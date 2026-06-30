"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            قوانین و شرایط استفاده از پلتفرم زارعون
          </h1>

          <div className="prose prose-lg max-w-none">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. تعریف پلتفرم</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                پلتفرم زارعون یک بازار آنلاین برای خرید و فروش محصولات کشاورزی است که به عنوان واسطه بین کشاورزان (تامین‌کنندگان) و مشتریان عمل می‌کند.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. خدمات پلتفرم</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">پلتفرم زارعون ارائه‌دهنده خدمات زیر است:</h3>
                <ul className="list-disc list-inside text-blue-700 space-y-2">
                  <li>نمایش محصولات کشاورزی از تامین‌کنندگان مختلف</li>
                  <li>دریافت سفارشات از مشتریان</li>
                  <li>ارسال سفارشات به تامین‌کنندگان مربوطه</li>
                  <li>تسهیل فرآیند خرید و فروش محصولات کشاورزی</li>
                  <li>ارائه ابزارهای مدیریتی برای کاربران</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. کاربران پلتفرم</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">تامین‌کنندگان</h3>
                  <ul className="list-disc list-inside text-green-700 space-y-2 text-sm">
                    <li>ثبت موجودی محصولات در پلتفرم</li>
                    <li>تعیین قیمت محصولات</li>
                    <li>دریافت سفارشات از پلتفرم</li>
                    <li>آماده‌سازی و تحویل محصولات</li>
                    <li>مسئولیت کامل کیفیت و تحویل</li>
                  </ul>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-3">مشتریان</h3>
                  <ul className="list-disc list-inside text-blue-700 space-y-2 text-sm">
                    <li>مشاهده محصولات موجود در پلتفرم</li>
                    <li>ثبت سفارش از طریق پلتفرم</li>
                    <li>دریافت محصولات از تامین‌کننده</li>
                    <li>بررسی کیفیت محصولات</li>
                    <li>پرداخت هزینه به پلتفرم</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. خدمات پلتفرم</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">پلتفرم زارعون ارائه می‌دهد:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>بستر فنی برای نمایش اطلاعات</li>
                  <li>ابزارهای ارتباطی بین کاربران</li>
                  <li>رابط کاربری برای مدیریت حساب</li>
                  <li>امکانات جستجو و فیلتر</li>
                  <li>سرویس‌های فنی محدود</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. تعهدات تامین‌کنندگان</h2>
              <div className="bg-red-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 mb-3">تامین‌کنندگان مسئولیت کامل دارند:</h3>
                <ul className="list-disc list-inside text-red-700 space-y-2">
                  <li>ثبت اطلاعات صحیح و کامل محصولات</li>
                  <li>کیفیت و استاندارد محصولات عرضه‌شده</li>
                  <li>تحویل به موقع و صحیح محصولات</li>
                  <li>رعایت قوانین بهداشتی و کیفی</li>
                  <li>حل اختلافات با مشتریان</li>
                  <li>پرداخت مالیات و عوارض مربوطه</li>
                  <li>رعایت قوانین و مقررات کشور</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. تعهدات مشتریان</h2>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-3">مشتریان مسئولیت دارند:</h3>
                <ul className="list-disc list-inside text-orange-700 space-y-2">
                  <li>پرداخت به موقع و کامل به پلتفرم</li>
                  <li>ارائه اطلاعات صحیح برای تحویل</li>
                  <li>بررسی کیفیت محصولات در زمان تحویل</li>
                  <li>رعایت قوانین و مقررات پلتفرم</li>
                  <li>ارزیابی منصفانه محصولات</li>
                  <li>رعایت قوانین و مقررات کشور</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. محدودیت‌های مسئولیت</h2>
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-300">
                <h3 className="text-lg font-semibold text-red-800 mb-3">🚫 پلتفرم زارعون هیچ مسئولیتی ندارد:</h3>
                <ul className="list-disc list-inside text-red-700 space-y-2">
                  <li><strong>هیچ مسئولیتی در قبال معاملات، کیفیت، تحویل یا پرداخت ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال اطلاعات، حریم خصوصی یا امنیت ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال اختلافات، خسارات یا مشکلات ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال عملکرد، دسترسی یا توقف سرویس ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال قوانین، مالیات یا مقررات ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال تصمیمات، اقدامات یا رفتار کاربران ندارد</strong></li>
                  <li><strong>هیچ مسئولیتی در قبال خسارات مستقیم، غیرمستقیم، اتفاقی یا تبعی ندارد</strong></li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. معاملات و پرداخت‌ها</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">نکات مهم:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>مشتریان سفارش خود را از طریق پلتفرم ثبت می‌کنند</li>
                  <li>پلتفرم سفارش را به تامین‌کننده مربوطه ارسال می‌کند</li>
                  <li>قیمت‌ها توسط تامین‌کنندگان تعیین می‌شود</li>
                  <li>مشتریان به پلتفرم پرداخت می‌کنند</li>
                  <li>پلتفرم مسئولیت مالی ندارد</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">9. اطلاعات کاربران</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ توجه:</p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  کاربران مسئولیت کامل اطلاعات خود را بر عهده دارند. 
                  پلتفرم هیچ مسئولیتی در قبال حفظ، امنیت یا حریم خصوصی اطلاعات ندارد.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  جزئیات بیشتر در <Link href="/privacy" className="text-blue-600 hover:underline">سیاست حریم خصوصی</Link> آمده است.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">10. تغییرات قوانین</h2>
              <div className="bg-yellow-50 p-6 rounded-lg">
                <p className="text-yellow-800 font-semibold mb-2">⚠️ توجه مهم:</p>
                <p className="text-gray-700 leading-relaxed">
                  پلتفرم زارعون حق تغییر این قوانین را بدون اطلاع قبلی دارد. 
                  استفاده از پلتفرم به معنای پذیرش قوانین فعلی و آینده است.
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">11. تماس با ما</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <strong>توجه:</strong> پلتفرم زارعون هیچ تعهدی برای پاسخگویی یا پشتیبانی ندارد.
                </p>
                <p className="text-gray-700">
                  <strong>تلفن:</strong> 09393387148<br/>
                  <strong>ایمیل:</strong> info@zareoon.ir<br/>
                  <strong>نکته:</strong> پاسخگویی تضمینی نیست
                </p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">12. پذیرش قوانین</h2>
              <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                <p className="text-red-800 font-bold text-lg mb-4">
                  ⚠️ با استفاده از پلتفرم زارعون، شما به طور کامل و بدون قید و شرط این قوانین را می‌پذیرید.
                </p>
                <p className="text-red-700">
                  در صورت عدم موافقت با هر یک از بندهای این قوانین، لطفاً از استفاده از پلتفرم خودداری کنید.
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
