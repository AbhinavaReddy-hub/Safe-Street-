

const { v4: uuidv4 } = require('uuid');
const Report          = require('../models/Report');
const logger          = require('../utils/logger');

/**
 * Persist a new report in “pending” state.
 *
 * @param {Object} params
 * @param {string[]} params.imageUrls
 * @param {string}   params.userId
 * @param {{ lng:number, lat:number, locationName:string }} params.location
 * @param {number}   params.trafficCongestionScore
 * @returns {Promise<Report>}
 */
async function createReport({ imageUrls, userId, location, trafficCongestionScore }) {
  try {
    const doc = await Report.create({
      caseId: uuidv4(),                     // ← generate unique ID
      imageUrls,
      userId,
      location: {
        type: 'Point',
        coordinates: [ location.lng, location.lat ],
        locationName: location.locationName
      },
      trafficCongestionScore,
      status: 'pending'
    });
    logger.info(`Report created: ${doc.caseId}`);
    return doc;
  } catch (err) {
    logger.error(`reportService.createReport error: ${err.message}`);
    throw err;
  }
}

module.exports = { createReport };
