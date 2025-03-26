const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: [true, 'Student ID is required']
    },
    studentName: {
        type: String,
        required: true
    },
    rollNumber: {
        type: String,
        required: true
    },
    programType: {
        type: String,
        enum: ['UNDERGRADUATE', 'POSTGRADUATE'],
        required: [true, 'Program type is required']
    },
    batch: {
        type: String,
        required: [true, 'Batch is required']
    },
    stream: {
        type: String,
        required: [true, 'Stream is required']
    },
    semester: {
        type: Number,
        required: [true, 'Semester is required']
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    subjects: [{
        subjectName: {
            type: String,
            required: true
        },
        marks: {
            theory: {
                type: Number,
                required: true,
                min: [0, 'Theory marks cannot be negative'],
                max: [70, 'Theory marks cannot exceed 70']
            },
            internal: {
                type: Number,
                required: true,
                min: [0, 'Internal marks cannot be negative'],
                max: [20, 'Internal marks cannot exceed 20']
            },
            practical: {
                type: Number,
                required: true,
                min: [0, 'Practical marks cannot be negative'],
                max: [10, 'Practical marks cannot exceed 10']
            }
        },
        totalMarks: {
            type: Number,
            default: 100
        },
        obtainedMarks: {
            type: Number,
            required: true
        },
        credit: {
            type: Number,
            required: true,
            min: [0, 'Credit cannot be negative']
        },
        grade: {
            type: String,
            enum: ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'],
            required: true
        },
        gradePoint: {
            type: Number,
            required: true
        },
        result: {
            type: String,
            enum: ['PASS', 'FAIL'],
            required: true
        }
    }],
    totalCredits: {
        type: Number,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    obtainedMarks: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true
    },
    cgpa: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        enum: ['PASS', 'FAIL'],
        required: true
    },
    remarks: {
        type: String,
        default: ''
    },
    publishedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Function to calculate grade and grade point based on grand total percentage
function calculateGradeAndPoint(percentage) {
    if (percentage >= 90) return { grade: 'O', point: 10 };
    if (percentage >= 80) return { grade: 'A+', point: 9 };
    if (percentage >= 70) return { grade: 'A', point: 8 };
    if (percentage >= 60) return { grade: 'B+', point: 7 };
    if (percentage >= 50) return { grade: 'B', point: 6 };
    if (percentage >= 45) return { grade: 'C', point: 5 };
    if (percentage >= 40) return { grade: 'D', point: 4 };
    return { grade: 'F', point: 0 };
}

// Pre-save middleware to calculate totals and results
resultSchema.pre('save', function(next) {
    // Calculate total marks and obtained marks
    const totalMarks = this.subjects.length * 100;
    let obtainedMarks = 0;
    let totalCredits = 0;

    // Calculate obtained marks and total credits
    this.subjects.forEach(subject => {
        obtainedMarks += subject.obtainedMarks;
        totalCredits += subject.credit;
    });

    // Calculate percentage
    const percentage = (obtainedMarks / totalMarks) * 100;

    // Calculate grade and grade point
    const { grade, point } = calculateGradeAndPoint(percentage);

    // Set grade and result for each subject
    this.subjects.forEach(subject => {
        subject.grade = grade;
        subject.gradePoint = point;
        subject.result = grade !== 'F' ? 'PASS' : 'FAIL';
    });

    // Set overall result
    this.totalCredits = totalCredits;
    this.totalMarks = totalMarks;
    this.obtainedMarks = obtainedMarks;
    this.percentage = percentage;
    this.cgpa = point;
    this.result = grade !== 'F' ? 'PASS' : 'FAIL';

    // Generate remarks
    if (percentage >= 90) {
        this.remarks = 'Outstanding performance!';
    } else if (percentage >= 80) {
        this.remarks = 'Excellent performance!';
    } else if (percentage >= 70) {
        this.remarks = 'Good performance!';
    } else if (percentage >= 60) {
        this.remarks = 'Satisfactory performance.';
    } else if (percentage >= 50) {
        this.remarks = 'Average performance.';
    } else {
        this.remarks = 'Needs improvement.';
    }

    next();
});

const Result = mongoose.model('Result', resultSchema);
module.exports = Result; 