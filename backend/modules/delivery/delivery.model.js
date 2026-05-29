const mongoose = require('mongoose');

const DeliveryAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  vehicleType: { type: String, enum: ['bike', 'car', 'van', 'truck', 'other'] },
  vehiclePlate: { type: String },
  isAvailable: { type: Boolean, default: true },
  currentLocation: {
    lat: { type: Number },
    lng: { type: Number },
    updatedAt: { type: Date }
  },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  totalDeliveries: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const RouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  stops: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    address: String,
    city: String,
    lat: Number,
    lng: Number,
    stopOrder: Number,
    estimatedArrival: Date,
    status: { type: String, enum: ['pending', 'arrived', 'completed', 'skipped'], default: 'pending' }
  }],
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  status: { type: String, enum: ['planned', 'in_progress', 'completed', 'cancelled'], default: 'planned' },
  startTime: { type: Date },
  endTime: { type: Date },
  notes: { type: String }
}, { timestamps: true });

const DeliverySchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned'],
    default: 'pending'
  },
  deliveryAddress: { street: String, city: String, lat: Number, lng: Number },
  estimatedDeliveryTime: { type: Date },
  actualDeliveryTime: { type: Date },
  recipientName: { type: String },
  signature: { type: String },
  notes: { type: String },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    location: { lat: Number, lng: Number },
    notes: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

DeliverySchema.index({ orderId: 1, agentId: 1, status: 1 });

const DeliveryAgent = mongoose.model('DeliveryAgent', DeliveryAgentSchema);
const Route = mongoose.model('Route', RouteSchema);
const Delivery = mongoose.model('Delivery', DeliverySchema);

module.exports = { DeliveryAgent, Route, Delivery };
