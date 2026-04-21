const mongoose = require('mongoose');

const PayslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  baseSalary: { type: Number, required: true },
  tax: { type: Number, required: true },
  net: { type: Number, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payslip', PayslipSchema);
