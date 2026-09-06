import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { PackagePlus, Pencil, Trash2, X } from 'lucide-react'
import { ConfirmDeleteModal } from '../../components/ConfirmDeleteModal'
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
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StockItem | null>(null)
  const [deleting, setDeleting] = useState(false)

  function openAdd() {
    setEditingId(null)
    setForm(empty)
    setError(null)
    setOpen(true)
  }

  function openEdit(item: StockItem) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      quantity: String(item.quantity),
      unit: item.unit,
      minStock: String(item.minStock),
    })
    setError(null)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setEditingId(null)
    setForm(empty)
    setError(null)
  }

  function closeDelete() {
    if (deleting) return
    setDeleteTarget(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStockItem(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
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
      closeModal()
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
    closeModal()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-primary">
            Product Stock
          </h1>
          <p className="mt-1 text-text-muted">
            Track blades, gel, face wash and other products
          </p>
        </div>

        <button type="button" onClick={openAdd} className={btnPrimary}>
          <PackagePlus className="h-4 w-4" />
          Add product
        </button>
      </div>

      <SectionCard title="Current stock" description={`${stock.length} items`}>
        {stock.length === 0 ? (
          <p className="text-sm text-text-muted">No stock items yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-3 font-medium">Product</th>
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
                            onClick={() => openEdit(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className={btnGhost}
                            onClick={() => setDeleteTarget(item)}
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

      <StockFormModal
        open={open}
        editing={Boolean(editingId)}
        form={form}
        error={error}
        onClose={closeModal}
        onChange={setForm}
        onSubmit={onSubmit}
      />

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        eyebrow="Delete product"
        message={
          <>
            Delete{' '}
            <span className="font-semibold text-text">
              {deleteTarget?.name}
            </span>
            ? This cannot be undone.
          </>
        }
        deleting={deleting}
        onClose={closeDelete}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  )
}

function StockFormModal({
  open,
  editing,
  form,
  error,
  onClose,
  onChange,
  onSubmit,
}: {
  open: boolean
  editing: boolean
  form: typeof empty
  error: string | null
  onClose: () => void
  onChange: (form: typeof empty) => void
  onSubmit: (e: FormEvent) => void
}) {
  const titleId = useId()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const t = window.setTimeout(() => nameRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open, editing])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-[2px]"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-bg p-5 shadow-2xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              {editing ? 'Edit product' : 'New product'}
            </p>
            <h2 id={titleId} className="mt-1 text-xl font-bold text-primary">
              {editing ? 'Edit product' : 'Add product'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-muted transition hover:bg-surface-muted hover:text-primary"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <Field label="Product name">
            <input
              ref={nameRef}
              className={inputClass}
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
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
              onChange={(e) => onChange({ ...form, quantity: e.target.value })}
              required
            />
          </Field>
          <Field label="Unit">
            <input
              className={inputClass}
              value={form.unit}
              onChange={(e) => onChange({ ...form, unit: e.target.value })}
              placeholder="pcs / bottle"
            />
          </Field>
          <Field label="Min stock alert">
            <input
              type="number"
              min="0"
              className={inputClass}
              value={form.minStock}
              onChange={(e) => onChange({ ...form, minStock: e.target.value })}
            />
          </Field>

          {error ? (
            <p className="sm:col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <div className="flex gap-2 pt-1 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-text-muted transition hover:bg-surface-muted"
            >
              Cancel
            </button>
            <button type="submit" className={`${btnPrimary} flex-1`}>
              {editing ? (
                <>
                  <Pencil className="h-4 w-4" />
                  Save changes
                </>
              ) : (
                <>
                  <PackagePlus className="h-4 w-4" />
                  Add product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
