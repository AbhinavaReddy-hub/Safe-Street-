// // // // const Report = require('../models/Report');
// // // // const axios = require('axios');
// // // // const { v4: uuidv4 } = require('uuid');
// // // // const cloudinary = require('../config/cloudinary');
// // // // const fs = require('fs');

// // // // // Load environment variables
// // // // require('dotenv').config();
// // // // const HERE_API_KEY = process.env.HERE_API_KEY;
// // // // const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// // // // // Haversine function to calculate distance between two points in meters
// // // // function haversine(lat1, lon1, lat2, lon2) {
// // // //   const R = 6371000; // Earth's radius in meters
// // // //   const dLat = (lat2 - lat1) * Math.PI / 180;
// // // //   const dLon = (lon2 - lon1) * Math.PI / 180;
// // // //   const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// // // //             Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
// // // //             Math.sin(dLon / 2) * Math.sin(dLon / 2);
// // // //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// // // //   return R * c;
// // // // }

// // // // const createReport = async (req, res) => {
// // // //   console.log('=== Starting Report Creation ===');
// // // //   try {
// // // //     if (!req.files || req.files.length === 0) {
// // // //       console.log('Error: No images uploaded or Multer failed to parse files');
// // // //       return res.status(400).json({ 
// // // //         success: false,
// // // //         error: 'At least one image is required' 
// // // //       });
// // // //     }
// // // //     console.log(`Received ${req.files.length} image(s)`);

// // // //     const caseId = uuidv4();
// // // //     console.log(`Generated caseId: ${caseId}`);

// // // //     console.log('Fetching approximate location...');
// // // //     const ipGeoResponse = await axios.get('http://ip-api.com/json').catch(err => {
// // // //       console.error('IP geolocation failed:', err.message);
// // // //       throw new Error(`IP geolocation failed: ${err.message}`);
// // // //     });
// // // //   M
// // // //     // const { lat: latitude, lon: longitude } = ipGeoResponse.data;
// // // //  const latitude=17.060799;
// // // //     const longitude = 79.267119;
// // // //     if (!latitude || !longitude) {
// // // //       console.log('Error: Unable to fetch location');
// // // //       return res.status(400).json({ 
// // // //         success: false,
// // // //         error: 'Unable to fetch location' 
// // // //       });
// // // //     }
// // // //     console.log(`Location fetched: (${latitude}, ${longitude})`);

// // // //     // Check for existing reports within 100 meters before uploading to Cloudinary
// // // //     console.log('Checking for existing reports within 100 meters...');
// // // //     const DISTANCE_THRESHOLD = 20; // meters
// // // //     const nearbyReports = await Report.find({
// // // //       location: {
// // // //         $near: {
// // // //           $geometry: {
// // // //             type: 'Point',
// // // //             coordinates: [longitude, latitude]
// // // //           },
// // // //           $maxDistance: DISTANCE_THRESHOLD // in meters
// // // //         }
// // // //       }
// // // //     }).lean();

// // // //     if (nearbyReports.length > 0) {
// // // //       console.log(`Found ${nearbyReports.length} nearby report(s)`);
// // // //       const hasAnalyzed = nearbyReports.some(report => report.status === 'analyzed');
// // // //       if (hasAnalyzed) {
// // // //         console.log('Found analyzed report(s), rejecting new report');
// // // //         // Delete temporary files
// // // //         req.files.forEach((file) => {
// // // //           fs.unlink(file.path, (err) => {
// // // //             if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // // //             else console.log(`Deleted temp file: ${file.path}`);
// // // //           });
// // // //         });
// // // //         return res.status(400).json({
// // // //           success: false,
// // // //           error: 'Already reported, work in progress'
// // // //         });
// // // //       }
// // // //       console.log('Only pending report(s) found, proceeding with new report');
// // // //     } else {
// // // //       console.log('No nearby reports found, proceeding with new report');
// // // //     }

// // // //     console.log('Uploading images to Cloudinary...');
// // // //     const uploadPromises = req.files.map((file, index) => {
// // // //       console.log(`Uploading file ${index + 1}: ${file.originalname}`);
// // // //       return cloudinary.uploader.upload(file.path, {
// // // //         folder: 'safe-street-reports',
// // // //         transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
// // // //       }).catch(err => {
// // // //         console.error(`Cloudinary upload failed for ${file.originalname}:`, err.message);
// // // //         throw new Error(`Cloudinary upload failed: ${err.message}`);
// // // //       });
// // // //     });
// // // //     const results = await Promise.all(uploadPromises);
// // // //     const imageUrls = results.map((result, index) => {
// // // //       console.log(`Uploaded file ${index + 1}: ${result.secure_url}`);
// // // //       return result.secure_url;
// // // //     });
// // // //     console.log(`Uploaded ${imageUrls.length} image(s) to Cloudinary`);

// // // //     // Delete temporary files after successful upload
// // // //     req.files.forEach((file) => {
// // // //       fs.unlink(file.path, (err) => {
// // // //         if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // // //         else console.log(`Deleted temp file: ${file.path}`);
// // // //       });
// // // //     });

// // // //     console.log('Resolving location name with HERE Maps...');
// // // //     let locationName = 'Unknown Location';
// // // //     try {
// // // //       const hereReverseGeoUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`;
// // // //       const hereResponse = await axios.get(hereReverseGeoUrl);
// // // //       if (hereResponse.status !== 200) {
// // // //         console.log('Error: Failed to resolve location name');
// // // //         throw new Error('Failed to fetch location name from HERE Maps');
// // // //       }
// // // //       locationName = hereResponse.data.items[0]?.title || 'Unknown Location';
// // // //       console.log(`Location name: ${locationName}`);
// // // //     } catch (err) {
// // // //       console.error('HERE Maps reverse geocoding failed:', err.message);
// // // //       console.log('Proceeding with default location name:', locationName);
// // // //     }

// // // //     console.log('Fetching traffic congestion with TomTom...');
// // // //     let trafficCongestionScore = 0;
// // // //     try {
// // // //       const tomTomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`;
// // // //       const tomTomResponse = await axios.get(tomTomUrl);
// // // //       if (tomTomResponse.status !== 200) {
// // // //         console.log('Error: Failed to fetch traffic data');
// // // //         throw new Error('Failed to fetch traffic data from TomTom');
// // // //       }
// // // //       const flowData = tomTomResponse.data.flowSegmentData;
// // // //       const currentSpeed = flowData.currentSpeed || 0;
// // // //       const freeFlowSpeed = flowData.freeFlowSpeed || 1;
// // // //       let congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
// // // //       congestion = Math.max(congestion, 0);
// // // //       trafficCongestionScore = Math.round(congestion * 10) / 10;
// // // //       console.log(`Traffic congestion score: ${trafficCongestionScore}`);
// // // //     } catch (err) {
// // // //       console.error('TomTom traffic API failed:', err.message);
// // // //       console.log('Proceeding with default traffic congestion score:', trafficCongestionScore);
// // // //     }

// // // //     const reportData = {
// // // //       caseId,
// // // //       imageUrls,
// // // //       userId: req.user._id,
// // // //       location: {
// // // //         type: 'Point',
// // // //         coordinates: [longitude, latitude],
// // // //         locationName,
// // // //       },
// // // //       trafficCongestionScore,
// // // //       status: 'pending',
// // // //     };
// // // //     console.log('Saving report to Reports collection...');

// // // //     const report = await Report.create(reportData).catch(err => {
// // // //       console.error('MongoDB save failed:', err.message);
// // // //       throw new Error(`MongoDB save failed: ${err.message}`);
// // // //     });
// // // //     console.log(`Report saved successfully (ID: ${report._id})`);

