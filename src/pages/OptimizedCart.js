import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { 
  MinusIcon, 
  PlusIcon, 
  TrashIcon, 
  ShoppingBagIcon,
  TagIcon,
  TruckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { 
  useCartQuery, 
  useUpdateCartItemMutation, 
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation 
} from '../services/queries';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // React Query hooks
  const { data: cartData, isLoading, error, refetch } = useCartQuery(isAuthenticated);
  const updateCartItemMutation = useUpdateCartItemMutation();
  const removeFromCartMutation = useRemoveFromCartMutation();
  const clearCartMutation = useClearCartMutation();
  const applyCouponMutation = useApplyCouponMutation();
  const removeCouponMutation = useRemoveCouponMutation();

  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);

  // Extract cart data with defaults
  const items = cartData?.items || [];
  const appliedCoupon = cartData?.appliedCoupon || null;
  const isEmpty = items.length === 0;

  // Calculate totals
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + (parseFloat(item.price || 0) * item.quantity), 0);
  const taxes = subtotal * 0.08; // 8% tax
  const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50
  
  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage' 
      ? subtotal * appliedCoupon.discount 
      : appliedCoupon.discount;
  }
  
  const total = Math.max(0, subtotal + taxes + shippingCost - discount);

  // Listen for real-time cart updates
  useEffect(() => {
    const handleCartUpdate = (event) => {
      console.log('Cart updated via WebSocket:', event.detail);
      queryClient.invalidateQueries(['cart']);
    };

    window.addEventListener('cart-updated', handleCartUpdate);
    return () => window.removeEventListener('cart-updated', handleCartUpdate);
  }, [queryClient]);

  // Handle quantity updates
  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await updateCartItemMutation.mutateAsync({ productId, quantity: newQuantity });
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  // Handle item removal
  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCartMutation.mutateAsync(productId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  // Handle clear cart
  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCartMutation.mutateAsync();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  // Handle coupon application
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    try {
      await applyCouponMutation.mutateAsync(couponCode);
      setCouponCode('');
      setShowCouponInput(false);
    } catch (error) {
      console.error('Failed to apply coupon:', error);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = async () => {
    try {
      await removeCouponMutation.mutateAsync();
    } catch (error) {
      console.error('Failed to remove coupon:', error);
    }
  };

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Please Login</h1>
          <p className="text-gray-600 mb-8">You need to be logged in to view your cart.</p>
          <Link 
            to="/login" 
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your cart...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Cart</h2>
            <p className="text-gray-600 mb-8">
              {error.response?.data?.message || 'Something went wrong while loading your cart.'}
            </p>
            <button
              onClick={() => refetch()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (isEmpty) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <ShoppingBagIcon className="h-24 w-24 text-gray-300 mx-auto mb-8" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Start shopping to add items to your cart.</p>
            <Link 
              to="/products" 
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-gray-600 mt-2">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleClearCart}
              disabled={clearCartMutation.isLoading}
              className="text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {clearCartMutation.isLoading ? 'Clearing...' : 'Clear Cart'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6">
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image || '/api/placeholder/80/80'}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600 text-sm">{item.description}</p>
                        <p className="font-semibold text-primary-600 mt-1">
                          ${parseFloat(item.price || 0).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updateCartItemMutation.isLoading}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>
                        
                        <span className="font-semibold text-lg w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={updateCartItemMutation.isLoading}
                          className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-lg">
                          ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          disabled={removeFromCartMutation.isLoading}
                          className="text-red-600 hover:text-red-700 mt-2 disabled:opacity-50"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">Order Summary</h2>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition-colors font-semibold"
              >
                Proceed to Checkout
              </button>
              
              <Link 
                to="/products" 
                className="block text-center text-primary-600 hover:text-primary-700 mt-4"
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
