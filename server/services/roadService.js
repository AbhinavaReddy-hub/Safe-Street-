
const axios  = require('axios');
const logger = require('../utils/logger');

async function batchValidateRoad(imageUrls) {
  try {
    const resp = await axios.post(
      `${process.env.ROAD_API_URL}/validate-road`,
      { image_urls: imageUrls },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000
      }
    );

    if (!resp.data || !Array.isArray(resp.data.valid)) {
      throw new Error('Unexpected response format from road API');
    }
    return resp.data.valid;
  } catch (err) {
    logger.error(`roadService.batchValidateRoad error: ${err.message}`);
    // On failure, treat all as invalid
    return imageUrls.map(() => false);
  }
}

module.exports = { batchValidateRoad };