// // // //     return res.status(201).json({
// // // //       success: true,
// // // //       data: report,
// // // //     });
// // // //   } catch (error) {
// // // //     // Ensure temporary files are deleted on error
// // // //     if (req.files) {
// // // //       req.files.forEach((file) => {
// // // //         fs.unlink(file.path, (err) => {
// // // //           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // // //           else console.log(`Deleted temp file: ${file.path}`);
// // // //         });
// // // //       });
// // // //     }
// // // //     console.error('Report creation failed:', error.message);
// // // //     return res.status(500).json({
// // // //       success: false,
// // // //       error: 'Failed to create report',
// // // //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// // // //     });
// // // //   }
// // // // };

// // // // const getReports = async (req, res) => {
// // // //   try {
// // // //     console.log('=== Fetching Reports ===');
// // // //     const reports = await Report.find({ userId: req.user._id })
// // // //       .populate('userId', 'name email')
// // // //       .sort({ createdAt: -1 })
// // // //       .lean();
// // // //     console.log(`Found ${reports.length} reports`);
// // // //     return res.status(200).json({
// // // //       success: true,
// // // //       count: reports.length,
// // // //       data: reports,
// // // //     });
// // // //   } catch (error) {
// // // //     console.error('Failed to fetch reports:', error.message);
// // // //     return res.status(500).json({
// // // //       success: false,
// // // //       error: 'Failed to fetch reports',
// // // //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// // // //     });
// // // //   }
// // // // };

// // // // module.exports = { createReport, getReports };
// // // const Report = require('../models/Report');
// // // const axios = require('axios');
// // // const { v4: uuidv4 } = require('uuid');
// // // const cloudinary = require('../config/cloudinary');
// // // const fs = require('fs');
// // // const h3 = require('h3-js');

// // // // Load environment variables
// // // require('dotenv').config();
// // // const HERE_API_KEY = process.env.HERE_API_KEY;
// // // const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// // // const createReport = async (req, res) => {
// // //   console.log('=== Starting Report Creation ===');
// // //   try {
// // //     if (!req.files || req.files.length === 0) {
// // //       console.log('Error: No images uploaded or Multer failed to parse files');
// // //       return res.status(400).json({ 
// // //         success: false,
// // //         error: 'At least one image is required' 
// // //       });
// // //     }
// // //     console.log(`Received ${req.files.length} image(s)`);

// // //     const caseId = uuidv4();
// // //     console.log(`Generated caseId: ${caseId}`);

// // //     console.log('Fetching approximate location...');
// // //     const ipGeoResponse = await axios.get('http://ip-api.com/json').catch(err => {
// // //       console.error('IP geolocation failed:', err.message);
// // //       throw new Error(`IP geolocation failed: ${err.message}`);
// // //     });
// // //     // const { lat: latitude, lon: longitude } = ipGeoResponse.data;
// // //     const latitude = 17.060799; // Hardcoded for testing
// // //     const longitude = 79.267119;
// // //     if (!latitude || !longitude) {
// // //       console.log('Error: Unable to fetch location');
// // //       return res.status(400).json({ 
// // //         success: false,
// // //         error: 'Unable to fetch location' 
// // //       });
// // //     }
// // //     console.log(`Location fetched: (${latitude}, ${longitude})`);

// // //     // Compute H3 cell ID at resolution 12 (~16m diameter)
// // //     const H3_RESOLUTION = 12;
// // //     const h3Cell = h3.latLngToCell(latitude, longitude, H3_RESOLUTION);
// // //     console.log(`H3 Cell ID: ${h3Cell}`);

// // //     // Check for existing non-pending reports in the same H3 cell
// // //     console.log(`Checking for non-pending reports in H3 cell ${h3Cell}...`);
// // //     const nearbyReports = await Report.find({
// // //       h3Cell,
// // //       status: { $in: ['analyzed', 'assigned', 'completed'] }
// // //     }).lean();

// // //     if (nearbyReports.length > 0) {
// // //       console.log(`Found ${nearbyReports.length} non-pending report(s)`);
// // //       req.files.forEach((file) => {
// // //         fs.unlink(file.path, (err) => {
// // //           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // //           else console.log(`Deleted temp file: ${file.path}`);
// // //         });
// // //       });
// // //       return res.status(400).json({
// // //         success: false,
// // //         error: 'Already reported, work in progress'
// // //       });
// // //     }
// // //     console.log('No non-pending reports found, proceeding with new report');

// // //     console.log('Uploading images to Cloudinary...');
// // //     const uploadPromises = req.files.map((file, index) => {
// // //       console.log(`Uploading file ${index + 1}: ${file.originalname}`);
// // //       return cloudinary.uploader.upload(file.path, {
// // //         folder: 'safe-street-reports',
// // //         transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
// // //       }).catch(err => {
// // //         console.error(`Cloudinary upload failed for ${file.originalname}:`, err.message);
// // //         throw new Error(`Cloudinary upload failed: ${err.message}`);
// // //       });
// // //     });
// // //     const results = await Promise.all(uploadPromises);
// // //     const imageUrls = results.map((result, index) => {
// // //       console.log(`Uploaded file ${index + 1}: ${result.secure_url}`);
// // //       return result.secure_url;
// // //     });
// // //     console.log(`Uploaded ${imageUrls.length} image(s) to Cloudinary`);

// // //     // Delete temporary files after successful upload
// // //     req.files.forEach((file) => {
// // //       fs.unlink(file.path, (err) => {
// // //         if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // //         else console.log(`Deleted temp file: ${file.path}`);
// // //       });
// // //     });

// // //     console.log('Resolving location name with HERE Maps...');
// // //     let locationName = 'Unknown Location';
// // //     try {
// // //       const hereReverseGeoUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`;
// // //       const hereResponse = await axios.get(hereReverseGeoUrl);
// // //       if (hereResponse.status !== 200) {
// // //         console.log('Error: Failed to resolve location name');
// // //         throw new Error('Failed to fetch location name from HERE Maps');
// // //       }
// // //       locationName = hereResponse.data.items[0]?.title || 'Unknown Location';
// // //       console.log(`Location name: ${locationName}`);
// // //     } catch (err) {
// // //       console.error('HERE Maps reverse geocoding failed:', err.message);
// // //       console.log('Proceeding with default location name:', locationName);
// // //     }

// // //     console.log('Fetching traffic congestion with TomTom...');
// // //     let trafficCongestionScore = 0;
// // //     try {
// // //       const tomTomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`;
// // //       const tomTomResponse = await axios.get(tomTomUrl);
// // //       if (tomTomResponse.status !== 200) {
// // //         console.log('Error: Failed to fetch traffic data');
// // //         throw new Error('Failed to fetch traffic data from TomTom');
// // //       }
// // //       const flowData = tomTomResponse.data.flowSegmentData;
// // //       const currentSpeed = flowData.currentSpeed || 0;
// // //       const freeFlowSpeed = flowData.freeFlowSpeed || 1;
// // //       let congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
// // //       congestion = Math.max(congestion, 0);
// // //       trafficCongestionScore = Math.round(congestion * 10) / 10;
// // //       console.log(`Traffic congestion score: ${trafficCongestionScore}`);
// // //     } catch (err) {
// // //       console.error('TomTom traffic API failed:', err.message);
// // //       console.log('Proceeding with default traffic congestion score:', trafficCongestionScore);
// // //     }

