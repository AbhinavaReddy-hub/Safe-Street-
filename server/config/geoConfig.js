// server/config/geoConfig.js

/**
 * Distance (in meters) to cluster pending reports around a seed.
 */
const BATCH_RADIUS_METERS = 200;

/**
 * Earth’s radius in meters. 
 * Used to convert linear distance (meters) into radians if needed.
 */
const EARTH_RADIUS_METERS = 6_371_000;

/**
 * Convert meters to radians for MongoDB geospatial queries.
 * distanceInRadians = meters / earthRadiusInMeters
 * @param {number} meters 
 * @returns {number}
 */
function metersToRadians(meters) {
  return meters / EARTH_RADIUS_METERS;
}

module.exports = {
  BATCH_RADIUS_METERS,
  metersToRadians,
};
