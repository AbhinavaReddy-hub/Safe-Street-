
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  damageType: String,
  severity: String,
  confidenceScore: Number,
  status: {
    type: String,
    default: 'pending'
  },
  description: {  // New field
    type: String,
    required: true
  }
}, { timestamps: true });

reportSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Report', reportSchema);