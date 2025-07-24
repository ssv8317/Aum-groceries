import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/Products/ProductGrid';
import ProductFilters from '../components/Products/ProductFilters';
import { productService } from '../services/api';

const Products = () => {
  console.log('🎯 PRODUCTS COMPONENT LOADED - VERSION 2.0');
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
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

  // Fetch products only once on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // No need for client-side filtering useEffect anymore - backend handles filtering

  const fetchProducts = async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters for backend filtering
      const queryParams = {};
      
      // Add category filter to backend request
      if (filterParams.category || filters.category) {
        const cat = filterParams.category || filters.category;
        queryParams.category_id = Number(cat); // Ensure it's a number
      }
      
      // Add search filter to backend request
      if (filterParams.search || filters.search) {
        queryParams.search = filterParams.search || filters.search;
      }
      
      // Add price filters to backend request
      if (filterParams.priceRange || filters.priceRange) {
        const priceRange = filterParams.priceRange || filters.priceRange;
        if (priceRange.includes('-')) {
          const [min, max] = priceRange.split('-').map(num => parseFloat(num));
          queryParams.min_price = min;
          if (max) queryParams.max_price = max;
        } else if (priceRange.includes('+')) {
          const min = parseFloat(priceRange.replace('+', ''));
          queryParams.min_price = min;
        }
      }
      
      // Add stock filter to backend request
      if (filterParams.inStock || filters.inStock) {
        queryParams.in_stock_only = true;
      }
      
      console.log('🚀 Fetching products with backend filtering:', queryParams);
      
      // Fetch products with backend filtering
      const response = await productService.getProducts(queryParams);
      
      // Handle various response formats from product service API
      let productsData = [];
      
      // Check for axios response structure: response.data contains the API response
      if (response.data) {
        // Backend returns: { value: [...], Count: N }
        if (response.data.value && Array.isArray(response.data.value)) {
          productsData = response.data.value;
        }
        // Sometimes backend might return array directly
        else if (Array.isArray(response.data)) {
          productsData = response.data;
        }
      }
      // Fallback: direct array response
      else if (Array.isArray(response)) {
        productsData = response;
      }
      
      console.log(`✅ Loaded ${productsData.length} products from API (backend filtered)`);
      if (productsData.length > 0) {
        console.log('🔍 Sample product structure:', {
          name: productsData[0].name,
          category_id: productsData[0].category_id,
          category: productsData[0].category
        });
      }
      
      // Apply only client-side sorting (backend handles filtering)
      const sortedProducts = applySorting(productsData, filterParams.sortBy || filters.sortBy);
      setProducts(sortedProducts);
      
      // Also store all products for reference (though we'll use backend filtering now)
      setAllProducts(productsData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || 'Failed to load products');
      // Fallback to empty array
      setProducts([]);
      setAllProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to apply only sorting on the frontend (backend handles filtering)
  const applySorting = (products, sortBy) => {
    console.log('🔄 Applying client-side sorting:', sortBy);
    
    if (!sortBy || sortBy === 'featured') {
      console.log('Using featured/default order (no sorting applied)');
      return products;
    }
    
    const sorted = [...products];
    
    console.log('Applying sort:', sortBy);
    console.log('Products before sorting:', sorted.slice(0, 3).map(p => `${p.name} - $${p.price}`));
    
    sorted.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return parseFloat(a.price) - parseFloat(b.price);
        case 'price-desc':
          return parseFloat(b.price) - parseFloat(a.price);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'newest':
          return new Date(b.created_at || '2024-01-01') - new Date(a.created_at || '2024-01-01');
        case 'rating-desc':
          // Placeholder for when ratings are implemented
          return 0;
        default:
          return 0;
      }
    });
    
    console.log('Products after sorting:', sorted.slice(0, 3).map(p => `${p.name} - $${p.price}`));
    return sorted;
  };

  const handleFilterChange = (newFilters) => {
    console.log('🔄 handleFilterChange called with:', newFilters);
    
    // Update filters state
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      console.log('🔄 Updated filters state:', updated);
      
      // Fetch products with new backend filtering
      fetchProducts(updated);
      
      return updated;
    });
    
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
        filters={filters}
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
            products={products}
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
