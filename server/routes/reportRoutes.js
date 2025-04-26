const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const upload = require('../middleware/uploadMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

router.post(
  '/',
  authMiddleware.protect,
  upload.single('image'),
  reportController.createReport
);

router.get(
  '/',
  authMiddleware.protect,
  reportController.getReports
);

module.exports = router;