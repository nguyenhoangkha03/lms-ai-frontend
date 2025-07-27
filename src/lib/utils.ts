import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// gộp các class name
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// định dạng kích thước file
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// định dạng thời gian từ giây thành chuỗi dạng HH:MM:SS hoặc MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// định dạng thời gian so với thời gian hiện tại
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'HH:mm')}`;
  }

  if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'HH:mm')}`;
  }

  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// định dạng theo mẫu chỉ định
export function formatDate(
  date: string | Date,
  formatStr = 'MMM dd, yyyy'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr);
}

// cắt chuỗi văn bản nếu vượt quá độ dài chỉ định, thêm ...
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// tạo slug từ chuỗi văn bản
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // xóa mọi ký tự không phải chữ, số, khoảng trắng, gạch ngang
    .replace(/[\s_-]+/g, '-') // thay thế khoảng trắng, gạch ngang bằng gạch ngang
    .replace(/^-+|-+$/g, ''); // xóa gạch ngang ở đầu và cuối
}

// viết hoa chữ cái đầu tiên của mỗi từ
export function capitalizeWords(text: string): string {
  return text.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

// lấy các chữ cái đầu tiên của mỗi từ
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}

// tạo id ngẫu nhiên
export function generateId(length = 8): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// trì hoãn thực hiện hàm
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// hạn chế số lần thực hiện hàm trong một khoảng thời gian
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// sao chép sâu
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const copy: any = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as any)[key]);
    });
    return copy;
  }
  return obj;
}

// kiểm tra xem một giá trị (chuỗi, mảng, hoặc đối tượng) có rỗng không.
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

// chuyển đổi chuỗi thành màu sắc
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colors = [
    '#F56565',
    '#ED8936',
    '#ECC94B',
    '#48BB78',
    '#38B2AC',
    '#4299E1',
    '#667EEA',
    '#9F7AEA',
    '#ED64A6',
    '#FC8181',
  ];

  return colors[Math.abs(hash) % colors.length];
}

// tính thời gian đọc của văn bảng
export function calculateReadingTime(
  text: string,
  wordsPerMinute = 200
): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

// định dạng phần trăm
export function formatPercentage(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// định dạng tiền tệ
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

// định dạng số
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// lấy phần mở rộng của tệp
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

// kiểm tra xem tệp có trong danh sách các loại tệp được cho phép không
export function isFileTypeAllowed(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

// kiểm tra xem email có hợp lệ không
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// kiểm tra xem URL có hợp lệ không
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// xác định màu chữ tương phản (đen hoặc trắng) cho màu nền
export function getContrastColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '');

  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

// trì hoãn thực hiện hàm
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// thử lại một hàm bất đồng bộ tối đa số lần chỉ định, với độ trễ giữa các lần thử
export async function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await sleep(delay);
      return retry(fn, retries - 1, delay);
    }
    throw error;
  }
}

// kiểm tra xem có đang chạy trong môi trường client hay không
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// lấy thông tin trình duyệt
export function getBrowserInfo() {
  if (!isClient()) return null;

  const userAgent = navigator.userAgent;
  let browserName = 'Unknown';
  let browserVersion = 'Unknown';

  if (userAgent.indexOf('Chrome') > -1) {
    browserName = 'Chrome';
    browserVersion = userAgent.substring(userAgent.indexOf('Chrome') + 7);
    browserVersion = browserVersion.substring(0, browserVersion.indexOf(' '));
  } else if (userAgent.indexOf('Firefox') > -1) {
    browserName = 'Firefox';
    browserVersion = userAgent.substring(userAgent.indexOf('Firefox') + 8);
  } else if (userAgent.indexOf('Safari') > -1) {
    browserName = 'Safari';
    browserVersion = userAgent.substring(userAgent.indexOf('Safari') + 7);
  } else if (userAgent.indexOf('Edge') > -1) {
    browserName = 'Edge';
    browserVersion = userAgent.substring(userAgent.indexOf('Edge') + 5);
  }

  return {
    name: browserName,
    version: browserVersion,
    userAgent: userAgent,
  };
}

// sao chép văn bản vào clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!isClient() || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
