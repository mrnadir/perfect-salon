import { supabase } from './supabase'
import type {
  Cutter,
  CutterExpense,
  CutterIncome,
  MonthlyCost,
  ShopExpense,
  StockItem,
} from '../types'

function num(value: unknown) {
  return typeof value === 'number' ? value : Number(value)
}

function mapCutter(row: Record<string, unknown>): Cutter {
  return {
    id: String(row.id),
    name: String(row.name),
    phone: row.phone ? String(row.phone) : undefined,
    specialty: row.specialty ? String(row.specialty) : undefined,
    notes: row.notes ? String(row.notes) : undefined,
    active: Boolean(row.active),
    createdAt: String(row.created_at),
  }
}

function mapIncome(row: Record<string, unknown>): CutterIncome {
  return {
    id: String(row.id),
    cutterId: String(row.cutter_id),
    amount: num(row.amount),
    note: String(row.note ?? ''),
    date: String(row.date),
    createdAt: String(row.created_at),
  }
}

function mapExpense(row: Record<string, unknown>): CutterExpense {
  return {
    id: String(row.id),
    cutterId: String(row.cutter_id),
    amount: num(row.amount),
    category: String(row.category ?? ''),
    note: String(row.note ?? ''),
    date: String(row.date),
    createdAt: String(row.created_at),
  }
}

function mapShopExpense(row: Record<string, unknown>): ShopExpense {
  return {
    id: String(row.id),
    amount: num(row.amount),
    note: String(row.note ?? ''),
    addedByCutterId: String(row.added_by_cutter_id),
    date: String(row.date),
    createdAt: String(row.created_at),
  }
}

function mapStock(row: Record<string, unknown>): StockItem {
  return {
    id: String(row.id),
    name: String(row.name),
    quantity: num(row.quantity),
    unit: String(row.unit ?? 'pcs'),
    minStock: num(row.min_stock),
    updatedAt: String(row.updated_at),
  }
}

function mapMonthly(row: Record<string, unknown>): MonthlyCost {
  return {
    id: String(row.id),
    label: String(row.label),
    amount: num(row.amount),
    month: String(row.month),
    kind: row.kind === 'rent' ? 'rent' : 'other',
    note: String(row.note ?? ''),
    createdAt: String(row.created_at),
  }
}

export async function fetchAllData() {
  const [
    cuttersRes,
    incomesRes,
    expensesRes,
    shopRes,
    stockRes,
    monthlyRes,
  ] = await Promise.all([
    supabase.from('cutters').select('*').order('created_at', { ascending: true }),
    supabase.from('incomes').select('*').order('created_at', { ascending: false }),
    supabase.from('expenses').select('*').order('created_at', { ascending: false }),
    supabase
      .from('shop_expenses')
      .select('*')
      .order('created_at', { ascending: false }),
    supabase.from('stock').select('*').order('updated_at', { ascending: false }),
    supabase
      .from('monthly_costs')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const firstError =
    cuttersRes.error ||
    incomesRes.error ||
    expensesRes.error ||
    shopRes.error ||
    stockRes.error ||
    monthlyRes.error

  if (firstError) throw firstError

  return {
    cutters: (cuttersRes.data ?? []).map((r) => mapCutter(r as Record<string, unknown>)),
    incomes: (incomesRes.data ?? []).map((r) => mapIncome(r as Record<string, unknown>)),
    expenses: (expensesRes.data ?? []).map((r) =>
      mapExpense(r as Record<string, unknown>),
    ),
    shopExpenses: (shopRes.data ?? []).map((r) =>
      mapShopExpense(r as Record<string, unknown>),
    ),
    stock: (stockRes.data ?? []).map((r) => mapStock(r as Record<string, unknown>)),
    monthlyCosts: (monthlyRes.data ?? []).map((r) =>
      mapMonthly(r as Record<string, unknown>),
    ),
  }
}

export async function insertCutter(c: Cutter) {
  const { error } = await supabase.from('cutters').insert({
    id: c.id,
    name: c.name,
    phone: c.phone ?? null,
    specialty: c.specialty ?? null,
    notes: c.notes ?? null,
    active: c.active,
    created_at: c.createdAt,
  })
  if (error) throw error
}

export async function patchCutter(
  id: string,
  data: Partial<Omit<Cutter, 'id' | 'createdAt'>>,
) {
  const payload: Record<string, unknown> = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.phone !== undefined) payload.phone = data.phone || null
  if (data.specialty !== undefined) payload.specialty = data.specialty || null
  if (data.notes !== undefined) payload.notes = data.notes || null
  if (data.active !== undefined) payload.active = data.active

  const { error } = await supabase.from('cutters').update(payload).eq('id', id)
  if (error) throw error
}

export async function insertIncome(i: CutterIncome) {
  const { error } = await supabase.from('incomes').insert({
    id: i.id,
    cutter_id: i.cutterId,
    amount: i.amount,
    note: i.note,
    date: i.date,
    created_at: i.createdAt,
  })
  if (error) throw error
}

export async function deleteIncomeRow(id: string) {
  const { error } = await supabase.from('incomes').delete().eq('id', id)
  if (error) throw error
}

export async function insertExpense(e: CutterExpense) {
  const { error } = await supabase.from('expenses').insert({
    id: e.id,
    cutter_id: e.cutterId,
    amount: e.amount,
    category: e.category,
    note: e.note,
    date: e.date,
    created_at: e.createdAt,
  })
  if (error) throw error
}

export async function deleteExpenseRow(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw error
}

export async function insertShopExpense(e: ShopExpense) {
  const { error } = await supabase.from('shop_expenses').insert({
    id: e.id,
    amount: e.amount,
    note: e.note,
    added_by_cutter_id: e.addedByCutterId,
    date: e.date,
    created_at: e.createdAt,
  })
  if (error) throw error
}

export async function deleteShopExpenseRow(id: string) {
  const { error } = await supabase.from('shop_expenses').delete().eq('id', id)
  if (error) throw error
}

export async function insertStockItem(s: StockItem) {
  const { error } = await supabase.from('stock').insert({
    id: s.id,
    name: s.name,
    quantity: s.quantity,
    unit: s.unit,
    min_stock: s.minStock,
    updated_at: s.updatedAt,
  })
  if (error) throw error
}

export async function patchStockItem(
  id: string,
  data: Partial<Pick<StockItem, 'name' | 'quantity' | 'unit' | 'minStock'>> & {
    updatedAt: string
  },
) {
  const payload: Record<string, unknown> = { updated_at: data.updatedAt }
  if (data.name !== undefined) payload.name = data.name
  if (data.quantity !== undefined) payload.quantity = data.quantity
  if (data.unit !== undefined) payload.unit = data.unit
  if (data.minStock !== undefined) payload.min_stock = data.minStock

  const { error } = await supabase.from('stock').update(payload).eq('id', id)
  if (error) throw error
}

export async function deleteStockRow(id: string) {
  const { error } = await supabase.from('stock').delete().eq('id', id)
  if (error) throw error
}

export async function insertMonthlyCost(m: MonthlyCost) {
  const { error } = await supabase.from('monthly_costs').insert({
    id: m.id,
    label: m.label,
    amount: m.amount,
    month: m.month,
    kind: m.kind,
    note: m.note,
    created_at: m.createdAt,
  })
  if (error) throw error
}

export async function deleteMonthlyCostRow(id: string) {
  const { error } = await supabase.from('monthly_costs').delete().eq('id', id)
  if (error) throw error
}
