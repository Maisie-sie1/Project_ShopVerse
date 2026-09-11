"use client";

import Link from "next/link";

type PageParams = {
  category?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
};

function getPageUrl(page: number, basePath: string, params: Record<string, string | undefined>): string {
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) urlParams.set(key, value);
  }
  if (page > 1) urlParams.set("page", String(page));
  return `${basePath}?${urlParams.toString()}`;
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: PageParams;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="flex items-center justify-center gap-1.5">
      <Link
        href={getPageUrl(Math.max(1, page - 1), basePath, params)}
        aria-disabled={page <= 1}
        className={`rounded-lg border border-stone-200 px-3 py-1.5 text-sm ${
          page <= 1 ? "pointer-events-none text-stone-300" : "text-stone-600 hover:bg-stone-50"
        }`}
      >
        ←
      </Link>
      {pages.map((p) => (
        <Link
          key={p}
          href={getPageUrl(p, basePath, params)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            p === page ? "bg-stone-900 text-white" : "text-stone-600 hover:bg-stone-100"
          }`}
        >
          {p}
        </Link>
      ))}
      <Link
        href={getPageUrl(Math.min(totalPages, page + 1), basePath, params)}
        aria-disabled={page >= totalPages}
        className={`rounded-lg border border-stone-200 px-3 py-1.5 text-sm ${
          page >= totalPages ? "pointer-events-none text-stone-300" : "text-stone-600 hover:bg-stone-50"
        }`}
      >
        →
      </Link>
    </nav>
  );
}