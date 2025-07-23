import axios from 'axios';

// User Service - Port 3001 (from docker-compose mapping)
const API_BASE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:8002';
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate instance for order service (cart operations)
const orderApi = axios.create({
  baseURL: `${ORDER_SERVICE_URL}/api/orders`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create separate instance for product service
const productApi = axios.create({
  baseURL: `${PRODUCT_SERVICE_URL}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for order API to add auth token and User-ID
orderApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // Extract user ID from token for order service
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.userId || payload.sub) {
          config.headers['User-ID'] = payload.userId || payload.sub;
        }
      } catch (e) {
        console.error('Error parsing token for User-ID:', e);
      }
    }
    
    // Fallback: if no User-ID is set, use a default for development
    if (!config.headers['User-ID']) {
      config.headers['User-ID'] = 'testuser123';
      console.log('Using fallback User-ID for development');
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Request interceptor for product API
productApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor for order API
orderApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Response interceptor for product API
productApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth Service - Updated for User Service API
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  
  // Address Management
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (addressData) => api.post('/users/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/users/addresses/${addressId}`),
  
  // Admin functions
  getAllUsers: (params = {}) => api.get('/users', { params }),
  
  // Health check
  healthCheck: () => api.get('/health'),
};

// Product Service (uses Product Service API)
export const productService = {
  getProducts: (params = {}) => productApi.get('/products/', { params }),
  getProduct: (id) => productApi.get(`/products/${id}/`),
  getCategories: () => productApi.get('/categories/'),
  getCategory: (id) => productApi.get(`/categories/${id}/`),
  getProductsByCategory: (categoryId) => productApi.get(`/products/?category_id=${categoryId}`),
  searchProducts: (query) => productApi.get(`/products/?search=${query}`),
  getProductReviews: (productId) => productApi.get(`/products/${productId}/reviews/`),
  addProductReview: (productId, review) => productApi.post(`/products/${productId}/reviews/`, review),
};

// Order Service (using order backend API)
export const orderService = {
  getOrders: (params = {}) => orderApi.get('/api/orders', { params }),
  getOrder: (id) => orderApi.get(`/api/orders/${id}`),
  createOrder: (orderData) => orderApi.post('/api/orders', orderData),
  updateOrder: (id, data) => orderApi.put(`/api/orders/${id}`, data),
  cancelOrder: (id) => orderApi.put(`/api/orders/${id}/cancel`),
  getOrderHistory: (userId) => orderApi.get(`/api/orders/user/${userId}`),
  trackOrder: (orderId) => orderApi.get(`/api/orders/${orderId}/track`),
  confirmOrder: (orderId) => orderApi.put(`/api/orders/${orderId}/confirm`),
  assignDelivery: (orderId, agentId) => orderApi.put(`/api/orders/${orderId}/assign`, { agentId }),
  updateOrderStatus: (orderId, status) => orderApi.put(`/api/orders/${orderId}/status`, { status }),
  getOrderAnalytics: () => orderApi.get('/api/orders/analytics'),
};

// Payment Service
export const paymentService = {
  createPayment: (paymentData) => api.post('/payments', paymentData),
  getPayment: (id) => api.get(`/payments/${id}`),
  updatePaymentStatus: (id, status) => api.put(`/payments/${id}/status`, { status }),
  getPaymentMethods: () => api.get('/payments/methods'),
  processRefund: (paymentId, amount) => api.post(`/payments/${paymentId}/refund`, { amount }),
  getPaymentHistory: (userId) => api.get(`/payments/user/${userId}`),
  validatePayment: (paymentId) => api.get(`/payments/${paymentId}/validate`),
  getPaymentAnalytics: () => api.get('/payments/analytics'),
};

// Cart Service (using order service)
export const cartService = {
  // Get user's cart
  getCart: async () => {
    try {
      const response = await orderApi.get('/api/orders/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to get cart:', error);
      // Return empty cart structure as fallback
      return {
        items: [],
        total: 0
      };
    }
  },

  // Add item to cart
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await orderApi.post('/api/orders/cart/items', {
        productId: productId,
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  updateCartItem: async (productId, quantity) => {
    try {
      const response = await orderApi.put(`/api/orders/cart/items/${productId}`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (productId) => {
    try {
      const response = await orderApi.delete(`/api/orders/cart/items/${productId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await orderApi.delete('/api/orders/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Additional cart functions for compatibility
  applyCoupon: (couponCode) => orderApi.post('/api/orders/cart/coupon', { couponCode }),
  removeCoupon: () => orderApi.delete('/api/orders/cart/coupon'),
  getCartSummary: () => orderApi.get('/api/orders/cart/summary'),
};

// User Service
export const userService = {
  getUsers: (params = {}) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserAddresses: (userId) => api.get(`/users/${userId}/addresses`),
  addUserAddress: (userId, address) => api.post(`/users/${userId}/addresses`, address),
  updateUserAddress: (userId, addressId, address) => api.put(`/users/${userId}/addresses/${addressId}`, address),
  deleteUserAddress: (userId, addressId) => api.delete(`/users/${userId}/addresses/${addressId}`),
  getUserPreferences: (userId) => api.get(`/users/${userId}/preferences`),
  updateUserPreferences: (userId, preferences) => api.put(`/users/${userId}/preferences`, preferences),
};

// Delivery Service
export const deliveryService = {
  getDeliveries: (params = {}) => api.get('/deliveries', { params }),
  getDelivery: (id) => api.get(`/deliveries/${id}`),
  createDelivery: (deliveryData) => api.post('/deliveries', deliveryData),
  updateDelivery: (id, data) => api.put(`/deliveries/${id}`, data),
  assignAgent: (deliveryId, agentId) => api.put(`/deliveries/${deliveryId}/assign`, { agentId }),
  updateDeliveryStatus: (deliveryId, status) => api.put(`/deliveries/${deliveryId}/status`, { status }),
  getAgentDeliveries: (agentId) => api.get(`/deliveries/agent/${agentId}`),
  getDeliveryRoute: (deliveryId) => api.get(`/deliveries/${deliveryId}/route`),
  markDelivered: (deliveryId) => api.put(`/deliveries/${deliveryId}/delivered`),
  reportIssue: (deliveryId, issue) => api.post(`/deliveries/${deliveryId}/issue`, issue),
  getDeliveryAnalytics: () => api.get('/deliveries/analytics'),
};

// WebSocket Service for real-time updates
export const websocketService = {
  connect: (userId) => {
    const ws = new WebSocket(`ws://localhost:8080/ws?userId=${userId}`);
    return ws;
  },
  
  onMessage: (ws, callback) => {
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback(data);
    };
  },
  
  sendMessage: (ws, message) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  },
  
  disconnect: (ws) => {
    if (ws) {
      ws.close();
    }
  }
};

// Location Service
export const locationService = {
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  },
  
  getAddressFromCoords: (lat, lng) => {
    return api.get(`/location/reverse-geocode?lat=${lat}&lng=${lng}`);
  },
  
  searchAddresses: (query) => {
    return api.get(`/location/search?q=${encodeURIComponent(query)}`);
  },
  
  calculateDistance: (from, to) => {
    return api.post('/location/distance', { from, to });
  },
  
  getDeliveryZones: () => api.get('/location/zones'),
  checkDeliveryAvailability: (address) => {
    return api.post('/location/check-delivery', { address });
  },
};

export default api;
