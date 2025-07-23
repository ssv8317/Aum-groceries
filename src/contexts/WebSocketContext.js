import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { websocketService } from '../services/api';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectInterval = 3000; // 3 seconds

  const connect = () => {
    if (!isAuthenticated || !user?.userId) {
      return;
    }

    try {
      setConnectionStatus('connecting');
      wsRef.current = websocketService.connect(user.userId);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        
        // Send identification message
        websocketService.sendMessage(wsRef.current, {
          type: 'IDENTIFY',
          userId: user.userId,
          timestamp: new Date().toISOString()
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('error');
        
        if (reconnectAttempts.current < maxReconnectAttempts) {
          scheduleReconnect();
        }
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('error');
      scheduleReconnect();
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectAttempts.current += 1;
    setConnectionStatus('reconnecting');

    reconnectTimeoutRef.current = setTimeout(() => {
      console.log(`WebSocket reconnect attempt ${reconnectAttempts.current}/${maxReconnectAttempts}`);
      connect();
    }, reconnectInterval * reconnectAttempts.current);
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close(1000, 'User logout');
      wsRef.current = null;
    }

    setIsConnected(false);
    setConnectionStatus('disconnected');
    reconnectAttempts.current = 0;
  };

  const sendMessage = (message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      websocketService.sendMessage(wsRef.current, {
        ...message,
        userId: user?.userId,
        timestamp: new Date().toISOString()
      });
      return true;
    }
    return false;
  };

  const handleWebSocketMessage = (data) => {
    console.log('WebSocket message received:', data);

    switch (data.type) {
      case 'CART_UPDATED':
        // Handle cart updates (will be processed by CartContext)
        window.dispatchEvent(new CustomEvent('cart-updated', { detail: data.cart }));
        break;

      case 'ORDER_STATUS_UPDATED':
        toast.success(`Order #${data.orderId} status updated: ${data.status}`);
        window.dispatchEvent(new CustomEvent('order-status-updated', { detail: data }));
        break;

      case 'DELIVERY_ASSIGNED':
        toast.info(`Delivery agent assigned to order #${data.orderId}`);
        break;

      case 'DELIVERY_STARTED':
        toast.info(`Your order #${data.orderId} is out for delivery!`);
        break;

      case 'DELIVERY_COMPLETED':
        toast.success(`Order #${data.orderId} has been delivered successfully!`);
        break;

      case 'PRICE_UPDATE':
        if (data.productIds && data.productIds.length > 0) {
          toast.info('Some items in your cart have price updates');
          window.dispatchEvent(new CustomEvent('price-update', { detail: data }));
        }
        break;

      case 'STOCK_ALERT':
        if (data.lowStock) {
          toast.warning(`${data.productName} is running low in stock!`);
        } else if (data.outOfStock) {
          toast.error(`${data.productName} is out of stock`);
        }
        break;

      case 'PROMOTION_ALERT':
        toast.success(`🎉 Special offer: ${data.message}`);
        break;

      case 'SYSTEM_MAINTENANCE':
        toast.error(`System maintenance scheduled: ${data.message}`);
        break;

      case 'CONNECTION_ACKNOWLEDGED':
        console.log('WebSocket connection acknowledged:', data);
        break;

      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  };

  // Connect when user authenticates
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, user?.userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  // Heartbeat to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const heartbeatInterval = setInterval(() => {
      sendMessage({ type: 'HEARTBEAT' });
    }, 30000); // Send heartbeat every 30 seconds

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  const value = {
    isConnected,
    connectionStatus,
    sendMessage,
    connect,
    disconnect
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export default WebSocketProvider;
