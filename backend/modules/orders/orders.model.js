const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0 },
  discount: { type: Number, default: 0, min: 0 }
});

const PaymentSchema = new mongoose.Schema({
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ['cash', 'card', 'transfer', 'check', 'other'], required: true },
  reference: { type: String },
  paidAt: { type: Date, default: Date.now },
  notes: { type: String }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true, min: 0 },
  taxTotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'partial', 'paid', 'refunded'],
    default: 'unpaid'
  },
  payments: [PaymentSchema],
  shippingAddress: {
    street: String, city: String, state: String, zipCode: String, country: { type: String, default: 'Maroc' }
  },
  deliveryDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

OrderSchema.index({ orderNumber: 1, clientId: 1, status: 1, createdAt: -1 });

OrderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CMD-${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, unique: true },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true, min: 0 },
  taxAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  dueDate: { type: Date },
  issuedDate: { type: Date, default: Date.now },
  paidDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

const ReturnSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    description: String,
    quantity: { type: Number, required: true },
    reason: { type: String, required: true }
  }],
  status: { type: String, enum: ['requested', 'approved', 'rejected', 'completed'], default: 'requested' },
  refundAmount: { type: Number, min: 0 },
  refundMethod: { type: String, enum: ['original', 'bank', 'cash', 'store_credit'] },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

OrderSchema.virtual('isOverdue').get(function () {
  if (!this.deliveryDate) return false;
  return this.deliveryDate < new Date() && !['delivered', 'cancelled', 'refunded'].includes(this.status);
});
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

const Order = mongoose.model('Order', OrderSchema);
const Invoice = mongoose.model('Invoice', InvoiceSchema);
const Return = mongoose.model('Return', ReturnSchema);

module.exports = { Order, Invoice, Return };
