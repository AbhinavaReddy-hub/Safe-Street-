const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/workers', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.getWorkers);

module.exports = router;
