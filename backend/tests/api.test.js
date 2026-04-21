const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

let server;
let token;
describe('API Integration Tests', () => {
  const adminCredentials = { email: 'superadmin@example.com', password: 'superadmin' };
  let employeeId, clientId, projectId, taskId, auditReportId, payslipId, companyId, chatbotLogId;

  beforeAll(async () => {
    server = app.listen(4000);
    // Ensure superadmin exists
    const passwordHash = await bcrypt.hash('superadmin', 10);
    await User.findOneAndUpdate(
      { email: 'superadmin@example.com' },
      {
        name: 'Super Admin',
        email: 'superadmin@example.com',
        password: passwordHash,
        role: 'admin',
        department: 'IT'
      },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  test('Login as admin', async () => {
    const res = await request(server)
      .post('/api/auth/login')
      .send(adminCredentials);
    expect(res.statusCode).toBe(200);
    expect(res.body.user).toBeDefined();
    token = res.headers['set-cookie'][0].split(';')[0];
  });

  test('Create Employee', async () => {
    const res = await request(server)
      .post('/api/employees')
      .set('Cookie', token)
      .send({
        salary: 3000,
        position: 'Developer',
        leaveBalance: 10
      });
    expect(res.statusCode).toBe(201);
    employeeId = res.body._id;
  });

  test('Get Employees', async () => {
    const res = await request(server)
      .get('/api/employees')
      .set('Cookie', token);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('Create Client', async () => {
    const res = await request(server)
      .post('/api/clients')
      .set('Cookie', token)
      .send({ name: 'Test Client', email: 'client1@example.com' });
    expect(res.statusCode).toBe(201);
    clientId = res.body._id;
  });

  test('Create Project', async () => {
    const res = await request(server)
      .post('/api/projects')
      .set('Cookie', token)
      .send({
        name: 'Test Project',
        clientId,
        managerId: employeeId,
        team: [employeeId],
        status: 'active',
        tasks: []
      });
    expect(res.statusCode).toBe(201);
    projectId = res.body._id;
  });

  test('Create Task', async () => {
    const res = await request(server)
      .post('/api/tasks')
      .set('Cookie', token)
      .send({
        projectId,
        title: 'Test Task',
        description: 'Task description',
        assignedTo: employeeId,
        status: 'todo'
      });
    expect(res.statusCode).toBe(201);
    taskId = res.body._id;
  });

  test('Create Audit Report', async () => {
    const res = await request(server)
      .post('/api/audit-reports')
      .set('Cookie', token)
      .send({
        projectId,
        createdBy: employeeId,
        content: 'Audit content',
        anomalies: ['none']
      });
    expect(res.statusCode).toBe(201);
    auditReportId = res.body._id;
  });

  test('Create Payslip', async () => {
    const res = await request(server)
      .post('/api/payslips')
      .set('Cookie', token)
      .send({
        employeeId,
        baseSalary: 3000,
        tax: 600,
        net: 2400,
        month: 3,
        year: 2026
      });
    expect(res.statusCode).toBe(201);
    payslipId = res.body._id;
  });

  test('Create Company', async () => {
    const res = await request(server)
      .post('/api/companies')
      .set('Cookie', token)
      .send({ name: 'Test Company', users: [employeeId] });
    expect(res.statusCode).toBe(201);
    companyId = res.body._id;
  });
  // Add more CRUD and negative tests as needed
});
