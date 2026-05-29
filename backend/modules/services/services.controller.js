const { ServiceCatalog, ServiceRequest, Technician, ServiceLifecycle, ServiceReport } = require('./services.model');

exports.getCatalog = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: 'i' };
    const services = await ServiceCatalog.find(filter).sort('name').lean();
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCatalogItem = async (req, res) => {
  try {
    const item = await ServiceCatalog.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const { status, clientId, assignedTo, priority } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (clientId) filter.clientId = clientId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority) filter.priority = priority;
    const requests = await ServiceRequest.find(filter)
      .populate('serviceId', 'name category')
      .populate('clientId', 'name company')
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRequest = async (req, res) => {
  try {
    const request = await ServiceRequest.create({ ...req.body, createdBy: req.user.id });
    await ServiceLifecycle.create({ requestId: request._id, status: 'new', changedBy: req.user.id, notes: 'Request created' });
    const populated = await ServiceRequest.findById(request._id)
      .populate('serviceId', 'name')
      .populate('clientId', 'name company')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { status, ...(status === 'completed' ? { completionDate: new Date() } : {}) },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: 'Request not found' });
    await ServiceLifecycle.create({ requestId: request._id, status, changedBy: req.user.id, notes });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTechnicians = async (req, res) => {
  try {
    const { available } = req.query;
    const filter = {};
    if (available === 'true') filter.isAvailable = true;
    const techs = await Technician.find(filter).sort('name').lean();
    res.json(techs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createTechnician = async (req, res) => {
  try {
    const tech = await Technician.create(req.body);
    res.status(201).json(tech);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRequestHistory = async (req, res) => {
  try {
    const history = await ServiceLifecycle.find({ requestId: req.params.id })
      .populate('changedBy', 'name email')
      .sort({ changedAt: -1 })
      .lean();
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await ServiceReport.find()
      .populate('requestId', 'title')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .lean();
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReport = async (req, res) => {
  try {
    const report = await ServiceReport.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
