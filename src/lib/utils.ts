import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { differenceInCalendarDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(yen: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(yen)
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateStr))
}

export function formatDateTime(dateStr: string): string {
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'たった今'
  if (diffMins < 60) return `${diffMins}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  if (diffDays < 7) return `${diffDays}日前`
  return formatDate(dateStr)
}

export function calcTotalPrice(rentalPrice: number): number {
  return rentalPrice
}

export function calcCancelFee(totalPrice: number, useDate: string): number {
  const daysUntilUse = differenceInCalendarDays(new Date(useDate), new Date())

  if (daysUntilUse >= 7) return 0
  if (daysUntilUse >= 3) return Math.floor(totalPrice * 0.3)
  if (daysUntilUse >= 1) return Math.floor(totalPrice * 0.5)
  return totalPrice
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength) + '…'
}
