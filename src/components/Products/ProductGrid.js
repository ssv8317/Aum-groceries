import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { productService } from '../../services/apiService';
import { StarIcon, ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ProductGrid = ({ searchQuery, category, sortBy }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState(new Set());
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, category, sortBy]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({
        search: searchQuery,
        category,
        sortBy
      });
      // API returns products directly as array, not wrapped in data property
      setProducts(response);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  };

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="w-full h-48 bg-gray-300"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-300 rounded mb-2"></div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
          <div className="relative">
            <Link to={`/products/${product.id}`}>
              <img
                src={product.image || '/api/placeholder/300/200'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
            </Link>
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors duration-200"
            >
              {wishlist.has(product.id) ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-600" />
              )}
            </button>
            {product.discount && (
              <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                {product.discount}% OFF
              </div>
            )}
          </div>
          
          <div className="p-4">
            <Link to={`/products/${product.id}`}>
              <h3 className="text-lg font-semibold text-gray-800 mb-2 hover:text-primary-600 transition-colors duration-200">
                {product.name}
              </h3>
            </Link>
            
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {product.description}
            </p>
            
            <div className="flex items-center mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                ({product.reviews || 0} reviews)
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-primary-600">
                  ₹{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">
                {product.unit}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${
                product.inStock ? 'text-green-600' : 'text-red-600'
              }`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              
              <button
                onClick={() => handleAddToCart(product)}
                disabled={!product.inStock}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors duration-200 ${
                  product.inStock
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="h-4 w-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
