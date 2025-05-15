

const Report = require('../models/Report');
const { collectBatch } = require('../services/batchService');
const { predictBatch } = require('../services/modelService');
const { computePriority } = require('../services/priorityService');
const logger = require('../utils/logger');

/**
 * Runs one batch cycle:
 *   1. Collect reports + image URLs within 100 m of a seed pending report
 *   2. Call FastAPI model once for all images
 *   3. Compute a unified priority score
 *   4. Update every report in that batch
 */
async function runBatch() {
  try {
    logger.info('⏰ Batch job started');

    // 1) Gather the batch
    const { reports, imageUrls } = await collectBatch();
    if (reports.length === 0) {
      logger.info('✔️ No pending reports to process');
      return;
    }
    logger.info(`🔄 Collected ${reports.length} reports and ${imageUrls.length} images`);

    // 2) Get a single prediction for all images
    const { damageType, severity, confidenceScore } = await predictBatch(imageUrls);
    logger.info(`💡 Model result:`, { damageType, severity, confidenceScore });

    // 3) Compute the priority score once
    //    (weight defaults can be overridden in computePriority arguments)
    const sampleReport = reports[0];
    const priorityScore = computePriority(
      {
        severity,
        damageType,
        trafficScore: sampleReport.trafficCongestionScore,
        confidenceScore
      }
      // Optional: pass custom weights here if needed
    );
    logger.info(`⭐ Computed priorityScore = ${priorityScore.toFixed(2)}`);

    // 4) Update all reports in one go
    const ids = reports.map(r => r._id);
    await Report.updateMany(
      { _id: { $in: ids } },
      {
        $set: {
          status:           'analyzed',
          damageType,
          severity,
          confidenceScore,
          priorityScore
        }
      }
    );

    logger.info(`✅ Updated ${reports.length} reports to 'analyzed'`);

  } catch (err) {
    logger.error('❌ Error in batch job:', err);
  }
}

module.exports = { runBatch };
