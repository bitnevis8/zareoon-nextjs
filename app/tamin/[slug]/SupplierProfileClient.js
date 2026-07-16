"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/app/context/AuthContext";
import { authFetch } from "@/app/utils/authHeaders";
import SupplierPostComposer from "./SupplierPostComposer";
import SupplierPostItem from "./SupplierPostItem";
import SupplierActiveProductsRail from "./SupplierActiveProductsRail";

const WEEK_DAY_KEYS = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

function Stars({ value, onChange, readonly }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`text-lg ${n <= value ? "text-amber-400" : "text-slate-300"} ${readonly ? "cursor-default" : "hover:scale-110"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function ProfileFieldsSection({ profile }) {
  const t = useTranslations("supplier.profile");
  const schema = profile.fieldSchema || [];
  const values = profile.profileFields || {};
  const entries = schema
    .map((f) => ({ label: f.label, value: values[f.key] }))
    .filter((e) => e.value && String(e.value).trim());

  if (!entries.length) return null;

  return (
    <section className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
      <h2 className="mb-3 text-sm font-bold text-emerald-900">{t("expertInfo")}</h2>
      <dl className="space-y-2 text-sm">
        {entries.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs font-semibold text-slate-500">{label}</dt>
            <dd className="mt-0.5 whitespace-pre-wrap text-slate-800">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function BusinessHoursTable({ hours }) {
  const t = useTranslations("supplier");
  if (!hours) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <tbody>
          {WEEK_DAY_KEYS.map((key) => {
            const row = hours[key] || {};
            return (
              <tr key={key} className="border-b border-slate-100 last:border-0">
                <td className="bg-slate-50 px-3 py-2 font-medium text-slate-700">{t(`weekDays.${key}`)}</td>
                <td className="px-3 py-2 text-slate-600">
                  {row.closed
                    ? t("profile.closed")
                    : t("profile.hoursRange", { open: row.open || "—", close: row.close || "—" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function SupplierProfileClient({ slug }) {
  const t = useTranslations("supplier");
  const auth = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const [profRes, postsRes, revRes] = await Promise.all([
      authFetch(`/api/tamin/public/${encodeURIComponent(slug)}`),
      fetch(`/api/tamin/public/${encodeURIComponent(slug)}/posts`),
      fetch(`/api/tamin/public/${encodeURIComponent(slug)}/reviews`),
    ]);
    const prof = await profRes.json();
    const postsJson = await postsRes.json();
    const revJson = await revRes.json();
    if (prof.success) setData(prof.data);
    if (postsJson.success) setPosts(postsJson.data || []);
    if (revJson.success) setReviews(revJson.data || []);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (!auth?.user) {
      router.push("/auth/login");
      return;
    }
    const res = await authFetch(`/api/tamin/follow/${data.profile.id}`, { method: "POST" });
    const json = await res.json();
    if (json.success) {
      setData((d) => ({
        ...d,
        isFollowing: json.data.following,
        stats: { ...d.stats, followerCount: json.data.followerCount },
      }));
    }
  };

  const submitPost = async ({ body, imageUrls, hashtags }) => {
    if (!body?.trim()) return false;
    setPosting(true);
    const res = await authFetch("/api/tamin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body, imageUrls, hashtags }),
    });
    const json = await res.json();
    setPosting(false);
    if (json.success) {
      setPosts((p) => [json.data, ...p]);
      return true;
    }
    return false;
  };

  const submitReview = async () => {
    setReviewSubmitting(true);
    const res = await authFetch(`/api/tamin/review/${data.profile.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
    });
    const json = await res.json();
    if (json.success) {
      setMsg(t("profile.reviewSubmitted"));
      setData((d) => ({ ...d, stats: json.data.stats, myReview: json.data.review }));
      load();
    } else {
      setMsg(json.message || t("profile.error"));
    }
    setReviewSubmitting(false);
  };

  const statsItems = useMemo(() => {
    if (!data?.stats) return [];
    const { stats } = data;
    return [
      {
        label: t("profile.tradeScore"),
        value: stats.tradeScore ? t("profile.tradeScoreValue", { score: stats.tradeScore }) : "—",
        hint: t("profile.tradeScoreHint"),
      },
      { label: t("profile.followers"), value: stats.followerCount?.toLocaleString("fa-IR") },
      { label: t("profile.activeProducts"), value: stats.productCount?.toLocaleString("fa-IR") },
      { label: t("profile.completedDeals"), value: stats.completedDeals?.toLocaleString("fa-IR") },
    ];
  }, [data, t]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-slate-600">{t("notFound.title")}</p>
        <Link href="/" className="mt-4 inline-block text-emerald-700 hover:underline">
          {t("notFound.backHome")}
        </Link>
      </div>
    );
  }

  const { profile, stats, isFollowing, canReview, myReview, isOwner, products } = data;
  const initial = (profile.firstName?.[0] || "?").toUpperCase();

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt=""
                  width={96}
                  height={96}
                  unoptimized
                  className="h-24 w-24 rounded-2xl border-4 border-white object-cover shadow-md"
                />
              ) : (
                <span className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-emerald-600 text-3xl font-bold text-white shadow-md">
                  {initial}
                </span>
              )}
              <div className="min-w-0 pb-1">
                <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">{profile.displayName}</h1>
                {profile.navBadge || profile.entityTypeLabel ? (
                  <span className="mt-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    {profile.navBadge || profile.entityTypeLabel}
                  </span>
                ) : null}
                {profile.country ? (
                  <p className="mt-1 text-xs text-slate-500">{profile.country}</p>
                ) : null}
                {profile.headline ? <p className="mt-1 text-sm text-slate-600">{profile.headline}</p> : null}
                <p className="mt-1 text-xs text-slate-400">
                  zareoon.ir/tamin/{profile.profileSlug}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {isOwner ? (
                <Link
                  href="/dashboard/supplier-profile"
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  {t("profile.editPage")}
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={toggleFollow}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                      isFollowing
                        ? "border border-slate-300 bg-white text-slate-700"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {isFollowing ? t("profile.following") : t("profile.follow")}
                  </button>
                  {auth?.user ? (
                    <Link
                      href={`/dashboard/messages?u=${profile.id}`}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {t("profile.message")}
                    </Link>
                  ) : null}
                </>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statsItems.map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 px-3 py-3 text-center">
                <div className="text-lg font-extrabold text-slate-900">{s.value}</div>
                <div className="text-[11px] text-slate-500">{s.label}</div>
                {s.hint ? <div className="text-[10px] text-slate-400">{s.hint}</div> : null}
              </div>
            ))}
          </div>

          {profile.bio ? (
            <p className="mt-5 text-sm leading-relaxed text-slate-700">{profile.bio}</p>
          ) : null}

          <ProfileFieldsSection profile={profile} />

          {profile.publicPhone ? (
            <p className="mt-2 text-sm text-slate-600">
              {t("profile.contact")}{" "}
              <a href={`tel:${profile.publicPhone}`} className="font-semibold text-emerald-700" dir="ltr">
                {profile.publicPhone}
              </a>
            </p>
          ) : null}
        </div>
      </div>

      <SupplierActiveProductsRail products={products} />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {isOwner ? <SupplierPostComposer onSubmit={submitPost} posting={posting} /> : null}

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-800">{t("profile.activities")}</h2>
              {posts.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">{t("profile.noPosts")}</p>
              ) : (
                <ul className="space-y-4">
                  {posts.map((post) => (
                    <SupplierPostItem key={post.id} post={post} />
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-sm font-bold text-slate-800">
                {t("profile.reviewsTitle", { count: stats.reviewCount?.toLocaleString("fa-IR") || 0 })}
              </h2>

              {canReview && !myReview ? (
                <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50/80 p-4">
                  <p className="mb-2 text-xs text-amber-900">{t("profile.canReviewHint")}</p>
                  <Stars value={reviewRating} onChange={setReviewRating} />
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={2}
                    placeholder={t("profile.reviewPlaceholder")}
                    className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={submitReview}
                    disabled={reviewSubmitting}
                    className="mt-2 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {t("profile.submitReview")}
                  </button>
                  {msg ? <p className="mt-2 text-xs text-amber-800">{msg}</p> : null}
                </div>
              ) : null}

              {reviews.length === 0 ? (
                <p className="text-sm text-slate-500">{t("profile.noReviews")}</p>
              ) : (
                <ul className="space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-slate-800">
                          {r.reviewer?.displayName || t("profile.defaultUser")}
                        </span>
                        <Stars value={r.rating} readonly />
                      </div>
                      {r.comment ? <p className="mt-2 text-sm text-slate-600">{r.comment}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-bold text-slate-800">{t("profile.businessHours")}</h2>
              <BusinessHoursTable hours={profile.businessHours} />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
