import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cartService, productService, orderService } from './api';
import toast from 'react-hot-toast';

// Cart Queries
export const useCartQuery = (enabled = true) => {
  return useQuery(
    ['cart'],
    cartService.getCart,
    {
      enabled,
      staleTime: 30000, // 30 seconds
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 2,
      onError: (error) => {
        console.error('Cart query error:', error);
        if (error.response?.status !== 401) {
          toast.error('Failed to load cart');
        }
      }
    }
  );
};

export const useAddToCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ productId, quantity }) => cartService.addToCart(productId, quantity),
    {
      onSuccess: (data, variables) => {
        // Invalidate and refetch cart
        queryClient.invalidateQueries(['cart']);
        
        // Optimistic update
        queryClient.setQueryData(['cart'], (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          
          const existingItem = oldData.items.find(item => item.id === variables.productId);
          
          if (existingItem) {
            return {
              ...oldData,
              items: oldData.items.map(item =>
                item.id === variables.productId
                  ? { ...item, quantity: item.quantity + variables.quantity }
                  : item
              )
            };
          } else {
            // For new item, we'd need product data - let's just invalidate
            return oldData;
          }
        });
      },
      onError: (error) => {
        console.error('Add to cart error:', error);
        toast.error('Failed to add item to cart');
      }
    }
  );
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ productId, quantity }) => cartService.updateCartItem(productId, quantity),
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(['cart']);
        
        // Optimistic update
        queryClient.setQueryData(['cart'], (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          
          return {
            ...oldData,
            items: oldData.items.map(item =>
              item.id === variables.productId
                ? { ...item, quantity: variables.quantity }
                : item
            )
          };
        });
      },
      onError: (error) => {
        console.error('Update cart item error:', error);
        toast.error('Failed to update item quantity');
      }
    }
  );
};

export const useRemoveFromCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (productId) => cartService.removeFromCart(productId),
    {
      onSuccess: (data, productId) => {
        queryClient.invalidateQueries(['cart']);
        
        // Optimistic update
        queryClient.setQueryData(['cart'], (oldData) => {
          if (!oldData || !oldData.items) return oldData;
          
          return {
            ...oldData,
            items: oldData.items.filter(item => item.id !== productId)
          };
        });
      },
      onError: (error) => {
        console.error('Remove from cart error:', error);
        toast.error('Failed to remove item from cart');
      }
    }
  );
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    cartService.clearCart,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
        queryClient.setQueryData(['cart'], { items: [], total: 0 });
        toast.success('Cart cleared successfully');
      },
      onError: (error) => {
        console.error('Clear cart error:', error);
        toast.error('Failed to clear cart');
      }
    }
  );
};

// Product Queries
export const useProductsQuery = (params = {}) => {
  return useQuery(
    ['products', params],
    () => productService.getProducts(params),
    {
      staleTime: 300000, // 5 minutes
      cacheTime: 600000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => data.data, // Extract the data from axios response
      onError: (error) => {
        console.error('Products query error:', error);
        toast.error('Failed to load products');
      }
    }
  );
};

export const useProductQuery = (productId, enabled = true) => {
  return useQuery(
    ['product', productId],
    () => productService.getProduct(productId),
    {
      enabled: enabled && !!productId,
      staleTime: 300000, // 5 minutes
      cacheTime: 600000, // 10 minutes
      retry: 2,
      select: (data) => data.data,
      onError: (error) => {
        console.error('Product query error:', error);
        if (error.response?.status === 404) {
          toast.error('Product not found');
        } else {
          toast.error('Failed to load product details');
        }
      }
    }
  );
};

export const useCategoriesQuery = () => {
  return useQuery(
    ['categories'],
    productService.getCategories,
    {
      staleTime: 600000, // 10 minutes
      cacheTime: 900000, // 15 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      select: (data) => data.data,
      onError: (error) => {
        console.error('Categories query error:', error);
        toast.error('Failed to load categories');
      }
    }
  );
};

// Order Queries
export const useOrdersQuery = (params = {}) => {
  return useQuery(
    ['orders', params],
    () => orderService.getOrders(params),
    {
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 2,
      select: (data) => data.data,
      onError: (error) => {
        console.error('Orders query error:', error);
        toast.error('Failed to load orders');
      }
    }
  );
};

export const useOrderQuery = (orderId, enabled = true) => {
  return useQuery(
    ['order', orderId],
    () => orderService.getOrder(orderId),
    {
      enabled: enabled && !!orderId,
      staleTime: 60000, // 1 minute
      cacheTime: 300000, // 5 minutes
      refetchInterval: 30000, // Refetch every 30 seconds for real-time tracking
      retry: 2,
      select: (data) => data.data,
      onError: (error) => {
        console.error('Order query error:', error);
        if (error.response?.status === 404) {
          toast.error('Order not found');
        } else {
          toast.error('Failed to load order details');
        }
      }
    }
  );
};

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    orderService.createOrder,
    {
      onSuccess: (data) => {
        // Invalidate orders and cart queries
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['cart']);
        
        // Clear cart after successful order
        queryClient.setQueryData(['cart'], { items: [], total: 0 });
        
        toast.success('Order placed successfully!');
        return data.data;
      },
      onError: (error) => {
        console.error('Create order error:', error);
        const message = error.response?.data?.message || 'Failed to place order';
        toast.error(message);
      }
    }
  );
};

// Coupon Mutations
export const useApplyCouponMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    cartService.applyCoupon,
    {
      onSuccess: (data, couponCode) => {
        queryClient.invalidateQueries(['cart']);
        toast.success(`Coupon ${couponCode} applied successfully!`);
      },
      onError: (error) => {
        console.error('Apply coupon error:', error);
        const message = error.response?.data?.message || 'Invalid coupon code';
        toast.error(message);
      }
    }
  );
};

export const useRemoveCouponMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    cartService.removeCoupon,
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
        toast.success('Coupon removed successfully');
      },
      onError: (error) => {
        console.error('Remove coupon error:', error);
        toast.error('Failed to remove coupon');
      }
    }
  );
};

// Query key factories for better organization
export const cartKeys = {
  all: ['cart'],
  lists: () => [...cartKeys.all, 'list'],
  list: (filters) => [...cartKeys.lists(), { filters }],
  details: () => [...cartKeys.all, 'detail'],
  detail: (id) => [...cartKeys.details(), id],
};

export const productKeys = {
  all: ['products'],
  lists: () => [...productKeys.all, 'list'],
  list: (filters) => [...productKeys.lists(), { filters }],
  details: () => [...productKeys.all, 'detail'],
  detail: (id) => [...productKeys.details(), id],
};

export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), { filters }],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
};
