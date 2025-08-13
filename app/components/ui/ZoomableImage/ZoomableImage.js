'use client';

import React, { useState, useEffect } from 'react';

export default function ZoomableImage({ src, alt, className, thumbnailClassName }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  // Handle Escape key press
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Thumbnail Image */}
      <div className="relative cursor-zoom-in" onClick={openModal}>
        <img 
          src={src} 
          alt={alt}
          className={`${thumbnailClassName || className} transition-transform hover:scale-105`}
        />
        {/* Zoom Icon Overlay */}
        <div className="absolute top-2 left-2 bg-black bg-opacity-50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
        </div>
      </div>

      {/* Full Size Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-95 p-4 backdrop-blur-sm">
          {/* Close Button */}
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-20 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70"
            aria-label="بستن"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Image Caption */}
          <div className="absolute bottom-6 left-6 right-6 text-white text-center z-20">
            <p className="bg-black bg-opacity-50 px-4 py-2 rounded-lg text-sm max-w-2xl mx-auto">
              {alt}
            </p>
          </div>

          {/* Full Size Image */}
          <div className="relative max-w-full max-h-full animate-in fade-in duration-300">
            <img 
              src={src} 
              alt={alt}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Background Click to Close */}
          <div 
            className="absolute inset-0 cursor-pointer"
            onClick={closeModal}
            aria-label="بستن تصویر"
          />
        </div>
      )}
    </>
  );
}