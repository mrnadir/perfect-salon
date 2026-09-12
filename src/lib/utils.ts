export function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function currentMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function formatMoney(amount: number) {
  const formatted = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 0,
  }).format(amount)
  return `৳${formatted}`
}

/** Remove leftover salon data keys from the old localStorage backend. */
export function clearLegacyLocalData() {
  const legacyKeys = [
    'perfect_salon_cutters',
    'perfect_salon_incomes',
    'perfect_salon_expenses',
    'perfect_salon_shop_expenses',
    'perfect_salon_stock',
    'perfect_salon_monthly',
  ] as const

  for (const key of legacyKeys) {
    localStorage.removeItem(key)
  }
}
