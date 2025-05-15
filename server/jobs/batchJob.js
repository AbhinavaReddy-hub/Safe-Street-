// // server/jobs/batchJob.js

// const Report = require('../models/Report');
// const { collectBatch } = require('../services/batchService');
// const { predictBatch } = require('../services/modelService');
// const { computePriority } = require('../services/priorityService');
// const logger = require('../utils/logger');

// /**
//  * Runs one batch cycle:
//  *  - Collect reports & image URLs
//  *  - Call modelService to get {damageType, severity, confidenceScore}
//  *  - Compute priority for each report
//  *  - Update reports in DB to status "analyzed"
//  */
// async function runBatch() {
//   try {
//     logger.info('⏰ Batch job started');

//     // 1. Collect batch
//     const { reports, imageUrls } = await collectBatch();
//     if (!reports.length) {
//       logger.info('✔️ No pending reports to process');
//       return;
//     }

//     logger.info(`🔄 Processing ${reports.length} reports with ${imageUrls.length} images`);

//     // 2. Call FastAPI model
//     const { damageType, severity, confidenceScore } = await predictBatch(imageUrls);
//     logger.info(`💡 Model returned:`, { damageType, severity, confidenceScore });

//     // 3. Compute & update each report
//     for (const report of reports) {
//       const priorityScore = computePriority(
//         {
//           severity,
//           damageType,
//           trafficScore: report.trafficCongestionScore,
//           confidenceScore
//         },
//         {
//           wTraffic: 0.35,
//           wSeverity: 0.35,
//           wType: 0.2,
//           wConf: 0.1
//         }
//       );

//       await Report.updateOne(
//         { _id: report._id },
//         {
//           $set: {
//             damageType,
//             severity,
//             confidenceScore,
//             priorityScore,
//             status: 'analyzed'
//           }
//         }
//       );

//       logger.info(`✅ Updated case ${report.caseId} → priority ${priorityScore.toFixed(2)}`);
//     }

//     logger.info('✅ Batch job completed successfully');

//   } catch (err) {
//     logger.error('❌ Error in batch job:', err);
//   }
// }

// module.exports = { runBatch };

// server/jobs/batchJob.js

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
