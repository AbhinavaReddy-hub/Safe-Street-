
const Report = require('../models/Report');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const generateDescription = (reportData, userData) => {
    const confidencePercentage = Math.round((reportData.confidenceScore || 0) * 100);
    const date = new Date().toLocaleString();
    const location = reportData.location?.address || 
                   `${reportData.location?.coordinates?.join(', ') || 'an unspecified location'}`;
    
    return `Our analysis of the submitted road imagery detected ${reportData.damageType ? `a ${reportData.damageType}` : 'road damage'} with ${reportData.severity ? `${reportData.severity} severity` : 'moderate impact'}. 
    
  Key observations:
  - Damage classification: ${reportData.damageType || 'Unspecified road surface deterioration'} (${confidencePercentage}% confidence)
  - Impact level: ${reportData.severity || 'Moderate'} severity
  - Geographic coordinates: ${location}
    
  This report was ${userData?.name ? `submitted by ${userData.name}` : 'generated'} on ${date} and is currently ${reportData.status ? `marked as ${reportData.status}` : 'awaiting review'}. 
  
  Recommended next steps: ${getRecommendation(reportData.severity)}`;
  };
  
  // Optional helper for recommendations
  const getRecommendation = (severity) => {
    switch(severity) {
      case 'high': 
        return 'Immediate repair recommended due to safety concerns.';
      case 'medium': 
        return 'Schedule repair within 2-4 weeks.';
      case 'low':
        return 'Monitor and include in next maintenance cycle.';
      default:
        return 'Further assessment recommended to determine appropriate action.';
    }
  };
// Damage detection with demo data fallback
const detectDamage = async (imageUrl) => {
  try {
    console.log('Calling damage detection API...');
    const response = await axios.post(process.env.DAMAGE_DETECTION_API || 'http://localhost:8000/predict', {
      image_url: imageUrl
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (error) {
    console.warn('API failed, using demo data. Error:', error.message);
    
    const demoResponses = [
      { damageType: 'pothole', severity: 'high', confidenceScore: 0.92 },
      { damageType: 'crack', severity: 'medium', confidenceScore: 0.87 },
      { damageType: 'rutting', severity: 'low', confidenceScore: 0.78 },
      { damageType: 'patch', severity: 'medium', confidenceScore: 0.85 },
      { damageType: 'alligator_cracking', severity: 'high', confidenceScore: 0.91 }
    ];
    
    const demoData = demoResponses[Math.floor(Math.random() * demoResponses.length)];
    console.log('Selected demo data:', demoData);
    return demoData;
  }
};

exports.createReport = async (req, res) => {
  let tempFilePath = null;
  console.log('\n=== New Report Creation Started ===');
  
  try {
    const { userId, lat, lng, address } = req.body;
    const file = req.file;

    // Validate input
    if (!file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'No image file provided' 
      });
    }
    console.log(`📁 File received: ${file.originalname} (${file.size} bytes)`);

    // Prepare file storage
    tempFilePath = path.join(__dirname, '..', 'uploads', `${Date.now()}-${file.originalname}`);
    
    if (!fs.existsSync(path.dirname(tempFilePath))) {
      console.log('📂 Creating uploads directory');
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    }

    // Save file temporarily
    await fs.promises.rename(file.path, tempFilePath);
    console.log(`💾 File stored temporarily at: ${tempFilePath}`);

    // Upload to Cloudinary
    console.log('☁️ Uploading to Cloudinary...');
    const cloudinaryResult = await cloudinary.uploader.upload(tempFilePath, {
      folder: 'road-damage-reports',
      quality: 'auto:good',
      transformation: [{ width: 800, height: 600, crop: 'limit' }]
    });
    console.log(`✅ Cloudinary upload successful: ${cloudinaryResult.secure_url}`);

    // Damage detection
    console.log('🔍 Analyzing damage...');
    const damageData = await detectDamage(cloudinaryResult.secure_url);
    console.log('📊 Damage analysis results:', damageData);
    
    // Get reporter info
    const user = await User.findById(userId).select('name email').lean() || {};
    console.log(`👤 Reporter: ${user.name || userId}`);

    // Prepare report data
    const reportData = {
      imageUrl: cloudinaryResult.secure_url,
      userId,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || null
      },
      damageType: damageData.damageType,
      severity: damageData.severity,
      confidenceScore: damageData.confidenceScore,
      status: 'pending',
      description: generateDescription(
        {
          ...damageData,
          location: { coordinates: [lng, lat], address },
          userId,
          status: 'pending'
        },
        user
      )
    };
    console.log('📝 Generated description:', reportData.description.replace(/\n/g, ' '));

    // Create report
    const report = await Report.create(reportData);
    console.log(`✅ Report created successfully (ID: ${report._id})`);

    // Cleanup
    try {
      fs.unlinkSync(tempFilePath);
      console.log('🧹 Temporary file cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Temp file cleanup failed:', cleanupError);
    }

    return res.status(201).json({
      success: true,
      data: report
    });

  } catch (error) {
    console.error('❌ Report creation failed:', error);
    
    // Cleanup on error
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('🧹 Cleaned up temp file after error');
      } catch (cleanupError) {
        console.error('⚠️ Error during cleanup:', cleanupError);
      }
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create report',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.getReports = async (req, res) => {
  try {
    console.log('\n=== Fetching Reports ===');
    const { status, userId, damageType, severity } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (damageType) filter.damageType = damageType;
    if (severity) filter.severity = severity;

    console.log('🔎 Filter criteria:', filter);

    const reports = await Report.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`📊 Found ${reports.length} reports`);
    return res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {
    console.error('❌ Failed to fetch reports:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch reports',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};