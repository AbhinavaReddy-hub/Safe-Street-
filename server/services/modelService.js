// server/services/modelService.js

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Calls the FastAPI /predict_case endpoint with a batch of image URLs.
 * @param {string[]} imageUrls
 * @returns {Promise<{
 *   damageType: string,
 *   severity: string,
 *   confidenceScore: number
 * }>}
 */
async function predictBatch(imageUrls) {
  if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
    throw new Error('predictBatch requires a non-empty array of image URLs');
  }

  try {
    logger.info(`📡 Sending batch of ${imageUrls.length} images to modelService`);

    const endpoint = process.env.PREDICT_CASE_URL || 'http://localhost:8000/predict_case';

    const response = await axios.post(endpoint, {
      image_urls: imageUrls
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30_000  // 30 seconds timeout
    });

    const data = response.data;
    logger.info(`💡 ModelService response: ${JSON.stringify(data)}`);

    // Validate response shape
    if (
      typeof data.damageType !== 'string' ||
      typeof data.severity   !== 'string' ||
      typeof data.confidenceScore !== 'number'
    ) {
      throw new Error('Invalid response format from modelService');
    }

    return data;

  } catch (err) {
    logger.error('❌ Error in modelService.predictBatch:', err.message);
    throw err;
  }
}

module.exports = {
  predictBatch
};
if (require.main === module) {
    // Quick local test
    predictBatch([
      'https://res.cloudinary.com/dowliahd4/image/upload/v1747245954/safe-street-reports/xj4k7o7oumiyaf22yecc.jpg',
      'https://res.cloudinary.com/dowliahd4/image/upload/v1747245954/safe-street-reports/xj4k7o7oumiyaf22yecc.jpg'
    ]).then(console.log).catch(console.error);
  }
  