import { useLanguage } from '../context/LanguageContext';

export default function CategoryProductGuide({ className = '' }) {
  const { t, isRTL } = useLanguage();

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`rounded-xl border border-slate-200 bg-white/90 px-4 py-3 ${className}`}
      role="note"
      aria-label={t('categoryProductGuideTitle')}
    >
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
    </div>
  );
}