// // //     const reportData = {
// // //       caseId,
// // //       imageUrls,
// // //       userId: req.user._id,
// // //       location: {
// // //         type: 'Point',
// // //         coordinates: [longitude, latitude],
// // //         locationName,
// // //       },
// // //       trafficCongestionScore,
// // //       status: 'pending',
// // //       h3Cell,
// // //     };
// // //     console.log('Saving report to Reports collection...');

// // //     const report = await Report.create(reportData).catch(err => {
// // //       console.error('MongoDB save failed:', err.message);
// // //       throw new Error(`MongoDB save failed: ${err.message}`);
// // //     });
// // //     console.log(`Report saved successfully (ID: ${report._id})`);

// // //     return res.status(201).json({
// // //       success: true,
// // //       data: report,
// // //     });
// // //   } catch (error) {
// // //     // Ensure temporary files are deleted on error
// // //     if (req.files) {
// // //       req.files.forEach((file) => {
// // //         fs.unlink(file.path, (err) => {
// // //           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// // //           else console.log(`Deleted temp file: ${file.path}`);
// // //         });
// // //       });
// // //     }
// // //     console.error('Report creation failed:', error.message);
// // //     return res.status(500).json({
// // //       success: false,
// // //       error: 'Failed to create report',
// // //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// // //     });
// // //   }
// // // };

// // // const getReports = async (req, res) => {
// // //   try {
// // //     console.log('=== Fetching Reports ===');
// // //     const reports = await Report.find({ userId: req.user._id })
// // //       .populate('userId', 'name email')
// // //       .sort({ createdAt: -1 })
// // //       .lean();
// // //     console.log(`Found ${reports.length} reports`);
// // //     return res.status(200).json({
// // //       success: true,
// // //       count: reports.length,
// // //       data: reports,
// // //     });
// // //   } catch (error) {
// // //     console.error('Failed to fetch reports:', error.message);
// // //     return res.status(500).json({
// // //       success: false,
// // //       error: 'Failed to fetch reports',
// // //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// // //     });
// // //   }
// // // };

// // // module.exports = { createReport, getReports };
// // const Report = require('../models/Report');
// // const Worker = require('../models/User');
// // // const Assignment = require('../models/Assignment');
// // const axios = require('axios');
// // const { v4: uuidv4 } = require('uuid');
// // const cloudinary = require('../config/cloudinary');
// // const fs = require('fs');
// // const h3 = require('h3-js');
// // const mongoose = require('mongoose');

// // // Load environment variables
// // require('dotenv').config();
// // const HERE_API_KEY = process.env.HERE_API_KEY;
// // const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// // const createReport = async (req, res) => {
// //   console.log('=== Starting Report Creation ===');
// //   try {
// //     if (!req.files || req.files.length === 0) {
// //       console.log('Error: No images uploaded or Multer failed to parse files');
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'At least one image is required' 
// //       });
// //     }
// //     console.log(`Received ${req.files.length} image(s)`);

// //     const caseId = uuidv4();
// //     console.log(`Generated caseId: ${caseId}`);

// //     console.log('Fetching approximate location...');
// //     const ipGeoResponse = await axios.get('http://ip-api.com/json').catch(err => {
// //       console.error('IP geolocation failed:', err.message);
// //       throw new Error(`IP geolocation failed: ${err.message}`);
// //     });
// //     // const { lat: latitude, lon: longitude } = ipGeoResponse.data;
// //     // const latitude = 17.064114; // Hardcoded for testing
// //     // const longitude =79.265711;
// //     const [latitude, longitude] = [17.065905, 79.265021];
// //     if (!latitude || !longitude) {
// //       console.log('Error: Unable to fetch location');
// //       return res.status(400).json({ 
// //         success: false,
// //         error: 'Unable to fetch location' 
// //       });
// //     }
// //     console.log(`Location fetched: (${latitude}, ${longitude})`);

// //     const H3_RESOLUTION = 12;
// //     const h3Cell = h3.latLngToCell(latitude, longitude, H3_RESOLUTION);
// //     console.log(`H3 Cell ID: ${h3Cell}`);

// //     console.log(`Checking for non-pending reports in H3 cell ${h3Cell}...`);
// //     const nearbyReports = await Report.find({
// //       h3Cell,
// //       status: { $in: ['analyzed', 'assigned', 'completed'] }
// //     }).limit(1).lean();

// //     if (nearbyReports.length > 0) {
// //       console.log(`Found ${nearbyReports.length} non-pending report(s)`);
// //       req.files.forEach((file) => {
// //         fs.unlink(file.path, (err) => {
// //           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// //           else console.log(`Deleted temp file: ${file.path}`);
// //         });
// //       });
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Already reported, work in progress'
// //       });
// //     }
// //     console.log('No non-pending reports found, proceeding with new report');

// //     console.log('Uploading images to Cloudinary...');
// //     const uploadPromises = req.files.map((file, index) => {
// //       console.log(`Uploading file ${index + 1}: ${file.originalname}`);
// //       return cloudinary.uploader.upload(file.path, {
// //         folder: 'safe-street-reports',
// //         transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
// //       }).catch(err => {
// //         console.error(`Cloudinary upload failed for ${file.originalname}:`, err.message);
// //         throw new Error(`Cloudinary upload failed: ${err.message}`);
// //       });
// //     });
// //     const results = await Promise.all(uploadPromises);
// //     const imageUrls = results.map((result, index) => {
// //       console.log(`Uploaded file ${index + 1}: ${result.secure_url}`);
// //       return result.secure_url;
// //     });
// //     console.log(`Uploaded ${imageUrls.length} image(s) to Cloudinary`);

// //     req.files.forEach((file) => {
// //       fs.unlink(file.path, (err) => {
// //         if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// //         else console.log(`Deleted temp file: ${file.path}`);
// //       });
// //     });

// //     console.log('Resolving location name with HERE Maps...');
// //     let locationName = 'Unknown Location';
// //     try {
// //       const hereReverseGeoUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`;
// //       const hereResponse = await axios.get(hereReverseGeoUrl);
// //       if (hereResponse.status !== 200) {
// //         console.log('Error: Failed to resolve location name');
// //         throw new Error('Failed to fetch location name from HERE Maps');
// //       }
// //       locationName = hereResponse.data.items[0]?.title || 'Unknown Location';
// //       console.log(`Location name: ${locationName}`);
// //     } catch (err) {
// //       console.error('HERE Maps reverse geocoding failed:', err.message);
// //       console.log('Proceeding with default location name:', locationName);
// //     }

// //     console.log('Fetching traffic congestion with TomTom...');
// //     let trafficCongestionScore = 0;
// //     try {
// //       const tomTomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`;
// //       const tomTomResponse = await axios.get(tomTomUrl);
// //       if (tomTomResponse.status !== 200) {
// //         console.log('Error: Failed to fetch traffic data');
// //         throw new Error('Failed to fetch traffic data from TomTom');
// //       }
// //       const flowData = tomTomResponse.data.flowSegmentData;
// //       const currentSpeed = flowData.currentSpeed || 0;
// //       const freeFlowSpeed = flowData.freeFlowSpeed || 1;
// //       let congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
// //       congestion = Math.max(congestion, 0);
// //       trafficCongestionScore = Math.round(congestion * 10) / 10;
// //       console.log(`Traffic congestion score: ${trafficCongestionScore}`);
// //     } catch (err) {
// //       console.error('TomTom traffic API failed:', err.message);
// //       console.log('Proceeding with default traffic congestion score:', trafficCongestionScore);
// //     }

