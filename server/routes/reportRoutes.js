// // const express = require('express');
// //    const router = express.Router();
// //    const reportController = require('../controllers/reportController');
// //    const authMiddleware = require('../middleware/authMiddleware');
// //    const { upload, handleMulterErrors, cleanupOnError } = require('../middleware/uploadMiddleware');

// //    // Debug middleware to log incoming form data
// //    const debugFormData = (req, res, next) => {
// //      console.log('Incoming request to /api/reports');
// //      console.log('Headers:', req.headers['content-type']);
// //      console.log('Body:', req.body);
// //      next();
// //    };

// //    router.post(
// //      '/',
// //      authMiddleware.protect,
// //      debugFormData, // Add debugging
// //      upload,
// //      handleMulterErrors,
// //      cleanupOnError,
// //      reportController.createReport
// //    );

// //    router.get(
// //      '/',
// //      authMiddleware.protect,
// //      reportController.getReports
// //    );

// //    module.exports = router;
// const express = require('express');
// const router = express.Router();
// const reportController = require('../controllers/reportController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { upload, handleMulterErrors, cleanupOnError } = require('../middleware/uploadMiddleware');

// // Debug middleware to log incoming form data
// const debugFormData = (req, res, next) => {
//   console.log(`Incoming request to ${req.originalUrl}`);
//   console.log('Headers:', req.headers['content-type']);
//   console.log('Body:', req.body);
//   next();
// };

// // Create a report (user)
// router.post(
//   '/',
//   authMiddleware.protect,
//   debugFormData,
//   upload,
//   handleMulterErrors,
//   cleanupOnError,
//   reportController.createReport
// );

// // Get user reports
// router.get(
//   '/',
//   authMiddleware.protect,
//   reportController.getReports
// );

// // Get admin reports (priority-based)
// router.get(
//   '/admin/reports',
//   authMiddleware.protect,
//   authMiddleware.restrictTo('admin'),
//   reportController.getAdminReports
// );

// // Get admin reports by severity
// router.get(
//   '/admin/reports/severity/:severity',
//   authMiddleware.protect,
//   authMiddleware.restrictTo('admin'),
//   reportController.getAdminReportsBySeverity
// );

// // Assign report to worker (admin)
// router.post(
//   '/admin/assign',
//   authMiddleware.protect,
//   authMiddleware.restrictTo('admin'),
//   reportController.assignReport
// );

// // Complete a report (worker)
// router.post(
//   '/worker/complete',
//   authMiddleware.protect,
//   authMiddleware.restrictTo('worker'),
//   reportController.completeReport
// );

// // Get worker reports
// router.get(
//   '/worker/reports',
//   authMiddleware.protect,
//   authMiddleware.restrictTo('worker'),
//   reportController.getWorkerReports
// );

// module.exports = router;
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload, handleMulterErrors, cleanupOnError } = require('../middleware/uploadMiddleware');

// Log incoming requests for debugging
const logRequest = (req, res, next) => {
  console.log(`Request: ${req.method} ${req.originalUrl}`, req.body);
  next();
};

// User Routes
router.post('/', authMiddleware.protect, logRequest, upload, handleMulterErrors, cleanupOnError, reportController.createReport);
router.get('/', authMiddleware.protect, logRequest, reportController.getReports);

// Admin Routes
router.get('/reports', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getAdminReports);
router.get('/reports/severity/:severity', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getAdminReportsBySeverity);
router.post('/assign', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.assignReport);

// Worker Routes
router.post('/worker/complete', authMiddleware.protect, authMiddleware.restrictTo('worker'), logRequest, reportController.completeReport);
router.get('/worker/reports', authMiddleware.protect, authMiddleware.restrictTo('worker'), logRequest, reportController.getWorkerReports);

module.exports = router;