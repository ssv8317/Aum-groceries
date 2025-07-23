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
      
      // Add to backend cart
      await cartService.addToCart(product.id, quantity);
      
      // Update local state optimistically
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === product.id);
        
        if (existingItem) {
          const updatedItems = prevItems.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          toast.success(`Updated ${product.name} quantity in cart`);
          return updatedItems;
        } else {
          const newItem = {
            id: product.id,
            productId: product.id,
            name: product.name,
            description: product.description,
            price: parseFloat(product.price || 0),
            image: product.image,
            quantity: quantity
          };
          toast.success(`Added ${product.name} to cart`);
          return [...prevItems, newItem];
        }
      });
      
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

  const removeFromCart = async (productId) => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to remove item. Please check your connection.');
      return;
    }

    setLoading(true);
    try {
      // Remove from backend
      await cartService.removeFromCart(productId);
      
      // Update local state
      setCartItems(prevItems => {
        const item = prevItems.find(item => item.id === productId);
        if (item) {
          toast.success(`Removed ${item.name} from cart`);
        }
        return prevItems.filter(item => item.id !== productId);
      });

      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_ITEM_REMOVED',
          productId: productId
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

  const updateCartItem = async (productId, quantity) => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to update item. Please check your connection.');
      return;
    }

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    setLoading(true);
    try {
      // Update backend
      await cartService.updateCartItem(productId, quantity);
      
      // Update local state
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );

      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_ITEM_UPDATED',
          productId: productId,
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
      // Clear backend cart
      await cartService.clearCart();
      
      // Update local state
      setCartItems([]);
      setAppliedCoupon(null);
      toast.success('Cart cleared');

      // Send real-time update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        websocketService.sendMessage(wsRef.current, {
          type: 'CART_CLEARED'
        });
      }

    } catch (error) {
      console.error('Failed to clear cart:', error);
      setError('Failed to clear cart');
      toast.error('Failed to clear cart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyCoupon = async (couponCode) => {
    if (!isAuthenticated || !isOnline) {
      toast.error('Unable to apply coupon. Please check your connection.');
      throw new Error('Offline or not authenticated');
    }

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
  const subtotal = cartItems.reduce((total, item) => total + (parseFloat(item.price || 0) * item.quantity), 0);
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
  const isInCart = (productId) => cartItems.some(item => item.id === productId);
  const getItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
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