// //     const reportData = {
// //       caseId,
// //       imageUrls,
// //       userId: req.user._id,
// //       location: {
// //         type: 'Point',
// //         coordinates: [longitude, latitude],
// //         locationName,
// //       },
// //       trafficCongestionScore,
// //       status: 'pending',
// //       h3Cell,
// //     };
// //     console.log('Saving report to Reports collection...');

// //     const report = await Report.create(reportData).catch(err => {
// //       console.error('MongoDB save failed:', err.message);
// //       throw new Error(`MongoDB save failed: ${err.message}`);
// //     });
// //     console.log(`Report saved successfully (ID: ${report._id})`);

// //     return res.status(201).json({
// //       success: true,
// //       data: report,
// //     });
// //   } catch (error) {
// //     if (req.files) {
// //       req.files.forEach((file) => {
// //         fs.unlink(file.path, (err) => {
// //           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
// //           else console.log(`Deleted temp file: ${file.path}`);
// //         });
// //       });
// //     }
// //     console.error('Report creation failed:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to create report',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // const getReports = async (req, res) => {
// //   try {
// //     console.log('=== Fetching Reports ===');
// //     const reports = await Report.find({ userId: req.user._id })
// //       .populate('userId', 'name email')
// //       .sort({ createdAt: -1 })
// //       .lean();
// //     console.log(`Found ${reports.length} reports`);
// //     return res.status(200).json({
// //       success: true,
// //       count: reports.length,
// //       data: reports,
// //     });
// //   } catch (error) {
// //     console.error('Failed to fetch reports:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch reports',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // // Admin: Get analyzed reports grouped by batchReports, prioritized by damageResult.priorityScore
// // const getAdminReports = async (req, res) => {
// //   try {
// //     console.log('=== Fetching Admin Reports ===');
// //     const { 
// //       h3Cell, 
// //       priorityThreshold = 50, // Default threshold for high-priority clusters
// //       sortBy = 'damageResult.priorityScore', 
// //       sortOrder = 'desc', 
// //       page = 1, 
// //       limit = 10 
// //     } = req.query;

// //     // Build query for batchReports
// //     const batchQuery = {
// //       'damageResult.priorityScore': { $gte: parseFloat(priorityThreshold) } // Filter high-priority clusters
// //     };
// //     if (h3Cell) batchQuery.h3Cell = h3Cell;

// //     // Aggregate batchReports with joined reports
// //     let batches = await mongoose.connection.collection('batchReports').aggregate([
// //       { $match: batchQuery },
// //       {
// //         $lookup: {
// //           from: 'reports',
// //           let: { caseIds: '$caseIds' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: { $in: ['$caseId', '$$caseIds'] },
// //                 status: 'analyzed'
// //               }
// //             },
// //             {
// //               $project: {
// //                 caseId: 1,
// //                 imageUrls: 1,
// //                 location: 1,
// //                 trafficCongestionScore: 1,
// //                 h3Cell: 1,
// //                 createdAt: 1
// //               }
// //             }
// //           ],
// //           as: 'reports'
// //         }
// //       },
// //       { $match: { reports: { $ne: [] } } }, // Only include batches with analyzed reports
// //       {
// //         $project: {
// //           batchId: 1,
// //           h3Cell: 1,
// //           centroid: 1,
// //           damageResult: 1,
// //           reportCount: 1,
// //           reports: 1,
// //           createdAt: 1
// //         }
// //       },
// //       { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
// //       { $skip: (parseInt(page) - 1) * parseInt(limit) },
// //       { $limit: parseInt(limit) }
// //     ]).toArray();

// //     // Fetch lower-priority batches if high-priority ones don't fill the page
// //     if (batches.length < limit) {
// //       const remainingLimit = limit - batches.length;
// //       const lowerPriorityBatches = await mongoose.connection.collection('batchReports').aggregate([
// //         {
// //           $match: {
// //             'damageResult.priorityScore': { $lt: parseFloat(priorityThreshold) },
// //             ...(h3Cell ? { h3Cell } : {})
// //           }
// //         },
// //         {
// //           $lookup: {
// //             from: 'reports',
// //             let: { caseIds: '$caseIds' },
// //             pipeline: [
// //               {
// //                 $match: {
// //                   $expr: { $in: ['$caseId', '$$caseIds'] },
// //                   status: 'analyzed'
// //                 }
// //               },
// //               {
// //                 $project: {
// //                   caseId: 1,
// //                   imageUrls: 1,
// //                   location: 1,
// //                   trafficCongestionScore: 1,
// //                   h3Cell: 1,
// //                   createdAt: 1
// //                 }
// //               }
// //             ],
// //             as: 'reports'
// //           }
// //         },
// //         { $match: { reports: { $ne: [] } } },
// //         {
// //           $project: {
// //             batchId: 1,
// //             h3Cell: 1,
// //             centroid: 1,
// //             damageResult: 1,
// //             reportCount: 1,
// //             reports: 1,
// //             createdAt: 1
// //           }
// //         },
// //         { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
// //         { $skip: (parseInt(page) - 1) * parseInt(limit) },
// //         { $limit: remainingLimit }
// //       ]).toArray();

// //       batches = [...batches, ...lowerPriorityBatches].sort((a, b) => {
// //         const aScore = a.damageResult.priorityScore;
// //         const bScore = b.damageResult.priorityScore;
// //         return sortOrder === 'desc' 
// //           ? bScore - aScore 
// //           : aScore - bScore;
// //       });
// //     }

// //     const total = await mongoose.connection.collection('batchReports').countDocuments({
// //       ...(h3Cell ? { h3Cell } : {}),
// //       caseIds: {
// //         $in: await Report.find({ status: 'analyzed' }).distinct('caseId')
// //       }
// //     });

// //     console.log(`Found ${batches.length} batch reports (total: ${total})`);

// //     return res.status(200).json({
// //       success: true,
// //       count: batches.length,
// //       total,
// //       page: parseInt(page),
// //       pages: Math.ceil(total / limit),
// //       data: batches,
// //     });
// //   } catch (error) {
// //     console.error('Failed to fetch admin reports:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch reports',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // // Admin: Get analyzed reports by severity (high, medium, low)
// // const getAdminReportsBySeverity = async (req, res) => {
// //   try {
// //     console.log('=== Fetching Admin Reports by Severity ===');
// //     const { severity } = req.params;
// //     const { 
// //       h3Cell, 
// //       sortBy = 'damageResult.priorityScore', 
// //       sortOrder = 'desc', 
// //       page = 1, 
// //       limit = 10 
// //     } = req.query;

// //     // Validate severity
// //     const validSeverities = ['high', 'medium', 'low'];
// //     if (!validSeverities.includes(severity)) {
// //       console.log(`Invalid severity: ${severity}`);
// //       return res.status(400).json({
// //         success: false,
// //         error: 'Invalid severity. Must be high, medium, or low'
// //       });
// //     }

// //     // Build query for batchReports
// //     const batchQuery = {
// //       'damageResult.severity': severity
// //     };
// //     if (h3Cell) batchQuery.h3Cell = h3Cell;

