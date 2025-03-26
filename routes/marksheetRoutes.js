const express = require("express");
const jwt = require("jsonwebtoken");
const Marksheet = require("../models/Marksheet");
const Student = require("../models/Student");
const Admin = require("../models/Admin");

const router = express.Router();

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token" });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "your-secret-jwt-key-change-this-in-production"
        );
        const admin = await Admin.findById(decoded.id);

        if (!admin) {
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }

        req.admin = admin;
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

// Create marksheet
router.post("/", protect, async (req, res) => {
    try {
        const { studentId, programType, semester, academicYear, subjects } = req.body;

        if (!studentId || !programType || !semester || !academicYear || !subjects || subjects.length === 0) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Get student details
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if marksheet already exists for this semester
        const existingMarksheet = await Marksheet.findOne({
            student: studentId,
            semester,
        });

        if (existingMarksheet) {
            return res.status(400).json({ message: "Marksheet already exists for this semester" });
        }

        // Auto-calculate obtainedMarks for each subject
        subjects.forEach(subject => {
            subject.obtainedMarks =
                (subject.marks.theory || 0) +
                (subject.marks.internal || 0) +
                (subject.marks.practical || 0);
        });

        // Create marksheet
        const marksheet = new Marksheet({
            student: studentId,
            studentName: student.studentName,
            programType,
            semester,
            academicYear,
            subjects,
            createdBy: req.admin._id,
        });

        // Save marksheet
        await marksheet.save();

        res.status(201).json({
            status: "success",
            message: "Marksheet created successfully",
            data: {
                marksheet: {
                    id: marksheet._id,
                    studentName: marksheet.studentName,
                    programType: marksheet.programType,
                    semester: marksheet.semester,
                    academicYear: marksheet.academicYear,
                    subjects: marksheet.subjects,
                    totalCredits: marksheet.totalCredits,
                    totalMarks: marksheet.totalMarks,
                    obtainedMarks: marksheet.obtainedMarks,
                    percentage: marksheet.percentage,
                    cgpa: marksheet.cgpa,
                    result: marksheet.result,
                    remarks: marksheet.remarks,
                },
            },
        });
    } catch (error) {
        res.status(400).json({
            status: "fail",
            message: error.message,
        });
    }
});

// Get all marksheets of a student
router.get('/student/:studentId', protect, async (req, res) => {
    try {
        const marksheets = await Marksheet.find({ student: req.params.studentId })
            .populate('student', 'studentName stream collegeRollNumber examRollNumber');

        res.status(200).json({
            status: 'success',
            results: marksheets.length,
            data: {
                marksheets: marksheets.map(marksheet => ({
                    id: marksheet._id,
                    studentName: marksheet.student.studentName,
                    programType: marksheet.programType,
                    semester: marksheet.semester,
                    subjects: marksheet.subjects,
                    totalCredits: marksheet.totalCredits,
                    totalMarks: marksheet.totalMarks,
                    obtainedMarks: marksheet.obtainedMarks,
                    percentage: marksheet.percentage,
                    result: marksheet.result
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

// Get single marksheet
router.get('/:id', protect, async (req, res) => {
    try {
        const marksheet = await Marksheet.findById(req.params.id)
            .populate('student', 'studentName stream collegeRollNumber examRollNumber');

        if (!marksheet) {
            return res.status(404).json({ message: 'Marksheet not found' });
        }

        res.status(200).json({
            status: 'success',
            data: {
                marksheet: {
                    id: marksheet._id,
                    studentName: marksheet.student.studentName,
                    programType: marksheet.programType,
                    semester: marksheet.semester,
                    subjects: marksheet.subjects,
                    totalCredits: marksheet.totalCredits,
                    totalMarks: marksheet.totalMarks,
                    obtainedMarks: marksheet.obtainedMarks,
                    percentage: marksheet.percentage,
                    result: marksheet.result
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