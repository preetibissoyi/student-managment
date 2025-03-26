const express = require('express');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// Student Registration
router.post('/register', catchAsync(async (req, res, next) => {
    const { name, email, password, rollNumber, programType, stream, batch, semester } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ $or: [{ email }, { rollNumber }] });
    if (existingStudent) {
        return next(new AppError('Email or roll number already registered', 400));
    }

    // Create new student
    const student = await Student.create({
        name,
        email,
        password,
        rollNumber,
        programType,
        stream,
        batch,
        semester
    });

    // Generate token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(201).json({
        status: 'success',
        token,
        data: {
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                programType: student.programType,
                stream: student.stream,
                batch: student.batch,
                semester: student.semester
            }
        }
    });
}));

// Student Login
router.post('/login', catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    // Check if student exists && password is correct
    const student = await Student.findOne({ email }).select('+password');
    if (!student || !(await student.correctPassword(password, student.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    // Generate token
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
        status: 'success',
        token,
        data: {
            student: {
                id: student._id,
                name: student.name,
                email: student.email,
                rollNumber: student.rollNumber,
                programType: student.programType,
                stream: student.stream,
                batch: student.batch,
                semester: student.semester
            }
        }
    });
}));

module.exports = router; 