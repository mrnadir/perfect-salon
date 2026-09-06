import { Check, Minus } from 'lucide-react'
import type { ReactNode } from 'react'

export function StatCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'good' | 'warn'
}) {
  const toneClass =
    tone === 'good'
      ? 'text-success'
      : tone === 'warn'
        ? 'text-danger'
        : 'text-accent'

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(26,26,26,0.04)]">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`mt-2 font-display text-3xl font-semibold ${toneClass}`}>
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-text-muted">{hint}</p> : null}
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: ReactNode
  action?: ReactNode
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-[0_8px_24px_rgba(26,26,26,0.04)] sm:p-6">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold text-primary">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm text-text-muted">{label}</span>
      {children}
    </label>
  )
}

export function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  checked: boolean
  indeterminate?: boolean
  onChange: () => void
  disabled?: boolean
  'aria-label'?: string
}) {
  const active = checked || indeterminate

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onChange}
      className={[
        'inline-flex h-[1.125rem] w-[1.125rem] shrink-0 items-center justify-center rounded-[0.35rem] border transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:cursor-not-allowed disabled:opacity-45',
        active
          ? 'border-accent bg-accent text-primary shadow-[0_1px_2px_rgba(201,162,75,0.35)]'
          : 'border-border bg-surface-muted text-transparent hover:border-accent/55 hover:bg-accent-soft',
      ].join(' ')}
    >
      {indeterminate && !checked ? (
        <Minus className="h-3 w-3 stroke-[3]" />
      ) : (
        <Check
          className={[
            'h-3 w-3 stroke-[3] transition',
            checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75',
          ].join(' ')}
        />
      )}
    </button>
  )
}

export const inputClass =
  'w-full rounded-xl border border-border bg-surface-muted px-3 py-2.5 text-text outline-none transition placeholder:text-text-muted/60 focus:border-accent'

export const selectClass =
  'salon-select w-full appearance-none rounded-xl border border-border bg-surface-muted py-2.5 pr-11 pl-3 text-text outline-none transition focus:border-accent'

export const btnPrimary =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-primary transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50'

export const btnGhost =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm text-text-muted transition hover:border-danger/40 hover:text-danger disabled:cursor-not-allowed'

export const btnSecondary =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text transition hover:border-accent hover:text-navy disabled:cursor-not-allowed'
