const mongoose = require('mongoose');

const examinationCardSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    stream: {
        type: String,
        required: true
    },
    examRollNumber: {
        type: String,
        required: true,
        unique: true
    },
    collegeRollNumber: {
        type: String,
        required: true,
        unique: true
    },
    studentName: {
        type: String,
        required: true
    },
    profilePhoto: {
        type: String,
        required: true
    },
    subjects: {
        majorCP1: {
            type: String,
            required: true
        },
        major: {
            type: String,
            required: true
        },
        majorCP2: {
            type: String,
            required: true
        },
        minorP1: {
            type: String,
            required: true
        },
        mdc1: {
            type: String,
            required: true
        },
        aec: {
            type: String,
            required: true
        },
        vac1: {
            type: String,
            required: true
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

const ExaminationCard = mongoose.model('ExaminationCard', examinationCardSchema);
module.exports = ExaminationCard; 