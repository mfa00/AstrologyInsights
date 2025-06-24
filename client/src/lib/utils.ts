import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ka-GE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatViews(views: number): string {
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}k`;
  }
  return views.toString();
}

export const zodiacSigns = [
  { en: 'aries', ka: 'ვერძი', symbol: '♈' },
  { en: 'taurus', ka: 'ხარი', symbol: '♉' },
  { en: 'gemini', ka: 'ტყუპები', symbol: '♊' },
  { en: 'cancer', ka: 'კანჩხი', symbol: '♋' },
  { en: 'leo', ka: 'ლომი', symbol: '♌' },
  { en: 'virgo', ka: 'ქალწული', symbol: '♍' },
  { en: 'libra', ka: 'სასწორი', symbol: '♎' },
  { en: 'scorpio', ka: 'მორიელი', symbol: '♏' },
  { en: 'sagittarius', ka: 'მშვილდოსანი', symbol: '♐' },
  { en: 'capricorn', ka: 'ღორი', symbol: '♑' },
  { en: 'aquarius', ka: 'წყალმცოცავი', symbol: '♒' },
  { en: 'pisces', ka: 'თევზები', symbol: '♓' }
];
