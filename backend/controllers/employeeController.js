const Employee = require('../models/Employee');

exports.createEmployee = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (!payload.userId) payload.userId = req.user?.id;
    
    if (!payload.firstName || !payload.lastName || !payload.email || !payload.position || !payload.salary) {
      return res.status(400).json({ 
        message: 'Champs obligatoires manquants: firstName, lastName, email, position, salary' 
      });
    }
    
    const employee = await Employee.create(payload);
    res.status(201).json(employee);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployees = async (req, res) => {
  try {
    const { search, department, position, status, minSalary, maxSalary, sortBy, sortOrder, page = 1, limit = 20 } = req.query;
    const query = {};

    if (search) {
      const regexp = new RegExp(search, 'i');
      query.$or = [
        { firstName: regexp },
        { lastName: regexp },
        { email: regexp },
        { position: regexp },
        { department: regexp }
      ];
    }
    if (department) query.department = department;
    if (position) query.position = position;
    if (status) query.status = status;
    if (minSalary || maxSalary) {
      query.salary = {};
      if (minSalary) query.salary.$gte = Number(minSalary);
      if (maxSalary) query.salary.$lte = Number(maxSalary);
    }

    const sort = {};
    sort[sortBy || 'createdAt'] = sortOrder === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Employee.countDocuments(query);

    const employees = await Employee.find(query)
      .populate('userId', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      employees,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('userId', 'name email role');
    if (!employee) return res.status(404).json({ message: 'Employé non trouvé' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const employee = await Employee.findByIdAndUpdate(id, updates, { 
      new: true,
      runValidators: true 
    });
    
    if (!employee) return res.status(404).json({ message: 'Employé non trouvé' });
    res.json(employee);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message).join(', ');
      return res.status(400).json({ message: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Un employé avec cet email existe déjà' });
    }
    res.status(500).json({ message: error.message });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employé non trouvé' });
    res.json({ message: 'Employé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getEmployeeStats = async (req, res) => {
  try {
    const statusStats = await Employee.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, totalSalary: { $sum: '$salary' } }}
    ]);

    const departmentStats = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$department', count: { $sum: 1 }, avgSalary: { $avg: '$salary' } } }
    ]);

    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'active' });
    const totalPayroll = await Employee.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$salary' } } }
    ]);

    res.json({
      byStatus: statusStats,
      byDepartment: departmentStats,
      summary: {
        total: totalEmployees,
        active: activeEmployees,
        inactive: totalEmployees - activeEmployees,
        monthlyPayroll: totalPayroll[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};