const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const studentSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Please provide student name'],
        trim: true
    },
    stream: {
        type: String,
        required: [true, 'Please provide stream'],
        trim: true
    },
    collegeRollNumber: {
        type: String,
        required: [true, 'Please provide college roll number'],
        unique: true,
        trim: true
    },
    examRollNumber: {
        type: String,
        unique: true,
        trim: true
    },
    examCode: {
        type: String,
        unique: true,
        trim: true
    },
    profilePhoto: {
        type: String,
        default: 'default.jpg'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Generate unique exam roll number and exam code
const generateUniqueNumber = async (model, field, prefix, length) => {
    let isUnique = false;
    let number;
    
    while (!isUnique) {
        // Generate random number
        const randomNum = Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1)));
        number = prefix ? `${prefix}${randomNum}` : randomNum.toString();
        
        // Check if number exists
        const exists = await model.findOne({ [field]: number });
        if (!exists) {
            isUnique = true;
        }
    }
    
    return number;
};

// Generate exam roll number and exam code before saving
studentSchema.pre('save', async function(next) {
    if (!this.isNew) return next();

    try {
        // Generate exam roll number (current year + 4 random digits)
        const currentYear = new Date().getFullYear().toString().slice(-2);
        this.examRollNumber = await generateUniqueNumber(this.constructor, 'examRollNumber', currentYear, 4);

        // Generate 6 digit exam code
        this.examCode = await generateUniqueNumber(this.constructor, 'examCode', null, 6);

        next();
    } catch (error) {
        next(error);
    }
});

const Student = mongoose.model('Student', studentSchema);
module.exports = Student; 