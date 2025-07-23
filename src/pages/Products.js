import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilters from '../components/Products/ProductFilters';
import { productService } from '../services/api';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sortBy') || 'featured',
    priceRange: '',
    rating: '',
    inStock: false
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category_id = filters.category;
      
      const response = await productService.getProducts(params);
      
      // Handle backend API response format
      let productsData = [];
      if (response.data && Array.isArray(response.data)) {
        productsData = response.data;
      } else if (response && Array.isArray(response)) {
        productsData = response;
      }
      
      setProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      // Fallback to empty array
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  const handleSearchChange = (search) => {
    setFilters(prev => ({ ...prev, search }));
    
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    setSearchParams(params);
  };

  const handleSortChange = (sortBy) => {
    setFilters(prev => ({ ...prev, sortBy }));
    
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    setSearchParams(params);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Products</h1>
        <p className="text-gray-600">Discover fresh groceries and everyday essentials</p>
      </div>

      <ProductFilters
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
      />

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {products.length} product{products.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <ProductGrid
            searchQuery={filters.search}
            category={filters.category}
            sortBy={filters.sortBy}
          />
        </>
      )}
    </div>
  );
};

export default Products;
