const mongoose = require('mongoose');
const Report = require('../models/Report');
const User = require('../models/User');
const Assignment = require('../models/Assignment');
const BatchReport = require('../models/BatchReport');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const h3 = require('h3-js');

require('dotenv').config();
const HERE_API_KEY = process.env.HERE_API_KEY;
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

const createReport = async (req, res) => {
  console.log('=== Starting Report Creation ===');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('No images uploaded');
      return res.status(400).json({ status: 'fail', message: 'At least one image is required' });
    }
    console.log(`Received ${req.files.length} image(s)`);

    const caseId = uuidv4();
    console.log(`Generated caseId: ${caseId}`);

    const { latitude, longitude } = req.body;
    // const [latitude, longitude] = [17.064193, 79.265675];

    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      console.log('Invalid or missing location');
      return res.status(400).json({ status: 'fail', message: 'Valid latitude and longitude are required' });
    }
    console.log(`Location: (${latitude}, ${longitude})`);

    const H3_RESOLUTION = 12;
    const h3Cell = h3.latLngToCell(parseFloat(latitude), parseFloat(longitude), H3_RESOLUTION);
    console.log(`H3 Cell ID: ${h3Cell}`);

    console.log(`Checking for non-pending reports in H3 cell ${h3Cell}`);
    const nearbyReports = await Report.find({
      h3Cell,
      status: { $in: ['analyzed', 'assigned'] }
    }).limit(1);

    if (nearbyReports.length > 0) {
      console.log(`Found ${nearbyReports.length} non-pending report(s)`);
      req.files.forEach(file => fs.unlink(file.path, err => err && console.error(`Failed to delete ${file.path}`)));
      return res.status(400).json({ status: 'fail', message: 'Already reported, work in progress' });
    }
    console.log('No non-pending reports found');

    console.log('Uploading images to Cloudinary');
    const imageUrls = await Promise.all(
      req.files.map(async (file, index) => {
        console.log(`Uploading file ${index + 1}: ${file.originalname}`);
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'safe-street-reports',
          transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }]
        });
        console.log(`Uploaded: ${result.secure_url}`);
        return result.secure_url;
      })
    );
    console.log(`Uploaded ${imageUrls.length} image(s)`);

    req.files.forEach(file => fs.unlink(file.path, err => err && console.error(`Failed to delete ${file.path}`)));

    console.log('Resolving location name with HERE Maps');
    let locationName = 'Unknown Location';
    try {
      const { data } = await axios.get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`
      );
      locationName = data.items[0]?.title || 'Unknown Location';
      console.log(`Location name: ${locationName}`);
    } catch (err) {
      console.error('HERE Maps failed:', err.message);
    }

    console.log('Fetching traffic congestion with TomTom');
    let trafficCongestionScore = 0;
    try {
      const { data } = await axios.get(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`
      );
      const { currentSpeed = 0, freeFlowSpeed = 1 } = data.flowSegmentData;
      const congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
      trafficCongestionScore = Math.max(Math.round(congestion * 10) / 10, 0);
      console.log(`Traffic congestion score: ${trafficCongestionScore}`);
    } catch (err) {
      console.error('TomTom failed:', err.message);
    }

    const reportData = {
      caseId,
      imageUrls,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
        locationName
      },
      trafficCongestionScore,
      status: 'pending',
      h3Cell
    };
    console.log('Saving report');
    const report = await Report.create(reportData);
    console.log(`Report saved (ID: ${report._id})`);

    return res.status(201).json({ status: 'success', data: report });
  } catch (error) {
    req.files?.forEach(file => fs.unlink(file.path, err => err && console.error(`Failed to delete ${file.path}`)));
    console.error('Report creation failed:', error.message);
    if (error.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Report with this caseId already exists' });
    }
    return res.status(500).json({ status: 'error', message: 'Failed to create report' });
  }
};

const getReports = async (req, res) => {
  try {
    console.log('=== Fetching Reports ===');
    const reports = await Report.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    console.log(`Found ${reports.length} reports`);
    return res.status(200).json({ status: 'success', count: reports.length, data: reports });
  } catch (error) {
    console.error('Failed to fetch reports:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

const getAdminReports = async (req, res) => {
  try {
    console.log('=== Fetching Admin Reports ===');
    const { h3Cell, priorityThreshold = 50, sortBy = 'damageResult.priorityScore', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    const batchQuery = { 'damageResult.priorityScore': { $gte: parseFloat(priorityThreshold) } };
    if (h3Cell) batchQuery.h3Cell = h3Cell;

    let batches = await BatchReport.aggregate([
      { $match: batchQuery },
      {
        $lookup: {
          from: 'reports',
          let: { caseIds: '$caseIds' },
          pipeline: [
            { $match: { $expr: { $in: ['$caseId', '$$caseIds'] }, status: 'analyzed' } },
            { $project: { caseId: 1, imageUrls: 1, location: 1, trafficCongestionScore: 1, h3Cell: 1, createdAt: 1 } }
          ],
          as: 'reports'
        }
      },
      { $match: { reports: { $ne: [] } } },
      { $project: { batchId: 1, h3Cell: 1, centroid: 1, damageResult: 1, reportCount: 1, reports: 1, createdAt: 1 } },
      { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) }
    ]);

    if (batches.length < limit) {
      const remainingLimit = limit - batches.length;
      const lowerPriorityBatches = await BatchReport.aggregate([
        {
          $match: {
            'damageResult.priorityScore': { $lt: parseFloat(priorityThreshold) },
            ...(h3Cell ? { h3Cell } : {})
          }
        },
        {
          $lookup: {
            from: 'reports',
            let: { caseIds: '$caseIds' },
            pipeline: [
              { $match: { $expr: { $in: ['$caseId', '$$caseIds'] }, status: 'analyzed' } },
              { $project: { caseId: 1, imageUrls: 1, location: 1, trafficCongestionScore: 1, h3Cell: 1, createdAt: 1 } }
            ],
            as: 'reports'
          }
        },
        { $match: { reports: { $ne: [] } } },
        { $project: { batchId: 1, h3Cell: 1, centroid: 1, damageResult: 1, reportCount: 1, reports: 1, createdAt: 1 } },
        { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: remainingLimit }
      ]);

      batches = [...batches, ...lowerPriorityBatches].sort((a, b) => {
        const aScore = a.damageResult.priorityScore;
        const bScore = b.damageResult.priorityScore;
        return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
      });
    }

    const total = await BatchReport.countDocuments({
      ...(h3Cell ? { h3Cell } : {}),
      caseIds: { $in: await Report.find({ status: 'analyzed' }).distinct('caseId') }
    });

    console.log(`Found ${batches.length} batch reports (total: ${total})`);
    return res.status(200).json({
      status: 'success',
      count: batches.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: batches
    });
  } catch (error) {
    console.error('Failed to fetch admin reports:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};


module.exports = {
  createReport,
  getReports,
  getAdminReports,
  
};
