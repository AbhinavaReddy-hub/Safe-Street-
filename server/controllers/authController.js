const User = require('../models/User');
const jwt = require('jsonwebtoken');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      role,
      isVerified: false
    });

    const token = signToken(user._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
exports.login = async (req, res, next) => {
    try {
      const { email, password } = req.body;
  
      // 1) Check if email and password exist
      if (!email || !password) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide email and password'
        });
      }
  
      // 2) Check if user exists and password is correct
      const user = await User.findOne({ email }).select('+password');
  
      if (!user || !(await user.correctPassword(password, user.password))) {
        return res.status(401).json({
          status: 'fail',
          message: 'Incorrect email or password'
        });
      }
  
      // 3) If everything ok, send token to client
      const token = signToken(user._id);
      
      res.status(200).json({
        status: 'success',
        token,
        data: {
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        }
      });
    } catch (err) {
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    }
  };