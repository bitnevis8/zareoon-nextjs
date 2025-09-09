"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { API_ENDPOINTS } from "../config/api";
import { getProductStockClass, calculateAvailableStock } from "../utils/stockUtils";

export default function SearchModal({ isOpen, onClose, allProducts = [], inventoryLots = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const inputRef = useRef(null);

  // Focus on input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading recent searches:', e);
      }
    }
  }, []);

  // Save recent searches to localStorage
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const newRecent = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('recentSearches', JSON.stringify(newRecent));
  };

  // Search functionality
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const query = searchQuery.trim();
      if (!query) { 
        setSearchResults([]); 
        return; 
      }
      
      setSearching(true);
      try {
        const res = await fetch(`${API_ENDPOINTS.farmer.products.getAll}?q=${encodeURIComponent(query)}&limit=20`, { cache: 'no-store' });
        const d = await res.json();
        setSearchResults(d.data || []);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle search result click
  const handleResultClick = (item) => {
    saveRecentSearch(item.name);
    handleClose();
  };

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  // Handle recent search click
  const handleRecentClick = (query) => {
    setSearchQuery(query);
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-start justify-center pt-2 sm:pt-16 px-2 sm:px-4 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'opacity-100'}`}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[80vh] overflow-hidden transition-all duration-200 ${isClosing ? 'scale-95 opacity-0 translate-y-4' : 'scale-100 opacity-100 translate-y-0'}`}>
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          {/* Close Button */}
          <div className="flex justify-end mb-3">
            <button
              onClick={handleClose}
              className="text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              بستن جستجو
            </button>
          </div>
          
          {/* Search Input */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm text-right search-modal"
              placeholder="جست‌وجو در محصولات و دسته‌ها..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ direction: 'rtl' }}
            />
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto" style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#d1d5db #f3f4f6'
        }}>
          {searchQuery ? (
            // Search Results
            <div className="p-4 sm:p-6">
              {searching ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 animate-pulse bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 mb-3">
                    {searchResults.length} نتیجه یافت شد
                  </div>
                  {searchResults.map((item) => {
                    const availableStock = calculateAvailableStock(item, allProducts, inventoryLots);
                    return (
                      <Link
                        key={item.id}
                        href={`/catalog/${item.id}`}
                        onClick={() => handleResultClick(item)}
                        className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm group ${getProductStockClass(item, allProducts, inventoryLots)}`}
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                          <Image
                            src={item.imageUrl || "/images/image-loader.webp"}
                            alt={item.name}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">{item.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              item.isOrderable 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.isOrderable ? 'محصول' : 'دسته'}
                            </span>
                            {availableStock > 0 && (
                              <span className="text-xs text-green-600 font-medium">
                                {availableStock.toLocaleString()} کیلوگرم
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-gray-400 group-hover:text-gray-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-300 mb-3">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-gray-600 text-sm font-medium mb-1">چیزی یافت نشد</div>
                  <div className="text-xs text-gray-400">کلمات کلیدی دیگری امتحان کنید</div>
                </div>
              )}
            </div>
          ) : (
            // Recent Searches or Empty State
            <div className="p-4 sm:p-6">
              {recentSearches.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900 text-sm">جستجوهای اخیر</h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded-lg transition-all duration-200"
                    >
                      پاک کردن همه
                    </button>
                  </div>
                  <div className="space-y-1">
                    {recentSearches.map((query, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentClick(query)}
                        className="w-full text-right p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200 hover:shadow-sm group"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-gray-700 font-medium text-sm">{query}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <div className="text-gray-700 text-sm font-medium mb-1">جستجو در محصولات</div>
                  <div className="text-gray-500 text-xs">نام محصول یا دسته را تایپ کنید</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
