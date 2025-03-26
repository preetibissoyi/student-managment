const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Admin = require('../models/Admin');

dotenv.config();

const createDefaultAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
        if (existingAdmin) {
            console.log('Admin user already exists');
            process.exit(0);
        }

        // Create default admin
        const admin = await Admin.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: 'admin123',
            role: 'admin'
        });

        console.log('Default admin user created successfully:', admin);
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
};

createDefaultAdmin(); 