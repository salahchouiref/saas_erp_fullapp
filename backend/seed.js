const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Client = require('./models/Client');
const { Project, Task, TeamMember } = require('./models/Project');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_ai';

async function seedDatabase() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Employee.deleteMany({});
  await Client.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});
  await TeamMember.deleteMany({});
  console.log('Cleared existing data');

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await User.create({
    name: 'Administrateur',
    email: 'admin@example.com',
    password: hashedPassword,
    role: 'admin'
  });
  console.log('Created admin user: admin@example.com / admin123');

  // Create dummy employees
  const employees = await Employee.insertMany([
    {
      userId: admin._id,
      firstName: 'Mohamed',
      lastName: 'Alami',
      email: 'mohamed.alami@example.com',
      phone: '+212 6 11 22 33 44',
      position: 'Développeur Senior',
      department: 'IT',
      salary: 15000,
      hireDate: new Date('2024-01-15'),
      leaveBalance: 22,
      leaveTaken: 3,
      status: 'active',
      address: { city: 'Casablanca', country: 'Maroc' },
      emergencyContact: { name: 'Fatima Alami', phone: '+212 6 99 88 77 66', relationship: 'Épouse' },
      skills: ['React', 'Node.js', 'MongoDB']
    },
    {
      firstName: 'Fatima',
      lastName: 'El Mansouri',
      email: 'fatima.mansouri@example.com',
      phone: '+212 6 22 33 44 55',
      position: 'Designer UI/UX',
      department: 'Design',
      salary: 12000,
      hireDate: new Date('2024-02-20'),
      leaveBalance: 20,
      leaveTaken: 5,
      status: 'active',
      address: { city: 'Rabat', country: 'Maroc' },
      skills: ['Figma', 'Adobe XD', 'Sketch']
    },
    {
      firstName: 'Ali',
      lastName: 'Bennani',
      email: 'ali.bennani@example.com',
      phone: '+212 6 33 44 55 66',
      position: 'Chef de Projet',
      department: 'Direction',
      salary: 18000,
      hireDate: new Date('2023-06-10'),
      leaveBalance: 18,
      leaveTaken: 7,
      status: 'active',
      address: { city: 'Casablanca', country: 'Maroc' },
      emergencyContact: { name: 'Salma Bennani', phone: '+212 6 44 55 66 77', relationship: 'Sœur' },
      skills: ['Agile', 'Scrum', 'Management']
    },
    {
      firstName: 'Youssef',
      lastName: 'Tazi',
      email: 'youssef.tazi@example.com',
      phone: '+212 6 44 55 66 77',
      position: 'Développeur Full Stack',
      department: 'IT',
      salary: 11000,
      hireDate: new Date('2024-03-01'),
      leaveBalance: 25,
      leaveTaken: 0,
      status: 'active',
      address: { city: 'Marrakech', country: 'Maroc' },
      skills: ['JavaScript', 'Python', 'PostgreSQL']
    },
    {
      firstName: 'Zineb',
      lastName: 'Amrani',
      email: 'zineb.amrani@example.com',
      phone: '+212 6 55 66 77 88',
      position: ' QA Engineer',
      department: 'IT',
      salary: 9000,
      hireDate: new Date('2024-04-15'),
      leaveBalance: 25,
      leaveTaken: 0,
      status: 'active',
      address: { city: 'Tanger', country: 'Maroc' },
      skills: ['Selenium', 'Jest', 'Cypress']
    }
  ]);
  console.log(`Created ${employees.length} employees`);

  // Create dummy clients
  const clients = await Client.insertMany([
    {
      name: 'Société Atlantique',
      email: 'contact@atlantique.ma',
      phone: '+212 5 22 30 40 50',
      company: 'Groupe Atlantique',
      industry: 'Technologie',
      status: 'active',
      address: { street: '123 Avenue Hassan II', city: 'Casablanca', country: 'Maroc' },
      contactPerson: { name: 'Mehdi Kabbaj', role: 'Directeur IT', email: 'mehdi@atlantique.ma', phone: '+212 6 11 22 33 44' },
      website: 'https://atlantique.ma',
      annualRevenue: 50000000,
      employeeCount: 250,
      source: 'website',
      rating: 5
    },
    {
      name: 'Maroc Telecom Solutions',
      email: 'info@maroctelecom.ma',
      phone: '+212 5 24 50 60 70',
      company: 'Maroc Telecom',
      industry: 'Télécommunications',
      status: 'active',
      address: { street: '456 Boulevard Mohammed V', city: 'Rabat', country: 'Maroc' },
      contactPerson: { name: 'Nadia Benali', role: 'Responsable Achats', email: 'nadia@maroctelecom.ma' },
      annualRevenue: 150000000,
      employeeCount: 1200,
      source: 'referral',
      rating: 4
    },
    {
      name: 'Ciments du Maghreb',
      email: 'achats@cimentsmaghreb.ma',
      phone: '+212 5 28 70 80 90',
      company: 'CDM',
      industry: 'Industrie',
      status: 'active',
      address: { city: 'El Jadida', country: 'Maroc' },
      contactPerson: { name: 'Rachid Chakri', role: 'Directeur Technique' },
      annualRevenue: 80000000,
      employeeCount: 500,
      source: 'cold_call',
      rating: 4
    },
    {
      name: 'Bank Al-Maghrib',
      email: 'it@bank-maghreb.ma',
      phone: '+212 5 22 10 20 30',
      company: 'BAM',
      industry: 'Finance',
      status: 'prospect',
      address: { street: '78 Rue Allal El Fassi', city: 'Rabat', country: 'Maroc' },
      website: 'https://bank-maghreb.ma',
      employeeCount: 3000,
      source: 'event',
      rating: 5
    },
    {
      name: 'TechMaroc Startup',
      email: 'hello@techmaroc.co',
      phone: '+212 6 10 20 30 40',
      company: 'TechMaroc',
      industry: 'Technologie',
      status: 'lead',
      address: { city: 'Casablanca', country: 'Maroc' },
      contactPerson: { name: 'Omar Fahim', role: 'CEO' },
      website: 'https://techmaroc.co',
      employeeCount: 15,
      source: 'website',
      rating: 3
    }
  ]);
  console.log(`Created ${clients.length} clients`);

  // Create dummy projects
  const projects = await Project.insertMany([
    {
      name: 'Application Mobile Banking',
      description: 'Développement d\'une application mobile de gestion bancaire',
      clientId: clients[0]._id,
      managerId: admin._id,
      status: 'active',
      priority: 'high',
      startDate: new Date('2024-06-01'),
      dueDate: new Date('2024-12-31'),
      budget: 500000,
      actualCost: 250000,
      progress: 45,
      isBillable: true,
      teamMembers: [
        { userId: employees[0]._id, role: 'developer', isActive: true },
        { userId: employees[2]._id, role: 'manager', isActive: true },
        { userId: employees[3]._id, role: 'developer', isActive: true }
      ]
    },
    {
      name: 'Refonte Site Corporate',
      description: 'Refonte complète du site web corporate',
      clientId: clients[1]._id,
      managerId: admin._id,
      status: 'active',
      priority: 'medium',
      startDate: new Date('2024-08-01'),
      dueDate: new Date('2024-10-30'),
      budget: 150000,
      actualCost: 45000,
      progress: 30,
      isBillable: true,
      teamMembers: [
        { userId: employees[1]._id, role: 'designer', isActive: true },
        { userId: employees[3]._id, role: 'developer', isActive: true }
      ]
    },
    {
      name: 'Système de Gestion RH',
      description: 'Développement d\'un système de gestion des ressources humaines',
      clientId: clients[2]._id,
      managerId: admin._id,
      status: 'completed',
      priority: 'medium',
      startDate: new Date('2024-01-15'),
      dueDate: new Date('2024-06-30'),
      completedDate: new Date('2024-06-25'),
      budget: 350000,
      actualCost: 320000,
      progress: 100,
      isBillable: true,
      teamMembers: [
        { userId: employees[0]._id, role: 'developer', isActive: true },
        { userId: employees[2]._id, role: 'manager', isActive: true }
      ]
    },
    {
      name: 'Audit Sécurité SI',
      description: 'Audit complet de la sécurité du système d\'information',
      clientId: clients[3]._id,
      managerId: admin._id,
      status: 'pending',
      priority: 'critical',
      startDate: new Date('2025-01-15'),
      dueDate: new Date('2025-03-31'),
      budget: 200000,
      isBillable: true,
      teamMembers: []
    },
    {
      name: 'Plateforme E-Learning',
      description: 'Création d\'une plateforme de formation en ligne',
      clientId: clients[4]._id,
      managerId: admin._id,
      status: 'draft',
      priority: 'medium',
      budget: 180000,
      isBillable: true,
      teamMembers: []
    }
  ]);
  console.log(`Created ${projects.length} projects`);

  // Create tasks for first project
  const tasks = await Task.insertMany([
    {
      title: 'Conception des écrans',
      description: 'Créer les maquettes des écrans principaux',
      projectId: projects[0]._id,
      createdBy: admin._id,
      assignedTo: employees[3]._id,
      status: 'done',
      priority: 'high',
      dueDate: new Date('2024-07-15'),
      completedDate: new Date('2024-07-12'),
      estimatedHours: 40,
      actualHours: 35
    },
    {
      title: 'API Authentication',
      description: 'Développer l\'API d\'authentification',
      projectId: projects[0]._id,
      createdBy: admin._id,
      assignedTo: employees[0]._id,
      status: 'done',
      priority: 'critical',
      dueDate: new Date('2024-08-01'),
      completedDate: new Date('2024-07-28'),
      estimatedHours: 60,
      actualHours: 55
    },
    {
      title: 'Module Paiement',
      description: 'Intégrer le module de paiement Stripe',
      projectId: projects[0]._id,
      createdBy: admin._id,
      assignedTo: employees[3]._id,
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date('2024-09-15'),
      estimatedHours: 80,
      actualHours: 40
    },
    {
      title: 'Tests QA',
      description: 'Effectuer les tests fonctionnels et d\'intégration',
      projectId: projects[0]._id,
      createdBy: admin._id,
      assignedTo: employees[4]._id,
      status: 'todo',
      priority: 'medium',
      dueDate: new Date('2024-11-01'),
      estimatedHours: 100
    },
    {
      title: 'Déploiement Production',
      description: 'Déployer l\'application en production',
      projectId: projects[0]._id,
      createdBy: admin._id,
      status: 'todo',
      priority: 'high',
      dueDate: new Date('2024-12-15'),
      estimatedHours: 20
    }
  ]);
  console.log(`Created ${tasks.length} tasks`);

  // Create team members
  await TeamMember.insertMany([
    {
      projectId: projects[0]._id,
      userId: employees[0]._id,
      role: 'developer',
      isActive: true
    },
    {
      projectId: projects[0]._id,
      userId: employees[2]._id,
      role: 'manager',
      isActive: true
    },
    {
      projectId: projects[0]._id,
      userId: employees[3]._id,
      role: 'developer',
      isActive: true
    },
    {
      projectId: projects[1]._id,
      userId: employees[1]._id,
      role: 'designer',
      isActive: true
    }
  ]);
  console.log('Created team members');

  console.log('\n=== Database seeded successfully! ===\n');
  console.log('Login credentials:');
  console.log('  Email: admin@example.com');
  console.log('  Password: admin123');
  
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

seedDatabase().catch(err => {
  console.error('Error seeding database:', err);
  mongoose.disconnect();
  process.exit(1);
});