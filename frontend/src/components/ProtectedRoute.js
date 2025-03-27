import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const location = useLocation();
    const adminToken = localStorage.getItem('adminToken');
    const studentToken = localStorage.getItem('studentToken');
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');

    // Check if user is authenticated
    if (!adminToken && !studentToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (allowedRoles) {
        const isAdmin = adminData.role === 'admin';
        const userRole = isAdmin ? 'admin' : 'student';
        
        if (!allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on user role
            const redirectPath = isAdmin ? '/admin/dashboard' : '/student/dashboard';
            return <Navigate to={redirectPath} state={{ from: location }} replace />;
        }
    }

    return children;
};

export default ProtectedRoute; 