import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** รวมและแก้ความขัดแย้งของ Tailwind CSS class names ก่อนส่งให้ React */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
