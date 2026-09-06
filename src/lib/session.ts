import type { AdminSession } from '../types'

const SESSION_KEY = 'perfect_salon_mgmt_session'

export const ADMIN = {
  username: 'admin',
  password: 'admin123',
}

export function getSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AdminSession
  } catch {
    return null
  }
}

export function saveSession(session: AdminSession | null) {
  if (!session) {
    localStorage.removeItem(SESSION_KEY)
    return
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}
