// frontend/src/services/api.js
import axios from 'axios';
import { API_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Song APIs
export const songAPI = {
  getAll: (params) => api.get('/songs', { params }),
  getById: (id) => api.get(`/songs/${id}`),
  stream: (id) => api.get(`/songs/${id}/stream`, { responseType: 'blob' }),
  download: (id) => api.get(`/songs/${id}/download`, { responseType: 'arraybuffer' })
};

// Admin APIs
export const adminAPI = {
  uploadSong: (formData) => api.post('/admin/songs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteSong: (id) => api.delete(`/admin/songs/${id}`),
  updateSong: (id, data) => api.put(`/admin/songs/${id}`, data),
  getStats: () => api.get('/admin/stats')
};

// Donation APIs
export const donationAPI = {
  create: (data) => api.post('/donations/create', data),
  verify: (data) => api.post('/donations/verify', data),
  getHistory: () => api.get('/donations/history')
};

export default api;