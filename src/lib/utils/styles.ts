import type { ClassArray } from "clsx";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...v: ClassArray): string {
  return twMerge(clsx(v));
}

export function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const rgb = [0, 0, 0];
  for (let i = 0; i < 3; i++) {
    rgb[i] = (hash >> (i * 8)) & 0xff;
  }

  const color = `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
  const isDark = luminance < 128;

  return { color, isDark };
}
