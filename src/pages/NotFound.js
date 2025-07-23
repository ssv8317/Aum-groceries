import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, HomeIcon } from '@heroicons/react/24/outline';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-24 w-24 mx-auto text-gray-400 mb-8" />
          
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. 
            The page might have been moved, deleted, or the URL might be incorrect.
          </p>
          
          <div className="space-y-4">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to Homepage
            </Link>
            
            <div className="text-center">
              <Link
                to="/products"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Browse Products
              </Link>
              <span className="mx-2 text-gray-400">|</span>
              <Link
                to="/cart"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View Cart
              </Link>
              <span className="mx-2 text-gray-400">|</span>
              <Link
                to="/orders"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