// //     // Aggregate batchReports with joined reports
// //     const batches = await mongoose.connection.collection('batchReports').aggregate([
// //       { $match: batchQuery },
// //       {
// //         $lookup: {
// //           from: 'reports',
// //           let: { caseIds: '$caseIds' },
// //           pipeline: [
// //             {
// //               $match: {
// //                 $expr: { $in: ['$caseId', '$$caseIds'] },
// //                 status: 'analyzed'
// //               }
// //             },
// //             {
// //               $project: {
// //                 caseId: 1,
// //                 imageUrls: 1,
// //                 location: 1,
// //                 trafficCongestionScore: 1,
// //                 h3Cell: 1,
// //                 createdAt: 1
// //               }
// //             }
// //           ],
// //           as: 'reports'
// //         }
// //       },
// //       { $match: { reports: { $ne: [] } } }, // Only include batches with analyzed reports
// //       {
// //         $project: {
// //           batchId: 1,
// //           h3Cell: 1,
// //           centroid: 1,
// //           damageResult: 1,
// //           reportCount: 1,
// //           reports: 1,
// //           createdAt: 1
// //         }
// //       },
// //       { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
// //       { $skip: (parseInt(page) - 1) * parseInt(limit) },
// //       { $limit: parseInt(limit) }
// //     ]).toArray();

// //     const total = await mongoose.connection.collection('batchReports').countDocuments({
// //       'damageResult.severity': severity,
// //       ...(h3Cell ? { h3Cell } : {}),
// //       caseIds: {
// //         $in: await Report.find({ status: 'analyzed' }).distinct('caseId')
// //       }
// //     });

// //     console.log(`Found ${batches.length} batch reports for severity ${severity} (total: ${total})`);

// //     return res.status(200).json({
// //       success: true,
// //       count: batches.length,
// //       total,
// //       page: parseInt(page),
// //       pages: Math.ceil(total / limit),
// //       data: batches,
// //     });
// //   } catch (error) {
// //     console.error(`Failed to fetch admin reports for severity ${severity}:`, error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch reports',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // // Admin: Assign report to worker
// // const assignReport = async (req, res) => {
// //   try {
// //     console.log('=== Assigning Report ===');
// //     const { caseId, batchId, workerId } = req.body;

// //     if (!caseId && !batchId) {
// //       return res.status(400).json({ success: false, error: 'caseId or batchId required' });
// //     }

// //     const worker = await Worker.findById(workerId);
// //     if (!worker || !worker.isAvailable) {
// //       console.log('Worker not available');
// //       return res.status(400).json({ success: false, error: 'Worker not available' });
// //     }

// //     let reports = [];
// //     if (batchId) {
// //       const batch = await mongoose.connection.collection('batchReports').findOne({ batchId });
// //       if (!batch) {
// //         return res.status(404).json({ success: false, error: 'Batch not found' });
// //       }
// //       reports = await Report.find({
// //         caseId: { $in: batch.caseIds },
// //         status: 'analyzed'
// //       });
// //     } else {
// //       const report = await Report.findOne({ caseId });
// //       if (!report) {
// //         return res.status(404).json({ success: false, error: 'Report not found' });
// //       }
// //       if (!['pending', 'analyzed'].includes(report.status)) {
// //         return res.status(400).json({ success: false, error: 'Report cannot be assigned' });
// //       }
// //       reports = [report];
// //     }

// //     if (reports.length === 0) {
// //       return res.status(400).json({ success: false, error: 'No assignable reports found' });
// //     }

// //     const assignments = await Promise.all(reports.map(async report => {
// //       const assignment = await Assignment.create({
// //         reportId: report._id,
// //         caseId: report.caseId,
// //         workerId,
// //         status: 'assigned',
// //       });
// //       report.status = 'assigned';
// //       report.assignmentId = assignment._id;
// //       await report.save();
// //       return assignment;
// //     }));

// //     await Worker.updateOne({ _id: workerId }, { isAvailable: false });

// //     console.log(`Assigned ${reports.length} reports to worker ${workerId}`);
// //     return res.status(200).json({
// //       success: true,
// //       data: { reports, assignments },
// //     });
// //   } catch (error) {
// //     console.error('Failed to assign report:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to assign report',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // // Worker: Complete assignment
// // const completeReport = async (req, res) => {
// //   try {
// //     console.log('=== Completing Report ===');
// //     const { caseId } = req.body;
// //     const workerId = req.user._id; // Assuming worker is authenticated

// //     const assignment = await Assignment.findOne({ caseId, workerId, status: 'assigned' });
// //     if (!assignment) {
// //       console.log('Assignment not found or not authorized');
// //       return res.status(404).json({ success: false, error: 'Assignment not found or not authorized' });
// //     }

// //     const report = await Report.findOne({ caseId });
// //     if (!report) {
// //       console.log('Report not found');
// //       return res.status(404).json({ success: false, error: 'Report not found' });
// //     }

// //     assignment.status = 'completed';
// //     assignment.completedAt = new Date();
// //     await assignment.save();

// //     report.status = 'completed';
// //     await report.save();

// //     await Worker.updateOne({ _id: workerId }, { isAvailable: true });

// //     console.log(`Report ${caseId} completed by worker ${workerId}`);
// //     return res.status(200).json({
// //       success: true,
// //       data: { report, assignment },
// //     });
// //   } catch (error) {
// //     console.error('Failed to complete report:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to complete report',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // // Worker: Get assigned reports
// // const getWorkerReports = async (req, res) => {
// //   try {
// //     console.log('=== Fetching Worker Reports ===');
// //     const workerId = req.user._id;
// //     const { status, page = 1, limit = 10 } = req.query;

// //     const query = { workerId, status: status || 'assigned' };
// //     const assignments = await Assignment.find(query)
// //       .populate({
// //         path: 'reportId',
// //         populate: { path: 'userId', select: 'name email' }
// //       })
// //       .sort({ assignedAt: -1 })
// //       .skip((page - 1) * limit)
// //       .limit(parseInt(limit))
// //       .lean();

// //     const total = await Assignment.countDocuments(query);
// //     console.log(`Found ${assignments.length} assignments (total: ${total})`);

// //     return res.status(200).json({
// //       success: true,
// //       count: assignments.length,
// //       total,
// //       page: parseInt(page),
// //       pages: Math.ceil(total / limit),
// //       data: assignments,
// //     });
// //   } catch (error) {
// //     console.error('Failed to fetch worker reports:', error.message);
// //     return res.status(500).json({
// //       success: false,
// //       error: 'Failed to fetch worker reports',
// //       details: process.env.NODE_ENV === 'development' ? error.message : undefined,
// //     });
// //   }
// // };

// // module.exports = { createReport, getReports, getAdminReports, getAdminReportsBySeverity, assignReport, completeReport, getWorkerReports };
// const Report = require('../models/Report');
// const User = require('../models/User');
// const Assignment = require('../models/Assignment');
// const axios = require('axios');
// const { v4: uuidv4 } = require('uuid');
// const cloudinary = require('../config/cloudinary');
// const fs = require('fs');
// const h3 = require('h3-js');
// const mongoose = require('mongoose');

// // Load environment variables
// require('dotenv').config();
// const HERE_API_KEY = process.env.HERE_API_KEY;
// const TOMTOM_API_KEY = process.env.TOMTOM_API_KEY;

// const createReport = async (req, res) => {
//   console.log('=== Starting Report Creation ===');
//   try {
//     if (!req.files || req.files.length === 0) {
//       console.log('Error: No images uploaded');
//       return res.status(400).json({
//         status: 'fail',
//         message: 'At least one image is required'
//       });
//     }
//     console.log(`Received ${req.files.length} image(s)`);

//     const caseId = uuidv4();
//     console.log(`Generated caseId: ${caseId}`);

//     // const { latitude, longitude } = req.body;
//     const [latitude, longitude] = [17.064393, 79.265685];
//     if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
//       console.log('Error: Invalid or missing location');
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Valid latitude and longitude are required'
//       });
//     }
//     console.log(`Location provided: (${latitude}, ${longitude})`);

