# Frontend-Backend Integration Guide

## 🔗 **Product Service Integration**

This document explains how the Customer Web App integrates with the Product Service backend.

### **📋 Integration Overview**

The React frontend now connects to your FastAPI Product Service running on `http://localhost:8000`.

### **🔧 Configuration**

**Environment Variables (.env):**
```bash
REACT_APP_PRODUCT_SERVICE_URL=http://localhost:8000
REACT_APP_USER_SERVICE_URL=http://localhost:3001
REACT_APP_ORDER_SERVICE_URL=http://localhost:8002
```

### **🚀 API Endpoints Used**

| Frontend Feature | API Endpoint | Description |
|-----------------|--------------|-------------|
| Product Listing | `GET /products` | Fetches all products with optional filters |
| Product Search | `GET /products?search=query` | Search products by name |
| Category Filter | `GET /products?category_id=1` | Filter by category |
| Product Detail | `GET /products/{id}` | Get single product details |
| Categories List | `GET /categories` | Get all categories |

### **📊 API Response Handling**

**Product List Response:**
```json
{
  "value": [
    {
      "id": 1,
      "name": "Kurkure Chilly Chatka",
      "description": "20 g",
      "price": 1.49,
      "stock_quantity": 50,
      "sku": "SKU-KURKURE-CHILLY-CHATKA",
      "unit": "packet",
      "category_id": 1,
      "is_active": true,
      "created_at": "2025-07-23T23:26:20.836010Z",
      "updated_at": null,
      "category": {
        "id": 1,
        "name": "Chips",
        "description": "Chips products",
        "is_active": true,
        "created_at": "2025-07-23T23:26:20.804748Z"
      }
    }
  ],
  "Count": 55
}
```

### **🗂️ Updated Files**

**1. API Configuration (`src/services/api.js`):**
- Updated `PRODUCT_SERVICE_URL` to port 8000
- Fixed API endpoints to match FastAPI format
- Added proper response handling

**2. Products Page (`src/pages/Products.js`):**
- Updated to handle `{value: [...], Count: 55}` response format
- Improved error handling and loading states

**3. Product Grid (`src/components/Products/ProductGrid.js`):**
- Changed import to use correct API service
- Updated response parsing logic

**4. Product Filters (`src/components/Products/ProductFilters.js`):**
- Now fetches real categories from API
- Updated to use category IDs instead of names

**5. Home Page (`src/pages/Home.js`):**
- Updated to use real product data
- Added proper response handling

### **🎯 Features Integrated**

✅ **Product Listing**: Displays all 55 products from your database
✅ **Category Filtering**: Uses real categories (Chips, Cookies, Dairy, etc.)
✅ **Search Functionality**: Search products by name
✅ **Product Details**: Shows price, stock, description, unit
✅ **Stock Management**: Displays stock quantities and availability

### **🏃‍♂️ Running the Integration**

**1. Start Product Service:**
```bash
cd product-service
docker-compose up --build
```

**2. Start Frontend:**
```bash
cd customer-web-app
npm start
```

**3. Access Application:**
- Frontend: http://localhost:3000
- Product API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### **🔍 Testing the Integration**

1. **Visit Products Page**: Navigate to `/products` to see all 55 products
2. **Test Search**: Search for "kurkure" or "chips"
3. **Test Filters**: Filter by categories like "Chips", "Cookies", etc.
4. **Check Product Details**: Click on any product for details
5. **Verify Data**: Ensure prices, stock, and descriptions match your CSV data

### **🚨 Troubleshooting**

**Common Issues:**

1. **"Failed to load products"**
   - Ensure Product Service is running on port 8000
   - Check browser console for CORS errors
   - Verify database connection

2. **Empty Product List**
   - Check if products are loaded in database
   - Verify API response format
   - Check network tab in browser dev tools

3. **Categories Not Loading**
   - Ensure `/categories` endpoint is accessible
   - Check if categories exist in database

### **🔄 Next Steps**

1. **Cart Integration**: Connect cart functionality to order service
2. **User Authentication**: Integrate with user service
3. **Order Management**: Connect checkout process
4. **Real-time Updates**: Add WebSocket for inventory updates

### **📱 Mobile Responsiveness**

The frontend is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

### **🔐 Security Considerations**

- API endpoints are configured for development
- CORS is enabled for local development
- Authentication tokens will be added when user service is integrated

This integration provides a solid foundation for your grocery e-commerce platform with real product data from your FastAPI backend!
