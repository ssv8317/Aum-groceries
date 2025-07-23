import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { ShoppingCartIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';

const ProductCard = ({ product }) => {
  const { addToCart, isInCart, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(product.id, quantity - 1);
    }
  };

  return (
    <div className="product-card">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={product.image || '/api/placeholder/300/300'}
          alt={product.name}
          className="h-48 w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          <Link to={`/products/${product.id}`} className="hover:text-primary-600 transition-colors">
            {product.name}
          </Link>
        </h3>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary-600">
              ₹{product.price}
            </span>
            <span className="text-sm text-gray-500">
              per {product.unit}
            </span>
          </div>
          
          <div className="flex items-center space-x-1">
            <span className="text-sm text-gray-500">Stock:</span>
            <span className={`text-sm font-medium ${
              product.stock_quantity > 10 ? 'text-green-600' :
              product.stock_quantity > 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {product.stock_quantity}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          {!isInCart(product.id) ? (
            <button
              onClick={handleAddToCart}
              disabled={product.stock_quantity === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                product.stock_quantity === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-600 text-white hover:bg-primary-700'
              }`}
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>{product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDecrement}
                className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded-md font-medium">
                {quantity}
              </span>
              <button
                onClick={handleIncrement}
                disabled={quantity >= product.stock_quantity}
                className={`p-1 rounded-full transition-colors ${
                  quantity >= product.stock_quantity
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
