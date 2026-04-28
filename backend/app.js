const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');

const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const projectRoutes = require('./routes/projects');
const clientRoutes = require('./routes/clients');

const taskRoutes = require('./routes/tasks');
const auditReportRoutes = require('./routes/auditReports');
const payslipRoutes = require('./routes/payslips');
const companyRoutes = require('./routes/companies');
const chatbotLogRoutes = require('./routes/chatbotLogs');
const auditRoutes = require('./routes/audit');
const aiRoutes = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});

const corsOptions = {
	origin: function (origin, callback) {
		const allowedOrigins = [
			'http://localhost:5173',
			'http://localhost:3000',
			'http://127.0.0.1:5173',
			'http://127.0.0.1:3000'
		];
		if (!origin || allowedOrigins.includes(origin)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/clients', clientRoutes);

app.use('/api/tasks', taskRoutes);
app.use('/api/audit-reports', auditReportRoutes);
app.use('/api/payslips', payslipRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/chatbot-logs', chatbotLogRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/api', (req, res) => res.json({ message: 'SaaS AI Audit Assistant API is available' }));
app.get('/', (req, res) => res.json({ message: 'SaaS AI Audit Assistant backend is running' }));

// Socket.IO setup
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Initialize notification controller
const notificationController = require('./controllers/notificationController');
notificationController.setSocketIO(io);

// Make io available to routes
app.set('io', io);

// Start server if this file is run directly
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Test notification after 10 seconds
  setTimeout(() => {
    console.log('🧪 Sending test notification...');
    const notificationController = require('./controllers/notificationController');
    notificationController.sendTestNotification('69e7c595401235199da18d36');
  }, 10000);
}

module.exports = { app, server };
