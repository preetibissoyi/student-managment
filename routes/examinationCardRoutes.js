const express = require('express');
const jwt = require('jsonwebtoken');
const ExaminationCard = require('../models/ExaminationCard');
const Student = require('../models/Student');
const Admin = require('../models/Admin');

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-jwt-key-change-this-in-production');
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

// Create examination card
router.post('/', protect, async (req, res) => {
    try {
        const { studentId, subjects } = req.body;

        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if examination card already exists
        const existingCard = await ExaminationCard.findOne({
            $or: [
                { examRollNumber: student.examRollNumber },
                { collegeRollNumber: student.collegeRollNumber }
            ]
        });

        if (existingCard) {
            return res.status(400).json({ message: 'Examination card already exists for this student' });
        }

        // Validate required subjects
        const requiredSubjects = ['majorCP1', 'major', 'majorCP2', 'minorP1', 'mdc1', 'aec', 'vac1'];
        const missingSubjects = requiredSubjects.filter(subject => !subjects[subject]);
        
        if (missingSubjects.length > 0) {
            return res.status(400).json({ 
                message: 'Missing required subjects', 
                missingSubjects 
            });
        }

        // Create examination card
        const examinationCard = await ExaminationCard.create({
            student: studentId,
            stream: student.stream,
            examRollNumber: student.examRollNumber,
            collegeRollNumber: student.collegeRollNumber,
            studentName: student.studentName,
            profilePhoto: student.profilePhoto,
            subjects,
            createdBy: req.admin._id
        });

        res.status(201).json({
            status: 'success',
            message: 'Examination card created successfully',
            data: {
                examinationCard: {
                    id: examinationCard._id,
                    stream: examinationCard.stream,
                    examRollNumber: examinationCard.examRollNumber,
                    collegeRollNumber: examinationCard.collegeRollNumber,
                    studentName: examinationCard.studentName,
                    profilePhoto: examinationCard.profilePhoto,
                    subjects: examinationCard.subjects
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

// Get all examination cards
router.get('/', protect, async (req, res) => {
    try {
        const examinationCards = await ExaminationCard.find({ createdBy: req.admin._id })
            .populate('student', 'studentName stream collegeRollNumber examRollNumber examCode profilePhoto');

        res.status(200).json({
            status: 'success',
            results: examinationCards.length,
            data: {
                examinationCards: examinationCards.map(card => ({
                    id: card._id,
                    stream: card.stream,
                    examRollNumber: card.examRollNumber,
                    collegeRollNumber: card.collegeRollNumber,
                    studentName: card.studentName,
                    profilePhoto: card.profilePhoto,
                    subjects: card.subjects
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

// Get single examination card
router.get('/:id', protect, async (req, res) => {
    try {
        const examinationCard = await ExaminationCard.findOne({
            _id: req.params.id,
            createdBy: req.admin._id
        }).populate('student', 'studentName stream collegeRollNumber examRollNumber examCode profilePhoto');

        if (!examinationCard) {
            return res.status(404).json({ message: 'Examination card not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                examinationCard: {
                    id: examinationCard._id,
                    stream: examinationCard.stream,
                    examRollNumber: examinationCard.examRollNumber,
                    collegeRollNumber: examinationCard.collegeRollNumber,
                    studentName: examinationCard.studentName,
                    profilePhoto: examinationCard.profilePhoto,
                    subjects: examinationCard.subjects
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

// Get examination card by exam roll number
router.get('/exam-roll/:examRollNumber', protect, async (req, res) => {
    try {
        const examinationCard = await ExaminationCard.findOne({
            examRollNumber: req.params.examRollNumber,
            createdBy: req.admin._id
        }).populate('student', 'studentName stream collegeRollNumber examRollNumber examCode profilePhoto');

        if (!examinationCard) {
            return res.status(404).json({ message: 'Examination card not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                examinationCard: {
                    id: examinationCard._id,
                    stream: examinationCard.stream,
                    examRollNumber: examinationCard.examRollNumber,
                    collegeRollNumber: examinationCard.collegeRollNumber,
                    studentName: examinationCard.studentName,
                    profilePhoto: examinationCard.profilePhoto,
                    subjects: examinationCard.subjects
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