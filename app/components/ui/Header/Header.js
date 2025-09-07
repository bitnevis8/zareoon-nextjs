'use client';

import Link from 'next/link';
import Image from 'next/image';
import AuthButtons from '../../AuthButtons';

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-[10002]">
      <div className="w-full">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3" prefetch={true}>
              <Image 
                src="/images/logo.png" 
                alt="لوگو تگانه" 
                width={48}
                height={48}
                className="w-12 h-12 object-contain border border-slate-200 rounded"
                priority
              />
              <div className="block">
                <h1 className="text-lg sm:text-2xl font-bold text-slate-800 bg-clip-text">
                  زارعون
                </h1>
          
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            {/* <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              prefetch={true}
            >
              صفحه اصلی
            </Link> */}
            {/* <Link 
              href="/categories" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              prefetch={true}
            >
              دسته‌بندی‌ها
            </Link> */}
            {/* Upload link removed as requested */}
            {/* <Link 
              href="/agencies" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              prefetch={true}
            >
              منابع خبری
            </Link> */}
				
            {/* <Link 
              href="/about" 
              className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium"
              prefetch={true}
            >
              درباره ما
            </Link> */}
				<Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center gap-2 mx-4 md:mx-6" prefetch={true}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l3-7H6.4"/><circle cx="9" cy="19" r="1"/><circle cx="20" cy="19" r="1"/></svg>
              سبد خرید
            </Link>
            <div className="ml-4 inline-block">
              <AuthButtons />
            </div>
          </nav>

        </div>
      </div>
    </header>
  );
} 