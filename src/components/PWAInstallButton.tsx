import { useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';
import { UI_TEXT, type Language } from '../game/i18n';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';

export function PWAInstallButton({
  compact = false,
  lang = 'en',
}: {
  compact?: boolean;
  lang?: Language;
}) {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const t = UI_TEXT[lang];

  if (isInstalled) return null;

  if (isInstallable) {
    return (
      <button
        type="button"
        onClick={() => void install()}
        className={`wood-button flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
          compact ? 'px-4 py-2 text-xs' : 'px-5 py-3 text-sm'
        }`}
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{t.installAndroid}</span>
      </button>
    );
  }

  if (isAndroid || isIOS) {
    return (
      <>
        <button
          type="button"
          onClick={() => setShowGuide(true)}
          className={`wood-button flex items-center justify-center gap-2 rounded-lg font-semibold cursor-pointer whitespace-nowrap ${
            compact ? 'px-4 py-2 text-xs' : 'px-5 py-3 text-sm'
          }`}
        >
          <Smartphone className="w-4 h-4 shrink-0" />
          <span>{isIOS ? t.addToIphone : t.installAndroid}</span>
        </button>

        {showGuide && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={t.brandTitle}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            <div
              className={`parchment-panel rounded-xl w-full max-w-sm p-5 ${
                lang === 'ar' ? 'text-right' : 'text-left'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display text-xl font-bold text-[#2c1e14]">
                  {isIOS ? t.installTitleIOS : t.installTitleAndroid}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowGuide(false)}
                  aria-label="Close install guide"
                  className="wood-button p-1.5 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {isIOS ? (
                lang === 'ar' ? (
                  <ol className="text-sm text-[#4a3322] space-y-2 list-decimal pr-5 mb-4">
                    <li>اضغط على زر <strong>المشاركة (Share)</strong> في متصفح Safari.</li>
                    <li>مرّر للأسفل واختر <strong>إضافة إلى الشاشة الرئيسية (Add to Home Screen)</strong>.</li>
                    <li>شغّل لعبة EcoGrow Mission بملء الشاشة من شاشتك الرئيسية.</li>
                  </ol>
                ) : (
                  <ol className="text-sm text-[#4a3322] space-y-2 list-decimal pl-5 mb-4">
                    <li>Tap the <strong>Share</strong> button in Safari.</li>
                    <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                    <li>Launch EcoGrow Mission fullscreen from your home screen.</li>
                  </ol>
                )
              ) : lang === 'ar' ? (
                <ol className="text-sm text-[#4a3322] space-y-2 list-decimal pr-5 mb-4">
                  <li>افتح قائمة المتصفح (<strong>⋮</strong>) في Chrome.</li>
                  <li>اختر <strong>تثبيت التطبيق (Install app)</strong> أو <strong>إضافة إلى الشاشة الرئيسية</strong>.</li>
                  <li>شغّل EcoGrow Mission بملء الشاشة — وتعمل بدون إنترنت أيضاً!</li>
                </ol>
              ) : (
                <ol className="text-sm text-[#4a3322] space-y-2 list-decimal pl-5 mb-4">
                  <li>Open the browser menu (<strong>⋮</strong>) in Chrome.</li>
                  <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                  <li>Launch EcoGrow Mission fullscreen — works offline too!</li>
                </ol>
              )}
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="wood-button-primary w-full py-2.5 rounded-lg text-sm font-semibold cursor-pointer"
              >
                {t.gotIt}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export function OfflineBanner({ lang = 'en' }: { lang?: Language }) {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 wood-panel rounded-md px-3 py-1 text-xs font-semibold text-[#ffe08a] pointer-events-none">
      {UI_TEXT[lang].offlineBanner}
    </div>
  );
}
