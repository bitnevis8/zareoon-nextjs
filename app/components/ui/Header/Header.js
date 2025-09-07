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
          <div className="flex flex-row  items-center ">
            <Link href="/" className="flex  items-center space-x-3" prefetch={true}>
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

          {/* Mobile Support Contact */}
          <div className="md:hidden flex flex-row flex-reverse items-center">
            <a
              href="tel:09393387148"
              className="text-gray-700 hover:text-green-600 transition-colors duration-200 flex items-center gap-1"
            >
              <span className="text-sm">09393387148</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>

            </a>
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

            {/* Support Contact */}
            <a
              href="tel:09393387148"
              className="text-gray-700 flex flex-row justify-center items-center hover:text-green-600 transition-colors duration-200 font-medium gap-2 mx-2"
            >
              <span className="text-sm"> 09393387148</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>

            </a>


            <Link href="/cart" className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center gap-2 mx-4 md:mx-6" prefetch={true}>
              سبد خرید

              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 3h2l.4 2M7 13h10l3-7H6.4" /><circle cx="9" cy="19" r="1" /><circle cx="20" cy="19" r="1" /></svg>

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