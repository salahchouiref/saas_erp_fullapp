const Client = require('../models/Client');

exports.createClient = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    if (!payload.name) {
      return res.status(400).json({ message: 'Le nom du client est obligatoire' });
    }
    
    const client = await Client.create(payload);
    res.status(201).json(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getClients = async (req, res) => {
  try {
    const { search, status, industry, assignedTo, sortBy, sortOrder } = req.query;
    const query = {};

    if (search) {
      const regexp = new RegExp(search, 'i');
      query.$or = [
        { name: regexp },
        { email: regexp },
        { company: regexp },
        { industry: regexp }
      ];
    }
    if (status) query.status = status;
    if (industry) query.industry = industry;
    if (assignedTo) query.assignedTo = assignedTo;

    const sort = {};
    sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const clients = await Client.find(query)
      .populate('assignedTo', 'name email')
      .populate('projects', 'name status')
      .sort(sort);
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('projects', 'name status dueDate progress');
    
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const client = await Client.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    });
    
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json(client);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });
    res.json({ message: 'Client supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};