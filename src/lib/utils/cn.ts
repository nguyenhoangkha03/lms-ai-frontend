import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// clsx: gộp lại cả biểu thức
// twMerge: loại trùng
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  const names = name.split(' ');
  const initials = names.map(n => n.charAt(0).toUpperCase());
  return initials.join('');
}
