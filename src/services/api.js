import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Products API
export const productsAPI = {
    getAll: () => axios.get(`${API_BASE_URL}/products`),
    getById: (id) => axios.get(`${API_BASE_URL}/products/${id}`),
    create: (data) => axios.post(`${API_BASE_URL}/products`, data),
    update: (id, data) => axios.put(`${API_BASE_URL}/products/${id}`, data),
    delete: (id) => axios.delete(`${API_BASE_URL}/products/${id}`)
};

// Orders API
export const ordersAPI = {
    getAll: () => axios.get(`${API_BASE_URL}/orders`),
    create: (data) => axios.post(`${API_BASE_URL}/orders`, data),
    update: (id, data) => axios.put(`${API_BASE_URL}/orders/${id}`, data)
};

// Stats API
export const statsAPI = {
    get: () => axios.get(`${API_BASE_URL}/stats`)
};

export default {
    products: productsAPI,
    orders: ordersAPI,
    stats: statsAPI
};
