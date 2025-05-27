




const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  caseId: {
    type: String,
    required: true,
    unique: true, // Ensures caseId is unique
  },
  imageUrls: {
    type: [String], // Array of Cloudinary URLs
    required: true,
    validate: {
      validator: function (array) {
        return array.length > 0; // Ensure at least one image URL
      },
      message: 'At least one image URL is required',
    },
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    type: {
      type: String,
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    locationName: {
      type: String, // Resolved area name from HERE Maps
      required: true,
    },
  },
  trafficCongestionScore: {
    type: Number, // Score from TomTom API
    required: true,
    min: 0, // Assuming score is non-negative
  },
  status: {
    type: String,
    enum: ['pending', 'analyzed', 'assigned', 'completed'],
    default: 'pending',
  },
  message: {
    type:String,
    default: "None",
  },
  h3Cell: {
    type: String,
    required: true, // H3 cell ID at resolution 12
  },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }
}, { timestamps: true });

// Indexes for efficient queries
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ caseId: 1 });
reportSchema.index({ userId: 1 });
reportSchema.index({ h3Cell: 1 }); 
module.exports = mongoose.model('Report', reportSchema);
