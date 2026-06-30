"use client";

import { useLanguage } from "../../../context/LanguageContext";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="hidden lg:block bg-white border-t border-gray-100 mt-auto">
      {/* Bottom Section */}
      <div className="border-t border-t-orange-100 bg-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center items-center">
            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-slate-800">
                {t("allRightsReserved")} © <time suppressHydrationWarning>{new Date().getFullYear()}</time>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 