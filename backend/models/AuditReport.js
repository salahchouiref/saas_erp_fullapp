const mongoose = require('mongoose');

const AuditReportSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  content: { type: String },
  anomalies: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('AuditReport', AuditReportSchema);
