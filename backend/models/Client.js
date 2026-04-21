const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  email: { type: String, lowercase: true },
  phone: { type: String },
  company: { type: String },
  industry: { type: String },
  status: { type: String, enum: ['lead', 'prospect', 'active', 'inactive', 'churned'], default: 'lead' },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Maroc' }
  },
  contactPerson: {
    name: { type: String },
    role: { type: String },
    email: { type: String },
    phone: { type: String }
  },
  website: { type: String },
  taxId: { type: String },
  registrationNumber: { type: String },
  annualRevenue: { type: Number, min: 0 },
  employeeCount: { type: Number, min: 0 },
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  notes: { type: String },
  tags: [{ type: String }],
  source: { type: String, enum: ['website', 'referral', 'cold_call', 'event', 'other'], default: 'website' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nextFollowUp: { type: Date },
  rating: { type: Number, min: 1, max: 5 }
}, { timestamps: true });

ClientSchema.index({ name: 1 });
ClientSchema.index({ status: 1 });
ClientSchema.index({ industry: 1 });
ClientSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Client', ClientSchema);