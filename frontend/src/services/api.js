const BASE_URL = 'http://localhost:8080/api/v1';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 204) {
    return null;
  }

  let data;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    // If it's a backend validation error (object with message or errors mapping)
    const errorMessage = data && typeof data === 'object' 
      ? data.message || JSON.stringify(data)
      : data || 'An error occurred';
    
    // Auto logout on 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-expired'));
    }
    
    throw new Error(errorMessage);
  }

  return data;
}

export const api = {
  // Authentication & Profile
  auth: {
    login: (email, password) => 
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    
    register: (email, password, firstName, lastName) => 
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      }),
    
    getMe: () => request('/auth/me'),
  },

  // Categories
  categories: {
    getAll: () => request('/categories'),
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.categoryId) query.append('categoryId', params.categoryId);
      if (params.keyword) query.append('keyword', params.keyword);
      if (params.page !== undefined) query.append('page', params.page);
      if (params.size !== undefined) query.append('size', params.size);
      if (params.sortBy) query.append('sortBy', params.sortBy);
      if (params.sortDir) query.append('sortDir', params.sortDir);
      
      const queryString = query.toString();
      return request(`/products${queryString ? `?${queryString}` : ''}`);
    },
    
    getById: (id) => request(`/products/${id}`),
  },

  // Shopping Cart
  cart: {
    get: () => request('/cart'),
    
    addItem: (productId, quantity = 1) => 
      request('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      }),
    
    updateItem: (cartItemId, quantity) => 
      request(`/cart/items/${cartItemId}?quantity=${quantity}`, {
        method: 'PUT',
      }),
    
    removeItem: (cartItemId) => 
      request(`/cart/items/${cartItemId}`, {
        method: 'DELETE',
      }),
  },

  // Orders
  orders: {
    checkout: (shippingAddress, paymentMethod = 'CREDIT_CARD') => 
      request('/orders', {
        method: 'POST',
        body: JSON.stringify({ shippingAddress, paymentMethod }),
      }),
    
    getHistory: (page = 0, size = 10) => 
      request(`/orders/history?page=${page}&size=${size}`),
    
    getById: (id) => request(`/orders/${id}`),
    
    updateStatus: (id, status) => 
      request(`/orders/${id}/status?status=${status}`, {
        method: 'PUT',
      }),
  },

  // Product Reviews
  reviews: {
    create: (productId, rating, comment) => 
      request(`/reviews/products/${productId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      }),
    
    getForProduct: (productId, page = 0, size = 10) => 
      request(`/reviews/products/${productId}?page=${page}&size=${size}`),
    
    getAverage: (productId) => 
      request(`/reviews/products/${productId}/average`),
  },

  // AI Layers
  ai: {
    chat: (message) => 
      request('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
    
    getRecommendations: (params = {}) => 
      request('/recommendations', {
        method: 'POST',
        body: JSON.stringify({
          maxPrice: params.maxPrice || null,
          categoryId: params.categoryId || null,
          intent: params.intent || null,
        }),
      }),
  },
};
