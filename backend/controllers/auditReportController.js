const AuditReport = require('../models/AuditReport');

exports.createAuditReport = async (req, res) => {
  try {
    const report = await AuditReport.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditReports = async (req, res) => {
  try {
    const reports = await AuditReport.find().populate('projectId createdBy');
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAuditReport = async (req, res) => {
  try {
    const report = await AuditReport.findById(req.params.id).populate('projectId createdBy');
    if (!report) return res.status(404).json({ message: 'Audit report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAuditReport = async (req, res) => {
  try {
    const report = await AuditReport.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!report) return res.status(404).json({ message: 'Audit report not found' });
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAuditReport = async (req, res) => {
  try {
    const report = await AuditReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: 'Audit report not found' });
    res.json({ message: 'Audit report deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
