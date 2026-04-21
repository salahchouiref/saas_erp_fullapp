const Project = require('../models/Project');
const Client = require('../models/Client');
const Employee = require('../models/Employee');

exports.generateReport = async (req, res) => {
  try {
    const projects = await Project.find().populate('clientId managerId team', 'name role');
    const clients = await Client.find();
    const employees = await Employee.find().populate('userId', 'name role');

    const report = {
      summary: {
        projects: projects.length,
        clients: clients.length,
        employees: employees.length,
      },
      warnings: [],
      recommendations: [],
    };

    if (projects.some((project) => project.status === 'pending')) {
      report.warnings.push('Plusieurs projets sont encore en attente.');
    }
    if (employees.some((employee) => employee.leaveBalance < 5)) {
      report.recommendations.push('Vérifier le Solde de congé pour les employés avec moins de 5 jours restants.');
    }

    report.details = projects.map((project) => ({
      project: project.name,
      client: project.clientId?.name || 'N/A',
      manager: project.managerId?.name || 'N/A',
      status: project.status,
      taskCount: project.tasks.length,
    }));

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
