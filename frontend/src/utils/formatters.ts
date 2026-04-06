/**
 * Format tiyn amount to human-readable tenge string
 * e.g. 124000000 tiyn → "1 240 000 ₸"
 */
export function formatMoney(tiyn: number): string {
  const tenge = Math.round(tiyn / 100)
  // Format with space as thousands separator
  const formatted = tenge.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0')
  return `${formatted}\u00A0₸`
}

/**
 * Format phone number to display format
 * e.g. "+77771234567" → "+7 777 123 45 67"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 9)} ${digits.slice(9, 11)}`
  }
  return phone
}

/**
 * Format ISO date string to Russian short format
 * e.g. "2025-01-14" → "14 января"
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'января', 'февраля', 'марта', 'апреля',
    'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

/**
 * Format ISO date with year
 * e.g. "2025-01-14" → "14 января 2025"
 */
export function formatDateFull(dateStr: string): string {
  const date = new Date(dateStr)
  const months = [
    'января', 'февраля', 'марта', 'апреля',
    'мая', 'июня', 'июля', 'августа',
    'сентября', 'октября', 'ноября', 'декабря',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Get number of days until a future date
 * Returns negative if the date is in the past
 */
export function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  // Strip time component
  target.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

/**
 * Format loan type to Russian label
 */
export function formatLoanType(type: string): string {
  const types: Record<string, string> = {
    consumer: 'Потребительский',
    auto: 'Авто',
    mortgage: 'Ипотека',
    micro: 'Микрозайм',
  }
  return types[type] || type
}

/**
 * Format percentage
 * e.g. 0.42 → "42%"
 */
export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
