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
router.post('/reports', authMiddleware.protect, logRequest, upload, handleMulterErrors, cleanupOnError, reportController.createReport);
router.get('/reports', authMiddleware.protect, logRequest, reportController.getReports);

// Admin Routes
router.get('/admin/reports', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getAdminReports);
router.get('/reports/severity/:severity', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getAdminReportsBySeverity);
router.post('/assign', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.assignReport);
router.get('/assigned', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getAssignedReports);
router.get('/completed', authMiddleware.protect, authMiddleware.restrictTo('admin'), logRequest, reportController.getCompletedReports);
// Worker Routes
router.post('/worker/complete', authMiddleware.protect, authMiddleware.restrictTo('worker'), logRequest, reportController.completeReport);
router.get('/worker/reports', authMiddleware.protect, authMiddleware.restrictTo('worker'), logRequest, reportController.getWorkerReports);

module.exports = router;
