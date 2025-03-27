export const setAuthToken = (token) => {
    if (token) {
        localStorage.setItem('adminToken', token);
    } else {
        localStorage.removeItem('adminToken');
    }
};

export const getAuthToken = () => {
    return localStorage.getItem('adminToken');
};

export const setAdminInfo = (adminInfo) => {
    if (adminInfo) {
        localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
    } else {
        localStorage.removeItem('adminInfo');
    }
};

export const getAdminInfo = () => {
    const adminInfo = localStorage.getItem('adminInfo');
    return adminInfo ? JSON.parse(adminInfo) : null;
};

export const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    window.location.href = '/admin/login';
};

export const isAuthenticated = () => {
    const token = getAuthToken();
    return !!token;
}; 