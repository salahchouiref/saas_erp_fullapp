const Notification = require('../models/Notification');
const Reminder = require('../models/Reminder');

let io = null;

exports.setSocketIO = (socketIO) => {
  io = socketIO;
};

const sendNotification = async (userId, title, message, type = 'info', relatedEntity = null) => {
  try {
    console.log('📤 SERVER: Creating notification for user:', userId, 'title:', title);
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
      relatedEntity,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    console.log('💾 SERVER: Notification saved:', notification._id);

    if (io) {
      console.log('🌐 SERVER: Emitting to room:', `user_${userId}`, 'event: notification');
      io.to(`user_${userId}`).emit('notification', notification);
      console.log('✅ SERVER: Notification emitted successfully');
    } else {
      console.log('❌ SERVER: Socket.IO not available');
    }

    return notification;
  } catch (error) {
    console.error('❌ SERVER: Send notification error:', error);
  }
};

exports.checkDueReminders = async () => {
  try {
    const now = new Date();
    let totalProcessed = 0;

    // Check for reminders due in exactly 5 minutes (advance warning)
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    const sixMinutesFromNow = new Date(now.getTime() + 6 * 60 * 1000);

    const advanceReminders = await Reminder.find({
      status: 'pending',
      scheduledAt: { $lte: sixMinutesFromNow, $gte: fiveMinutesFromNow }
    }).populate('createdBy', '_id name').lean();

    for (const reminder of advanceReminders) {
      console.log('📢 Sending advance notification for reminder:', reminder.title);
      await sendNotification(
        reminder.createdBy?._id,
        `⏰ ${reminder.title} (dans 5 min)`,
        reminder.message,
        'warning',
        { type: 'reminder_advance', id: reminder._id, advanceMinutes: 5 }
      );
      totalProcessed++;
    }

    // Check for reminders due now (exact time)
    const oneMinuteFromNow = new Date(now.getTime() + 1 * 60 * 1000);

    const exactReminders = await Reminder.find({
      status: 'pending',
      scheduledAt: { $lte: oneMinuteFromNow, $gte: now }
    }).populate('createdBy', '_id name').lean();

    for (const reminder of exactReminders) {
      console.log('🚨 Sending exact time notification for reminder:', reminder.title);
      await sendNotification(
        reminder.createdBy?._id,
        `🔔 ${reminder.title}`,
        reminder.message,
        'reminder',
        { type: 'reminder', id: reminder._id }
      );

      await Reminder.findByIdAndUpdate(reminder._id, { status: 'notified' });
      totalProcessed++;
    }

    return totalProcessed;
  } catch (error) {
    console.error('Check due reminders error:', error);
    return 0;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  const { id } = req.params;
  
  try {
    await Notification.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { isRead: true }
    );
    
    res.json({ message: 'Marqué comme lu' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user?.id, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'Tous marqués comme lus' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Test function to manually send a notification
exports.sendTestNotification = async (userId) => {
  console.log('🧪 Sending test notification to user:', userId);
  await sendNotification(
    userId,
    '🧪 Test Notification',
    'This is a test notification to verify the system is working',
    'info',
    { type: 'test' }
  );
};

setInterval(async () => {
  console.log('🔍 Checking for due reminders in server...');
  try {
    const count = await exports.checkDueReminders();
    console.log(`✅ Reminder check completed, processed: ${count}`);
  } catch (error) {
    console.log('❌ Reminder check failed:', error.message);
  }
}, 30000); // Check every 30 seconds for testing

module.exports = exports;