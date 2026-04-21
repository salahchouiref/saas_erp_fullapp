const Workflow = require('../models/Workflow');
const Employee = require('../models/Employee');
const Client = require('../models/Client');
const { Project, Task } = require('../models/Project');
const Reminder = require('../models/Reminder');
const User = require('../models/User');

const actionHandlers = {
  'create_employee': async (config) => {
    const employee = await Employee.create({
      firstName: config.firstName,
      lastName: config.lastName,
      email: config.email,
      position: config.position,
      department: config.department,
      status: config.status || 'active',
      salary: config.salary
    });
    return { success: true, data: employee, message: `Employé ${config.firstName} ${config.lastName} créé` };
  },
  
  'create_client': async (config) => {
    const client = await Client.create({
      name: config.name,
      email: config.email,
      company: config.company,
      phone: config.phone,
      industry: config.industry,
      status: config.status || 'active'
    });
    return { success: true, data: client, message: `Client ${config.name} créé` };
  },
  
  'create_project': async (config) => {
    const project = await Project.create({
      name: config.name,
      description: config.description,
      status: config.status || 'planning',
      priority: config.priority || 'medium',
      progress: 0,
      clientId: config.clientId
    });
    return { success: true, data: project, message: `Projet ${config.name} créé` };
  },
  
  'create_task': async (config) => {
    const task = await Task.create({
      title: config.title,
      description: config.description,
      projectId: config.projectId,
      assignedTo: config.assignedTo,
      status: config.status || 'todo',
      priority: config.priority || 'medium',
      dueDate: config.dueDate
    });
    return { success: true, data: task, message: `Tâche "${config.title}" créée` };
  },
  
  'create_reminder': async (config) => {
    const reminder = await Reminder.create({
      title: config.title,
      message: config.message,
      type: config.type || 'reminder',
      scheduledAt: config.scheduledAt || new Date(Date.now() + 3600000),
      priority: config.priority || 'medium',
      createdBy: config.createdBy
    });
    return { success: true, data: reminder, message: `Rappel "${config.title}" créé` };
  },
  
  'update_employee': async (config) => {
    const employee = await Employee.findByIdAndUpdate(config.id, config.data, { new: true });
    return { success: true, data: employee, message: 'Employé mis à jour' };
  },
  
  'update_client': async (config) => {
    const client = await Client.findByIdAndUpdate(config.id, config.data, { new: true });
    return { success: true, data: client, message: 'Client mis à jour' };
  },
  
  'update_project': async (config) => {
    const project = await Project.findByIdAndUpdate(config.id, config.data, { new: true });
    return { success: true, data: project, message: 'Projet mis à jour' };
  },
  
  'send_notification': async (config) => {
    return { success: true, message: `Notification: ${config.message}` };
  },
  
  'delete_record': async (config) => {
    const { entity, id } = config;
    const models = { employee: Employee, client: Client, project: Project, task: Task };
    const Model = models[entity];
    if (!Model) return { success: false, message: 'Entité non supportée' };
    
    await Model.findByIdAndDelete(id);
    return { success: true, message: `${entity} supprimé` };
  }
};

const conditionHandlers = {
  'equals': (value, expected) => value === expected,
  'not_equals': (value, expected) => value !== expected,
  'contains': (value, expected) => String(value).includes(expected),
  'greater_than': (value, expected) => Number(value) > Number(expected),
  'less_than': (value, expected) => Number(value) < Number(expected),
  'is_empty': (value) => !value || value === '',
  'is_not_empty': (value) => value && value !== ''
};

