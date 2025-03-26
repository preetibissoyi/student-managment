const express = require('express');
const Result = require('../models/Result');
const Student = require('../models/Student');
const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const router = express.Router();

// Helper function to calculate grade and grade point
const calculateGradeAndPoint = (percentage) => {
    if (percentage >= 90) return { grade: 'O', gradePoint: 10 };
    if (percentage >= 80) return { grade: 'A+', gradePoint: 9 };
    if (percentage >= 70) return { grade: 'A', gradePoint: 8 };
    if (percentage >= 60) return { grade: 'B+', gradePoint: 7 };
    if (percentage >= 50) return { grade: 'B', gradePoint: 6 };
    if (percentage >= 40) return { grade: 'C', gradePoint: 5 };
    if (percentage >= 30) return { grade: 'D', gradePoint: 4 };
    return { grade: 'F', gradePoint: 0 };
};

// Auth Middleware
const protect = async (req, res, next) => {
    try {
        // 1) Check if token exists
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'You are not logged in! Please log in to get access.' 
            });
        }

        // 2) Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

        // 3) Check if user exists (either admin or student)
        const admin = await Admin.findById(decoded.id);
        const student = await Student.findById(decoded.id);

        if (!admin && !student) {
            return res.status(401).json({ 
                status: 'fail',
                message: 'The user belonging to this token no longer exists.' 
            });
        }

        // Grant access to protected route
        if (admin) {
            req.admin = admin;
            req.user = admin;
        } else {
            req.student = student;
            req.user = student;
        }
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ 
            status: 'fail',
            message: 'Not authorized, token failed' 
        });
    }
};

// Restrict to admin middleware
const restrictToAdmin = (req, res, next) => {
    if (!req.admin) {
        return res.status(403).json({
            status: 'fail',
            message: 'You do not have permission to perform this action'
        });
    }
    next();
};

// Publish Result
router.post('/', protect, restrictToAdmin, async (req, res) => {
    try {
        const { studentId, programType, batch, stream, semester, academicYear, subjects } = req.body;

        // Validate required fields
        if (!studentId || !programType || !batch || !stream || !semester || !academicYear || !subjects) {
            return res.status(400).json({
                status: 'fail',
                message: 'Please provide all required fields'
            });
        }

        // Find student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({
                status: 'fail',
                message: 'Student not found'
            });
        }

        // Validate subjects
        if (subjects.length === 0) {
            return res.status(400).json({
                status: 'fail',
                message: 'At least one subject is required'
            });
        }

        // Process subjects and calculate totals
        let totalCredits = 0;
        let totalMarks = 0;
        let obtainedMarks = 0;
        let totalGradePoints = 0;

        const processedSubjects = subjects.map(subject => {
            // Validate subject structure
            if (!subject.subjectName || !subject.marks || !subject.credit) {
                throw new Error('Each subject must have subjectName, marks, and credit');
            }

            if (!subject.marks.theory || !subject.marks.internal || !subject.marks.practical) {
                throw new Error('Each subject must have theory, internal, and practical marks');
            }

            // Validate marks limits
            if (subject.marks.theory > 70) {
                throw new Error('Theory marks cannot exceed 70');
            }
            if (subject.marks.internal > 20) {
                throw new Error('Internal marks cannot exceed 20');
            }
            if (subject.marks.practical > 10) {
                throw new Error('Practical marks cannot exceed 10');
            }

            // Calculate obtained marks for this subject
            const subjectObtainedMarks = subject.marks.theory + subject.marks.internal + subject.marks.practical;
            const subjectPercentage = (subjectObtainedMarks / 100) * 100;
            const { grade, gradePoint } = calculateGradeAndPoint(subjectPercentage);

            // Update totals
            totalCredits += subject.credit;
            totalMarks += 100;
            obtainedMarks += subjectObtainedMarks;
            totalGradePoints += gradePoint * subject.credit;

            return {
                ...subject,
                totalMarks: 100,
                obtainedMarks: subjectObtainedMarks,
                percentage: subjectPercentage,
                grade,
                gradePoint,
                result: subjectPercentage >= 40 ? 'PASS' : 'FAIL'
            };
        });

        // Calculate overall percentage and CGPA
        const overallPercentage = (obtainedMarks / totalMarks) * 100;
        const cgpa = totalGradePoints / totalCredits;

        // Determine overall result
        const result = overallPercentage >= 40 ? 'PASS' : 'FAIL';

        // Create result
        const newResult = await Result.create({
            student: studentId,
            studentName: student.studentName,
            rollNumber: student.collegeRollNumber,
            programType,
            batch,
            stream,
            semester,
            academicYear,
            subjects: processedSubjects,
            totalCredits,
            totalMarks,
            obtainedMarks,
            percentage: overallPercentage,
            cgpa,
            result,
            publishedBy: req.admin._id,
            isPublished: true
        });

        res.status(201).json({
            status: 'success',
            message: 'Result published successfully',
            data: {
                result: newResult
            }
        });
    } catch (error) {
        console.error('Result creation error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message || 'Error creating result'
        });
    }
});

// Get All Results
router.get('/', protect, restrictToAdmin, async (req, res) => {
    try {
        const { programType, batch, stream, semester } = req.query;
        const query = { isPublished: true };

        // Add filters if provided
        if (programType) query.programType = programType;
        if (batch) query.batch = batch;
        if (stream) query.stream = stream;
        if (semester) query.semester = semester;

        const results = await Result.find(query)
            .populate('student', 'studentName collegeRollNumber')
            .populate('publishedBy', 'name')
            .sort({ rollNumber: 1 });

        res.status(200).json({
            status: 'success',
            results: results.length,
            data: {
                results
            }
        });
    } catch (error) {
        console.error('Get results error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message || 'Error fetching results'
        });
    }
});

// Get Student Result
router.get('/:studentId/:semester', protect, async (req, res) => {
    try {
        const { studentId, semester } = req.params;

        const result = await Result.findOne({
            student: studentId,
            semester,
            isPublished: true
        }).populate('student', 'studentName collegeRollNumber')
          .populate('publishedBy', 'name');

        if (!result) {
            return res.status(404).json({
                status: 'fail',
                message: 'Result not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                result
            }
        });
    } catch (error) {
        console.error('Get student result error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message || 'Error fetching student result'
        });
    }
});

// Get Batch Results
router.get('/batch/:batch/stream/:stream/semester/:semester', protect, restrictToAdmin, async (req, res) => {
    try {
        const { batch, stream, semester } = req.params;

        const results = await Result.find({
            batch,
            stream,
            semester,
            isPublished: true
        }).populate('student', 'studentName collegeRollNumber')
          .populate('publishedBy', 'name')
          .sort({ rollNumber: 1 });

        res.status(200).json({
            status: 'success',
            results: results.length,
            data: {
                results
            }
        });
    } catch (error) {
        console.error('Get batch results error:', error);
        res.status(400).json({
            status: 'fail',
            message: error.message || 'Error fetching batch results'
        });
    }
});

// Update Result
router.patch('/:id', protect, catchAsync(async (req, res, next) => {
    const result = await Result.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    ).populate('student', 'name rollNumber')
     .populate('publishedBy', 'name');

    if (!result) {
        return next(new AppError('Result not found', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            result
        }
    });
}));

// Delete Result
router.delete('/:id', protect, catchAsync(async (req, res, next) => {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) {
        return next(new AppError('Result not found', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
}));

module.exports = router; 