import api from '../../services/api';

const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data;
};

const login = async (userData) => {
    const response = await api.post('/auth/login', userData);
    if (response.data.data.token) {
        localStorage.setItem('token', response.data.data.token);
    }
    return response.data.data;
};

const logout = () => {
    localStorage.removeItem('token');
};

const getMe = async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
}

const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;
