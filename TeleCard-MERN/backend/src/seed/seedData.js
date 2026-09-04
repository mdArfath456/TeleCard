const User = require('../models/User');
const Category = require('../models/Category');

async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@telecard.com').toLowerCase();
  if (await User.exists({ email: adminEmail })) return;

  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

  await User.create({
    name: 'TeleCard Admin',
    email: adminEmail,
    phone: '9000000000',
    password: adminPassword,
    role: 'ADMIN',
    enabled: true,
  });

  console.log('TeleCard admin account created:', adminEmail);
}

async function seedCategories() {
  const count = await Category.countDocuments();
  if (count > 0) return;

  await Category.insertMany([
    { name: 'Credit Cards', description: 'Credit cards across reward, cashback and travel categories', active: true },
    { name: 'Debit Cards', description: 'Debit cards linked to savings accounts', active: true },
    { name: 'Business Cards', description: 'Cards designed for business and corporate spending', active: true },
  ]);

  console.log('Seeded starter categories - add cards from the admin panel');
}

async function runSeed() {
  await seedAdmin();
  await seedCategories();
}

module.exports = runSeed;
