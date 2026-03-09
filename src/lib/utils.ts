import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhotoCount(count: number) {
  return `${count.toLocaleString()} photo${count === 1 ? "" : "s"}`;
}

export function formatSelectionCount(selected: number, limit: number) {
  return `${selected}/${limit} selected`;
}
