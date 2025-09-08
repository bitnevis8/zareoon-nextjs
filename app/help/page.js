"use client";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            راهنمای استفاده از زارعون
          </h1>
          <p className="text-xl text-gray-600">
            راهنمای کامل برای استفاده از پلتفرم زارعون
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* راهنمای مشتریان */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-blue-600 mb-6">
              راهنمای مشتریان
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ثبت‌نام و ورود
                </h3>
                <p className="text-gray-600">
                  برای شروع، شماره موبایل یا ایمیل خود را وارد کنید و کد تایید را دریافت کنید.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  سفارش محصولات
                </h3>
                <p className="text-gray-600">
                  محصولات مورد نظر خود را انتخاب کنید و سفارش خود را ثبت کنید.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  پیگیری سفارش
                </h3>
                <p className="text-gray-600">
                  وضعیت سفارش خود را در داشبورد شخصی مشاهده کنید.
                </p>
              </div>
            </div>
          </div>

          {/* راهنمای تامین‌کنندگان */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-green-600 mb-6">
              راهنمای تامین‌کنندگان
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  ثبت موجودی
                </h3>
                <p className="text-gray-600">
                  محصولات خود را در سیستم ثبت کنید و موجودی خود را مدیریت کنید.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  دریافت سفارشات
                </h3>
                <p className="text-gray-600">
                  سفارشات مشتریان را دریافت کنید و آن‌ها را آماده کنید.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  مدیریت محصولات
                </h3>
                <p className="text-gray-600">
                  محصولات خود را ویرایش کنید و ویژگی‌های آن‌ها را تعریف کنید.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* تماس با ما */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            تماس با ما
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">تلفن</h3>
              <p className="text-gray-600">09393387148</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ایمیل</h3>
              <p className="text-gray-600">info@zareoon.ir</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">ساعات کاری</h3>
              <p className="text-gray-600">24 ساعته</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
