import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/api';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  TruckIcon, 
  MapPinIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingSteps, setTrackingSteps] = useState([]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.trackOrder(orderId);
      setOrder(response.data);
      setTrackingSteps(response.data.trackingSteps || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'confirmed': 'text-blue-600 bg-blue-100',
      'preparing': 'text-purple-600 bg-purple-100',
      'ready': 'text-green-600 bg-green-100',
      'picked_up': 'text-orange-600 bg-orange-100',
      'out_for_delivery': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5" />;
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return <CheckCircleIcon className="h-5 w-5" />;
      case 'picked_up':
      case 'out_for_delivery':
        return <TruckIcon className="h-5 w-5" />;
      case 'delivered':
        return <CheckCircleIcon className="h-5 w-5" />;
      default:
        return <ClockIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(orderId);
        fetchOrderDetails();
      } catch (err) {
        setError('Failed to cancel order');
      }
    }
  };

  const handleContactDelivery = () => {
    if (order.deliveryAgent?.phone) {
      window.open(`tel:${order.deliveryAgent.phone}`);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-4">{error}</div>
          <button
            onClick={() => navigate('/orders')}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Order not found</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Order #{order.id}</h1>
            <p className="text-gray-600 mt-1">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Progress */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Order Progress</h2>
            
            <div className="relative">
              {trackingSteps.map((step, index) => (
                <div key={index} className="flex items-start mb-6 last:mb-0">
                  <div className="flex-shrink-0 mr-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {getStatusIcon(step.status)}
                    </div>
                    {index < trackingSteps.length - 1 && (
                      <div className={`w-0.5 h-6 mt-2 ml-5 ${
                        step.completed ? 'bg-green-500' : 'bg-gray-200'
                      }`}></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{step.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                    {step.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(step.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          {order.deliveryAgent && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Information</h2>
              
              <div className="flex items-center space-x-4">
                <img
                  src={order.deliveryAgent.avatar || '/api/placeholder/60/60'}
                  alt={order.deliveryAgent.name}
                  className="w-15 h-15 rounded-full"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{order.deliveryAgent.name}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(order.deliveryAgent.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-2">
                      {order.deliveryAgent.rating} ({order.deliveryAgent.totalDeliveries} deliveries)
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleContactDelivery}
                    className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                  >
                    <PhoneIcon className="h-5 w-5" />
                  </button>
                  <button className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200">
                    <ChatBubbleLeftIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h2>
            
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-md">
                  <img
                    src={item.image || '/api/placeholder/60/60'}
                    alt={item.name}
                    className="w-15 h-15 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">₹{item.price * item.quantity}</p>
                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">₹{order.deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-800">₹{order.taxes}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Total</span>
                  <span>₹{order.total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
            
            <div className="flex items-start space-x-3">
              <MapPinIcon className="h-5 w-5 text-gray-600 mt-1" />
              <div>
                <p className="font-medium text-gray-800">{order.deliveryAddress.name}</p>
                <p className="text-sm text-gray-600 mt-1">{order.deliveryAddress.address}</p>
                <p className="text-sm text-gray-600">{order.deliveryAddress.phone}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {(order.status === 'pending' || order.status === 'confirmed') && (
              <button
                onClick={handleCancelOrder}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Cancel Order
              </button>
            )}
            
            {order.status === 'delivered' && (
              <button
                onClick={() => navigate(`/orders/${orderId}/review`)}
                className="w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 transition-colors duration-200"
              >
                Rate & Review
              </button>
            )}
            
            <button
              onClick={() => navigate('/support')}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Get Help
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
