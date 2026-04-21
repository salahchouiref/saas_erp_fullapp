const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 2, maxlength: 200 },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['reminder', 'meeting', 'deadline', 'call', 'task'], 
    default: 'reminder' 
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  scheduledAt: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  isRecurring: { type: Boolean, default: false },
  recurringInterval: { type: String, enum: ['daily', 'weekly', 'monthly', null], default: null }
}, { timestamps: true });

ReminderSchema.index({ scheduledAt: 1 });
ReminderSchema.index({ status: 1 });
ReminderSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema);