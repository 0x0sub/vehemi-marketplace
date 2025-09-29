import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format HEMI amounts
export function formatHemi(amount: bigint): string {
  const formatted = Number(amount) / 1e18
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(formatted)
}

// Format time remaining
export function formatTimeRemaining(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = timestamp - now
  
  if (remaining <= 0) {
    return 'Expired'
  }
  
  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  
  if (days > 0) {
    return `${days}d ${hours}h`
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else {
    return `${minutes}m`
  }
}

// Get time remaining in seconds
export function getTimeRemaining(timestamp: number): string {
  return formatTimeRemaining(timestamp)
}

// Get lock duration in human readable format
export function getLockDuration(lockEndTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const duration = lockEndTime - now
  
  if (duration <= 0) {
    return 'Expired'
  }
  
  const days = Math.floor(duration / 86400)
  const hours = Math.floor((duration % 86400) / 3600)
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return 'Less than 1 hour'
  }
}

// Get unlock date category
export function getUnlockDateCategory(lockEndTime: number): string {
  const now = Math.floor(Date.now() / 1000)
  const remaining = lockEndTime - now
  
  if (remaining <= 0) {
    return 'expired'
  } else if (remaining <= 7 * 24 * 3600) { // 7 days
    return 'soon'
  } else if (remaining <= 30 * 24 * 3600) { // 30 days
    return 'month'
  } else if (remaining <= 365 * 24 * 3600) { // 1 year
    return 'year'
  } else {
    return 'long'
  }
}

// Truncate address for display
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
