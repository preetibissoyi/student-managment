import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Login from './components/Login';
import Navigation from './components/Navigation';
import ResultManagement from './components/ResultManagement';
import BatchResults from './components/BatchResults';
import StudentResults from './components/StudentResults';
import StudentManagement from './components/StudentManagement';
import Dashboard from './components/Dashboard';
import AdminLogin from './components/AdminLogin';
import AdminRegister from './components/AdminRegister';

const theme = createTheme();

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/admin/register" element={<AdminRegister />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    
                    {/* Admin Routes (Now Public) */}
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/students" element={<StudentManagement />} />
                    <Route path="/admin/results" element={<ResultManagement />} />
                    <Route path="/admin/batch-results" element={<BatchResults />} />
                    
                    {/* Student Routes (Now Public) */}
                    <Route path="/student/dashboard" element={<Dashboard />} />
                    <Route path="/student/results" element={<StudentResults />} />
                    
                    {/* Default Route */}
                    <Route path="/" element={<Navigate to="/admin/login" replace />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App;
