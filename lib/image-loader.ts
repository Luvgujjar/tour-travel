"use client";

import type { ImageLoaderProps } from "next/image";

export default function unsplashLoader({ src, width, quality }: ImageLoaderProps) {
  const url = new URL(src);
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality || 72));
  return url.href;
}
