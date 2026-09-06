import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider, useData } from './context/DataContext'
import { ExecutiveLayout, ManagementLayout } from './components/layouts'
import { ManagementGuard } from './components/ManagementGuard'
import { ExecutiveHome } from './pages/executive/ExecutiveHome'
import { CutterProfile } from './pages/executive/CutterProfile'
import { ShopExpenseDaily } from './pages/executive/ShopExpenseDaily'
import { ManagementLogin } from './pages/management/ManagementLogin'
import { ManagementOverview } from './pages/management/ManagementOverview'
import { ManagementCutters } from './pages/management/ManagementCutters'
import { ManagementIncome } from './pages/management/ManagementIncome'
import { ManagementExpenses } from './pages/management/ManagementExpenses'
import { ManagementShopExpenses } from './pages/management/ManagementShopExpenses'
import { ManagementStock } from './pages/management/ManagementStock'
import { ManagementMonthly } from './pages/management/ManagementMonthly'
import { Scissors } from 'lucide-react'
import { btnPrimary } from './components/ui'

function BrandLogo({ pulse = false }: { pulse?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${pulse ? 'animate-pulse' : ''}`}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-accent/40 bg-accent-soft text-accent shadow-[0_8px_24px_rgba(201,162,75,0.18)]">
        <Scissors className="h-8 w-8" />
      </div>
      <p className="font-display text-2xl font-bold tracking-wide text-primary">
        Perfect Salon
      </p>
    </div>
  )
}

function AppRoutes() {
  const { loading, error, refresh } = useData()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <BrandLogo pulse />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
        <BrandLogo />
        <div>
          <p className="font-display text-xl font-semibold text-primary">
            Could not connect to Supabase
          </p>
          <p className="mt-2 max-w-md text-sm text-text-muted">{error}</p>
        </div>
        <button type="button" className={btnPrimary} onClick={() => void refresh()}>
          Retry
        </button>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<ExecutiveLayout />}>
          <Route path="/" element={<ExecutiveHome />} />
          <Route path="/cutter/:id" element={<CutterProfile />} />
          <Route path="/shop-expense" element={<ShopExpenseDaily />} />
        </Route>

        <Route path="/management/login" element={<ManagementLogin />} />

        <Route element={<ManagementGuard />}>
          <Route element={<ManagementLayout />}>
            <Route path="/management" element={<ManagementOverview />} />
            <Route path="/management/cutters" element={<ManagementCutters />} />
            <Route path="/management/income" element={<ManagementIncome />} />
            <Route
              path="/management/expenses"
              element={<ManagementExpenses />}
            />
            <Route
              path="/management/shop-expenses"
              element={<ManagementShopExpenses />}
            />
            <Route path="/management/stock" element={<ManagementStock />} />
            <Route
              path="/management/monthly"
              element={<ManagementMonthly />}
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppRoutes />
      </DataProvider>
    </AuthProvider>
  )
}
