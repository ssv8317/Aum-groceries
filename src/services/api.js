import axios from 'axios';

// User Service - Port 3001 (from docker-compose mapping)
const API_BASE_URL = process.env.REACT_APP_USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.REACT_APP_ORDER_SERVICE_URL || 'http://localhost:8002';
const PRODUCT_SERVICE_URL = process.env.REACT_APP_PRODUCT_SERVICE_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
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
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  
  // Address Management
  getAddresses: () => api.get('/api/users/addresses'),
  addAddress: (addressData) => api.post('/api/users/addresses', addressData),
  updateAddress: (addressId, addressData) => api.put(`/api/users/addresses/${addressId}`, addressData),
  deleteAddress: (addressId) => api.delete(`/api/users/addresses/${addressId}`),
  
  // Admin functions
  getAllUsers: (params = {}) => api.get('/api/users', { params }),
  
  // Health check
  healthCheck: () => api.get('/api/health'),
};

// Product Service (uses Product Service API)
export const productService = {
  getProducts: (params = {}) => productApi.get('/products', { params }),
  getProduct: (id) => productApi.get(`/products/${id}`),
  getCategories: () => productApi.get('/categories'),
  getCategory: (id) => productApi.get(`/categories/${id}`),
  getProductsByCategory: (categoryId) => productApi.get(`/products`, { params: { category_id: categoryId } }),
  searchProducts: (query) => productApi.get(`/products`, { params: { search: query } }),
  // Health check for product service
  healthCheck: () => productApi.get('/health'),
  // Note: Reviews might not be implemented in your current product service
  getProductReviews: (productId) => productApi.get(`/products/${productId}/reviews/`),
  addProductReview: (productId, review) => productApi.post(`/products/${productId}/reviews/`, review),
};

// Order Service (using order backend API)
export const orderService = {
  getOrders: (params = {}) => orderApi.get('', { params }),
  getOrder: (id) => orderApi.get(`/${id}`),
  createOrder: (orderData) => orderApi.post('', orderData),
  createOrderWithPayment: (orderData) => orderApi.post('/with-payment', orderData),
  updateOrder: (id, data) => orderApi.put(`/${id}`, data),
  cancelOrder: (id) => orderApi.put(`/${id}/cancel`),
  assignAgent: (orderId, agentId) => orderApi.put(`/${orderId}/assign-agent`, { agentId }),
  updateOrderStatus: (orderId, status) => orderApi.put(`/${orderId}/status`, { status }),
  getOrderHistory: (userId) => orderApi.get(`/user/${userId}`),
  trackOrder: (orderId) => orderApi.get(`/${orderId}/track`),
  confirmOrder: (orderId) => orderApi.put(`/${orderId}/confirm`),
  getOrderAnalytics: () => orderApi.get('/analytics'),
  healthCheck: () => orderApi.get('/health'),
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
      const response = await orderApi.get('/cart');
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

  // Add item to cart (updated to accept product object)
  addToCart: async (product) => {
    try {
      const response = await orderApi.post('/cart/items', {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        quantity: product.quantity || 1,
        unitPrice: product.price,
        unit: product.unit
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add to cart:', error);
      throw error;
    }
  },

  // Update cart item quantity
  // NOTE: itemId must be the cart item ID returned from the backend, not the product ID.
  updateCartItem: async (cartItemId, quantity) => {
    try {
      const response = await orderApi.put(`/cart/items/${cartItemId}`, {
        quantity: quantity
      });
      return response.data;
    } catch (error) {
      console.error('Failed to update cart item:', error);
      throw error;
    }
  },

  // Remove item from cart
  removeFromCart: async (itemId) => {
    try {
      const response = await orderApi.delete(`/cart/items/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      throw error;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await orderApi.delete('/cart');
      return response.data;
    } catch (error) {
      console.error('Failed to clear cart:', error);
      throw error;
    }
  },

  // Additional cart functions for compatibility
  applyCoupon: (couponCode) => orderApi.post('/cart/coupon', { couponCode }),
  removeCoupon: () => orderApi.delete('/cart/coupon'),
  getCartSummary: () => orderApi.get('/cart/summary'),
  checkout: () => orderApi.post('/cart/checkout'),
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
    // Use the correct order service port
    const ws = new WebSocket(`ws://localhost:8002/ws?userId=${userId}`);
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
