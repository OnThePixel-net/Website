import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length > 1) {
    return words[0][0] + words[1][0];
  } else {
    return name.substring(0, 2);
  }
}
