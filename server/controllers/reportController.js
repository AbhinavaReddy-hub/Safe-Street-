
// // server/controllers/reportController.js
// const Report         = require('../models/Report');
// const { v4: uuidv4 } = require('uuid');
// const cloudinary     = require('../config/cloudinary');
// const fs             = require('fs');
// const axios          = require('axios');
// require('dotenv').config();

// const HERE_API_KEY   = process.env.HERE_API_KEY;
// const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// const { batchValidateRoad } = require('../services/roadService');

// const createReport = async (req, res) => {
//   console.log('=== Starting Report Creation ===');
//   try {
//     // 0) Must have at least one file
//     if (!req.files || req.files.length === 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: 'At least one image is required' });
//     }
//     console.log(`Received ${req.files.length} image(s)`);

//     //
//     // 1) TEMP upload all to Cloudinary so that /validate-road can fetch them
//     //
//     console.log('Uploading to Cloudinary (temp)…');
//     const tempResults = await Promise.all(
//       req.files.map(f =>
//         cloudinary.uploader.upload(f.path, {
//           folder: 'safe-street-temp',
//           transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }]
//         })
//       )
//     );
//     // get the public URLs
//     const tempUrls = tempResults.map(r => r.secure_url);
//     // clean up local files
//     req.files.forEach(f => fs.unlinkSync(f.path));
//     console.log('Temp URLs:', tempUrls);

//     //
//     // 2) Road vs. Non-road
//     //
//     console.log('Validating which images are roads…');
//     const flags = await batchValidateRoad(tempUrls);
//     console.log('Road-validation flags:', flags);

//     const validUrls   = tempUrls.filter((_, i) => flags[i]);
//     const dropped     = flags.filter(v => !v).length;

//     if (validUrls.length === 0) {
//       console.log('No valid road images → rejecting');
//       // (optional) cleanup temp images from Cloudinary as well
//       return res
//         .status(422)
//         .json({ success: false, error: 'None of the images appear to be roads. Please retake.' });
//     }
//     console.log(`${dropped} image(s) dropped; ${validUrls.length} remain`);

//     //
//     // 3) Generate caseId
//     //
//     const caseId = uuidv4();
//     console.log(`Generated caseId: ${caseId}`);

//     //
//     // 4) Re-upload valid images to permanent folder
//     //
//     console.log('Uploading valid images to Cloudinary (final)…');
//     const finalResults = await Promise.all(
//       validUrls.map(url =>
//         cloudinary.uploader.upload(url, {
//           folder: 'safe-street-reports',
//           transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }]
//         })
//       )
//     );
//     const imageUrls = finalResults.map(r => r.secure_url);
//     console.log('Final URLs:', imageUrls);

//     //
//     // 5) Fetch IP-based coords
//     //
//     console.log('Fetching IP-based location…');
//     const ipRes = await axios.get('http://ip-api.com/json');
//     const { lat, lon } = ipRes.data;
//     if (lat == null || lon == null) throw new Error('Unable to fetch location');

//     //
//     // 6) Reverse Geocode with HERE
//     //
//     let locationName = 'Unknown Location';
//     try {
//       const hereRes = await axios.get(
//         `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lon}&apiKey=${HERE_API_KEY}`
//       );
//       locationName = hereRes.data.items[0]?.title || locationName;
//     } catch (e) {
//       console.warn('HERE Maps failed:', e.message);
//     }

//     //
//     // 7) TomTom traffic
//     //
//     let trafficScore = 0;
//     try {
//       const tomRes = await axios.get(
//         `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${lat},${lon}`
//       );
//       const f = tomRes.data.flowSegmentData;
//       let c = Math.min(10 * (1 - (f.currentSpeed||0)/(f.freeFlowSpeed||1)), 10);
//       trafficScore = Math.max(0, Math.round(c*10)/10);
//     } catch (e) {
//       console.warn('TomTom failed:', e.message);
//     }

//     //
//     // 8) Persist to Mongo
//     //
//     console.log('Saving report to DB…');
//     const report = await Report.create({
//       caseId,
//       imageUrls,
//       userId: req.user._id,
//       location: {
//         type: 'Point',
//         coordinates: [lon, lat],
//         locationName
//       },
//       trafficCongestionScore: trafficScore,
//       status: 'pending'
//     });

//     console.log('Report saved:', report.caseId);
//     return res.status(201).json({ success: true, data: report });
//   } catch (err) {
//     console.error('createReport error:', err);
//     return res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// };

// const getReports = async (req, res) => {
//   try {
//     console.log('Fetching user reports…');
//     const reports = await Report.find({ userId: req.user._id })
//       .populate('userId', 'name email')
//       .sort({ createdAt: -1 })
//       .lean();
//     return res.status(200).json({ success: true, count: reports.length, data: reports });
//   } catch (err) {
//     console.error('getReports error:', err);
//     return res.status(500).json({ success: false, error: 'Internal Server Error' });
//   }
// };

