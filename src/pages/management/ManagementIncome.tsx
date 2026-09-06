import { useMemo, useState } from 'react'
import { useData } from '../../context/DataContext'
import { formatMoney } from '../../lib/utils'
import { Field, inputClass, SectionCard, selectClass, StatCard } from '../../components/ui'

export function ManagementIncome() {
  const { cutters, incomes } = useData()
  const [cutterFilter, setCutterFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  const nameOf = useMemo(() => {
    const map = new Map(cutters.map((c) => [c.id, c.name]))
    return (id: string) => map.get(id) || 'Unknown'
  }, [cutters])

  const filtered = useMemo(
    () =>
      incomes.filter(
        (i) =>
          (cutterFilter === 'all' || i.cutterId === cutterFilter) &&
          (!dateFilter || i.date === dateFilter),
      ),
    [incomes, cutterFilter, dateFilter],
  )

  const total = filtered.reduce((s, i) => s + i.amount, 0)

  const byCutter = useMemo(() => {
    const map = new Map<string, number>()
    for (const i of filtered) {
      map.set(i.cutterId, (map.get(i.cutterId) || 0) + i.amount)
    }
    return [...map.entries()]
      .map(([cutterId, amount]) => ({
        cutterId,
        name: nameOf(cutterId),
        amount,
      }))
      .sort((a, b) => b.amount - a.amount)
  }, [filtered, nameOf])

  const hasFilters = cutterFilter !== 'all' || Boolean(dateFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-semibold text-primary">
            Total Income
          </h1>
          <p className="mt-1 text-text-muted">
            Daily basis income summary per cutter
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <Field label="Cutter">
            <select
              className={`${selectClass} min-w-[10rem]`}
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
          <button
            type="button"
            disabled={!hasFilters}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-text-muted transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            onClick={() => {
              setCutterFilter('all')
              setDateFilter('')
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <StatCard label="Filtered total income" value={formatMoney(total)} tone="good" />

      <SectionCard title="Per cutter totals">
        {byCutter.length === 0 ? (
          <p className="text-sm text-text-muted">No income for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Cutter</th>
                  <th className="pb-3 font-medium text-right">Total income</th>
                </tr>
              </thead>
              <tbody>
                {byCutter.map((row) => (
                  <tr key={row.cutterId} className="border-b border-border/60">
                    <td className="py-3 text-text">{row.name}</td>
                    <td className="py-3 text-right font-medium text-success">
                      {formatMoney(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="Income records" description={`${filtered.length} entries`}>
        {filtered.length === 0 ? (
          <p className="text-sm text-text-muted">No records.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Cutter</th>
                  <th className="pb-3 font-medium">Note</th>
                  <th className="pb-3 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-border/60">
                    <td className="py-3 text-text-muted">{i.date}</td>
                    <td className="py-3 text-text">{nameOf(i.cutterId)}</td>
                    <td className="py-3 text-text-muted">{i.note || '—'}</td>
                    <td className="py-3 text-right text-success">
                      {formatMoney(i.amount)}
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
