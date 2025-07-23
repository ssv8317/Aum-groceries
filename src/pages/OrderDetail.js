import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { 
  ArrowLeftIcon,
  CalendarIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  PhoneIcon,
  ChatBubbleLeftIcon,
  StarIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(id);
      setOrder(response.data);
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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  };

  const handleCancelOrder = async () => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await orderService.cancelOrder(id);
        fetchOrderDetails();
      } catch (err) {
        setError('Failed to cancel order');
      }
    }
  };

  const handleReorder = () => {
    // Add order items to cart and redirect to cart
    navigate('/cart');
  };

  const handleContactSupport = () => {
    // Open support chat or phone
    window.open('tel:+918000000000');
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
          <div className="text-gray-500 text-lg mb-4">Order not found</div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Orders
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Order #{order.orderNumber}
            </h1>
            <div className="flex items-center text-gray-600 mt-2">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Placed on {formatDate(order.createdAt)}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusIcon(order.status)}
              <span className="ml-2 capitalize">{order.status.replace('_', ' ')}</span>
            </span>
            
            {!['delivered', 'cancelled'].includes(order.status) && (
              <Link
                to={`/order-tracking/${order.id}`}
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
              >
                Track Order
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Order Items</h2>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                  <img
                    src={item.product?.image || '/placeholder-product.jpg'}
                    alt={item.product?.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {item.product?.category} • {item.product?.brand}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(item.price)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Delivery Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Delivery Address</h3>
                  <div className="text-gray-600 mt-1">
                    <p>{order.deliveryAddress?.name}</p>
                    <p>{order.deliveryAddress?.addressLine1}</p>
                    {order.deliveryAddress?.addressLine2 && (
                      <p>{order.deliveryAddress.addressLine2}</p>
                    )}
                    <p>
                      {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                    </p>
                    <p>Phone: {order.deliveryAddress?.phone}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TruckIcon className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-800">Delivery Slot</h3>
                  <p className="text-gray-600 mt-1 capitalize">
                    {order.deliverySlot?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {order.specialInstructions && (
                <div className="flex items-start space-x-3">
                  <ChatBubbleLeftIcon className="h-6 w-6 text-gray-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-800">Special Instructions</h3>
                    <p className="text-gray-600 mt-1">{order.specialInstructions}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Payment Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCardIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-800">Payment Method</h3>
                  <p className="text-gray-600 capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <ReceiptPercentIcon className="h-6 w-6 text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-800">Payment Status</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1)}
                  </span>
                </div>
              </div>

              {order.transactionId && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Transaction ID:</span> {order.transactionId}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">{formatPrice(order.subtotal)}</span>
              </div>
              
              {order.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">-{formatPrice(order.discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery Fee</span>
                <span className="text-gray-800">{formatPrice(order.shippingCost)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Taxes</span>
                <span className="text-gray-800">{formatPrice(order.taxes)}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-lg">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions</h2>
            
            <div className="space-y-3">
              {order.status === 'delivered' && (
                <button className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 flex items-center justify-center">
                  <StarIcon className="h-4 w-4 mr-2" />
                  Rate & Review
                </button>
              )}
              
              <button
                onClick={handleReorder}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200"
              >
                Reorder Items
              </button>
              
              {!['delivered', 'cancelled'].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200"
                >
                  Cancel Order
                </button>
              )}
              
              <button
                onClick={handleContactSupport}
                className="w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-200 flex items-center justify-center"
              >
                <PhoneIcon className="h-4 w-4 mr-2" />
                Contact Support
              </button>
            </div>
          </div>

          {/* Delivery Agent (if available) */}
          {order.deliveryAgent && (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Delivery Agent</h2>
              
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium">
                    {order.deliveryAgent.name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{order.deliveryAgent.name}</h3>
                  <p className="text-sm text-gray-600">{order.deliveryAgent.phone}</p>
                </div>
                <button
                  onClick={() => window.open(`tel:${order.deliveryAgent.phone}`)}
                  className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200"
                >
                  <PhoneIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
