"use client";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            سیاست حریم خصوصی پلتفرم زارعون
          </h1>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. مقدمه</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                پلتفرم زارعون متعهد به حفظ حریم خصوصی کاربران خود است. این سند توضیح می‌دهد که چگونه اطلاعات شخصی شما جمع‌آوری، استفاده و محافظت می‌شود.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. اطلاعاتی که جمع‌آوری می‌کنیم</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">اطلاعات شخصی</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
                    <li>نام و نام خانوادگی</li>
                    <li>شماره موبایل</li>
                    <li>آدرس ایمیل</li>
                    <li>آدرس محل سکونت</li>
                    <li>اطلاعات هویتی</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">اطلاعات تجاری</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-2 text-sm">
                    <li>اطلاعات محصولات</li>
                    <li>تاریخچه سفارشات</li>
                    <li>اطلاعات پرداخت</li>
                    <li>نظرات و ارزیابی‌ها</li>
                    <li>اطلاعات مکان</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. نحوه استفاده از اطلاعات</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>ارائه خدمات پلتفرم و تسهیل معاملات</li>
                <li>ارتباط با کاربران در مورد سفارشات و خدمات</li>
                <li>بهبود کیفیت خدمات و تجربه کاربری</li>
                <li>ارائه پشتیبانی فنی و حل مشکلات</li>
                <li>رعایت قوانین و مقررات قانونی</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. اشتراک‌گذاری اطلاعات</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3">موارد اشتراک‌گذاری:</h3>
                <ul className="list-disc list-inside text-yellow-700 space-y-2">
                  <li>اطلاعات سفارش با کشاورز مربوطه</li>
                  <li>اطلاعات تحویل با راننده</li>
                  <li>اطلاعات پرداخت با درگاه‌های پرداخت</li>
                  <li>اطلاعات مورد نیاز برای رعایت قوانین</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. امنیت اطلاعات</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>استفاده از پروتکل‌های امنیتی پیشرفته</li>
                <li>رمزگذاری اطلاعات حساس</li>
                <li>دسترسی محدود به اطلاعات</li>
                <li>نظارت مداوم بر سیستم‌های امنیتی</li>
                <li>آموزش کارکنان در مورد حفاظت از اطلاعات</li>
              </ul>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. حقوق کاربران</h2>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-3">شما حق دارید:</h3>
                <ul className="list-disc list-inside text-green-700 space-y-2">
                  <li>دسترسی به اطلاعات شخصی خود</li>
                  <li>تصحیح اطلاعات نادرست</li>
                  <li>حذف اطلاعات شخصی</li>
                  <li>محدود کردن استفاده از اطلاعات</li>
                  <li>اعتراض به پردازش اطلاعات</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. کوکی‌ها و فناوری‌های مشابه</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                ما از کوکی‌ها و فناوری‌های مشابه برای بهبود تجربه کاربری، حفظ جلسات کاربری و تحلیل استفاده از پلتفرم استفاده می‌کنیم.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. تغییرات سیاست حریم خصوصی</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                این سیاست ممکن است به‌روزرسانی شود. تغییرات مهم از طریق پلتفرم به اطلاع کاربران می‌رسد.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. تماس با ما</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                برای سوالات مربوط به حریم خصوصی:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>تلفن:</strong> 09393387148<br/>
                  <strong>ایمیل:</strong> privacy@zareoon.ir<br/>
                  <strong>آدرس:</strong> ایران
                </p>
              </div>
            </div>

            <div className="border-t pt-6 mt-8">
              <p className="text-sm text-gray-500 text-center">
                آخرین بروزرسانی: {new Date().toLocaleDateString('fa-IR')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
