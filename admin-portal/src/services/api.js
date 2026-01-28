import axios from 'axios';

// Create AXIOS instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8000/api/',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add Interceptor to add JWT Token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add Response Interceptor to handle 401 (Unauthorized)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const login = async (username, password) => {
    return api.post('login/', { username, password });
};

export const verifyOtp = async (username, otp) => {
    return api.post('verify-otp/', { username, otp });
};

export const getDashboardStats = async () => {
    return api.get('dashboard/');
};

export const forceLogout = async (username, password) => {
    return api.post('force-logout/', { username, password });
};

export const logoutUser = async () => {
    try {
        await api.post('logout/');
    } catch (err) {
        // proceed even if server logout fails
    }
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
};

// College APIs
export const getColleges = async () => api.get('colleges/');
export const createCollege = async (data) => api.post('colleges/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteCollege = async (id) => api.delete(`colleges/${id}/`);

// Student APIs
export const getStudents = async () => api.get('students/');
export const createStudent = async (data) => api.post('students/', data);

// Application APIs
export const getApplications = async () => api.get('applications/');
export const updateApplicationStatus = async (id, status) => api.patch(`applications/${id}/`, { status });

// Brochure APIs
export const getBrochures = async () => api.get('brochures/');
export const createBrochure = async (data) => api.post('brochures/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteBrochure = async (id) => api.delete(`brochures/${id}/`);

// Ad Content APIs
export const getAds = async () => api.get('ads/');
export const createAd = async (data) => api.post('ads/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteAd = async (id) => api.delete(`ads/${id}/`);

export const sendHelpEmail = async (subject, message) => {
    return api.post('send-help-email/', { subject, message });
};

// System Settings APIs
export const getMaintenanceMode = async () => api.get('maintenance-mode/');
export const updateMaintenanceMode = async (mode) => api.post('maintenance-mode/', { maintenance_mode: mode });

export const getAnnouncement = async () => api.get('announcements/');
export const updateAnnouncement = async (text) => api.post('announcements/', { announcement: text });

export const getAuditLogs = async () => api.get('audit-logs/');

export const changePassword = async (oldPassword, newPassword) => {
    return api.post('change-password/', { old_password: oldPassword, new_password: newPassword });
};

export default api;
