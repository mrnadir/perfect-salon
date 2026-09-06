import { useState, type FormEvent } from 'react'
import { PackagePlus, Pencil, Trash2 } from 'lucide-react'
import { useData } from '../../context/DataContext'
import type { StockItem } from '../../types'
import {
  btnGhost,
  btnPrimary,
  btnSecondary,
  Field,
  inputClass,
  SectionCard,
} from '../../components/ui'

const empty = { name: '', quantity: '', unit: 'pcs', minStock: '5' }

export function ManagementStock() {
  const { stock, addStockItem, updateStockItem, deleteStockItem } = useData()
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function startEdit(item: StockItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      minStock: String(item.minStock),
    })
    setError(null)
  }

  function reset() {
    setEditingId(null)
    setForm(empty)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const quantity = Number(form.quantity)
    const minStock = Number(form.minStock)
    if (Number.isNaN(quantity) || quantity < 0) {
      setError('Quantity must be 0 or more')
      return
    }

    if (editingId) {
      await updateStockItem(editingId, {
        name: form.name,
        quantity,
        unit: form.unit,
        minStock: Number.isNaN(minStock) ? 0 : minStock,
      })
      reset()
      setError(null)
      return
    }

    const err = await addStockItem({
      name: form.name,
      quantity,
      unit: form.unit,
      minStock: Number.isNaN(minStock) ? 0 : minStock,
    })
    if (err) {
      setError(err)
      return
    }
    setError(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold text-primary">
          Shop Cosmetics Stock
        </h1>
        <p className="mt-1 text-text-muted">
          Track blades, gel, face wash and other items
        </p>
      </div>

      <SectionCard
        title={editingId ? 'Edit item' : 'Add stock item'}
        action={
          editingId ? (
            <button type="button" className={btnSecondary} onClick={reset}>
              Cancel
            </button>
          ) : null
        }
      >
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Item name">
            <input
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Blade / Gel / Face wash"
              required
            />
          </Field>
          <Field label="Quantity">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              required
            />
          </Field>
          <Field label="Unit">
            <input
              className={inputClass}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="pcs / bottle"
            />
          </Field>
          <Field label="Min stock alert">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
          </Field>
          {error ? (
            <p className="sm:col-span-2 lg:col-span-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <div className="sm:col-span-2 lg:col-span-4">
            <button type="submit" className={btnPrimary}>
              {editingId ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Save item
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  Add item
                </>
              )}
            </button>
          </div>
        </form>
      </SectionCard>

      <SectionCard title="Current stock" description={`${stock.length} items`}>
        {stock.length === 0 ? (
          <p className="text-sm text-text-muted">No stock items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Item</th>
                  <th className="pb-3 font-medium">Qty</th>
                  <th className="pb-3 font-medium">Unit</th>
                  <th className="pb-3 font-medium">Min</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {stock.map((item) => {
                  const low = item.quantity <= item.minStock
                  return (
                    <tr key={item.id} className="border-b border-border/60">
                      <td className="py-3 text-text">{item.name}</td>
                      <td className="py-3 text-text">{item.quantity}</td>
                      <td className="py-3 text-text-muted">{item.unit}</td>
                      <td className="py-3 text-text-muted">{item.minStock}</td>
                      <td className="py-3">
                        <span className={low ? 'text-danger' : 'text-success'}>
                          {low ? 'Low' : 'OK'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className={btnSecondary}
                            onClick={() => startEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => {
                              if (confirm(`Delete ${item.name}?`)) {
                                deleteStockItem(item.id)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
