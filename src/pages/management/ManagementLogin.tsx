import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { SiteHeader } from '../../components/layouts'
import { btnPrimary, Field, inputClass } from '../../components/ui'

export function ManagementLogin() {
  const { session, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (session) return <Navigate to="/management" replace />

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(login(username, password))
  }

  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader mode="management" />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-accent">
            <Scissors className="h-7 w-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Management Desk
          </h1>
          <p className="mt-2 text-sm text-text-muted">
            Secure access for Perfect Salon management
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_30px_rgba(26,26,26,0.06)]"
        >
          <Field label="Username">
            <input
              className={inputClass}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </Field>
          {error ? (
            <p className="rounded-lg border border-danger/20 bg-danger/5 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button type="submit" className={`${btnPrimary} w-full`}>
            Login
          </button>
          <p className="text-center text-xs text-text-muted">
            Demo: <span className="text-primary">admin / admin123</span>
          </p>
        </form>
      </div>
    </div>
  )
}
