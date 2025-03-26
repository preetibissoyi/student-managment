const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// Sign up
router.post('/register', catchAsync(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered', 400));
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'student'
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
}));

// Login
router.post('/login', catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check if user exists && password is correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }
    });
}));

module.exports = router; 