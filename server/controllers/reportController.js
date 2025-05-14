const Report = require('../models/Report');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

// Load environment variables
require('dotenv').config();
const HERE_API_KEY = process.env.HERE_API_KEY;
const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

const createReport = async (req, res) => {
  console.log('=== Starting Report Creation ===');
  try {
    if (!req.files || req.files.length === 0) {
      console.log('Error: No images uploaded or Multer failed to parse files');
      return res.status(400).json({ 
        success: false,
        error: 'At least one image is required' 
      });
    }
    console.log(`Received ${req.files.length} image(s)`);

    const caseId = uuidv4();
    console.log(`Generated caseId: ${caseId}`);

    console.log('Uploading images to Cloudinary...');
    const uploadPromises = req.files.map((file, index) => {
      console.log(`Uploading file ${index + 1}: ${file.originalname}`);
      return cloudinary.uploader.upload(file.path, {
        folder: 'safe-street-reports',
        transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
      }).catch(err => {
        console.error(`Cloudinary upload failed for ${file.originalname}:`, err.message);
        throw new Error(`Cloudinary upload failed: ${err.message}`);
      });
    });
    const results = await Promise.all(uploadPromises);
    const imageUrls = results.map((result, index) => {
      console.log(`Uploaded file ${index + 1}: ${result.secure_url}`);
      return result.secure_url;
    });
    console.log(`Uploaded ${imageUrls.length} image(s) to Cloudinary`);

    req.files.forEach((file) => {
      fs.unlink(file.path, (err) => {
        if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
        else console.log(`Deleted temp file: ${file.path}`);
      });
    });

    console.log('Fetching approximate location...');
    const ipGeoResponse = await axios.get('http://ip-api.com/json').catch(err => {
      console.error('IP geolocation failed:', err.message);
      throw new Error(`IP geolocation failed: ${err.message}`);
    });
    const { lat: latitude, lon: longitude } = ipGeoResponse.data;

    if (!latitude || !longitude) {
      console.log('Error: Unable to fetch location');
      return res.status(400).json({ 
        success: false,
        error: 'Unable to fetch location' 
      });
    }
    console.log(`Location fetched: (${latitude}, ${longitude})`);

    console.log('Resolving location name with HERE Maps...');
    let locationName = 'Unknown Location';
    try {
      const hereReverseGeoUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`;
      const hereResponse = await axios.get(hereReverseGeoUrl);
      if (hereResponse.status !== 200) {
        console.log('Error: Failed to resolve location name');
        throw new Error('Failed to fetch location name from HERE Maps');
      }
      locationName = hereResponse.data.items[0]?.title || 'Unknown Location';
      console.log(`Location name: ${locationName}`);
    } catch (err) {
      console.error('HERE Maps reverse geocoding failed:', err.message);
      console.log('Proceeding with default location name:', locationName);
    }

    console.log('Fetching traffic congestion with TomTom...');
    let trafficCongestionScore = 0;
    try {
      const tomTomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`;
      const tomTomResponse = await axios.get(tomTomUrl);
      if (tomTomResponse.status !== 200) {
        console.log('Error: Failed to fetch traffic data');
        throw new Error('Failed to fetch traffic data from TomTom');
      }
      const flowData = tomTomResponse.data.flowSegmentData;
      const currentSpeed = flowData.currentSpeed || 0;
      const freeFlowSpeed = flowData.freeFlowSpeed || 1;
      let congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
      congestion = Math.max(congestion, 0);
      trafficCongestionScore = Math.round(congestion * 10) / 10;
      console.log(`Traffic congestion score: ${trafficCongestionScore}`);
    } catch (err) {
      console.error('TomTom traffic API failed:', err.message);
      console.log('Proceeding with default traffic congestion score:', trafficCongestionScore);
    }

    const reportData = {
      caseId,
      imageUrls,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [latitude,longitude],
        locationName,
      },
      trafficCongestionScore,
      status: 'pending',
    };
    console.log('Saving report to Reports collection...');

    const report = await Report.create(reportData).catch(err => {
      console.error('MongoDB save failed:', err.message);
      throw new Error(`MongoDB save failed: ${err.message}`);
    });
    console.log(`Report saved successfully (ID: ${report._id})`);

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Report creation failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

const getReports = async (req, res) => {
  try {
    console.log('=== Fetching Reports ===');
    const reports = await Report.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    console.log(`Found ${reports.length} reports`);
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error('Failed to fetch reports:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = { createReport, getReports };