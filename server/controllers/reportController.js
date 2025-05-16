

const Report         = require('../models/Report');
const { v4: uuidv4 } = require('uuid');
const cloudinary     = require('../config/cloudinary');
const fs             = require('fs');
const axios          = require('axios');
require('dotenv').config();

const HERE_API_KEY     = process.env.HERE_API_KEY;
const TOMTOM_API_KEY   = process.env.TOMTOM_API_KEY;

// NEW → batch road/detect validator
const { batchValidateRoad } = require('../services/roadService');
// NEW → duplicate‐location checker
const { isDuplicate }       = require('../services/dedupeService');
const { BATCH_RADIUS_METERS } = require('../config/geoConfig');

async function createReport(req, res) {
  console.log('=== Starting Report Creation ===');
  try {
    // 0) Validate that at least one file was uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one image is required'
      });
    }
    console.log(`Received ${req.files.length} image(s)`);

    //
    // 1) TEMP upload to Cloudinary for FastAPI to download
    //
    console.log('Uploading to Cloudinary (temp)…');
    const tempResults = await Promise.all(
      req.files.map(f =>
        cloudinary.uploader.upload(f.path, {
          folder: 'safe-street-temp',
          transformation: [
            { width: 800, quality: 'auto', fetch_format: 'auto' }
          ],
        })
      )
    );
    const tempUrls = tempResults.map(r => r.secure_url);

    // Remove local tmp files immediately
    req.files.forEach(f => fs.unlinkSync(f.path));
    console.log('Temp URLs for road-check:', tempUrls);

    //
    // 2) Road-vs-Non-road filtering via your FastAPI service
    //
    console.log('Validating which images are roads…');
    const flags = await batchValidateRoad(tempUrls);
    console.log('Road-validation flags:', flags);

    const validUrls = tempUrls.filter((_, i) => flags[i]);
    const dropped   = flags.filter(v => !v).length;

    if (validUrls.length === 0) {
      console.log('No valid road images → rejecting');
      return res.status(422).json({
        success: false,
        error: 'None of the images appear to be roads. Please retake.'
      });
    }
    console.log(`${dropped} image(s) dropped; ${validUrls.length} remain`);

    //
    // 3) Generate a new caseId
    //
    const caseId = uuidv4();
    console.log(`Generated caseId: ${caseId}`);

    //
    // 4) Re-upload only the valid images into final folder
    //
    console.log('Uploading valid images to Cloudinary (final)…');
    const finalResults = await Promise.all(
      validUrls.map(url =>
        cloudinary.uploader.upload(url, {
          folder: 'safe-street-reports',
          transformation: [
            { width: 800, quality: 'auto', fetch_format: 'auto' }
          ],
        })
      )
    );
    const imageUrls = finalResults.map(r => r.secure_url);
    console.log('Final URLs:', imageUrls);

    //
    // 5) Fetch approximate coordinates via IP
    //
    console.log('Fetching IP-based location…');
    const ipRes = await axios.get('http://ip-api.com/json');
    const { lat, lon } = ipRes.data;
    if (lat == null || lon == null) throw new Error('Unable to fetch location');

    //
    // 5a) Optional: Deduplication — do we already have a similar report here?
    
    console.log(`Checking duplicates within ${BATCH_RADIUS_METERS}m…`);
    const dup = await isDuplicate({ lng: lon, lat });
    if (dup) {
      console.log('Duplicate location detected → rejecting');
      return res.status(409).json({
        success: false,
        error: `A report already exists within ${BATCH_RADIUS_METERS} m of this location.`
      });
    }

    //
    // 6) Reverse geocode via HERE Maps
    //
    let locationName = 'Unknown Location';
    try {
      const hereRes = await axios.get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lon}`
        + `&apiKey=${HERE_API_KEY}`
      );
      locationName = hereRes.data.items[0]?.title || locationName;
    } catch (e) {
      console.warn('HERE Maps reverse-geocode failed:', e.message);
    }

    //
    // 7) Fetch traffic congestion from TomTom
    //
    let trafficCongestionScore = 0;
    try {
      const tomRes = await axios.get(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json`
        + `?key=${TOMTOM_API_KEY}&point=${lat},${lon}`
      );
      const flow = tomRes.data.flowSegmentData;
      const cs   = flow.currentSpeed  || 0;
      const fs   = flow.freeFlowSpeed || 1;
      let congestion = Math.min(10 * (1 - cs/fs), 10);
      congestion = Math.max(congestion, 0);
      trafficCongestionScore = Math.round(congestion * 10) / 10;
    } catch (e) {
      console.warn('TomTom API failed:', e.message);
    }

    //
    // 8) Finally, save to MongoDB
    //
    console.log('Saving report to DB…');
    const report = await Report.create({
      caseId,
      imageUrls,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [ lon, lat ],
        locationName
      },
      trafficCongestionScore,
      status: 'pending'
    });

    console.log('Report saved:', report.caseId);
    return res.status(201).json({ success: true, data: report });
  }
  catch (err) {
    console.error('createReport error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

async function getReports(req, res) {
  try {
    console.log('Fetching user reports…');
    const reports = await Report.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  }
  catch (err) {
    console.error('getReports error:', err.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
}

module.exports = { createReport, getReports };
