// ============================================
// Validators - Form validation utilities
// ============================================

/**
 * Validate required field
 */
export function required(message = '필수 입력 항목입니다.') {
  return (val: unknown) => {
    if (val === null || val === undefined) return message;
    if (typeof val === 'string' && val.trim().length === 0) return message;
    if (Array.isArray(val) && val.length === 0) return message;
    return true;
  };
}

/**
 * Validate email format
 */
export function email(message = '올바른 이메일 형식이 아닙니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty (use with required() if needed)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(val) || message;
  };
}

/**
 * Validate URL format
 */
export function url(message = '올바른 URL 형식이 아닙니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    try {
      new URL(val);
      return true;
    } catch {
      return message;
    }
  };
}

/**
 * Validate minimum length
 */
export function minLength(min: number, message?: string) {
  return (val: string) => {
    if (!val) return true; // Allow empty
    const msg = message || `최소 ${min}자 이상 입력해주세요.`;
    return val.length >= min || msg;
  };
}

/**
 * Validate maximum length
 */
export function maxLength(max: number, message?: string) {
  return (val: string) => {
    if (!val) return true; // Allow empty
    const msg = message || `최대 ${max}자까지 입력 가능합니다.`;
    return val.length <= max || msg;
  };
}

/**
 * Validate exact length
 */
export function exactLength(length: number, message?: string) {
  return (val: string) => {
    if (!val) return true; // Allow empty
    const msg = message || `정확히 ${length}자를 입력해주세요.`;
    return val.length === length || msg;
  };
}

/**
 * Validate minimum value
 */
export function minValue(min: number, message?: string) {
  return (val: number) => {
    if (val === null || val === undefined) return true; // Allow empty
    const msg = message || `최소값은 ${min}입니다.`;
    return val >= min || msg;
  };
}

/**
 * Validate maximum value
 */
export function maxValue(max: number, message?: string) {
  return (val: number) => {
    if (val === null || val === undefined) return true; // Allow empty
    const msg = message || `최대값은 ${max}입니다.`;
    return val <= max || msg;
  };
}

/**
 * Validate number only
 */
export function numeric(message = '숫자만 입력 가능합니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    return /^\d+$/.test(val) || message;
  };
}

/**
 * Validate alphanumeric only
 */
export function alphanumeric(message = '영문자와 숫자만 입력 가능합니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    return /^[a-zA-Z0-9]+$/.test(val) || message;
  };
}

/**
 * Validate phone number (Korean format)
 */
export function phoneNumber(message = '올바른 전화번호 형식이 아닙니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    // Korean phone number formats: 010-1234-5678, 02-123-4567, etc.
    const phoneRegex = /^(\d{2,3})-(\d{3,4})-(\d{4})$/;
    return phoneRegex.test(val) || message;
  };
}

/**
 * Validate password strength
 * - At least 8 characters
 * - Contains uppercase, lowercase, number
 */
export function password(
  message = '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를 포함해야 합니다.'
) {
  return (val: string) => {
    if (!val) return true; // Allow empty
    if (val.length < 8) return message;
    if (!/[a-z]/.test(val)) return message;
    if (!/[A-Z]/.test(val)) return message;
    if (!/\d/.test(val)) return message;
    return true;
  };
}

/**
 * Validate password confirmation
 */
export function passwordConfirm(
  passwordValue: string,
  message = '비밀번호가 일치하지 않습니다.'
) {
  return (val: string) => {
    return val === passwordValue || message;
  };
}

/**
 * Validate date range (start date must be before end date)
 */
export function dateRange(
  startDate: string | Date | null,
  endDate: string | Date | null,
  message = '시작일은 종료일보다 이전이어야 합니다.'
) {
  if (!startDate || !endDate) return true;
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return start <= end || message;
}

/**
 * Validate IP address
 */
export function ipAddress(message = '올바른 IP 주소 형식이 아닙니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(val) || message;
  };
}

/**
 * Validate port number
 */
export function portNumber(message = '올바른 포트 번호가 아닙니다 (1-65535).') {
  return (val: number) => {
    if (val === null || val === undefined) return true; // Allow empty
    return (val >= 1 && val <= 65535) || message;
  };
}

/**
 * Validate repository URL (Git)
 */
export function repositoryUrl(message = '올바른 Git 저장소 URL이 아닙니다.') {
  return (val: string) => {
    if (!val) return true; // Allow empty
    const gitRegex =
      /^(https?:\/\/)?(www\.)?(github|gitlab|bitbucket)\.com\/[\w\-.]+\/[\w\-.]+(.git)?$/i;
    return gitRegex.test(val) || message;
  };
}

/**
 * Custom validator combinator
 */
export function combine(...validators: ((val: unknown) => true | string)[]) {
  return (val: unknown) => {
    for (const validator of validators) {
      const result = validator(val);
      if (result !== true) return result;
    }
    return true;
  };
}
