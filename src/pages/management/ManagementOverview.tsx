import { useMemo } from 'react'
import { useData } from '../../context/DataContext'
import { currentMonth, formatMoney, todayISO } from '../../lib/utils'
import { SectionCard, StatCard } from '../../components/ui'

export function ManagementOverview() {
  const {
    cutters,
    incomes,
    expenses,
    shopExpenses,
    stock,
    monthlyCosts,
  } = useData()
  const today = todayISO()
  const month = currentMonth()

  const stats = useMemo(() => {
    const incomeToday = incomes
      .filter((i) => i.date === today)
      .reduce((s, i) => s + i.amount, 0)
    const cutterExpToday = expenses
      .filter((e) => e.date === today)
      .reduce((s, e) => s + e.amount, 0)
    const shopToday = shopExpenses
      .filter((e) => e.date === today)
      .reduce((s, e) => s + e.amount, 0)
    const monthlyTotal = monthlyCosts
      .filter((m) => m.month === month)
      .reduce((s, m) => s + m.amount, 0)
    const lowStock = stock.filter((s) => s.quantity <= s.minStock).length
    return { incomeToday, cutterExpToday, shopToday, monthlyTotal, lowStock }
  }, [incomes, expenses, shopExpenses, monthlyCosts, stock, today, month])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Management Overview
        </h1>
        <p className="mt-1 text-text-muted">
          Perfect Salon — daily totals, stock & monthly costs
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Active cutters" value={String(cutters.filter((c) => c.active).length)} />
        <StatCard
          label="Today income (all cutters)"
          value={formatMoney(stats.incomeToday)}
          tone="good"
        />
        <StatCard
          label="Today cutter expense"
          value={formatMoney(stats.cutterExpToday)}
          tone="warn"
        />
        <StatCard
          label="Today shop expense"
          value={formatMoney(stats.shopToday)}
          tone="warn"
        />
        <StatCard
          label={`Monthly costs (${month})`}
          value={formatMoney(stats.monthlyTotal)}
        />
        <StatCard
          label="Low stock items"
          value={String(stats.lowStock)}
          tone={stats.lowStock ? 'warn' : 'good'}
        />
      </div>

      <SectionCard title="What you can manage">
        <ul className="grid gap-2 text-sm text-text-muted sm:grid-cols-2">
          <li>• Add & edit cutters</li>
          <li>• Daily income per cutter</li>
          <li>• Daily expense per cutter</li>
          <li>• Shop expense summary</li>
          <li>• Product stock</li>
          <li>• Shop rent + monthly expenses</li>
        </ul>
      </SectionCard>
    </div>
  )
}
