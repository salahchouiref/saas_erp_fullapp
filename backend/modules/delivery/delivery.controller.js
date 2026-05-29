const { Delivery, DeliveryAgent, Route } = require('./delivery.model');

exports.getDeliveries = async (req, res) => {
  try {
    const { status, agentId, orderId } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (agentId) filter.agentId = agentId;
    if (orderId) filter.orderId = orderId;
    const deliveries = await Delivery.find(filter)
      .populate('orderId', 'orderNumber total')
      .populate('agentId', 'name phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    res.json(deliveries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('orderId')
      .populate('agentId')
      .populate('routeId')
      .lean();
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.create({ ...req.body, createdBy: req.user.id });
    if (delivery.agentId) {
      await DeliveryAgent.findByIdAndUpdate(delivery.agentId, { isAvailable: false });
    }
    const populated = await Delivery.findById(delivery._id)
      .populate('orderId', 'orderNumber total')
      .populate('agentId', 'name phone')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) return res.status(404).json({ message: 'Delivery not found' });
    delivery.status = status;
    delivery.timeline.push({ status, notes, timestamp: new Date() });
    if (status === 'delivered') {
      delivery.actualDeliveryTime = new Date();
      if (delivery.agentId) {
        await DeliveryAgent.findByIdAndUpdate(delivery.agentId, {
          $inc: { totalDeliveries: 1 },
          isAvailable: true
        });
      }
    }
    if (status === 'failed' || status === 'returned') {
      if (delivery.agentId) {
        await DeliveryAgent.findByIdAndUpdate(delivery.agentId, { isAvailable: true });
      }
    }
    await delivery.save();
    const io = req.app.get('io');
    if (io) {
      io.emit('deliveryUpdate', { deliveryId: delivery._id, status, timestamp: new Date() });
    }
    res.json(delivery);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAgents = async (req, res) => {
  try {
    const { available } = req.query;
    const filter = { isActive: true };
    if (available === 'true') filter.isAvailable = true;
    const agents = await DeliveryAgent.find(filter).sort('name').lean();
    res.json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.create(req.body);
    res.status(201).json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAgent = async (req, res) => {
  try {
    const agent = await DeliveryAgent.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!agent) return res.status(404).json({ message: 'Agent not found' });
    res.json(agent);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find()
      .populate('agentId', 'name phone')
      .populate('stops.orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .lean();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
