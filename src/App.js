import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

// Layout Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import CartTest from './pages/CartTest';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Protected Route Component
import ProtectedRoute from './components/Auth/ProtectedRoute';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pb-20">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart-test" element={<CartTest />} />
          
          {/* Protected Routes */}
          <Route path="/cart" element={
            <ProtectedRoute>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
