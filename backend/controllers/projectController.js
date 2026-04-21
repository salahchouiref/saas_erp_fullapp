const { Project } = require('../models/Project');

exports.createProject = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.managerId) payload.managerId = req.user?.id;
    
    if (!payload.name || !payload.clientId) {
      return res.status(400).json({ 
        message: 'Champs obligatoires manquants: name, clientId' 
      });
    }
    
    if (!payload.status) payload.status = 'draft';
    if (!payload.priority) payload.priority = 'medium';
    
    const project = await Project.create(payload);
    res.status(201).json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { search, status, priority, clientId, managerId, sortBy, sortOrder } = req.query;
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (managerId) query.managerId = managerId;
    if (clientId) query.clientId = clientId;
    
    if (search) {
      const regexp = new RegExp(search, 'i');
      query.$or = [
        { name: regexp },
        { description: regexp }
      ];
    }

    const sort = {};
    sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const projects = await Project.find(query)
      .populate('clientId', 'name email company')
      .populate('managerId', 'name email')
      .populate('teamMembers.userId', 'name email')
      .sort(sort);
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email company phone')
      .populate('managerId', 'name email')
      .populate('teamMembers.userId', 'name email')
      .populate('tasks.assignedTo', 'name email')
      .populate('comments.userId', 'name email');
    
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (updates.status === 'completed' && !updates.completedDate) {
      updates.completedDate = new Date();
      updates.progress = 100;
    }
    
    const project = await Project.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    });
    
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json(project);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: 'Projet non trouvé' });
    res.json({ message: 'Projet supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const stats = await Project.aggregate([
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalBudget: { $sum: '$budget' },
        totalActualCost: { $sum: '$actualCost' }
      }}
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};