//     const H3_RESOLUTION = 12;
//     const h3Cell = h3.latLngToCell(parseFloat(latitude), parseFloat(longitude), H3_RESOLUTION);
//     console.log(`H3 Cell ID: ${h3Cell}`);

//     console.log(`Checking for non-pending reports in H3 cell ${h3Cell}...`);
//     const nearbyReports = await Report.find({
//       h3Cell,
//       status: { $in: ['analyzed', 'assigned', 'completed'] }
//     }).limit(1).lean();

//     if (nearbyReports.length > 0) {
//       console.log(`Found ${nearbyReports.length} non-pending report(s)`);
//       req.files.forEach((file) => {
//         fs.unlink(file.path, (err) => {
//           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
//           else console.log(`Deleted temp file: ${file.path}`);
//         });
//       });
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Already reported, work in progress'
//       });
//     }
//     console.log('No non-pending reports found, proceeding with new report');

//     console.log('Uploading images to Cloudinary...');
//     const uploadPromises = req.files.map((file, index) => {
//       console.log(`Uploading file ${index + 1}: ${file.originalname}`);
//       return cloudinary.uploader.upload(file.path, {
//         folder: 'safe-street-reports',
//         transformation: [{ width: 800, quality: 'auto', fetch_format: 'auto' }],
//       }).catch(err => {
//         console.error(`Cloudinary upload failed for ${file.originalname}:`, err.message);
//         throw new Error(`Cloudinary upload failed: ${err.message}`);
//       });
//     });
//     const results = await Promise.all(uploadPromises);
//     const imageUrls = results.map((result, index) => {
//       console.log(`Uploaded file ${index + 1}: ${result.secure_url}`);
//       return result.secure_url;
//     });
//     console.log(`Uploaded ${imageUrls.length} image(s) to Cloudinary`);

//     req.files.forEach((file) => {
//       fs.unlink(file.path, (err) => {
//         if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
//         else console.log(`Deleted temp file: ${file.path}`);
//       });
//     });

//     console.log('Resolving location name with HERE Maps...');
//     let locationName = 'Unknown Location';
//     try {
//       const hereReverseGeoUrl = `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&apiKey=${HERE_API_KEY}`;
//       const hereResponse = await axios.get(hereReverseGeoUrl);
//       if (hereResponse.status !== 200) {
//         console.log('Error: Failed to resolve location name');
//         throw new Error('Failed to fetch location name from HERE Maps');
//       }
//       locationName = hereResponse.data.items[0]?.title || 'Unknown Location';
//       console.log(`Location name: ${locationName}`);
//     } catch (err) {
//       console.error('HERE Maps reverse geocoding failed:', err.message);
//       console.log('Proceeding with default location name:', locationName);
//     }

//     console.log('Fetching traffic congestion with TomTom...');
//     let trafficCongestionScore = 0;
//     try {
//       const tomTomUrl = `https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?key=${TOMTOM_API_KEY}&point=${latitude},${longitude}`;
//       const tomTomResponse = await axios.get(tomTomUrl);
//       if (tomTomResponse.status !== 200) {
//         console.log('Error: Failed to fetch traffic data');
//         throw new Error('Failed to fetch traffic data from TomTom');
//       }
//       const flowData = tomTomResponse.data.flowSegmentData;
//       const currentSpeed = flowData.currentSpeed || 0;
//       const freeFlowSpeed = flowData.freeFlowSpeed || 1;
//       let congestion = Math.min(10 * (1 - currentSpeed / freeFlowSpeed), 10);
//       congestion = Math.max(congestion, 0);
//       trafficCongestionScore = Math.round(congestion * 10) / 10;
//       console.log(`Traffic congestion score: ${trafficCongestionScore}`);
//     } catch (err) {
//       console.error('TomTom traffic API failed:', err.message);
//       console.log('Proceeding with default traffic congestion score:', trafficCongestionScore);
//     }

//     const reportData = {
//       caseId,
//       imageUrls,
//       userId: req.user._id,
//       location: {
//         type: 'Point',
//         coordinates: [parseFloat(longitude), parseFloat(latitude)],
//         locationName,
//       },
//       trafficCongestionScore,
//       status: 'pending',
//       h3Cell,
//     };
//     console.log('Saving report to Reports collection...');

//     const report = await Report.create(reportData).catch(err => {
//       console.error('MongoDB save failed:', err.message);
//       throw new Error(`MongoDB save failed: ${err.message}`);
//     });
//     console.log(`Report saved successfully (ID: ${report._id})`);

//     return res.status(201).json({
//       status: 'success',
//       data: report,
//     });
//   } catch (error) {
//     if (req.files) {
//       req.files.forEach((file) => {
//         fs.unlink(file.path, (err) => {
//           if (err) console.error(`Failed to delete temp file ${file.path}:`, err);
//           else console.log(`Deleted temp file: ${file.path}`);
//         });
//       });
//     }
//     console.error('Report creation failed:', error.message);
//     if (error.code === 11000) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Report with this caseId already exists'
//       });
//     }
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to create report'
//     });
//   }
// };

// const getReports = async (req, res) => {
//   try {
//     console.log('=== Fetching Reports ===');
//     const reports = await Report.find({ userId: req.user._id, })
//       .populate('userId', 'name email')
//       .sort({ createdAt: -1 })
//       .lean();
//     console.log(`Found ${reports.length} reports`);
//     return res.status(200).json({
//       status: 'success',
//       count: reports.length,
//       data: reports,
//     });
//   } catch (error) {
//     console.error('Failed to fetch reports:', error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch reports'
//     });
//   }
// };

// const getAdminReports = async (req, res) => {
//   try {
//     console.log('=== Fetching Admin Reports ===');
//     const { 
//       h3Cell, 
//       priorityThreshold = 50,
//       sortBy = 'damageResult.priorityScore', 
//       sortOrder = 'desc', 
//       page = 1, 
//       limit = 10 
//     } = req.query;

//     const batchQuery = {
//       'damageResult.priorityScore': { $gte: parseFloat(priorityThreshold) }
//     };
//     if (h3Cell) batchQuery.h3Cell = h3Cell;

//     let batches = await mongoose.connection.collection('batchReports').aggregate([
//       { $match: batchQuery },
//       {
//         $lookup: {
//           from: 'reports',
//           let: { caseIds: '$caseIds' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ['$caseId', '$$caseIds'] },
//                 status: 'analyzed'
//               }
//             },
//             {
//               $project: {
//                 caseId: 1,
//                 imageUrls: 1,
//                 location: 1,
//                 trafficCongestionScore: 1,
//                 h3Cell: 1,
//                 createdAt: 1
//               }
//             }
//           ],
//           as: 'reports'
//         }
//       },
//       { $match: { reports: { $ne: [] } } },
//       {
//         $project: {
//           batchId: 1,
//           h3Cell: 1,
//           centroid: 1,
//           damageResult: 1,
//           reportCount: 1,
//           reports: 1,
//           createdAt: 1
//         }
//       },
//       { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
//       { $skip: (parseInt(page) - 1) * parseInt(limit) },
//       { $limit: parseInt(limit) }
//     ], { hint: { "damageResult.priorityScore": 1 } }).toArray();

