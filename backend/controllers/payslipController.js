const Payslip = require('../models/Payslip');

exports.createPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.create(req.body);
    res.status(201).json(payslip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find().populate('employeeId');
    res.json(payslips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id).populate('employeeId');
    if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
    res.json(payslip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
    res.json(payslip);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findByIdAndDelete(req.params.id);
    if (!payslip) return res.status(404).json({ message: 'Payslip not found' });
    res.json({ message: 'Payslip deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
