const User = require('../models/User');

exports.getWorkers = async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' }).select('_id name email');

    res.status(200).json({
      status: 'success',
      results: workers.length,
      data: workers
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message
    });
  }
};
