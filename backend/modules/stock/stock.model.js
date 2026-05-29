const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const WarehouseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  address: { street: String, city: String, country: { type: String, default: 'Maroc' } },
  managerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, unique: true, required: true },
  description: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  unitPrice: { type: Number, required: true, min: 0 },
  unitCost: { type: Number, min: 0 },
  unit: { type: String, default: 'piece' },
  taxRate: { type: Number, default: 0 },
  minStockLevel: { type: Number, default: 0 },
  maxStockLevel: { type: Number },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  barcode: { type: String },
  attributes: { type: Map, of: String }
}, { timestamps: true });

ProductSchema.index({ name: 1, sku: 1, categoryId: 1 });

const StockMovementSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type: { type: String, enum: ['in', 'out', 'transfer', 'adjustment', 'return'], required: true },
  quantity: { type: Number, required: true },
  referenceType: { type: String, enum: ['purchase_order', 'sales_order', 'transfer', 'physical_count', 'return'] },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  unitPrice: { type: Number },
  notes: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

StockMovementSchema.index({ productId: 1, warehouseId: 1, createdAt: -1 });

const StockLevelSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  quantity: { type: Number, default: 0, min: 0 },
  reservedQuantity: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

StockLevelSchema.index({ productId: 1, warehouseId: 1 }, { unique: true });

const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { name: String, email: String, phone: String },
  email: { type: String },
  phone: { type: String },
  address: { street: String, city: String, country: { type: String, default: 'Maroc' } },
  taxId: { type: String },
  paymentTerms: { type: String },
  leadTimeDays: { type: Number },
  rating: { type: Number, min: 1, max: 5 },
  isActive: { type: Boolean, default: true },
  notes: { type: String }
}, { timestamps: true });

const Category = mongoose.model('Category', CategorySchema);
const Warehouse = mongoose.model('Warehouse', WarehouseSchema);
const Product = mongoose.model('Product', ProductSchema);
const StockMovement = mongoose.model('StockMovement', StockMovementSchema);
const StockLevel = mongoose.model('StockLevel', StockLevelSchema);
const Supplier = mongoose.model('Supplier', SupplierSchema);

module.exports = { Category, Warehouse, Product, StockMovement, StockLevel, Supplier };
