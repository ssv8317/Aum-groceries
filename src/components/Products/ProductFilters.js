import React, { useState, useEffect } from 'react';
import { FunnelIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { productService } from '../../services/api';

const ProductFilters = ({ filters: currentFilters, onFilterChange, onSearchChange, onSortChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    rating: '',
    inStock: false,
    ...currentFilters
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentFilters) {
      setFilters(prev => ({ ...prev, ...currentFilters }));
    }
  }, [currentFilters]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      // Handle your categories API response format
      let categoriesData = [];
      if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      // Add "All Categories" option at the beginning
      const allCategories = [
        { id: '', name: 'All Categories' },
        ...categoriesData
      ];
      setCategories(allCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories
      setCategories([
        { id: '', name: 'All Categories' },
        { id: '1', name: 'Chips' },
        { id: '2', name: 'Cookies' },
        { id: '3', name: 'Dairy' },
        { id: '4', name: 'Snacks' }
      ]);
    }
  };

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: 'Under $5', value: '0-5' },
    { label: '$5 - $10', value: '5-10' },
    { label: '$10 - $20', value: '10-20' },
    { label: '$20 - $50', value: '20-50' },
    { label: 'Above $50', value: '50+' }
  ];

  const sortOptions = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price-asc' },
    { label: 'Price: High to Low', value: 'price-desc' },
    { label: 'Rating: High to Low', value: 'rating-desc' },
    { label: 'Newest First', value: 'newest' },
    { label: 'A-Z', value: 'name-asc' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: '',
      priceRange: '',
      rating: '',
      sortBy: 'featured',
      inStock: false
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search products..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          <FunnelIcon className="h-5 w-5 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {categories.map((category) => (
                <option key={category.id || category.name} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Rating
            </label>
            <select
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Ratings</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy || 'featured'}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center mb-4">
          <input
            id="inStock"
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => handleFilterChange('inStock', e.target.checked)}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="inStock" className="ml-2 block text-sm text-gray-700">
            Show only items in stock
          </label>
        </div>

        {/* Clear Filters */}
        <button
          onClick={clearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear all filters
        </button>
      </div>
    </div>
  );
};

export default ProductFilters;
