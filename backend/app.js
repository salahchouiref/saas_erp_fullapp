const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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

dotenv.config();
const app = express();

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

app.get('/api', (req, res) => res.json({ message: 'SaaS AI Audit Assistant API is available' }));
app.get('/', (req, res) => res.json({ message: 'SaaS AI Audit Assistant backend is running' }));


module.exports = app;
