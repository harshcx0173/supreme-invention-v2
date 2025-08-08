const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meeting-booking-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Function to make a user super admin
async function makeSuperAdmin(email) {
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { 
        isSuperAdmin: true,
        isAdmin: true // Super admins should also be admins
      },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${email} not found.`);
      return;
    }

    console.log(`✅ Successfully made ${user.name} (${user.email}) a Super Admin!`);
    console.log(`User details:`);
    console.log(`- Name: ${user.name}`);
    console.log(`- Email: ${user.email}`);
    console.log(`- isAdmin: ${user.isAdmin}`);
    console.log(`- isSuperAdmin: ${user.isSuperAdmin}`);
  } catch (error) {
    console.error('Error making user super admin:', error);
  }
}

// Function to list all super admins
async function listSuperAdmins() {
  try {
    const superAdmins = await User.find({ isSuperAdmin: true });
    
    if (superAdmins.length === 0) {
      console.log('No super admins found.');
      return;
    }

    console.log('Current Super Admins:');
    superAdmins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
    });
  } catch (error) {
    console.error('Error listing super admins:', error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'create' && args[1]) {
  makeSuperAdmin(args[1]);
} else if (command === 'list') {
  listSuperAdmins();
} else {
  console.log('Usage:');
  console.log('  node createSuperAdmin.js create <email>  - Make a user super admin');
  console.log('  node createSuperAdmin.js list            - List all super admins');
  console.log('');
  console.log('Example:');
  console.log('  node createSuperAdmin.js create john@example.com');
}

// Close connection after operation
setTimeout(() => {
  mongoose.connection.close();
  console.log('MongoDB connection closed.');
}, 1000);
