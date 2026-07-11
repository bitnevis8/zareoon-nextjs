"use client";

import { Toaster } from "react-hot-toast";
import { useLanguage } from "../../context/LanguageContext";

export default function AppToaster() {
  const { isRTL } = useLanguage();

  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={10}
      containerStyle={{ top: 72, zIndex: 99999 }}
      toastOptions={{
        duration: 4200,
        style: {
          direction: isRTL ? "rtl" : "ltr",
          textAlign: isRTL ? "right" : "left",
        },
        success: {
          iconTheme: { primary: "#059669", secondary: "#ecfdf5" },
        },
        error: {
          iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
        },
      }}
    />
  );
}
