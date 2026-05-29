require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Client = require('./models/Client');
const { Project } = require('./models/Project');
const Payslip = require('./models/Payslip');
const Company = require('./models/Company');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_ai';

const moroccanCities = ['Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès', 'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida', 'Nador', 'Taza', 'Mohammedia'];

const companies = [
  { name: 'CGI Maroc', industry: 'Technologies', city: 'Casablanca', taxId: 'CG123456' },
  { name: 'OCP Group', industry: 'Mines & Chimie', city: 'Casablanca', taxId: 'OC789012' },
  { name: 'Attijariwafa Bank', industry: 'Finance', city: 'Casablanca', taxId: 'AT345678' },
  { name: 'Maroc Telecom', industry: 'Télécommunications', city: 'Rabat', taxId: 'MT901234' },
  { name: 'Royal Air Maroc', industry: 'Transport Aérien', city: 'Casablanca', taxId: 'RM567890' },
  { name: 'Groupe Holmarcom', industry: 'Conglomérat', city: 'Casablanca', taxId: 'GH123789' },
  { name: 'CTM', industry: 'Transport', city: 'Casablanca', taxId: 'CT456123' },
  { name: 'Akwa Group', industry: 'Énergie', city: 'Casablanca', taxId: 'AK789456' },
  { name: 'Lesieur Cristal', industry: 'Agroalimentaire', city: 'Casablanca', taxId: 'LC123890' },
  { name: 'Managem', industry: 'Mines', city: 'Casablanca', taxId: 'MG567234' },
];

const employees = [
  { firstName: 'Mohamed', lastName: 'Benali', email: 'mohamed.benali@example.ma', position: 'Directeur Général', department: 'Direction', salary: 45000 },
  { firstName: 'Fatima', lastName: 'Zahra', email: 'fatima.zahra@example.ma', position: 'Directrice RH', department: 'RH', salary: 35000 },
  { firstName: 'Hassan', lastName: 'El Idrissi', email: 'hassan.idrissi@example.ma', position: 'Développeur Fullstack', department: 'IT', salary: 22000 },
  { firstName: 'Amina', lastName: 'Alaoui', email: 'amina.alaoui@example.ma', position: 'Chef de Projet', department: 'IT', salary: 28000 },
  { firstName: 'Khalid', lastName: 'Bennani', email: 'khalid.bennani@example.ma', position: 'Comptable', department: 'Finance', salary: 15000 },
  { firstName: 'Nadia', lastName: 'El Fassi', email: 'nadia.fassi@example.ma', position: 'Marketing Manager', department: 'Marketing', salary: 25000 },
  { firstName: 'Omar', lastName: 'Tazi', email: 'omar.tazi@example.ma', position: 'Développeur Backend', department: 'IT', salary: 20000 },
  { firstName: 'Sara', lastName: 'Berrada', email: 'sara.berrada@example.ma', position: 'UX Designer', department: 'Design', salary: 18000 },
  { firstName: 'Youssef', lastName: 'El Amrani', email: 'youssef.amrani@example.ma', position: 'Commercial Senior', department: 'Ventes', salary: 30000 },
  { firstName: 'Latifa', lastName: 'Mansouri', email: 'latifa.mansouri@example.ma', position: 'Assistante RH', department: 'RH', salary: 12000 },
  { firstName: 'Rachid', lastName: 'Ouazzani', email: 'rachid.ouazzani@example.ma', position: 'Data Analyst', department: 'IT', salary: 24000 },
  { firstName: 'Imane', lastName: 'Kabbaj', email: 'imane.kabbaj@example.ma', position: 'Responsable Clientèle', department: 'Ventes', salary: 20000 },
  { firstName: 'Adil', lastName: 'Sekkat', email: 'adil.sekkat@example.ma', position: 'DevOps Engineer', department: 'IT', salary: 26000 },
  { firstName: 'Samira', lastName: 'Guessous', email: 'samira.guessous@example.ma', position: 'Content Manager', department: 'Marketing', salary: 14000 },
  { firstName: 'Mehdi', lastName: 'Fakhri', email: 'mehdi.fakhri@example.ma', position: 'Stagiaire Développeur', department: 'IT', salary: 6000 },
];

