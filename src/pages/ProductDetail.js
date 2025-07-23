import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { productService } from '../services/apiService';
import { 
  StarIcon, 
  ShoppingCartIcon, 
  HeartIcon, 
  ShareIcon,
  TruckIcon,
  ShieldCheckIcon,
  CurrencyRupeeIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productService.getProduct(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await productService.getProductReviews(id);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await productService.getRelatedProducts(id);
      setRelatedProducts(response.data);
    } catch (error) {
      console.error('Error fetching related products:', error);
    }
  };

  const handleAddToCart = () => {
    addToCart({ ...product, quantity });
  };

  const handleQuantityChange = (newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-12 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
        <button
          onClick={() => navigate('/products')}
          className="bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600 mb-8">
        <span onClick={() => navigate('/')} className="cursor-pointer hover:text-primary-600">
          Home
        </span>
        <span className="mx-2">/</span>
        <span onClick={() => navigate('/products')} className="cursor-pointer hover:text-primary-600">
          Products
        </span>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={product.images?.[selectedImage] || product.image || '/api/placeholder/400/400'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary-500' : 'border-gray-200'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-4">
            <span className="text-4xl font-bold text-primary-600">₹{product.price}</span>
            {product.originalPrice && (
              <span className="text-xl text-gray-500 line-through">₹{product.originalPrice}</span>
            )}
            {product.discount && (
              <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
                {product.discount}% OFF
              </span>
            )}
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center space-x-4">
            <span className="text-lg font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-md">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
            <span className="text-sm text-gray-600">({product.unit})</span>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-md font-medium transition-colors duration-200 ${
                product.inStock
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCartIcon className="h-5 w-5" />
              <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
            
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {isWishlisted ? (
                <HeartIconSolid className="h-6 w-6 text-red-500" />
              ) : (
                <HeartIcon className="h-6 w-6 text-gray-600" />
              )}
            </button>
            
            <button className="p-3 border border-gray-300 rounded-md hover:bg-gray-50">
              <ShareIcon className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <TruckIcon className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-600">Free Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
              <span className="text-sm text-gray-600">Quality Assured</span>
            </div>
            <div className="flex items-center space-x-2">
              <CurrencyRupeeIcon className="h-5 w-5 text-purple-600" />
              <span className="text-sm text-gray-600">Best Price</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="mb-12">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-primary-500 text-primary-600 font-medium">
              Description
            </button>
            <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
              Nutritional Info
            </button>
            <button className="py-2 px-1 text-gray-500 hover:text-gray-700">
              Reviews ({reviews.length})
            </button>
          </nav>
        </div>
        
        <div className="py-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.longDescription || product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img
                  src={relatedProduct.image || '/api/placeholder/200/200'}
                  alt={relatedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">{relatedProduct.name}</h3>
                  <p className="text-primary-600 font-bold">₹{relatedProduct.price}</p>
                  <button
                    onClick={() => navigate(`/products/${relatedProduct.id}`)}
                    className="w-full mt-2 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
