
// const express = require('express');
// const router  = express.Router();

// const { createReport, getReports } = require('../controllers/reportController');
// const auth                         = require('../middleware/authMiddleware');
// const {
//   upload,
//   handleMulterErrors,
//   cleanupOnError
// } = require('../middleware/uploadMiddleware');

// // Debug form-data
// const debugForm = (req, res, next) => {
//   console.log('→ POST /api/reports');
//   console.log('  Content-Type:', req.headers['content-type']);
//   console.log('  Body fields:', req.body);
//   console.log('  File count:', req.files?.length || 0);
//   next();
// };

// router.post(
//   '/',
//   auth.protect,
//   debugForm,
//   upload,               // does .array('images')
//   handleMulterErrors,
//   cleanupOnError,
//   createReport
// );

// router.get(
//   '/',
//   auth.protect,
//   getReports
// );

// module.exports = router;

// server/routes/reportRoutes.js
const express = require('express');
const router  = express.Router();

const { createReport, getReports } = require('../controllers/reportController');
const auth                         = require('../middleware/authMiddleware');
const {
  upload,            // our multerDebug wrapper (calls array('images'))
  handleMulterErrors,
  cleanupOnError
} = require('../middleware/uploadMiddleware');

// Debug form-data
const debugForm = (req, res, next) => {
  console.log('→ POST /api/reports');
  console.log('  Content-Type:', req.headers['content-type']);
  console.log('  Body fields:', req.body);
  console.log('  File count:', req.files?.length || 0);
  next();
};

router.post(
  '/',
  auth.protect,
  debugForm,
  upload,               // populates req.files from field name "images"
  handleMulterErrors,
  cleanupOnError,
  createReport
);

router.get(
  '/',
  auth.protect,
  getReports
);

module.exports = router;
