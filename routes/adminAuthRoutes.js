const express = require('express');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// Admin Registration
router.post('/register', catchAsync(async (req, res, next) => {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
        return next(new AppError('Email already registered', 400));
    }

    // Create new admin
    const admin = await Admin.create({
        name,
        email,
        password,
        role: 'admin'
    });

    // Generate token
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'your-secret-key', {
        expiresIn: '1d'
    });

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
}));

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide email and password'
            });
        }

        // Check if admin exists && password is correct
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordCorrect = await admin.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                status: 'fail',
                message: 'Invalid email or password'
            });
        }

        // Generate token
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
        console.error('Login error:', error);
        res.status(500).json({
            status: 'fail',
            message: 'An error occurred during login'
        });
    }
});

module.exports = router; 