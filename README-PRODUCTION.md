# AUM Groceries - Customer Web Application

A modern, real-time grocery shopping web application built with React and microservices architecture.

## 🚀 Features

### ✅ Production-Ready Features
- **Real-time cart synchronization** across devices via WebSocket
- **No mock data** - All data comes from backend APIs
- **Optimistic UI updates** with React Query
- **Offline detection** and graceful fallbacks
- **Error handling** with retry mechanisms
- **Authentication** with JWT tokens
- **Responsive design** with Tailwind CSS
- **Real-time notifications** for order updates
- **Efficient caching** and data fetching

### 🛒 Cart Features
- Add/remove items with real-time sync
- Quantity updates with optimistic UI
- Coupon code support
- Tax and shipping calculations
- Cross-device synchronization
- Offline-first with sync when online

### 📱 Real-time Updates
- Order status changes
- Delivery notifications
- Price updates
- Stock alerts
- System maintenance notices

## 🏗️ Architecture

### Microservices Integration
- **User Service** (Port 3001) - Authentication & user management
- **Product Service** (Port 8001) - Products & categories
- **Order Service** (Port 8002) - Orders & cart management
- **WebSocket Service** (Port 8080) - Real-time communications

### Tech Stack
- **Frontend**: React 18, React Router, TailwindCSS
- **State Management**: React Query (TanStack Query), Context API
- **Real-time**: WebSocket with auto-reconnection
- **HTTP Client**: Axios with interceptors
- **UI**: Heroicons, React Hot Toast
- **Build Tool**: Create React App

## 🛠️ Setup Instructions

### Prerequisites
Make sure you have the following backend services running:
- User Service on `http://localhost:3001`
- Product Service on `http://localhost:8001` 
- Order Service on `http://localhost:8002`
- WebSocket Service on `ws://localhost:8080`

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd customer-web-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   The `.env` file is already configured with the correct backend URLs:
   ```env
   # Backend Services URLs
   REACT_APP_USER_SERVICE_URL=http://localhost:3001
   REACT_APP_PRODUCT_SERVICE_URL=http://localhost:8001
   REACT_APP_ORDER_SERVICE_URL=http://localhost:8002
   REACT_APP_WEBSOCKET_URL=ws://localhost:8080
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## 🔧 Key Improvements Made

### 1. Removed All Mock Data
- Eliminated `getSampleCartData()` and `initializeCartWithRealProducts()`
- Cart now loads only from backend API
- No localStorage fallbacks for cart data

### 2. Real-time WebSocket Integration
- **WebSocketContext** for managing connections
- Auto-reconnection with exponential backoff
- Real-time cart synchronization across devices
- Order status updates and delivery notifications

### 3. React Query Optimization
- **Efficient caching** and background updates
- **Optimistic updates** for better UX
- **Error handling** with automatic retries
- **Query invalidation** for real-time sync

### 4. Production-Ready Cart System
- **Authentication-based** cart loading
- **Network status** awareness
- **Error boundaries** with retry mechanisms
- **Loading states** and skeleton screens

### 5. Enhanced Error Handling
- Network connectivity detection
- Graceful degradation when offline
- User-friendly error messages
- Automatic retry mechanisms

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── Layout/          # Layout components (Navbar, Footer)
│   └── Products/        # Product-related components
├── contexts/            # React Context providers
│   ├── AuthContext.js   # Authentication state
│   ├── CartContext.js   # Cart state management
│   └── WebSocketContext.js  # Real-time connections
├── pages/               # Page components
│   ├── Auth/            # Login, Register pages
│   ├── Cart.js          # Shopping cart page
│   ├── OptimizedCart.js # New optimized cart with React Query
│   └── ...              # Other pages
├── services/            # API services and queries
│   ├── api.js           # Axios configuration and endpoints
│   └── queries.js       # React Query hooks
└── ...
```

## 🚀 Quick Start Commands

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🔄 API Integration

### Cart Service Endpoints
- `GET /api/orders/cart` - Get user's cart
- `POST /api/orders/cart/items` - Add item to cart
- `PUT /api/orders/cart/items/:id` - Update item quantity
- `DELETE /api/orders/cart/items/:id` - Remove item from cart
- `DELETE /api/orders/cart` - Clear cart

### Real-time Events
- `CART_UPDATED` - Cart items changed
- `ORDER_STATUS_UPDATED` - Order status changed
- `DELIVERY_ASSIGNED` - Delivery agent assigned
- `PRICE_UPDATE` - Product prices changed
- `STOCK_ALERT` - Low stock or out of stock

## 🐛 Troubleshooting

### Common Issues

1. **Cart not loading:**
   - Check if user is authenticated
   - Verify Order Service is running on port 8002
   - Check browser console for API errors

2. **Real-time updates not working:**
   - Verify WebSocket service is running on port 8080
   - Check browser network tab for WebSocket connection
   - Ensure user is properly authenticated

3. **Build errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules package-lock.json && npm install`

### Debug Mode
Enable debug mode in `.env`:
```env
REACT_APP_DEBUG_MODE=true
```

## 🚀 Performance Features

- **Code splitting** with React.lazy()
- **Image optimization** with lazy loading
- **Caching strategies** with React Query
- **Optimistic updates** for instant UI feedback
- **Real-time synchronization** across devices

## 🔒 Security Features

- JWT token management with auto-refresh
- API request/response interceptors
- Input validation and sanitization
- CORS configuration

---

**Ready for Production!** 🎉

This application is now production-ready with:
- ✅ No mock data
- ✅ Real-time synchronization  
- ✅ Robust error handling
- ✅ Performance optimizations
- ✅ Scalable architecture

## 🚀 Next Steps

1. **Start your backend services** (User, Product, Order, WebSocket)
2. **Run `npm install`** to install dependencies
3. **Run `npm start`** to start the development server
4. **Test the real-time features** by opening multiple browser tabs
5. **Deploy to production** when ready

Your grocery application is now enterprise-ready! 🛒
