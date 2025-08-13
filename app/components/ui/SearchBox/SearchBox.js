'use client';

import { useState, useEffect, useRef } from 'react';

export default function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allTags, setAllTags] = useState([]);
  const searchRef = useRef(null);

  // Fetch all tags on component mount
  useEffect(() => {
    const fetchAllTags = async () => {
      try {
        const response = await fetch('/api/tags');
        
        if (response.ok) {
          const data = await response.json();
          setAllTags(data.tags || []);
        } else {
          setAllTags([]);
        }
      } catch (error) {
        setAllTags([]);
      }
    };

    fetchAllTags();
  }, []);

  // Filter suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim().length < 2) { // Changed from 1 to 2 to reduce requests
      setSuggestions([]);
      return;
    }

    if (!allTags || !Array.isArray(allTags)) {
      setSuggestions([]);
      return;
    }

    // Debounce the search to reduce server load
    const timeoutId = setTimeout(() => {
      const filtered = allTags.filter(tag => 
        tag && tag.name && 
        tag.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedTags.some(selected => selected.id === tag.id)
      );
      
      setSuggestions(filtered.slice(0, 10)); // Limit to 10 suggestions
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedTags, allTags]);

  // Fetch filtered articles when selected tags change
  useEffect(() => {
    const fetchFilteredArticles = async () => {
      if (selectedTags.length === 0) {
        setFilteredArticles([]);
        return;
      }

      setIsLoading(true);
      try {
        const tagIds = selectedTags.map(tag => tag.id).join(',');
        
        const response = await fetch(`/api/articles/by-tags?tagIds=${tagIds}&limit=20`);
        
        if (response.ok) {
          const data = await response.json();
          setFilteredArticles(data.articles || []);
        } else {
          setFilteredArticles([]);
        }
      } catch (error) {
        setFilteredArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredArticles();
  }, [selectedTags]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTagSelect = (tag) => {
    if (!selectedTags.some(selected => selected.id === tag.id)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setSearchTerm('');
    setSuggestions([]);
    setIsOpen(false);
  };

  const handleTagRemove = (tagId) => {
    setSelectedTags(selectedTags.filter(tag => tag.id !== tagId));
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) {
      handleTagSelect(suggestions[0]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto b">
      {/* Search Input */}
      <div className="relative" ref={searchRef}>
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="جستجو با تگانه ..."
              className="w-full px-4 py-3 pr-12 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </form>

        {/* Suggestions Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag)}
                className="w-full px-4 py-3 text-right hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-right">
                    <div className="font-medium text-gray-900">{tag.name}</div>
                    {tag.description && (
                      <div className="text-sm text-gray-500 mt-1">{tag.description}</div>
                    )}
                  </div>
                  <div className="mr-3">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                <span className="ml-2">{tag.name}</span>
                <button
                  onClick={() => handleTagRemove(tag.id)}
                  className="mr-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-600 hover:bg-blue-200 focus:outline-none"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-2 text-sm text-gray-600">
            {selectedTags.length === 1 
              ? `نمایش اخبار مرتبط با تگ "${selectedTags[0].name}"`
              : `نمایش اخبار مرتبط با ${selectedTags.length} تگ انتخاب شده`
            }
          </div>
        </div>
      )}

      {/* Advanced Categories Link */}
      <div className="mt-4 flex justify-center">
        <a
          href="/advanced-categories"
          className="w-44 flex justify-center  px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors duration-200"
        >
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
           دسته‌بندی پیشرفته 
        </a>
      </div>

      {/* Filtered Articles Results */}
      {selectedTags.length > 0 && (
        <div className="mt-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-gray-600">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                در حال جستجو...
              </div>
            </div>
          ) : filteredArticles.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-right">نتایج اخبار مرتبط:</h3>
              <ul className="space-y-2 text-right">
                {filteredArticles.map((article) => (
                  <li key={article.id}>
                      <a
                      href={`/`}
                      className="flex items-center gap-3 hover:bg-blue-50 rounded p-2 transition-colors"
                    >
                      <span className="text-sm font-medium text-blue-800 truncate text-right">
                        {article.title}
                        {article.agency?.name && (
                          <span className="text-gray-500 font-normal ml-2">| {article.agency.name}</span>
                        )}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خبری یافت نشد</h3>
              <p className="text-gray-500">
                هیچ خبری با تگ‌های انتخاب شده یافت نشد. لطفاً تگ‌های دیگری انتخاب کنید.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 