//     if (batches.length < limit) {
//       const remainingLimit = limit - batches.length;
//       const lowerPriorityBatches = await mongoose.connection.collection('batchReports').aggregate([
//         {
//           $match: {
//             'damageResult.priorityScore': { $lt: parseFloat(priorityThreshold) },
//             ...(h3Cell ? { h3Cell } : {})
//           }
//         },
//         {
//           $lookup: {
//             from: 'reports',
//             let: { caseIds: '$caseIds' },
//             pipeline: [
//               {
//                 $match: {
//                   $expr: { $in: ['$caseId', '$$caseIds'] },
//                   status: 'analyzed'
//                 }
//               },
//               {
//                 $project: {
//                   caseId: 1,
//                   imageUrls: 1,
//                   location: 1,
//                   trafficCongestionScore: 1,
//                   h3Cell: 1,
//                   createdAt: 1
//                 }
//               }
//             ],
//             as: 'reports'
//           }
//         },
//         { $match: { reports: { $ne: [] } } },
//         {
//           $project: {
//             batchId: 1,
//             h3Cell: 1,
//             centroid: 1,
//             damageResult: 1,
//             reportCount: 1,
//             reports: 1,
//             createdAt: 1
//           }
//         },
//         { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
//         { $skip: (parseInt(page) - 1) * parseInt(limit) },
//         { $limit: remainingLimit }
//       ], { hint: { "damageResult.priorityScore": 1 } }).toArray();

//       batches = [...batches, ...lowerPriorityBatches].sort((a, b) => {
//         const aScore = a.damageResult.priorityScore;
//         const bScore = b.damageResult.priorityScore;
//         return sortOrder === 'desc' ? bScore - aScore : aScore - bScore;
//       });
//     }

//     const total = await mongoose.connection.collection('batchReports').countDocuments({
//       ...(h3Cell ? { h3Cell } : {}),
//       caseIds: {
//         $in: await Report.find({ status: 'analyzed' }).distinct('caseId')
//       }
//     });

//     console.log(`Found ${batches.length} batch reports (total: ${total})`);

//     return res.status(200).json({
//       status: 'success',
//       count: batches.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//       data: batches,
//     });
//   } catch (error) {
//     console.error('Failed to fetch admin reports:', error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch reports'
//     });
//   }
// };

// const getAdminReportsBySeverity = async (req, res) => {
//   try {
//     console.log('=== Fetching Admin Reports by Severity ===');
//     const { severity } = req.params;
//     const { 
//       h3Cell, 
//       sortBy = 'damageResult.priorityScore', 
//       sortOrder = 'desc', 
//       page = 1, 
//       limit = 10 
//     } = req.query;

//     const validSeverities = ['high', 'medium', 'low'];
//     if (!validSeverities.includes(severity)) {
//       console.log(`Invalid severity: ${severity}`);
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Invalid severity. Must be high, medium, or low'
//       });
//     }

//     const batchQuery = {
//       'damageResult.severity': severity
//     };
//     if (h3Cell) batchQuery.h3Cell = h3Cell;

//     const batches = await mongoose.connection.collection('batchReports').aggregate([
//       { $match: batchQuery },
//       {
//         $lookup: {
//           from: 'reports',
//           let: { caseIds: '$caseIds' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: { $in: ['$caseId', '$$caseIds'] },
//                 status: 'analyzed'
//               }
//             },
//             {
//               $project: {
//                 caseId: 1,
//                 imageUrls: 1,
//                 location: 1,
//                 trafficCongestionScore: 1,
//                 h3Cell: 1,
//                 createdAt: 1
//               }
//             }
//           ],
//           as: 'reports'
//         }
//       },
//       { $match: { reports: { $ne: [] } } },
//       {
//         $project: {
//           batchId: 1,
//           h3Cell: 1,
//           centroid: 1,
//           damageResult: 1,
//           reportCount: 1,
//           reports: 1,
//           createdAt: 1
//         }
//       },
//       { $sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 } },
//       { $skip: (parseInt(page) - 1) * parseInt(limit) },
//       { $limit: parseInt(limit) }
//     ], { hint: { "damageResult.severity": 1 } }).toArray();

//     const total = await mongoose.connection.collection('batchReports').countDocuments({
//       'damageResult.severity': severity,
//       ...(h3Cell ? { h3Cell } : {}),
//       caseIds: {
//         $in: await Report.find({ status: 'analyzed' }).distinct('caseId')
//       }
//     });

//     console.log(`Found ${batches.length} batch reports for severity ${severity} (total: ${total})`);

//     return res.status(200).json({
//       status: 'success',
//       count: batches.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//       data: batches,
//     });
//   } catch (error) {
//     console.error(`Failed to fetch admin reports for severity ${severity}:`, error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch reports'
//     });
//   }
// };

// const assignReport = async (req, res) => {
//   try {
//     console.log('=== Assigning Report ===');
//     const { caseId, batchId, workerId } = req.body;

//     if (!caseId && !batchId) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'caseId or batchId required'
//       });
//     }

//     const worker = await User.findById(workerId);
//     if (!worker || worker.role !== 'worker') {
//       console.log('Worker not found or not a worker');
//       return res.status(400).json({
//         status: 'fail',
//         message: 'Worker not found or not a worker'
//       });
//     }

//     let reports = [];
//     if (batchId) {
//       const batch = await mongoose.connection.collection('batchReports').findOne({ batchId });
//       if (!batch) {
//         return res.status(404).json({
//           status: 'fail',
//           message: 'Batch not found'
//         });
//       }
//       reports = await Report.find({
//         caseId: { $in: batch.caseIds },
//         status: 'analyzed'
//       });
//     } else {
//       const report = await Report.findOne({ caseId });
//       if (!report) {
//         return res.status(404).json({
//           status: 'fail',
//           message: 'Report not found'
//         });
//       }
//       if (!['pending', 'analyzed'].includes(report.status)) {
//         return res.status(400).json({
//           status: 'fail',
//           message: 'Report cannot be assigned'
//         });
//       }
//       reports = [report];
//     }

//     if (reports.length === 0) {
//       return res.status(400).json({
//         status: 'fail',
//         message: 'No assignable reports found'
//       });
//     }

//     const assignments = await Promise.all(reports.map(async report => {
//       const assignment = await Assignment.create({
//         reportId: report._id,
//         caseId: report.caseId,
//         workerId: mongoose.Types.ObjectId(workerId),
//         status: 'assigned',
//       });
//       report.status = 'assigned';
//       report.assignmentId = assignment._id;
//       await report.save();
//       return assignment;
//     }));

//     console.log(`Assigned ${reports.length} reports to worker ${workerId}`);
//     return res.status(200).json({
//       status: 'success',
//       data: { reports, assignments },
//     });
//   } catch (error) {
//     console.error('Failed to assign report:', error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to assign report'
//     });
//   }
// };

// const completeReport = async (req, res) => {
//   try {
//     console.log('=== Completing Report ===');
//     const { caseId } = req.body;
//     const workerId = req.user.id;

//     const assignment = await Assignment.findOne({
//       caseId,
//       workerId: mongoose.Types.ObjectId(workerId),
//       status: 'assigned'
//     });
//     if (!assignment) {
//       console.log('Assignment not found or not authorized');
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Assignment not found or not authorized'
//       });
//     }

//     const report = await Report.findOne({ caseId });
//     if (!report) {
//       console.log('Report not found');
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Report not found'
//       });
//     }

//     assignment.status = 'completed';
//     assignment.completedAt = new Date();
//     await assignment.save();

//     report.status = 'completed';
//     await report.save();

//     console.log(`Report ${caseId} completed by worker ${workerId}`);
//     return res.status(200).json({
//       status: 'success',
//       data: { report, assignment },
//     });
//   } catch (error) {
//     console.error('Failed to complete report:', error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to complete report'
//     });
//   }
// };

// const getWorkerReports = async (req, res) => {
//   try {
//     console.log('=== Fetching Worker Reports ===');
//     const workerId = req.user.id;
//     const { status, page = 1, limit = 10 } = req.query;

