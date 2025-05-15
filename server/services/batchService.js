// server/services/batchService.js

const Report = require('../models/Report');
const haversine = require('haversine-distance');
const { BATCH_RADIUS_METERS } = require('../config/geoConfig');

/**
 * Collect one batch of pending reports based on proximity.
 *
 * @returns {Promise<{ reports: Array, imageUrls: string[] }>}
 */
async function collectBatch() {
  // 1) Find a seed pending report
  const seed = await Report.findOne({ status: 'pending' }).lean();
  if (!seed) {
    return { reports: [], imageUrls: [] };
  }

  const [seedLng, seedLat] = seed.location.coordinates;

  // 2) Fetch all pending and filter by distance
  const allPending = await Report.find({ status: 'pending' }).lean();
  const batchReports = allPending.filter(r => {
    const [lng, lat] = r.location.coordinates;
    const dist = haversine(
      { lat: seedLat, lng: seedLng },
      { lat,   lng      }
    );
    return dist <= BATCH_RADIUS_METERS;
  });

  if (!batchReports.length) {
    return { reports: [], imageUrls: [] };
  }

  // 3) Collect all image URLs
  const imageUrls = batchReports.flatMap(r => r.imageUrls);

  return { reports: batchReports, imageUrls };
}

module.exports = { collectBatch };
