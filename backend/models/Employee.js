const mongoose = require('mongoose');

const EmployeeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  firstName: { type: String, required: true, minlength: 2, maxlength: 50 },
  lastName: { type: String, required: true, minlength: 2, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String },
  position: { type: String, required: true },
  department: { type: String },
  salary: { type: Number, required: true, min: 0 },
  hireDate: { type: Date, default: Date.now },
  leaveBalance: { type: Number, default: 0, min: 0 },
  leaveTaken: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['active', 'inactive', 'on_leave', 'terminated'], default: 'active' },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Maroc' }
  },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  skills: [{ type: String }],
  notes: { type: String },
  avatar: { type: String }
}, { timestamps: true });

EmployeeSchema.index({ firstName: 1, lastName: 1 });
EmployeeSchema.index({ department: 1 });
EmployeeSchema.index({ status: 1 });

EmployeeSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

EmployeeSchema.set('toJSON', { virtuals: true });
EmployeeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Employee', EmployeeSchema);