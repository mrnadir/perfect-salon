import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { formatMoney } from '../../lib/utils'
import { Field, inputClass, SectionCard, StatCard } from '../../components/ui'

export function ManagementShopExpenses() {
  const { cutters, shopExpenses } = useData()
  const [dateFilter, setDateFilter] = useState('')
  const [cutterFilter, setCutterFilter] = useState('all')

  const cutterName = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id?: string) => (id ? map.get(id) : undefined) || '—'
  }, [cutters])

  const filtered = useMemo(
    () =>
      shopExpenses.filter(
        (e) =>
          (cutterFilter === 'all' || e.addedByCutterId === cutterFilter) &&
          (!dateFilter || e.date === dateFilter),
      ),
    [shopExpenses, cutterFilter, dateFilter],
  )

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const byCutter = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      const key = e.addedByCutterId || 'unknown'
      map.set(key, (map.get(key) || 0) + e.amount)
    }
    return [...map.entries()]
      .map(([id, amount]) => ({
        id,
        name: id === 'unknown' ? 'Unknown' : cutterName(id),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, cutterName])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Shop Expense Summary
        </h1>
        <p className="mt-1 text-text-muted">
          Overview of shop expenses — amount, purpose, and who added
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Added by">
          <select
            className={inputClass}
            value={cutterFilter}
            onChange={(e) => setCutterFilter(e.target.value)}
          >
            <option value="all">All cutters</option>
            {cutters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Date">
          <input
            type="date"
            className={inputClass}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted"
            onClick={() => {
              setCutterFilter('all')
              setDateFilter('')
            }}
          >
            Clear filters
          </button>
        </div>
      </div>

      <StatCard
        label="Filtered shop expense"
        value={formatMoney(total)}
        tone="warn"
      />

      <SectionCard title="By cutter">
        {byCutter.length === 0 ? (
          <p className="text-sm text-text-muted">No data.</p>
        ) : (
          <div className="space-y-2">
            {byCutter.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 text-sm"
              >
                <span className="text-text">{row.name}</span>
                <span className="font-medium text-primary">
                  {formatMoney(row.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="All shop expenses"
        description={`${filtered.length} entries`}
      >
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Purpose / Notes</th>
                  <th className="pb-3 font-medium">Added by</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="py-3 text-text-muted">{e.date}</td>
                    <td className="py-3 font-medium text-primary">
                      {formatMoney(e.amount)}
                    </td>
                    <td className="py-3 text-text">{e.note || '—'}</td>
                    <td className="py-3 text-text-muted">
                      {cutterName(e.addedByCutterId)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