//     const query = {
//       workerId: mongoose.Types.ObjectId(workerId),
//       status: status || 'assigned'
//     };
//     const assignments = await Assignment.find(query)
//       .populate({
//         path: 'reportId',
//         populate: { path: 'userId', select: 'name email' }
//       })
//       .sort({ assignedAt: -1 })
//       .skip((page - 1) * limit)
//       .limit(parseInt(limit))
//       .lean();

//     const total = await Assignment.countDocuments(query);
//     console.log(`Found ${assignments.length} assignments (total: ${total})`);

//     return res.status(200).json({
//       status: 'success',
//       count: assignments.length,
//       total,
//       page: parseInt(page),
//       pages: Math.ceil(total / limit),
//       data: assignments,
//     });
//   } catch (error) {
//     console.error('Failed to fetch worker reports:', error.message);
//     return res.status(500).json({
//       status: 'error',
//       message: 'Failed to fetch worker reports'
//     });
//   }
// };

// module.exports = {
//   createReport,
//   getReports,
//   getAdminReports,
//   getAdminReportsBySeverity,
//   assignReport,
//   completeReport,
//   getWorkerReports
// };
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

const getAdminReportsBySeverity = async (req, res) => {
  try {
    console.log('=== Fetching Admin Reports by Severity ===');
    const { severity } = req.params;
    const { h3Cell, sortBy = 'damageResult.priorityScore', sortOrder = 'desc', page = 1, limit = 10 } = req.query;

    if (!['high', 'medium', 'low'].includes(severity)) {
      console.log(`Invalid severity: ${severity}`);
      return res.status(400).json({ status: 'fail', message: 'Invalid severity. Must be high, medium, or low' });
    }

    const batchQuery = { 'damageResult.severity': severity };
    if (h3Cell) batchQuery.h3Cell = h3Cell;

    const batches = await BatchReport.aggregate([
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

    const total = await BatchReport.countDocuments({
      'damageResult.severity': severity,
      ...(h3Cell ? { h3Cell } : {}),
      caseIds: { $in: await Report.find({ status: 'analyzed' }).distinct('caseId') }
    });

    console.log(`Found ${batches.length} batch reports for severity ${severity} (total: ${total})`);
    return res.status(200).json({
      status: 'success',
      count: batches.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: batches
    });
  } catch (error) {
    console.error(`Failed to fetch admin reports for severity ${severity}:`, error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch reports' });
  }
};

const assignReport = async (req, res) => {
  try {
    console.log('=== Assigning Report ===');
    console.log('Request body:', req.body);

    const { caseId, batchId, workerId } = req.body;

    if (!workerId) {
      console.log('Missing workerId');
      return res.status(400).json({ status: 'fail', message: 'workerId is required' });
    }

    if (!caseId && !batchId) {
      console.log('Missing caseId and batchId');
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Either caseId or batchId is required' 
      });
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      console.log('Worker not found or not a worker');
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Worker not found or not a worker' 
      });
    }

    let reports = [];
    if (batchId) {
      console.log(`Fetching batch with batchId: ${batchId}`);
      const batch = await BatchReport.findOne({ batchId });
      if (!batch) {
        console.log('Batch not found');
        return res.status(404).json({ status: 'fail', message: 'Batch not found' });
      }
      reports = await Report.find({ 
        caseId: { $in: batch.caseIds }, 
        status: 'analyzed' 
      });
      console.log(`Found ${reports.length} reports in batch`);
    } else if (caseId) {
      console.log(`Fetching report with caseId: ${caseId}`);
      const report = await Report.findOne({ caseId });
      if (!report) {
        console.log('Report not found');
        return res.status(404).json({ status: 'fail', message: 'Report not found' });
      }
      if (!['pending', 'analyzed'].includes(report.status)) {
        console.log('Report cannot be assigned');
        return res.status(400).json({ 
          status: 'fail', 
          message: 'Report cannot be assigned (status must be pending or analyzed)' 
        });
      }
      reports = [report];
    }

    if (reports.length === 0) {
      console.log('No assignable reports found');
      return res.status(400).json({ 
        status: 'fail', 
        message: 'No assignable reports found' 
      });
    }

    const assignments = await Promise.all(
      reports.map(async report => {
        console.log(`Creating assignment for report: ${report.caseId}`);
        const assignment = await Assignment.create({
          reportId: report._id,
          caseId: report.caseId,
          workerId: new mongoose.Types.ObjectId(workerId),
          status: 'assigned'
        });
        report.status = 'assigned';
        report.assignmentId = assignment._id;
        await report.save();
        console.log(`Assigned report ${report.caseId} to worker ${workerId}`);
        return assignment;
      })
    );

    console.log(`Assigned ${reports.length} reports to worker ${workerId}`);
    return res.status(200).json({ 
      status: 'success', 
      data: { reports, assignments } 
    });
  } catch (error) {
    console.error('Failed to assign report:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to assign report: ' + error.message 
    });
  }
};


const completeReport = async (req, res) => {
  console.log("helj")
  try {
    console.log('=== Completing Report ===');
    console.log('Raw request body:', req.body);

    if (!req.body || typeof req.body !== 'object') {
      console.log('Request body is missing or not an object');
      return res.status(400).json({ 
        status: 'fail', 
        message: 'Request body is missing or invalid' 
      });
    }

    const { caseId } = req.body;
    const workerId = req.user.id;

    if (!caseId) {
      console.log('Missing or undefined caseId in request body');
      return res.status(400).json({ 
        status: 'fail', 
        message: 'caseId is required' 
      });
    }

    console.log(`Searching for assignment with caseId: ${caseId}, workerId: ${workerId}, status: assigned`);

    const assignment = await Assignment.findOne({
      caseId,
      workerId: new mongoose.Types.ObjectId(workerId),
      status: 'assigned'
    });

    if (!assignment) {
      console.log(`Assignment not found for caseId: ${caseId}, workerId: ${workerId}`);
      return res.status(404).json({ 
        status: 'fail', 
        message: `No assigned assignment found for caseId ${caseId} and worker ${workerId}` 
      });
    }

    const report = await Report.findOne({ caseId });
    if (!report) {
      console.log(`Report not found for caseId: ${caseId}`);
      return res.status(404).json({ 
        status: 'fail', 
        message: `Report not found for caseId ${caseId}` 
      });
    }

    assignment.status = 'completed';
    assignment.completedAt = new Date();
    await assignment.save();

    report.status = 'completed';
    await report.save();

    console.log(`Report ${caseId} completed by worker ${workerId}`);
    return res.status(200).json({ 
      status: 'success', 
      data: { report, assignment } 
    });
  } catch (error) {
    console.error('Failed to complete report:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Failed to complete report: ' + error.message 
    });
  }
};

const getWorkerReports = async (req, res) => {
  try {
    console.log('=== Fetching Worker Reports ===');
    const workerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { workerId: new mongoose.Types.ObjectId(workerId), status: status || 'assigned' };
    const assignments = await Assignment.find(query)
      .populate({ path: 'reportId', populate: { path: 'userId', select: 'name email' } })
      .sort({ assignedAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const total = await Assignment.countDocuments(query);
    console.log(`Found ${assignments.length} assignments (total: ${total})`);

    return res.status(200).json({
      status: 'success',
      count: assignments.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: assignments
    });
  } catch (error) {
    console.error('Failed to fetch worker reports:', error.message);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch worker reports' });
  }
};

module.exports = {
  createReport,
  getReports,
  getAdminReports,
  getAdminReportsBySeverity,
  assignReport,
  completeReport,
  getWorkerReports
};
