import { Link, NavLink, Outlet } from 'react-router-dom'
import { LogOut, Scissors, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function BrandMark({ subtitle }: { subtitle: string }) {
  return (
    <Link to="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-accent">
        <Scissors className="h-5 w-5" />
      </div>
      <div>
        <p className="font-display text-xl font-bold tracking-wide text-primary">
          Perfect Salon
        </p>
        <p className="text-xs text-text-muted">{subtitle}</p>
      </div>
    </Link>
  )
}

export function SiteHeader({
  mode,
}: {
  mode: 'executive' | 'management'
}) {
  const { session, logout } = useAuth()

  return (
    <header className="border-b border-border bg-bg/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <BrandMark
          subtitle={
            mode === 'executive' ? 'Executive Desk' : 'Management Desk'
          }
        />

        <div className="flex items-center gap-2">
          {mode === 'executive' ? (
            <Link
              to="/management"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:border-accent hover:text-primary"
            >
              <Shield className="h-4 w-4 text-accent" />
              Management Desk
            </Link>
          ) : (
            <>
              <Link
                to="/"
                className="rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:border-accent hover:text-primary"
              >
                Executive Desk
              </Link>
              {session ? (
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-text-muted transition hover:border-accent hover:text-primary"
                >
                  <LogOut className="h-4 w-4 text-accent" />
                  Logout
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </header>
  )
}

function DeskNav({
  items,
}: {
  items: { to: string; label: string; end?: boolean }[]
}) {
  return (
    <nav className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 py-2 sm:px-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2 text-sm whitespace-nowrap transition',
                isActive
                  ? 'bg-navy text-white'
                  : 'text-text-muted hover:bg-accent-soft hover:text-primary',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function ExecutiveLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader mode="executive" />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}

export function ManagementLayout() {
  return (
    <div className="min-h-screen bg-bg text-text">
      <SiteHeader mode="management" />
      <DeskNav
        items={[
          { to: '/management', label: 'Overview', end: true },
          { to: '/management/cutters', label: 'Cutters' },
          { to: '/management/income', label: 'Cutter Income' },
          { to: '/management/expenses', label: 'Cutter Expense' },
          { to: '/management/shop-expenses', label: 'Shop Expense' },
          { to: '/management/stock', label: 'Cosmetics Stock' },
          { to: '/management/monthly', label: 'Rent & Monthly' },
        ]}
      />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  )
}
