const mongoose = require('mongoose');

const WorkflowStepSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['trigger', 'action', 'condition', 'delay'], 
    required: true 
  },
  name: { type: String, required: true },
  config: { type: mongoose.Schema.Types.Mixed, default: {} },
  nextStepId: { type: String },
  condition: { type: String }
});

const WorkflowSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 2, maxlength: 100 },
  description: { type: String, maxlength: 500 },
  trigger: {
    type: { type: String, enum: ['manual', 'scheduled', 'event'], default: 'manual' },
    event: { type: String },
    cronExpression: { type: String },
    config: { type: mongoose.Schema.Types.Mixed }
  },
  steps: [WorkflowStepSchema],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastRun: { type: Date },
  runCount: { type: Number, default: 0 }
}, { timestamps: true });

WorkflowSchema.index({ isActive: 1 });
WorkflowSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Workflow', WorkflowSchema);