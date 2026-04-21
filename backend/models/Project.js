const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 2, maxlength: 200 },
  description: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'review', 'done', 'blocked'], 
    default: 'todo' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  startDate: { type: Date },
  dueDate: { type: Date },
  completedDate: { type: Date },
  estimatedHours: { type: Number, min: 0 },
  actualHours: { type: Number, min: 0, default: 0 },
  order: { type: Number, default: 0 },
  tags: [{ type: String }],
  attachments: [{ name: String, url: String, type: String }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  relatedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isBlocked: { type: Boolean, default: false },
  blockReason: { type: String }
}, { timestamps: true });

const TeamMemberSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { 
    type: String, 
    enum: ['manager', 'developer', 'designer', 'qa', 'analyst', 'other'], 
    default: 'developer' 
  },
  joinedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  permissions: {
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canAssign: { type: Boolean, default: false }
  }
}, { timestamps: true });

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 200 },
  description: { type: String },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'active', 'on_hold', 'completed', 'cancelled', 'archived'], 
    default: 'draft' 
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  startDate: { type: Date },
  dueDate: { type: Date },
  completedDate: { type: Date },
  budget: { type: Number, min: 0 },
  actualCost: { type: Number, min: 0, default: 0 },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  tasks: [{
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dueDate: { type: Date },
    status: { type: String, enum: ['todo', 'in_progress', 'review', 'done', 'blocked'], default: 'todo' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' }
  }],
  teamMembers: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['manager', 'developer', 'designer', 'qa', 'analyst', 'other'] },
    joinedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  deliverables: [{ type: String }],
  documents: [{
    name: { type: String },
    url: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  isBillable: { type: Boolean, default: true },
  invoiceAmount: { type: Number, min: 0 },
  invoiceStatus: { type: String, enum: ['not_invoiced', 'invoiced', 'paid', 'overdue'], default: 'not_invoiced' }
}, { timestamps: true });

ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ clientId: 1 });
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ dueDate: 1 });

TaskSchema.index({ projectId: 1 });
TaskSchema.index({ assignedTo: 1 });
TaskSchema.index({ status: 1 });

TeamMemberSchema.index({ projectId: 1 });
TeamMemberSchema.index({ userId: 1 });
TeamMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });

ProjectSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && !['completed', 'cancelled', 'archived'].includes(this.status);
});

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', TaskSchema);
const TeamMember = mongoose.model('TeamMember', TeamMemberSchema);

module.exports = {
  Project: mongoose.model('Project', ProjectSchema),
  Task,
  TeamMember
};