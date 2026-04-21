const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['info', 'success', 'warning', 'error', 'reminder'], default: 'info' },
  isRead: { type: Boolean, default: false },
  relatedEntity: {
    type: { type: String },
    id: { type: mongoose.Schema.Types.ObjectId }
  },
  expiresAt: { type: Date }
}, { timestamps: true });

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);