// module.exports = { createReport, getReports };

// server/controllers/reportController.js

const Report           = require('../models/Report');
const { v4: uuidv4 }   = require('uuid');
const cloudinary       = require('../config/cloudinary');
const fs               = require('fs');
const axios            = require('axios');
require('dotenv').config();

const HERE_API_KEY     = process.env.HERE_API_KEY;
const TOMTOM_API_KEY   = process.env.TOMTOM_API_KEY;

// NEW: import duplicate-check
const { isDuplicate }  = require('../services/dedupeService');
const { batchValidateRoad } = require('../services/roadService');

const createReport = async (req, res) => {
  console.log('=== Starting Report Creation ===');
  try {
    // 0) Must have at least one file
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'At least one image is required' });
    }
    console.log(`Received ${req.files.length} image(s)`);

    //
    // 1) TEMP upload all to Cloudinary so that /validate-road can fetch them
    //
    console.log('Uploading to Cloudinary (temp)…');
    const tempResults = await Promise.all(
      req.files.map(f =>
        cloudinary.uploader.upload(f.path, {
          folder: 'safe-street-temp',
          transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }]
        })
      )
    );
    const tempUrls = tempResults.map(r => r.secure_url);
    // clean up local files
    req.files.forEach(f => fs.unlinkSync(f.path));
    console.log('Temp URLs:', tempUrls);

    //
    // 2) Road vs. Non-road
    //
    console.log('Validating which images are roads…');
    const flags = await batchValidateRoad(tempUrls);
    console.log('Road-validation flags:', flags);

    const validUrls = tempUrls.filter((_, i) => flags[i]);
    const dropped   = flags.filter(v => !v).length;

    if (validUrls.length === 0) {
      console.log('No valid road images → rejecting');
      return res
        .status(422)
        .json({ success: false, error: 'None of the images appear to be roads. Please retake.' });
    }
    console.log(`${dropped} image(s) dropped; ${validUrls.length} remain`);

    //
    // 3) Generate caseId
    //
    const caseId = uuidv4();
    console.log(`Generated caseId: ${caseId}`);

    //
    // 4) Re-upload valid images to permanent folder
    //
    console.log('Uploading valid images to Cloudinary (final)…');
    const finalResults = await Promise.all(
      validUrls.map(url =>
        cloudinary.uploader.upload(url, {
          folder: 'safe-street-reports',
          transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }]
        })
      )
    );
    const imageUrls = finalResults.map(r => r.secure_url);
    console.log('Final URLs:', imageUrls);

    //
    // 5) Fetch IP-based coords
    //
    console.log('Fetching IP-based location…');
    const ipRes = await axios.get('http://ip-api.com/json');
    const { lat, lon } = ipRes.data;
    if (lat == null || lon == null) throw new Error('Unable to fetch location');

    //
    // 5a) DEDUPE CHECK: is there already a report nearby?
    //
    console.log(`Checking duplicates within ${process.env.BATCH_RADIUS_METERS || '100'}m…`);
    const dup = await isDuplicate({ lng: lon, lat });
    if (dup) {
      console.log('Duplicate location detected → rejecting');
      return res
        .status(409)
        .json({ success: false, error: 'A report already exists within 100 m of this location.' });
    }

    //
    // 6) Reverse Geocode with HERE
    //
    let locationName = 'Unknown Location';
    try {
      const hereRes = await axios.get(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${lat},${lon}&apiKey=${HERE_API_KEY}`
      );
      locationName = hereRes.data.items[0]?.title || locationName;
    } catch (e) {
      console.warn('HERE Maps failed:', e.message);
    }

    //
    // 7) TomTom traffic
    //
    let trafficScore = 0;
    try {
      const tomRes = await axios.get(
        `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${lat},${lon}`
      );
      const f = tomRes.data.flowSegmentData;
      let c = Math.min(10 * (1 - (f.currentSpeed || 0)/(f.freeFlowSpeed || 1)), 10);
      trafficScore = Math.max(0, Math.round(c * 10) / 10);
    } catch (e) {
      console.warn('TomTom failed:', e.message);
    }

    //
    // 8) Persist to Mongo
    //
    console.log('Saving report to DB…');
    const report = await Report.create({
      caseId,
      imageUrls,
      userId: req.user._id,
      location: {
        type: 'Point',
        coordinates: [lon, lat],
        locationName
      },
      trafficCongestionScore: trafficScore,
      status: 'pending'
    });

    console.log('Report saved:', report.caseId);
    return res.status(201).json({ success: true, data: report });
  } catch (err) {
    console.error('createReport error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const getReports = async (req, res) => {
  try {
    console.log('Fetching user reports…');
    const reports = await Report.find({ userId: req.user._id })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (err) {
    console.error('getReports error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

module.exports = { createReport, getReports };
