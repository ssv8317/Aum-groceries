import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  TagIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

const Cart = () => {
  const navigate = useNavigate();
  const cartContext = useCart();
  
  // Add safety check and default values
  const {
    items = [], // Provide default empty array
    loading = false,
    error = null,
    totalItems = 0,
    subtotal = 0,
    taxes = 0,
    shippingCost = 0,
    discount = 0,
    total = 0,
    appliedCoupon = null,
    updateCartItem = () => {},
    removeFromCart = () => {},
    clearCart = () => {},
    applyCoupon = () => {},
    removeCoupon = () => {},
    isEmpty = true,
    clearError = () => {}
  } = cartContext || {};

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Safety check - if context is not loaded yet, show loading
  if (!cartContext) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else {
      updateCartItem(itemId, newQuantity);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setCouponLoading(true);
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
      setShowCouponInput(false);
    } catch (err) {
      // Error is handled by context
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  const handleProceedToCheckout = () => {
    navigate('/checkout');
  };

  if (isEmpty) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBagIcon className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="bg-primary-600 text-white px-8 py-3 rounded-md hover:bg-primary-700 transition-colors duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Shopping Cart</h1>
        <button
          onClick={handleClearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-700"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Cart Items ({totalItems})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {Array.isArray(items) && items.length > 0 ? items.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || '/api/placeholder/80/80'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg font-bold text-primary-600">₹{item.price}</span>
                        {item.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            ₹{item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        disabled={loading}
                      >
                        <MinusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                      
                      <span className="w-8 text-center font-medium text-gray-800">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
                        disabled={loading}
                      >
                        <PlusIcon className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 mt-2 transition-colors duration-200"
                        disabled={loading}
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No items in cart</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes (GST)</span>
                <span className="text-gray-800">₹{taxes.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <div className="flex items-center space-x-2">
                  <TruckIcon className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Shipping</span>
                </div>
                <span className="text-gray-800">
                  {shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-primary-600">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <TagIcon className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 font-medium">{appliedCoupon.code}</span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="text-green-600 hover:text-green-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  {!showCouponInput ? (
                    <button
                      onClick={() => setShowCouponInput(true)}
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <TagIcon className="h-4 w-4" />
                      <span>Add Coupon Code</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {couponLoading ? 'Applying...' : 'Apply'}
                        </button>
                        <button
                          onClick={() => {
                            setShowCouponInput(false);
                            setCouponCode('');
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={loading || isEmpty}
              className="w-full bg-primary-600 text-white py-3 px-6 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? 'Processing...' : 'Proceed to Checkout'}
            </button>
            
            <div className="mt-4 text-center">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
