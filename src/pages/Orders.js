import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/api';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  TruckIcon,
  EyeIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrders();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
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
      case 'confirmed':
        return <ClockIcon className="h-5 w-5" />;
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
      month: 'short',
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

  const filterOrders = (orders) => {
    switch (selectedTab) {
      case 'active':
        return orders.filter(order => 
          !['delivered', 'cancelled'].includes(order.status)
        );
      case 'delivered':
        return orders.filter(order => order.status === 'delivered');
      case 'cancelled':
        return orders.filter(order => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  const filteredOrders = filterOrders(orders);

  const tabs = [
    { key: 'all', label: 'All Orders', count: orders.length },
    { key: 'active', label: 'Active', count: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
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
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <ShoppingBagIcon className="h-24 w-24 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet. Start shopping to see your orders here.
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  selectedTab === tab.key
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-6">
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      Order #{order.orderNumber}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <EyeIcon className="h-4 w-4 mr-2" />
                    View Details
                  </Link>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <img
                        key={index}
                        src={item.product.image || '/placeholder-product.jpg'}
                        alt={item.product.name}
                        className="h-10 w-10 rounded-full border-2 border-white object-cover"
                      />
                    ))}
                    {order.items.length > 3 && (
                      <div className="h-10 w-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center text-lg font-semibold text-gray-800">
                  <CurrencyRupeeIcon className="h-5 w-5 mr-1" />
                  {formatPrice(order.total)}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-2">
                  {order.status === 'delivered' && (
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Rate & Review
                    </button>
                  )}
                  {!['delivered', 'cancelled'].includes(order.status) && (
                    <Link
                      to={`/order-tracking/${order.id}`}
                      className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Track Order
                    </Link>
                  )}
                  {order.status === 'delivered' && (
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Reorder
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for Filtered Results */}
      {filteredOrders.length === 0 && orders.length > 0 && (
        <div className="text-center py-16">
          <div className="text-gray-500 text-lg mb-2">No {selectedTab} orders found</div>
          <p className="text-gray-400">Try selecting a different tab</p>
        </div>
      )}
    </div>
  );
};

export default Orders;
