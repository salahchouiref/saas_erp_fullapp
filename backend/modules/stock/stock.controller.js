const { Product, Category, Warehouse, StockMovement, StockLevel, Supplier } = require('./stock.model');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sortBy, sortOrder } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (category) filter.categoryId = category;
    if (minPrice || maxPrice) {
      filter.unitPrice = {};
      if (minPrice) filter.unitPrice.$gte = Number(minPrice);
      if (maxPrice) filter.unitPrice.$lte = Number(maxPrice);
    }
    const sort = {};
    sort[sortBy || 'name'] = sortOrder === 'desc' ? -1 : 1;
    const products = await Product.find(filter).populate('categoryId').sort(sort).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId').lean();
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const stockLevels = await StockLevel.find({ productId: req.params.id }).populate('warehouseId').lean();
    res.json({ ...product, stockLevels });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    if (req.body.warehouseId) {
      await StockLevel.create({ productId: product._id, warehouseId: req.body.warehouseId, quantity: 0 });
    }
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'SKU already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'SKU already exists' });
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    await StockMovement.deleteMany({ productId: req.params.id });
    await StockLevel.deleteMany({ productId: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate('parentId').sort('name').lean();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find().populate('managerId', 'name email').lean();
    res.json(warehouses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    res.status(201).json(warehouse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStockMovements = async (req, res) => {
  try {
    const { productId, warehouseId, type, limit } = req.query;
    const filter = {};
    if (productId) filter.productId = productId;
    if (warehouseId) filter.warehouseId = warehouseId;
    if (type) filter.type = type;
    const movements = await StockMovement.find(filter)
      .populate('productId', 'name sku')
      .populate('warehouseId', 'name')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 100)
      .lean();
    res.json(movements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStockMovement = async (req, res) => {
  try {
    const { productId, warehouseId, type, quantity, notes } = req.body;
    const movement = await StockMovement.create({
      productId, warehouseId, type, quantity: Math.abs(quantity),
      notes, performedBy: req.user.id
    });
    let stockLevel = await StockLevel.findOne({ productId, warehouseId });
    if (!stockLevel) {
      stockLevel = await StockLevel.create({ productId, warehouseId, quantity: 0 });
    }
    const qty = Number(quantity);
    if (type === 'in' || type === 'return') {
      stockLevel.quantity += qty;
    } else if (type === 'out') {
      stockLevel.quantity = Math.max(0, stockLevel.quantity - qty);
    } else if (type === 'adjustment') {
      stockLevel.quantity = Math.max(0, qty);
    }
    await stockLevel.save();
    const product = await Product.findById(productId);
    if (product && product.minStockLevel > 0 && stockLevel.quantity <= product.minStockLevel) {
      const Notification = require('mongoose').model('Notification');
      await Notification.create({
        userId: req.user.id,
        title: 'Stock faible',
        message: `${product.name} a atteint le seuil minimum (${stockLevel.quantity} ${product.unit})`,
        type: 'warning',
        relatedEntity: { type: 'Product', id: product._id }
      });
    }
    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStockLevels = async (req, res) => {
  try {
    const { lowStock } = req.query;
    const filter = {};
    if (lowStock === 'true') {
      const products = await Product.find({ minStockLevel: { $gt: 0 } }).lean();
      const productIds = products.filter(p => p.minStockLevel > 0).map(p => p._id);
      filter.productId = { $in: productIds };
    }
    const levels = await StockLevel.find(filter)
      .populate('productId', 'name sku unitPrice minStockLevel unit')
      .populate('warehouseId', 'name')
      .lean();
    if (lowStock === 'true') {
      const lowStockLevels = levels.filter(l => l.productId && l.quantity <= l.productId.minStockLevel);
      return res.json(lowStockLevels);
    }
    res.json(levels);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSuppliers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    const suppliers = await Supplier.find(filter).sort('name').lean();
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
