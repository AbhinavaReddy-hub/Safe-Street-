// const express = require('express');
// const router = express.Router();
// const reportController = require('../controllers/reportController');
// const upload = require('../middleware/uploadMiddleware');
// const authMiddleware = require('../middleware/authMiddleware');

// router.post(
//   '/',
//   authMiddleware.protect,
//   upload.single('image'),
//   reportController.createReport
// );

// router.get(
//   '/',
//   authMiddleware.protect,
//   reportController.getReports
// );

// module.exports = router;









// const express = require('express');
// const router = express.Router();
// const reportController = require('../controllers/reportController');
// const authMiddleware = require('../middleware/authMiddleware');
// const { upload, cleanupOnError } = require('../middleware/uploadMiddleware');

// router.post(
//   '/',
//   authMiddleware.protect,
//   upload, // Handles multiple image uploads under 'images' field
//   cleanupOnError, // Cleans up temporary files on error
//   reportController.createReport
// );

// router.get(
//   '/',
//   authMiddleware.protect,
//   reportController.getReports
// );

// module.exports = router;



const express = require('express');
   const router = express.Router();
   const reportController = require('../controllers/reportController');
   const authMiddleware = require('../middleware/authMiddleware');
   const { upload, handleMulterErrors, cleanupOnError } = require('../middleware/uploadMiddleware');

   // Debug middleware to log incoming form data
   const debugFormData = (req, res, next) => {
     console.log('Incoming request to /api/reports');
     console.log('Headers:', req.headers['content-type']);
     console.log('Body:', req.body);
     next();
   };

   router.post(
     '/',
     authMiddleware.protect,
     debugFormData, // Add debugging
     upload,
     handleMulterErrors,
     cleanupOnError,
     reportController.createReport
   );

   router.get(
     '/',
     authMiddleware.protect,
     reportController.getReports
   );

   module.exports = router;