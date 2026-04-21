const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_ai';

async function createSuperAdmin() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const email = 'superadmin@example.com';
  const password = 'superadmin123';
  const name = 'Super Admin';
  const role = 'admin';

  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Superadmin already exists:', email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ name, email, password: hashedPassword, role });
  await user.save();
  console.log('Superadmin created:', email);
  mongoose.disconnect();
}

createSuperAdmin().catch(err => {
  console.error('Error creating superadmin:', err);
  mongoose.disconnect();
  process.exit(1);
});
