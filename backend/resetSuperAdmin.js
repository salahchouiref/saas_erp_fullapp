const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/saas_ai';

async function resetSuperAdmin() {
  await mongoose.connect(MONGO_URI);

  const email = 'superadmin@example.com';
  const password = 'superadmin123';
  const name = 'Super Admin';
  const role = 'admin';

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const user = await User.findOneAndUpdate(
    { email },
    { name, email, password: hashedPassword, role },
    { upsert: true, new: true }
  );
  
  console.log('Superadmin reset:', user.email);
  mongoose.disconnect();
}

resetSuperAdmin().catch(err => {
  console.error('Error:', err);
  mongoose.disconnect();
  process.exit(1);
});