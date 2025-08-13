'use client';
import { useState } from 'react';

export default function ShareButton({ url, title }) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // ساخت URL کامل در زمان اجرا
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${url}` : url;

  const shareOptions = [
    {
      name: 'تلگرام',
      icon: '📱',
      url: `https://t.me/share/url?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'واتساپ',
      icon: '📞',
      url: `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`
    },
    {
      name: 'ایتا',
      icon: '📲',
      url: `https://eitaa.com/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'روبیکا',
      icon: '💬',
      url: `https://rubika.ir/share?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'توییتر',
      icon: '🐦',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`
    }
  ];

  const handleShare = (shareUrl) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowDropdown(false);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      alert('لینک کپی شد!');
    } catch (err) {
      console.error('خطا در کپی کردن لینک:', err);
    }
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="اشتراک‌گذاری"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
        </svg>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute left-0 top-8 z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[140px] sm:min-w-[160px]">
                         {shareOptions.map((option) => (
               <button
                 key={option.name}
                 onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   handleShare(option.url);
                 }}
                 className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2"
               >
                <span className="text-lg">{option.icon}</span>
                <span>{option.name}</span>
              </button>
            ))}
            <hr className="my-1" />
                         <button
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 copyToClipboard();
               }}
               className="w-full px-3 py-2 text-right text-sm hover:bg-gray-50 flex items-center gap-2"
             >
              <span className="text-lg">📋</span>
              <span>کپی لینک</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
} 