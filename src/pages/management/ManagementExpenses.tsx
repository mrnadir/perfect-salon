import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { formatMoney } from '../../lib/utils'
import { Field, inputClass, SectionCard, StatCard } from '../../components/ui'

export function ManagementExpenses() {
  const { cutters, expenses } = useData()
  const [cutterFilter, setCutterFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const nameOf = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) || 'Unknown'
  }, [cutters])

  const filtered = useMemo(
    () =>
      expenses.filter(
        (e) =>
          (cutterFilter === 'all' || e.cutterId === cutterFilter) &&
          (!dateFilter || e.date === dateFilter),
      ),
    [expenses, cutterFilter, dateFilter],
  )

  const total = filtered.reduce((s, e) => s + e.amount, 0)

  const byCutter = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of filtered) {
      map.set(e.cutterId, (map.get(e.cutterId) || 0) + e.amount)
    }
    return [...map.entries()]
      .map(([cutterId, amount]) => ({
        cutterId,
        name: nameOf(cutterId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, nameOf])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Total Expense — each cutter
        </h1>
        <p className="mt-1 text-text-muted">
          Daily basis expense summary per cutter
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Cutter">
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

      <StatCard label="Filtered total expense" value={formatMoney(total)} tone="warn" />

      <SectionCard title="Per cutter totals">
        {byCutter.length === 0 ? (
          <p className="text-sm text-text-muted">No expenses for this filter.</p>
        ) : (
          <div className="space-y-2">
            {byCutter.map((row) => (
              <div
                key={row.cutterId}
                className="flex items-center justify-between rounded-xl border border-border/70 px-4 py-3 text-sm"
              >
                <span className="text-text">{row.name}</span>
                <span className="font-medium text-danger">
                  {formatMoney(row.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Expense records" description={`${filtered.length} entries`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Cutter</th>
                  <th className="pb-3 font-medium">Category</th>
                  <th className="pb-3 font-medium">Note</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="py-3 text-text-muted">{e.date}</td>
                    <td className="py-3 text-text">{nameOf(e.cutterId)}</td>
                    <td className="py-3 text-text">{e.category}</td>
                    <td className="py-3 text-text-muted">{e.note || '—'}</td>
                    <td className="py-3 text-right text-danger">
                      {formatMoney(e.amount)}
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
