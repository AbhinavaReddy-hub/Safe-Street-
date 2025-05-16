

// const Report = require('../models/Report');
// const logger = require('../utils/logger');
// const { BATCH_RADIUS_METERS } = require('../config/geoConfig');

// // consider all “live” statuses here
// const LIVE_STATUSES = ['pending', 'in-progress', 'assigned', 'analyzed'];

// async function isDuplicate(loc, statuses = LIVE_STATUSES) {
//   try {
//     const dup = await Report.findOne({
//       status: { $in: statuses },
//       location: {
//         $near: {
//           $geometry: { type: 'Point', coordinates: [ loc.lng, loc.lat ] },
//           $maxDistance: BATCH_RADIUS_METERS
//         }
//       }
//     }).lean();

//     return !!dup;
//   } catch (err) {
//     logger.error(`dedupeService.isDuplicate error: ${err.message}`);
//     // On error, be conservative and flag as duplicate
//     return true;
//   }
// }

// module.exports = { isDuplicate };





// server/services/dedupeService.js

const Report           = require('../models/Report');
const logger           = require('../utils/logger');
const { BATCH_RADIUS_METERS } = require('../config/geoConfig');

// Only consider “live” statuses as duplicates
const LIVE_STATUSES = [
  'in-progress',
  'assigned',
  'analyzed'
];

async function isDuplicate(loc, statuses = LIVE_STATUSES) {
  try {
    const dup = await Report.findOne({
      status: { $in: statuses },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [ loc.lng, loc.lat ]
          },
          $maxDistance: BATCH_RADIUS_METERS
        }
      }
    }).lean();

    return !!dup;
  } catch (err) {
    logger.error(`dedupeService.isDuplicate error: ${err.message}`);
    // On error, be conservative and treat as duplicate
    return true;
  }
}

module.exports = { isDuplicate };