const clients = [
  { name: 'Groupe OCP', company: 'OCP Group', industry: 'Mines', email: 'contact@ocpgroup.ma', phone: '+212522111111', status: 'active', annualRevenue: 85000000000, employeeCount: 22000 },
  { name: 'Attijariwafa Bank', company: 'Attijariwafa Bank', industry: 'Finance', email: 'contact@attijariwafa.ma', phone: '+212522222222', status: 'active', annualRevenue: 32000000000, employeeCount: 15000 },
  { name: 'Maroc Telecom', company: 'Maroc Telecom', industry: 'Télécoms', email: 'contact@iam.ma', phone: '+212522333333', status: 'active', annualRevenue: 18000000000, employeeCount: 8000 },
  { name: 'Royal Air Maroc', company: 'Royal Air Maroc', industry: 'Transport', email: 'contact@royalairmaroc.ma', phone: '+212522444444', status: 'active', annualRevenue: 12000000000, employeeCount: 5500 },
  { name: 'Groupe Holmarcom', company: 'Groupe Holmarcom', industry: 'Conglomérat', email: 'contact@holmarcom.ma', phone: '+212522555555', status: 'active', annualRevenue: 25000000000, employeeCount: 10000 },
  { name: 'Akwa Group', company: 'Akwa Group', industry: 'Énergie', email: 'contact@akwa.ma', phone: '+212522666666', status: 'active', annualRevenue: 20000000000, employeeCount: 7000 },
  { name: 'Lesieur Cristal', company: 'Lesieur Cristal', industry: 'Agroalimentaire', email: 'contact@lesieur.ma', phone: '+212522777777', status: 'active', annualRevenue: 8000000000, employeeCount: 3000 },
  { name: 'Managem', company: 'Managem', industry: 'Mines', email: 'contact@managem.ma', phone: '+212522888888', status: 'active', annualRevenue: 6000000000, employeeCount: 4000 },
  { name: 'CTM', company: 'CTM', industry: 'Transport', email: 'contact@ctm.ma', phone: '+212522999999', status: 'active', annualRevenue: 2000000000, employeeCount: 2500 },
  { name: 'CGI Maroc', company: 'CGI Maroc', industry: 'Technologies', email: 'contact@cgi.ma', phone: '+212520000000', status: 'active', annualRevenue: 5000000000, employeeCount: 3500 },
];

