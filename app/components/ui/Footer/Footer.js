"use client";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      {/* Bottom Section */}
      <div className="border-t border-t-orange-100 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center">
            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-slate-800">
                تمامی حقوق این سایت برای زارعون محفوظ است © <time suppressHydrationWarning>{new Date().getFullYear()}</time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 