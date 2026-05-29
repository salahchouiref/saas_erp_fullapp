const { Task, TeamMember, Project } = require('../models/Project');

exports.createTask = async (req, res) => {
  try {
    const payload = { ...req.body };
    const projectId = req.params.projectId || payload.projectId;
    if (!projectId) {
      return res.status(400).json({ message: 'projectId est obligatoire' });
    }
    payload.projectId = projectId;
    payload.createdBy = req.user?.id;

    const task = await Task.create(payload);

    const project = await Project.findById(projectId);
    if (project) {
      project.tasks.push({
        title: task.title,
        description: task.description,
        assignedTo: task.assignedTo,
        dueDate: task.dueDate,
        status: task.status,
        priority: task.priority
      });
      await project.save();
    }

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    res.status(201).json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const { status, assignedTo, priority, search } = req.query;
    const query = {};

    if (projectId) query.projectId = projectId;
    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (priority) query.priority = priority;

    if (search) {
      const regexp = new RegExp(search, 'i');
      query.$or = [
        { title: regexp },
        { description: regexp },
        { tags: regexp }
      ];
    }

    const tasks = await Task.find(query)
      .populate('projectId', 'name status')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTask = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const task = await Task.findById(taskId)
      .populate('projectId', 'name status clientId')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('comments.userId', 'name email')
      .populate('relatedTasks', 'title status');

    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const updates = req.body;

    if (updates.status === 'done' && !updates.completedDate) {
      updates.completedDate = new Date();
    }

    const task = await Task.findByIdAndUpdate(taskId, updates, {
      new: true,
      runValidators: true
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    const project = await Project.findById(task.projectId);
    if (project) {
      const taskIndex = project.tasks.findIndex(t => t._id?.toString() === taskId);
      if (taskIndex > -1) {
        project.tasks[taskIndex].status = task.status;
        project.tasks[taskIndex].assignedTo = task.assignedTo?._id;
        project.tasks[taskIndex].priority = task.priority;
        await project.save();
      }
    }

    res.json(task);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const task = await Task.findByIdAndDelete(taskId);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    const project = await Project.findById(task.projectId);
    if (project) {
      project.tasks = project.tasks.filter(t => t._id?.toString() !== taskId);
      await project.save();
    }

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const taskId = req.params.taskId || req.params.id;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Le commentaire est obligatoire' });

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Tâche non trouvée' });

    task.comments.push({
      userId: req.user?.id,
      text
    });
    await task.save();

    await task.populate('comments.userId', 'name email');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTaskStats = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const match = projectId ? { projectId } : {};

    const stats = await Task.aggregate([
      { $match: match },
      { $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalHours: { $sum: '$actualHours' }
      }}
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.body.projectId;
    const { userId, role, permissions } = req.body;

    if (!projectId || !userId) {
      return res.status(400).json({ message: 'projectId et userId sont obligatoires' });
    }

    const existing = await TeamMember.findOne({ projectId, userId });
    if (existing) {
      return res.status(400).json({ message: 'Ce membre fait déjà partie de l\'équipe' });
    }

    const member = await TeamMember.create({
      projectId,
      userId,
      role: role || 'developer',
      permissions: permissions || {}
    });

    const project = await Project.findById(projectId);
    if (project) {
      project.teamMembers.push({
        userId,
        role: role || 'developer',
        isActive: true
      });
      await project.save();
    }

    await member.populate('userId', 'name email');
    res.status(201).json(member);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Ce membre fait déjà partie de l\'équipe' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const projectId = req.params.projectId || req.query.projectId;
    const query = {};
    if (projectId) query.projectId = projectId;

    const members = await TeamMember.find(query)
      .populate('userId', 'name email role')
      .populate('projectId', 'name status');

    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const memberId = req.params.memberId || req.params.id;
    const updates = req.body;

    const member = await TeamMember.findByIdAndUpdate(memberId, updates, { new: true })
      .populate('userId', 'name email');

    if (!member) return res.status(404).json({ message: 'Membre non trouvé' });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeTeamMember = async (req, res) => {
  try {
    const memberId = req.params.memberId || req.params.id;
    const member = await TeamMember.findByIdAndDelete(memberId);
    if (!member) return res.status(404).json({ message: 'Membre non trouvé' });

    const project = await Project.findById(member.projectId);
    if (project) {
      project.teamMembers = project.teamMembers.filter(
        m => m.userId?.toString() !== member.userId?.toString()
      );
      await project.save();
    }

    res.json({ message: 'Membre supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
