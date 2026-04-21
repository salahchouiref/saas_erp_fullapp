import { useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useToast } from './Toast';
import { useAuth } from '../context/AuthContext';

export function NotificationBell() {
  const socketRef = useRef(null);
  const { user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Connect to Socket.IO
    const socketConnection = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    console.log('🔌 Connecting to Socket.IO server...');

    socketConnection.on('connect', () => {
      console.log('🔗 Socket.IO Connected to server');
      console.log('👤 Current user object:', JSON.stringify(user, null, 2));

      // Join user room for personal notifications
      if (user?.id) {
        socketConnection.emit('join', user.id);
        console.log('👤 FRONTEND: Joined user room:', user.id);
      } else {
        console.log('⚠️ FRONTEND: No user ID available for room join');
      }
    });

    // Handle all notifications with priority-based toast colors
    socketConnection.on('notification', (notification) => {
      console.log('🔔 Received notification:', notification);
      console.log('📝 Notification message:', notification.message);
      console.log('🎨 Notification type:', notification.type);

      // Determine toast type based on notification type and priority
      let toastType = 'info';
      if (notification.type === 'reminder') {
        toastType = 'warning';
      } else if (notification.type === 'error') {
        toastType = 'error';
      } else if (notification.type === 'success') {
        toastType = 'success';
      }

      // Show priority-colored toast with content
      const toastMessage = notification.relatedEntity?.type === 'reminder_advance'
        ? `${notification.title}: ${notification.message}`
        : `${notification.title}: ${notification.message}`;

      console.log('🍞 Showing toast:', toastMessage, 'Type:', toastType);
      addToast(toastMessage, toastType);

      // Browser notification for additional visibility
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          tag: `notification-${notification._id}`
        });
      }
    });

    socketConnection.on('reminderNotification', (reminder) => {
      console.log('⏰ Received reminder notification:', reminder);

      // Priority-based toast color
      let toastType = 'warning'; // default for reminders
      if (reminder.priority === 'urgent') {
        toastType = 'error'; // red for urgent
      } else if (reminder.priority === 'low') {
        toastType = 'info'; // blue for low
      }

      // Show detailed toast with reminder content
      addToast(`🔔 ${reminder.title}: ${reminder.message}`, toastType);

      // Browser notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`🔔 ${reminder.title}`, {
          body: reminder.message,
          icon: '/favicon.ico',
          tag: `reminder-${reminder.id}`
        });
      }
    });

    socketConnection.on('disconnect', () => {
      console.log('🔌 Disconnected from server');
    });

    socketConnection.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
    });

    socketRef.current = socketConnection;

    return () => {
      socketConnection.disconnect();
    };
  }, [user]);

  // Component only handles Socket.IO events and toast notifications
  // No UI elements needed - toasts appear automatically
  return null;
}