const express = require('express');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const router = express.Router();

// Register Admin
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        // Create new admin
        const admin = await Admin.create({
            name,
            email,
            password
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            status: 'success',
            token,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Login Admin
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Check if admin exists && password is correct
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            status: 'success',
            token,
            data: {
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

module.exports = router; 