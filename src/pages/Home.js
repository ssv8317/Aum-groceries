import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productService } from '../services/apiService';
import ProductCard from '../components/Products/ProductCard';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery(
    'featuredProducts',
    () => productService.getProducts({ limit: 8, featured: true }),
    { staleTime: 5 * 60 * 1000 }
  );

  const { data: categories } = useQuery(
    'categories',
    () => productService.getCategories(),
    { staleTime: 10 * 60 * 1000 }
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Fresh Groceries
              <span className="block">Delivered Fast</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Get farm-fresh produce and essentials delivered to your doorstep
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="btn-secondary text-lg px-8 py-3">
                Shop Now
              </Link>
              <Link to="/register" className="btn-outline bg-transparent border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-3">
                Join Today
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AUM Groceries?
            </h2>
            <p className="text-lg text-gray-600">
              Experience the best in grocery delivery with our premium services
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Same-day delivery available. Get your groceries within hours.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fresh Quality</h3>
              <p className="text-gray-600">Hand-picked fresh produce directly from trusted farms.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Best Prices</h3>
              <p className="text-gray-600">Competitive pricing with regular discounts and offers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">
                Shop by Category
              </h2>
              <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
                View All
                <ChevronRightIcon className="ml-1 h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-white rounded-full shadow-md flex items-center justify-center mx-auto mb-3 group-hover:shadow-lg transition-shadow">
                    <span className="text-2xl">{category.icon || '🛒'}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link to="/products" className="flex items-center text-primary-600 hover:text-primary-700 font-medium">
              View All
              <ChevronRightIcon className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of satisfied customers and experience the convenience of online grocery shopping.
          </p>
          <Link to="/register" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
            Start Shopping Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
