import axios from 'axios';
import { getToken } from './authService';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// AuthProvider registers these so that a 401 can log the user out and a 403 can show a notice
let unauthorizedHandler = () => {};
let forbiddenHandler = () => {};

export const registerAuthHandlers = ({ onUnauthorized, onForbidden }) => {
  unauthorizedHandler = onUnauthorized;
  forbiddenHandler = onForbidden;
};

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLoginRequest = error.config?.url?.includes('/v1/auth/login');

    if (status === 401 && !isLoginRequest) {
      unauthorizedHandler();
    }
    if (status === 403) {
      forbiddenHandler();
    }

    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/v1/auth/login', credentials),
};

// Employee API calls
export const employeeAPI = {
  getAll: () => api.get('/v1/employees'),
  getActive: () => api.get('/v1/employees/active/list'),
  getById: (id) => api.get(`/v1/employees/${id}`),
  create: (data) => api.post('/v1/employees', data),
  update: (id, data) => api.put(`/v1/employees/${id}`, data),
  delete: (id) => api.delete(`/v1/employees/${id}`),
  deactivate: (id) => api.put(`/v1/employees/${id}/deactivate`),
  getByDepartment: (departmentId) => api.get(`/v1/employees/department/${departmentId}`),
  search: (term) => api.get(`/v1/employees/search?term=${term}`),
};

// Department API calls
export const departmentAPI = {
  getAll: () => api.get('/v1/departments'),
  getById: (id) => api.get(`/v1/departments/${id}`),
  create: (data) => api.post('/v1/departments', data),
  update: (id, data) => api.put(`/v1/departments/${id}`, data),
  delete: (id) => api.delete(`/v1/departments/${id}`),
  search: (term) => api.get(`/v1/departments/search?term=${term}`),
};

export default api;
