// ============================================
// Formatters - Date, time, number formatting utilities
// ============================================

import { format, formatDistance, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

// ============================================
// Date & Time Formatters
// ============================================

/**
 * Format date to Korean format (YYYY년 MM월 DD일)
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy년 MM월 dd일', { locale: ko });
  } catch {
    return '-';
  }
}

/**
 * Format date to short format (YYYY-MM-DD)
 */
export function formatDateShort(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd');
  } catch {
    return '-';
  }
}

/**
 * Format datetime to Korean format (YYYY년 MM월 DD일 HH:mm)
 */
export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy년 MM월 dd일 HH:mm', { locale: ko });
  } catch {
    return '-';
  }
}

/**
 * Format datetime to short format (YYYY-MM-DD HH:mm)
 */
export function formatDateTimeShort(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'yyyy-MM-dd HH:mm');
  } catch {
    return '-';
  }
}

/**
 * Format time only (HH:mm:ss)
 */
export function formatTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm:ss');
  } catch {
    return '-';
  }
}

/**
 * Format relative time (e.g., "2시간 전", "3일 전")
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistance(d, new Date(), {
      addSuffix: true,
      locale: ko,
    });
  } catch {
    return '-';
  }
}

/**
 * Format custom date pattern
 */
export function formatCustom(
  date: string | Date | null | undefined,
  pattern: string
): string {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern, { locale: ko });
  } catch {
    return '-';
  }
}

// ============================================
// Number Formatters
// ============================================

/**
 * Format number with thousand separators (1,234,567)
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('ko-KR').format(value);
}

/**
 * Format number as currency (₩1,234,567)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(value);
}

/**
 * Format number as percentage (12.34%)
 */
export function formatPercentage(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format file size (bytes to KB, MB, GB)
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined || bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format duration in seconds to HH:mm:ss
 */
export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '-';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

// ============================================
// String Formatters
// ============================================

/**
 * Truncate string with ellipsis
 */
export function truncate(
  str: string | null | undefined,
  maxLength: number
): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string | null | undefined): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert to title case
 */
export function titleCase(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}
