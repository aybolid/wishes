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
    // Keep values in higher range (e.g., 127–255)
    rgb[i] = 127 + ((hash >> (i * 8)) & 0x7f); // 0x7f = 127
  }

  const color = `#${rgb.map((c) => c.toString(16).padStart(2, "0")).join("")}`;

  const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
  const isDark = luminance < 128;

  return { color, isDark };
}
