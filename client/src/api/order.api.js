import api from './axiosInstance';

export const orderApi = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: (params = {}) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
};
