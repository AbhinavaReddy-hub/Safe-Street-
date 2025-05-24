const mongoose = require('mongoose');

const batchReportSchema = new mongoose.Schema({
  batchId: { type: String, required: true },
  caseIds: [{ type: String }],
  centroid: {
    latitude: Number,
    longitude: Number
  },
  damageResult: {
    damageType: String,
    severity: String,
    confidenceScore: Number,
    severityWeight: Number,
    priorityScore: Number
  },
  reportCount: Number,
  h3Cell: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BatchReport', batchReportSchema, 'batchReports');