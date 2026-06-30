import { useLanguage } from '../context/LanguageContext';
import { getStockLegend } from '../utils/stockUtils';

export default function CatalogGuidePanel({ showCategoryGuide = true, className = '' }) {
  const { t, isRTL } = useLanguage();
  const legendItems = getStockLegend(t);

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`w-full rounded-xl border border-slate-200 bg-slate-50/80 overflow-hidden ${className}`}
      role="note"
      aria-label={showCategoryGuide ? t('catalogGuidePanelAriaLabel') : t('stockLegendAriaLabel')}
    >
      <div
        className={`grid grid-cols-1 ${
          showCategoryGuide ? 'lg:grid-cols-2' : ''
        } divide-y lg:divide-y-0 lg:divide-x divide-slate-200`}
      >
        {showCategoryGuide ? (
          <section className="px-4 py-4 sm:px-5 sm:py-5 bg-white/90">
            <p className="text-xs font-semibold text-slate-800 mb-1.5">{t('categoryProductGuideTitle')}</p>
            <p className="text-xs text-slate-500 mb-2.5 leading-6">{t('categoryProductGuideIntro')}</p>
            <div className="space-y-2 text-xs text-slate-600 leading-6">
              <p>
                <span className="font-semibold text-slate-800">{t('category')}</span>
                <span className="text-slate-400 mx-1.5" aria-hidden>
                  —
                </span>
                {t('categoryProductGuideCategory')}
              </p>
              <p>
                <span className="font-semibold text-slate-800">{t('product')}</span>
                <span className="text-slate-400 mx-1.5" aria-hidden>
                  —
                </span>
                {t('categoryProductGuideProduct')}
              </p>
            </div>
          </section>
        ) : null}

        <section className={`px-4 py-4 sm:px-5 sm:py-5 ${showCategoryGuide ? '' : 'lg:col-span-1'}`}>
          <p className="text-xs font-medium text-slate-600 mb-2">{t('stockLegendTitle')}</p>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {legendItems.map((item) => (
              <div
                key={item.className}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs border ${item.className}`}
              >
                <span className="font-medium">{item.label}</span>
                <span className="opacity-80">({item.range})</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
