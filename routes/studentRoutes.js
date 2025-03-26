const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const upload = require('../middleware/upload');

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-jwt-key-change-this-in-production');
        
        // Get admin from token
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ message: 'Not authorized, invalid token' });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// Create student with photo upload
router.post('/', protect, upload.single('profilePhoto'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a profile photo' });
        }

        const { studentName, stream, collegeRollNumber } = req.body;

        // Check if student with college roll number already exists
        const existingStudent = await Student.findOne({ collegeRollNumber });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student with this college roll number already exists' });
        }

        // Create student with photo path
        const student = await Student.create({
            studentName,
            stream,
            collegeRollNumber,
            profilePhoto: `/uploads/students/${req.file.filename}`,
            createdBy: req.admin._id
        });

        res.status(201).json({
            status: 'success',
            data: {
                student: {
                    id: student._id,
                    studentName: student.studentName,
                    stream: student.stream,
                    collegeRollNumber: student.collegeRollNumber,
                    examRollNumber: student.examRollNumber,
                    examCode: student.examCode,
                    profilePhoto: student.profilePhoto
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

// Get all students
router.get('/', protect, async (req, res) => {
    try {
        const students = await Student.find({ createdBy: req.admin._id });
        
        res.status(200).json({
            status: 'success',
            results: students.length,
            data: {
                students: students.map(student => ({
                    id: student._id,
                    studentName: student.studentName,
                    stream: student.stream,
                    collegeRollNumber: student.collegeRollNumber,
                    examRollNumber: student.examRollNumber,
                    examCode: student.examCode,
                    profilePhoto: student.profilePhoto
                }))
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message
        });
    }
});

// Get single student
router.get('/:id', protect, async (req, res) => {
    try {
        const student = await Student.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                student: {
                    id: student._id,
                    studentName: student.studentName,
                    stream: student.stream,
                    collegeRollNumber: student.collegeRollNumber,
                    examRollNumber: student.examRollNumber,
                    examCode: student.examCode,
                    profilePhoto: student.profilePhoto
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