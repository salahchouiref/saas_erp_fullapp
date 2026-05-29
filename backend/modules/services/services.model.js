const mongoose = require('mongoose');

const ServiceCatalogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['consulting', 'development', 'design', 'support', 'training', 'maintenance', 'other'] },
  estimatedDuration: { type: Number },
  durationUnit: { type: String, enum: ['hours', 'days', 'weeks', 'months'], default: 'hours' },
  basePrice: { type: Number, min: 0 },
  isActive: { type: Boolean, default: true },
  requiredSkills: [{ type: String }]
}, { timestamps: true });

const ServiceRequestSchema = new mongoose.Schema({
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['new', 'assigned', 'in_progress', 'on_hold', 'completed', 'cancelled'],
    default: 'new'
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  requestedDate: { type: Date, default: Date.now },
  startDate: { type: Date },
  completionDate: { type: Date },
  estimatedHours: { type: Number },
  actualHours: { type: Number, default: 0 },
  costEstimate: { type: Number, min: 0 },
  finalCost: { type: Number, min: 0 },
  notes: { type: String },
  attachments: [{ name: String, url: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

ServiceRequestSchema.index({ clientId: 1, status: 1, assignedTo: 1 });

const TechnicianSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String },
  skills: [{ type: String }],
  isAvailable: { type: Boolean, default: true },
  rating: { type: Number, min: 1, max: 5, default: 5 }
}, { timestamps: true });

const ServiceLifecycleSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  status: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  changedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const ServiceReportSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceRequest', required: true },
  title: { type: String, required: true },
  content: { type: String },
  findings: [{ type: String }],
  recommendations: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const ServiceCatalog = mongoose.model('ServiceCatalog', ServiceCatalogSchema);
const ServiceRequest = mongoose.model('ServiceRequest', ServiceRequestSchema);
const Technician = mongoose.model('Technician', TechnicianSchema);
const ServiceLifecycle = mongoose.model('ServiceLifecycle', ServiceLifecycleSchema);
const ServiceReport = mongoose.model('ServiceReport', ServiceReportSchema);

module.exports = { ServiceCatalog, ServiceRequest, Technician, ServiceLifecycle, ServiceReport };
