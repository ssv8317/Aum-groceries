import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { productService, cartService, websocketService } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const wsRef = useRef(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isAuthenticated) {
        loadCart(); // Sync cart when back online
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Cart changes will sync when reconnected.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isAuthenticated]);

  // WebSocket connection for real-time cart updates
  useEffect(() => {
    if (isAuthenticated && user?.userId && isOnline) {
      try {
        wsRef.current = websocketService.connect(user.userId);
        
        websocketService.onMessage(wsRef.current, (data) => {
          if (data.type === 'CART_UPDATED') {
            console.log('Real-time cart update received:', data.cart);
            setCartItems(data.cart.items || []);
            if (data.cart.appliedCoupon) {
              setAppliedCoupon(data.cart.appliedCoupon);
            }
          }
        });

        wsRef.current.onopen = () => {
          console.log('WebSocket connected for real-time cart updates');
        };

        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

      } catch (error) {
        console.error('Failed to establish WebSocket connection:', error);
      }
    }

    return () => {
      if (wsRef.current) {
        websocketService.disconnect(wsRef.current);
      }
    };
  }, [isAuthenticated, user?.userId, isOnline]);

  // Load cart when user authenticates or component mounts
  useEffect(() => {
    if (isAuthenticated && isOnline) {
      loadCart();
    } else if (!isAuthenticated) {
      // Clear cart when user logs out
      setCartItems([]);
      setAppliedCoupon(null);
      setError(null);
    }
  }, [isAuthenticated, isOnline]);

  const loadCart = async () => {
    if (!isAuthenticated || !isOnline) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading cart from backend...');
      const cartData = await cartService.getCart();
      
      if (cartData && cartData.items) {
        console.log('Cart loaded successfully:', cartData);
        setCartItems(cartData.items);
        
        if (cartData.appliedCoupon) {
          setAppliedCoupon(cartData.appliedCoupon);
        }
      } else {
        // Empty cart is valid - no fallback to mock data
        setCartItems([]);
        setAppliedCoupon(null);
      }
      
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart. Please refresh the page.');
      toast.error('Failed to load cart. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!isOnline) {
      toast.error('You are offline. Please check your connection.');
      return;
    }

    setLoading(true);
    try {
      console.log('Adding to cart:', product.id, quantity);
      // Add to backend cart with full product object
      await cartService.addToCart({
        id: product.id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        unit: product.unit,
        quantity
      });
      // Always reload cart from backend to get correct cart item data
      await loadCart();
      toast.success(`Added/updated ${product.name} in cart`);
      // Send real-time update via WebSocket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_ITEM_ADDED',
          productId: product.id,
          quantity: quantity
        });
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setError('Failed to add item to cart');
      toast.error('Failed to add item to cart. Please try again.');
      // Reload cart to ensure consistency
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  // Remove cart item by cart item id
  const removeFromCart = async (cartItemId) => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to remove item. Please check your connection.');
      return;
    }

    setLoading(true);
    try {
      // Remove from backend
      await cartService.removeFromCart(cartItemId);
      // Always reload cart from backend to get correct cart item data
      await loadCart();
      toast.success('Removed item from cart');
      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_ITEM_REMOVED',
          cartItemId: cartItemId
        });
      }
    } catch (error) {
      console.error('Failed to remove from cart:', error);
      setError('Failed to remove item from cart');
      toast.error('Failed to remove item. Please try again.');
      // Reload cart to ensure consistency
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  // Update cart item by cart item id
  const updateCartItem = async (cartItemId, quantity) => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to update item. Please check your connection.');
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }

    setLoading(true);
    try {
      // Update backend
      await cartService.updateCartItem(cartItemId, quantity);
      // Always reload cart from backend to get correct cart item data
      await loadCart();
      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_ITEM_UPDATED',
          cartItemId: cartItemId,
          quantity: quantity
        });
      }
    } catch (error) {
      console.error('Failed to update cart item:', error);
      setError('Failed to update item quantity');
      toast.error('Failed to update quantity. Please try again.');
      // Reload cart to ensure consistency
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to clear cart. Please check your connection.');
      return;
    }

    setLoading(true);
    try {
      // Call backend to clear the cart
      await cartService.clearCart();

      // Always reload cart from backend to get latest data
      await loadCart();

      // Send real-time update for cart cleared
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_CLEARED'
        });
      }

      toast.success('Cart cleared');
    } catch (error) {
      console.error('Failed to clear cart:', error);
      setError('Failed to clear cart');
      toast.error('Failed to clear cart. Please try again.');
      // Reload cart to ensure consistency
      await loadCart();
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    setLoading(true);
    try {
      // Apply coupon via backend
      const response = await cartService.applyCoupon(couponCode);
      const couponData = response.data;
      
      setAppliedCoupon(couponData);
      toast.success(`Coupon ${couponCode} applied successfully!`);

      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'COUPON_APPLIED',
          couponCode: couponCode
        });
      }

      return couponData;

    } catch (error) {
      console.error('Failed to apply coupon:', error);
      const message = error.response?.data?.message || 'Invalid coupon code';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeCoupon = async () => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to remove coupon. Please check your connection.');
      return;
    }

    setLoading(true);
    try {
      // Remove coupon via backend
      await cartService.removeCoupon();
      
      setAppliedCoupon(null);
      toast.success('Coupon removed');

      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'COUPON_REMOVED'
        });
      }

    } catch (error) {
      console.error('Failed to remove coupon:', error);
      toast.error('Failed to remove coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Calculated values
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  // Use backend-calculated totalPrice for each item for subtotal
  const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.totalPrice || 0)), 0);
  // Optionally, if you want to show per-item price, use item.unitPrice
  const taxes = subtotal * 0.08; // 8% tax
  const shippingCost = subtotal > 50 ? 0 : 5.99; // Free shipping over $50

  let discount = 0;
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage' 
      ? subtotal * appliedCoupon.discount 
      : appliedCoupon.discount;
  }

  const total = Math.max(0, subtotal + taxes + shippingCost - discount);
  const isEmpty = cartItems.length === 0;

  // Legacy functions for backward compatibility
  const getTotalItems = () => totalItems;
  const getTotalPrice = () => subtotal;
  // Match by productId for isInCart and getItemQuantity
  const isInCart = (productId) => cartItems.some(item => item.productId === productId || item.id === productId);
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.productId === productId || item.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    // Main properties expected by Cart component
    items: cartItems,
    loading,
    error,
    totalItems,
    subtotal,
    taxes,
    shippingCost,
    discount,
    total,
    appliedCoupon,
    isEmpty,
    isOnline,
    // Functions expected by Cart component
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    clearError,
    loadCart,
    // Legacy properties for backward compatibility
    cartItems,
    addToCart,
    updateQuantity: updateCartItem, // Alias for updateCartItem
    getTotalItems,
    getTotalPrice,
    isInCart,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
