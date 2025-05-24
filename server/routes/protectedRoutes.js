const express = require('express');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/me', protect, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// Admin-only route
router.get('/admin-data', protect, restrictTo('admin'), (req, res) => {
    res.status(200).json({ message: 'Only accessible by admins!' });
});

module.exports = router;