exports.createWorkflow = async (req, res) => {
  const { name, description, trigger, steps } = req.body;
  
  if (!name || !steps || steps.length === 0) {
    return res.status(400).json({ message: 'Nom et étapes requis' });
  }
  
  try {
    const workflow = await Workflow.create({
      name,
      description,
      trigger: trigger || { type: 'manual' },
      steps,
      createdBy: req.user?.id
    });
    
    res.status(201).json({ message: 'Workflow créé', workflow });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkflows = async (req, res) => {
  try {
    const workflows = await Workflow.find({ createdBy: req.user?.id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ workflows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getWorkflow = async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    if (!workflow) return res.status(404).json({ message: 'Workflow non trouvé' });
    
    res.json({ workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateWorkflow = async (req, res) => {
  const { name, description, trigger, steps, isActive } = req.body;
  
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { name, description, trigger, steps, isActive },
      { new: true }
    );
    
    if (!workflow) return res.status(404).json({ message: 'Workflow non trouvé' });
    
    res.json({ message: 'Workflow mis à jour', workflow });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteWorkflow = async (req, res) => {
  try {
    await Workflow.findByIdAndDelete(req.params.id);
    res.json({ message: 'Workflow supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.runWorkflow = async (req, res) => {
  const { id } = req.params;
  const { inputs } = req.body;
  
  try {
    const workflow = await Workflow.findById(id);
    if (!workflow) return res.status(404).json({ message: 'Workflow non trouvé' });
    
    if (!workflow.isActive) {
      return res.status(400).json({ message: 'Workflow désactivé' });
    }
    
    let context = { ...(inputs || {}), results: [] };
    let stepResults = [];
    
    for (const step of workflow.steps) {
      try {
        if (step.type === 'condition') {
          const handler = conditionHandlers[step.condition?.operator];
          if (!handler) {
            stepResults.push({ step: step.name, skipped: true, reason: 'Condition non supportée' });
            continue;
          }
          
          const value = context[step.condition.field];
          const passes = handler(value, step.condition.value);
          
          if (passes && step.nextStepId) {
            stepResults.push({ step: step.name, passed: true });
          } else {
            stepResults.push({ step: step.name, passed: false });
            break;
          }
        } else if (step.type === 'action') {
          const handler = actionHandlers[step.config.action];
          if (!handler) {
            stepResults.push({ step: step.name, error: 'Action non supportée' });
            continue;
          }
          
          const result = await handler({ ...step.config, createdBy: req.user?.id });
          context.results.push(result);
          stepResults.push({ step: step.name, result });
          
          if (!result.success) break;
        } else if (step.type === 'delay') {
          const ms = step.config.seconds * 1000;
          await new Promise(r => setTimeout(r, Math.min(ms, 5000)));
          stepResults.push({ step: step.name, delayed: step.config.seconds });
        }
      } catch (stepError) {
        stepResults.push({ step: step.name, error: stepError.message });
        break;
      }
    }
    
    await Workflow.findByIdAndUpdate(id, {
      lastRun: new Date(),
      $inc: { runCount: 1 }
    });
    
    res.json({ 
      message: 'Workflow exécuté',
      results: stepResults,
      context 
    });
  } catch (error) {
    console.error('Run workflow error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableActions = async (req, res) => {
  res.json({
    actions: [
      { id: 'create_employee', name: 'Créer un employé', fields: ['firstName', 'lastName', 'email', 'position', 'department', 'salary'] },
      { id: 'create_client', name: 'Créer un client', fields: ['name', 'email', 'company', 'phone', 'industry'] },
      { id: 'create_project', name: 'Créer un projet', fields: ['name', 'description', 'priority', 'clientId'] },
      { id: 'create_task', name: 'Créer une tâche', fields: ['title', 'description', 'projectId', 'assignedTo', 'priority', 'dueDate'] },
      { id: 'create_reminder', name: 'Créer un rappel', fields: ['title', 'message', 'type', 'scheduledAt', 'priority'] },
      { id: 'update_employee', name: 'Modifier un employé', fields: ['id', 'data'] },
      { id: 'update_client', name: 'Modifier un client', fields: ['id', 'data'] },
      { id: 'update_project', name: 'Modifier un projet', fields: ['id', 'data'] },
      { id: 'send_notification', name: 'Envoyer une notification', fields: ['message'] },
      { id: 'delete_record', name: 'Supprimer un enregistrement', fields: ['entity', 'id'] }
    ],
    conditions: [
      { id: 'equals', name: 'Égal à' },
      { id: 'not_equals', name: 'Différent de' },
      { id: 'contains', name: 'Contient' },
      { id: 'greater_than', name: 'Supérieur à' },
      { id: 'less_than', name: 'Inférieur à' },
      { id: 'is_empty', name: 'Est vide' },
      { id: 'is_not_empty', name: 'N\'est pas vide' }
    ]
  });
};

module.exports = exports;