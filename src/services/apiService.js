import api from './api';
import axios from 'axios';

// Create a separate API instance for product service
const productAPI = axios.create({
  baseURL: process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:8001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }
};

export const productService = {
  getProducts: async (params = {}) => {
    const response = await productAPI.get('/products', { params });
    return response.data;
  },

  getProduct: async (id) => {
    const response = await productAPI.get(`/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await productAPI.get('/categories');
    return response.data;
  },

  searchProducts: async (query) => {
    const response = await productAPI.get(`/products/search?q=${query}`);
    return response.data;
  }
};

export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  createOrderWithPayment: async (orderData) => {
    const response = await api.post('/orders/with-payment', orderData);
    return response.data;
  },

  getOrders: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrder: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/orders/${id}/status`, { status });
    return response.data;
  }
};

// Cart Service - Backend cart integration
export const cartService = {
  getCart: async () => {
    const response = await api.get('/orders/cart');
    return response.data;
  },

  addToCart: async (productData) => {
    const response = await api.post('/orders/cart/add', {
      productId: productData.id,
      productName: productData.name,
      productSku: productData.sku,
      quantity: productData.quantity || 1,
      unitPrice: productData.price,
      unit: productData.unit
    });
    return response.data;
  },

  updateCartItem: async (itemId, quantity) => {
    const response = await api.put(`/orders/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId) => {
    const response = await api.delete(`/orders/cart/items/${itemId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/orders/cart');
    return response.data;
  },

  checkoutCart: async (checkoutData) => {
    const response = await api.post('/orders/cart/checkout', checkoutData);
    return response.data;
  }
};

export const paymentService = {
  initiatePayment: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  getPaymentStatus: async (orderId) => {
    const response = await api.get(`/payments/order/${orderId}`);
    return response.data;
  },

  getPaymentHistory: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
  }
};
