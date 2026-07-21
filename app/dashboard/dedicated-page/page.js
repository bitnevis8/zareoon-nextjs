"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useExistingPublicSlug } from "@/app/hooks/useExistingPublicSlug";
import { dash } from "@/app/components/dashboard/dashboardTheme";

export default function DedicatedPageIntro() {
  const t = useTranslations("dashboard.dedicatedPage");
  const router = useRouter();
  const { publicPath, hasSlug, loading } = useExistingPublicSlug();

  useEffect(() => {
    if (!loading && hasSlug && publicPath) {
      router.replace(publicPath);
    }
  }, [loading, hasSlug, publicPath, router]);

  if (loading || (hasSlug && publicPath)) {
    return (
      <div className={`${dash.page} flex min-h-[40vh] items-center justify-center`}>
        <p className="text-sm text-slate-600">{t("loading")}</p>
      </div>
    );
  }

  return (
    <div className={dash.page}>
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2 text-center sm:text-start">
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{t("title")}</h1>
          <p className="text-sm leading-7 text-slate-600 sm:text-base">{t("subtitle")}</p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5">
            <h2 className="text-lg font-semibold text-emerald-900">{t("shopTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t("shopBody")}</p>
            <Link href="/dashboard/seller/join" className={`${dash.btnPrimary} mt-4 inline-flex min-h-11`}>
              {t("shopCta")}
            </Link>
          </section>

          <section className="rounded-2xl border border-violet-200/80 bg-violet-50/40 p-5">
            <h2 className="text-lg font-semibold text-violet-900">{t("servicesTitle")}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t("servicesBody")}</p>
            <Link
              href="/trade-services/register"
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-700 px-4 text-sm font-semibold text-white hover:bg-violet-800"
            >
              {t("servicesCta")}
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
