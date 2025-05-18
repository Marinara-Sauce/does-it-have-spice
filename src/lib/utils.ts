
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(input?: string | null) {
  if (!input) return null;

  return input
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function isSystemDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function isDarkMode(theme: string | undefined) {
  if (!theme) return isSystemDarkMode();
  return theme === 'dark' || (theme === 'system' && isSystemDarkMode());
}