const projectNames = [
  'Digitalisation OCP Plateforme', 'Application Mobile Attijari', 'Data Center IAM', 'Site E-commerce RAM',
  'CRM Holmarcom', 'ERP Akwa Group', 'Supply Chain Lesieur', 'Business Intelligence Managem',
  'Portail Réservation CTM', 'Cloud Migration CGI'
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const col of collections) {
      if (col.name !== 'system.indexes') {
        await mongoose.connection.db.collection(col.name).deleteMany({});
        console.log(`Cleared collection: ${col.name}`);
      }
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await User.create({
      name: 'Administrateur', email: 'admin@example.com', password: hashedPassword, role: 'admin', department: 'Direction'
    });
    console.log(`✓ Admin created: admin@example.com / admin123`);

    await User.create({
      name: 'Mohamed Benali', email: 'manager@example.com', password: hashedPassword, role: 'manager', department: 'IT'
    });
    console.log(`✓ Manager created: manager@example.com / admin123`);

    await User.create({
      name: 'Fatima Zahra', email: 'employee@example.com', password: hashedPassword, role: 'employee', department: 'RH'
    });
    console.log(`✓ Employee created: employee@example.com / admin123`);

    const companyDocs = [];
    for (const c of companies) {
      const doc = await Company.create({ name: c.name, data: { industry: c.industry, city: c.city, taxId: c.taxId } });
      companyDocs.push(doc);
    }
    console.log(`✓ ${companies.length} companies created`);

    const employeeDocs = [];
    for (const e of employees) {
      const doc = await Employee.create({
        firstName: e.firstName, lastName: e.lastName, email: e.email,
        phone: `+2126${String(Math.floor(10000000 + Math.random() * 90000000))}`,
        position: e.position, department: e.department, salary: e.salary,
        hireDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        leaveBalance: 22, status: 'active',
        address: { city: moroccanCities[Math.floor(Math.random() * moroccanCities.length)], country: 'Maroc' },
        skills: e.department === 'IT' ? ['JavaScript', 'Python', 'MongoDB', 'React'] : e.department === 'RH' ? ['Recrutement', 'Paie'] : ['Communication'],
      });
      employeeDocs.push(doc);
    }
    console.log(`✓ ${employees.length} employees created`);

    const clientDocs = [];
    for (const c of clients) {
      const doc = await Client.create({
        name: c.name, company: c.company, industry: c.industry, email: c.email, phone: c.phone,
        status: c.status, annualRevenue: c.annualRevenue, employeeCount: c.employeeCount,
        address: { city: moroccanCities[Math.floor(Math.random() * moroccanCities.length)], country: 'Maroc' },
        source: Math.random() > 0.5 ? 'referral' : 'website',
      });
      clientDocs.push(doc);
    }
    console.log(`✓ ${clients.length} clients created`);

    const projectDocs = [];
    for (let i = 0; i < projectNames.length; i++) {
      const client = clientDocs[i % clientDocs.length];
      const manager = employeeDocs.filter(e => e.department === 'IT')[i % 4];
      const statuses = ['active', 'active', 'active', 'completed', 'on_hold', 'draft'];
      const status = statuses[i % statuses.length];
      const doc = await Project.create({
        name: projectNames[i], description: `Projet ${projectNames[i]} - transformation digitale`,
        clientId: client._id, managerId: manager?._id || employeeDocs[0]._id,
        status, priority: i % 3 === 0 ? 'high' : 'medium',
        startDate: new Date(2025, i % 12, 1),
        dueDate: new Date(2026, (i + 6) % 12, 30),
        budget: (i + 1) * 500000, actualCost: i % 2 === 0 ? (i + 1) * 300000 : 0,
        progress: status === 'completed' ? 100 : status === 'active' ? Math.floor(Math.random() * 80) + 10 : 0,
        isBillable: true,
        teamMembers: [
          { userId: admin._id, role: 'manager', isActive: true, joinedAt: new Date(2025, 0, 1) },
          { userId: employeeDocs[i % employeeDocs.length]._id, role: 'developer', isActive: true, joinedAt: new Date(2025, 0, 15) },
        ],
      });
      projectDocs.push(doc);
    }
    console.log(`✓ ${projectDocs.length} projects created`);

    for (const emp of employeeDocs) {
      for (let m = 1; m <= 5; m++) {
        const baseSalary = emp.salary;
        const tax = Math.round(baseSalary * 0.2);
        const net = baseSalary - tax;
        await Payslip.create({
          employeeId: emp._id, baseSalary: baseSalary, tax, net, month: m, year: 2026,
        });
      }
    }
    console.log(`✓ ${employeeDocs.length * 5} payslips created (5 months each)`);

    await mongoose.connection.close();
    console.log('\n═══════════════════════════════════════════');
    console.log('   DATABASE SEEDED SUCCESSFULLY 🎉');
    console.log('═══════════════════════════════════════════');
    console.log(`   Users: 3 (admin/manager/employee)`);
    console.log(`   Companies: ${companyDocs.length}`);
    console.log(`   Employees: ${employeeDocs.length}`);
    console.log(`   Clients: ${clientDocs.length}`);
    console.log(`   Projects: ${projectDocs.length}`);
    console.log(`   Payslips: ${employeeDocs.length * 5}`);
    console.log('═══════════════════════════════════════════');
    console.log('\n   Login: admin@example.com / admin123\n');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
