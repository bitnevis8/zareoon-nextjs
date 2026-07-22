"use client";

import Image from "next/image";
import Link from "next/link";
import { resolveMediaUrl } from "@/app/utils/mediaUrl";
import { buildHashtagSearchHref } from "@/app/utils/mobileSearchUtils";

function postImages(post) {
  if (Array.isArray(post.imageUrls) && post.imageUrls.length) return post.imageUrls;
  if (post.imageUrl) return [post.imageUrl];
  return [];
}

export default function SupplierPostItem({ post }) {
  const images = postImages(post);
  const hashtags = Array.isArray(post.hashtags) ? post.hashtags : [];

  return (
    <li className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <p className="whitespace-pre-wrap text-sm text-slate-800">{post.body}</p>

      {hashtags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {hashtags.map((tag) => (
            <Link
              key={tag}
              href={buildHashtagSearchHref(tag)}
              className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 hover:text-emerald-950"
            >
              #{tag}
            </Link>
          ))}
        </div>
      ) : null}

      {images.length > 0 ? (
        <div
          className={`mt-3 grid gap-2 ${
            images.length === 1 ? "grid-cols-1" : images.length === 2 ? "grid-cols-2" : "grid-cols-3"
          }`}
        >
          {images.map((url, index) => (
            <a
              key={`${url}-${index}`}
              href={resolveMediaUrl(url)}
              target="_blank"
              rel="noopener noreferrer"
              className="relative block aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
            >
              <Image
                src={resolveMediaUrl(url)}
                alt=""
                fill
                unoptimized
                className="object-cover"
              />
            </a>
          ))}
        </div>
      ) : null}

      <time className="mt-2 block text-xs text-slate-400">
        {new Date(post.createdAt).toLocaleDateString("fa-IR")}
      </time>
    </li>
  );
}
