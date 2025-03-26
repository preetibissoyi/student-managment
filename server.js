const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');
const examinationCardRoutes = require('./routes/examinationCardRoutes');
const marksheetRoutes = require('./routes/marksheetRoutes');
const resultRoutes = require('./routes/resultRoutes');
const studentAuthRoutes = require('./routes/studentAuthRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/student-auth', studentAuthRoutes);
app.use('/api/admin-auth', adminAuthRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/examination-cards', examinationCardRoutes);
app.use('/api/marksheets', marksheetRoutes);
app.use('/api/results', resultRoutes);

// MongoDB Connection with updated options
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/student-management')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: err.message
    });
});

// Handle unhandled routes
app.all('*', (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server!`));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 