import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Link } from 'react-router-dom'
import { useAuthContext } from '../../hooks/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts'
import {
  Wallet, ShoppingBag, TrendingUp, Package, ChevronDown,
  DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

type Period = 'this-month' | 'last-month' | '3-months' | '6-months' | '1-year'

interface KpiData {
  ingresos: number
  ganancia: number
  pedidosAtendidos: number
  productosVendidos: number
  ingresosPrevios: number
  pedidosPrevios: number
}

interface DailySale {
  fecha: string
  ingresos: number
  ganancia: number
}

interface StatusCount {
  name: string
  value: number
  color: string
}

interface TopProduct {
  nombre: string
  cantidad: number
  ingresos: number
}

interface CategorySale {
  nombre: string
  ingresos: number
  color: string
}

interface BrandSale {
  nombre: string
  ingresos: number
  color: string
}

interface MonthlyTrend {
  mes: string
  ingresos: number
}

interface InventoryItem {
  id_producto: number
  nombre_producto: string
  stock_actual: number
  precio_producto: number
  precio_compra: number | null
}

interface PendingOrder {
  id_pedido: number
  fecha: string
  monto_total: number
  estado_pago: string
  usuario: { nombre_persona: string } | null
}

interface ExpiringOffer {
  id_oferta: number
  producto_nombre: string
  precio_oferta: number
  precio_original: number
  fecha_fin: string
}

interface WeeklyComparison {
  semana: string
  actual: number
  anterior: number
}

interface YearComparison {
  mes: string
  actual: number
  anterior: number
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16']

const periodLabels: Record<Period, string> = {
  'this-month': 'Este mes',
  'last-month': 'Mes anterior',
  '3-months': 'Últimos 3 meses',
  '6-months': 'Últimos 6 meses',
  '1-year': 'Último año',
}

const STATUS_COLORS: Record<string, string> = {
  pendiente: '#F59E0B',
  PAGADO: '#10B981',
  atendido: '#3B82F6',
  rechazado: '#EF4444',
}

function getPeriodRange(period: Period) {
  const now = new Date()
  let start: Date
  let prevStart: Date
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

  switch (period) {
    case 'this-month':
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      break
    case 'last-month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
      break
    case '3-months': {
      const d3 = new Date(now)
      d3.setMonth(d3.getMonth() - 3)
      start = d3
      const d3p = new Date(start)
      d3p.setMonth(d3p.getMonth() - 3)
      prevStart = d3p
      break
    }
    case '6-months': {
      const d6 = new Date(now)
      d6.setMonth(d6.getMonth() - 6)
      start = d6
      const d6p = new Date(start)
      d6p.setMonth(d6p.getMonth() - 6)
      prevStart = d6p
      break
    }
    case '1-year': {
      const d1 = new Date(now)
      d1.setFullYear(d1.getFullYear() - 1)
      start = d1
      const d1p = new Date(start)
      d1p.setFullYear(d1p.getFullYear() - 1)
      prevStart = d1p
      break
    }
  }

  return { start: start.toISOString(), end: end.toISOString(), prevStart: prevStart.toISOString() }
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 }).format(n)
}

export default function AdminDashboard() {
  const { user } = useAuthContext()
  const [period, setPeriod] = useState<Period>('this-month')
  const [showPeriodOptions, setShowPeriodOptions] = useState(false)

  const [kpi, setKpi] = useState<KpiData>({
    ingresos: 0, ganancia: 0, pedidosAtendidos: 0, productosVendidos: 0,
    ingresosPrevios: 0, pedidosPrevios: 0,
  })
  const [dailySales, setDailySales] = useState<DailySale[]>([])
  const [statusData, setStatusData] = useState<StatusCount[]>([])
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [categorySales, setCategorySales] = useState<CategorySale[]>([])
  const [brandSales, setBrandSales] = useState<BrandSale[]>([])
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([])
  const [weeklyComparison, setWeeklyComparison] = useState<WeeklyComparison[]>([])
  const [yearComparison, setYearComparison] = useState<YearComparison[]>([])
  const [lowStock, setLowStock] = useState<InventoryItem[]>([])
  const [noStock, setNoStock] = useState<InventoryItem[]>([])
  const [recentProducts, setRecentProducts] = useState<InventoryItem[]>([])
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([])
  const [lossProducts, setLossProducts] = useState<InventoryItem[]>([])
  const [expiringOffers, setExpiringOffers] = useState<ExpiringOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingComplementary, setLoadingComplementary] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    const { start, end, prevStart } = getPeriodRange(period)
    const prevEnd = new Date(new Date(start).getTime() - 86400000).toISOString()

    const today = new Date()
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()

    try {
      const [
        atendidosRes,
        prevAtendidosRes,
        detallesRes,
        prevDetallesRes,
        statusRes,
        dailyRes,
        recentRes,
        allAttendedRes,
        catBrandRes,
      ] = await Promise.all([
        supabase.from('pedido').select('monto_total').eq('estado_pago', 'atendido').gte('fecha', start).lte('fecha', end),
        supabase.from('pedido').select('monto_total').eq('estado_pago', 'atendido').gte('fecha', prevStart).lte('fecha', prevEnd),
        supabase
          .from('pedidodetalles')
          .select('cantidad_pedido, producto:pk_producto_pedido(nombre_producto, precio_producto, precio_compra), pedido:pk_pedido!inner(fecha)')
          .gte('pedido.fecha', start).lte('pedido.fecha', end),
        supabase
          .from('pedidodetalles')
          .select('cantidad_pedido, producto:pk_producto_pedido(nombre_producto, precio_producto, precio_compra), pedido:pk_pedido!inner(fecha)')
          .gte('pedido.fecha', prevStart).lte('pedido.fecha', prevEnd),
        supabase.from('pedido').select('estado_pago').gte('fecha', start).lte('fecha', end),
        supabase.from('pedido').select('monto_total, fecha, estado_pago').eq('estado_pago', 'atendido').gte('fecha', start).lte('fecha', end).order('fecha', { ascending: true }),
        supabase
          .from('pedido')
          .select('id_pedido, monto_total, estado_pago, fecha, usuario:pk_usuario(nombre_persona)')
          .order('fecha', { ascending: false }).limit(5),
        supabase.from('pedido').select('monto_total', { count: 'exact', head: true }).eq('estado_pago', 'atendido').gte('fecha', start).lte('fecha', end),
        supabase
          .from('pedidodetalles')
          .select('cantidad_pedido, producto:pk_producto_pedido(nombre_producto, precio_producto, categoria:pk_categoria_producto(nombre_categoria_producto), marca:pk_marca_producto(nombre_marca_producto)), pedido:pk_pedido!inner(fecha)')
          .gte('pedido.fecha', start).lte('pedido.fecha', end),
      ])

      const ingresos = (atendidosRes.data || []).reduce((s, p) => s + Number(p.monto_total || 0), 0)
      const ingresosPrevios = (prevAtendidosRes.data || []).reduce((s, p) => s + Number(p.monto_total || 0), 0)

      const calcGanancia = (detalles: any[]) =>
        detalles.reduce((sum: number, d: any) => {
          const prod = d.producto
          if (!prod || !prod.precio_compra) return sum
          return sum + (prod.precio_producto - prod.precio_compra) * (d.cantidad_pedido || 0)
        }, 0)

      const ganancia = calcGanancia(detallesRes.data as any[] || [])
      const gananciaPrev = calcGanancia(prevDetallesRes.data as any[] || [])

      const productosVendidos = (detallesRes.data as any[] || []).reduce((s: number, d: any) => s + (d.cantidad_pedido || 0), 0)

      const statusCounts: Record<string, number> = {}
      ;(statusRes.data || []).forEach((p: any) => {
        statusCounts[p.estado_pago] = (statusCounts[p.estado_pago] || 0) + 1
      })
      const statusArr: StatusCount[] = Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] || '#6B7280',
      }))

      const dailyMap: Record<string, { ingresos: number; ganancia: number }> = {}
      ;(dailyRes.data || []).forEach((p: any) => {
        const day = p.fecha?.split('T')[0]
        if (day) {
          dailyMap[day] = dailyMap[day] || { ingresos: 0, ganancia: 0 }
          dailyMap[day].ingresos += Number(p.monto_total || 0)
        }
      })
      ;(detallesRes.data as any[] || []).forEach((d: any) => {
        const day = d.pedido?.fecha?.split('T')[0]
        if (day && d.producto?.precio_compra) {
          if (!dailyMap[day]) dailyMap[day] = { ingresos: 0, ganancia: 0 }
          dailyMap[day].ganancia += (d.producto.precio_producto - d.producto.precio_compra) * (d.cantidad_pedido || 0)
        }
      })
      const dailyArr: DailySale[] = Object.entries(dailyMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([fecha, vals]) => ({ fecha, ...vals }))

      const productAgg: Record<string, { nombre: string; cantidad: number; ingresos: number }> = {}
      ;(detallesRes.data as any[] || []).forEach((d: any) => {
        if (!d.producto?.nombre_producto) return
        const name = d.producto.nombre_producto
        if (!productAgg[name]) productAgg[name] = { nombre: name, cantidad: 0, ingresos: 0 }
        productAgg[name].cantidad += d.cantidad_pedido || 0
        productAgg[name].ingresos += (d.producto.precio_producto || 0) * (d.cantidad_pedido || 0)
      })
      const topProductsArr: TopProduct[] = Object.values(productAgg)
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10)

      const catAgg: Record<string, number> = {}
      const brandAgg: Record<string, number> = {}
      ;(catBrandRes.data as any[] || []).forEach((d: any) => {
        const cat = d.producto?.categoria?.nombre_categoria_producto
        if (cat) catAgg[cat] = (catAgg[cat] || 0) + (d.producto.precio_producto || 0) * (d.cantidad_pedido || 0)
        const brand = d.producto?.marca?.nombre_marca_producto
        if (brand) brandAgg[brand] = (brandAgg[brand] || 0) + (d.producto.precio_producto || 0) * (d.cantidad_pedido || 0)
      })
      const catArr: CategorySale[] = Object.entries(catAgg)
        .sort(([, a], [, b]) => b - a)
        .map(([nombre, ingresos], i) => ({ nombre, ingresos, color: CHART_COLORS[i % CHART_COLORS.length] }))
      const brandArr: BrandSale[] = Object.entries(brandAgg)
        .sort(([, a], [, b]) => b - a)
        .map(([nombre, ingresos], i) => ({ nombre, ingresos, color: CHART_COLORS[i % CHART_COLORS.length] }))

      setKpi({
        ingresos,
        ganancia,
        pedidosAtendidos: allAttendedRes.count ?? 0,
        productosVendidos,
        ingresosPrevios,
        pedidosPrevios: prevAtendidosRes.data?.length ?? 0,
      })
      setDailySales(dailyArr)
      setStatusData(statusArr)
      setRecentOrders(recentRes.data as any[] || [])
      setTopProducts(topProductsArr)
      setCategorySales(catArr)
      setBrandSales(brandArr)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    loadData()
  }, [loadData])

  const loadComplementaryData = useCallback(async () => {
    try {
      const now = new Date()
      const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1)
      const thisYearStart = new Date(now.getFullYear(), 0, 1)
      const lastYearStart = new Date(now.getFullYear() - 1, 0, 1)
      const lastYearEnd = new Date(now.getFullYear(), 0, 0, 23, 59, 59)
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

      const [
        trendRes,
        lowStockRes,
        noStockRes,
        recentProdRes,
        pendingOrdersRes,
        lossProductsRes,
        offersRes,
      ] = await Promise.all([
        supabase.from('pedido').select('monto_total, fecha').eq('estado_pago', 'atendido').gte('fecha', twelveMonthsAgo.toISOString()).order('fecha', { ascending: true }),
        supabase.from('inventario').select('id_producto:pk_producto, stock_actual, producto:pk_producto!inner(nombre_producto, precio_producto, precio_compra)').lt('stock_actual', 10).gte('stock_actual', 1),
        supabase.from('inventario').select('id_producto:pk_producto, stock_actual, producto:pk_producto!inner(nombre_producto, precio_producto, precio_compra)').eq('stock_actual', 0),
        supabase.from('producto').select('id_producto, nombre_producto, precio_producto, precio_compra').order('created_at', { ascending: false }).limit(5),
        supabase.from('pedido').select('id_pedido, fecha, monto_total, estado_pago, usuario:pk_usuario(nombre_persona)').eq('estado_pago', 'pendiente').order('fecha', { ascending: false }),
        supabase.from('producto').select('id_producto, nombre_producto, precio_producto, precio_compra').not('precio_compra', 'is', null),
        supabase.from('oferta').select('id_oferta, precio_oferta, fecha_fin, fecha_inicio, producto:pk_producto(nombre_producto, precio_producto)').lte('fecha_fin', thirtyDaysFromNow.toISOString().split('T')[0]).gte('fecha_fin', new Date().toISOString().split('T')[0]).order('fecha_fin', { ascending: true }),
      ])

      const monthAgg: Record<string, number> = {}
      ;(trendRes.data || []).forEach((p: any) => {
        const d = new Date(p.fecha)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        monthAgg[key] = (monthAgg[key] || 0) + Number(p.monto_total || 0)
      })
      const trendArr: MonthlyTrend[] = Object.entries(monthAgg)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([mes, ingresos]) => ({ mes, ingresos }))

      const getWeekNumber = (date: Date) => Math.ceil((date.getDate()) / 7)
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
      const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

      const buildWeekly = (orders: any[], month: number, year: number) => {
        const weekMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        ;(orders || []).forEach((p: any) => {
          const d = new Date(p.fecha)
          if (d.getMonth() === month && d.getFullYear() === year) {
            const wn = getWeekNumber(d)
            weekMap[wn] = (weekMap[wn] || 0) + Number(p.monto_total || 0)
          }
        })
        return weekMap
      }

      const weeklyCurrent = buildWeekly(trendRes.data as any[] || [], currentMonth, currentYear)
      const weeklyPrev = buildWeekly(trendRes.data as any[] || [], prevMonth, prevMonthYear)
      const weeklyArr: WeeklyComparison[] = []
      const maxWeeks = Math.max(...Object.keys(weeklyCurrent).map(Number), ...Object.keys(weeklyPrev).map(Number), 4)
      for (let i = 1; i <= maxWeeks; i++) {
        weeklyArr.push({ semana: `Sem ${i}`, actual: weeklyCurrent[i] || 0, anterior: weeklyPrev[i] || 0 })
      }

      const buildYearly = (orders: any[], year: number) => {
        const monthMap: Record<number, number> = {}
        ;(orders || []).forEach((p: any) => {
          const d = new Date(p.fecha)
          if (d.getFullYear() === year) {
            monthMap[d.getMonth()] = (monthMap[d.getMonth()] || 0) + Number(p.monto_total || 0)
          }
        })
        return monthMap
      }

      const yearCurrent = buildYearly(trendRes.data as any[] || [], currentYear)
      const yearPrev = buildYearly(trendRes.data as any[] || [], currentYear - 1)
      const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const yearArr: YearComparison[] = Array.from({ length: 12 }, (_, i) => ({
        mes: MONTHS_SHORT[i],
        actual: yearCurrent[i] || 0,
        anterior: yearPrev[i] || 0,
      }))

      const lossArr: InventoryItem[] = (lossProductsRes.data as any[] || []).filter(
        (p: any) => p.precio_compra && Number(p.precio_compra) > Number(p.precio_producto)
      )

      const offersArr: ExpiringOffer[] = (offersRes.data as any[] || []).map((o: any) => ({
        id_oferta: o.id_oferta,
        producto_nombre: o.producto?.nombre_producto || '—',
        precio_oferta: Number(o.precio_oferta),
        precio_original: Number(o.producto?.precio_producto || 0),
        fecha_fin: o.fecha_fin,
      }))

      setMonthlyTrend(trendArr)
      setWeeklyComparison(weeklyArr)
      setYearComparison(yearArr)
      setLowStock((lowStockRes.data as any[] || []).map((i: any) => ({ id_producto: i.pk_producto, nombre_producto: i.producto?.nombre_producto || '', stock_actual: i.stock_actual, precio_producto: Number(i.producto?.precio_producto || 0), precio_compra: i.producto?.precio_compra || null })))
      setNoStock((noStockRes.data as any[] || []).map((i: any) => ({ id_producto: i.pk_producto, nombre_producto: i.producto?.nombre_producto || '', stock_actual: i.stock_actual, precio_producto: Number(i.producto?.precio_producto || 0), precio_compra: i.producto?.precio_compra || null })))
      setRecentProducts(recentProdRes.data as InventoryItem[] || [])
      setPendingOrders((pendingOrdersRes.data as any[] || []).map((o: any) => ({ ...o, usuario: Array.isArray(o.usuario) ? o.usuario[0] : o.usuario })))
      setLossProducts(lossArr)
      setExpiringOffers(offersArr)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingComplementary(false)
    }
  }, [])

  useEffect(() => {
    loadComplementaryData()
  }, [loadComplementaryData])

  const kpiCards = [
    {
      label: 'Ingresos',
      value: formatCurrency(kpi.ingresos),
      prev: kpi.ingresosPrevios,
      icon: Wallet,
      color: 'from-blue-500 to-blue-600',
      bgLight: 'bg-blue-50 dark:bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: 'Ganancia Neta',
      value: formatCurrency(kpi.ganancia),
      prev: 0,
      icon: TrendingUp,
      color: 'from-emerald-500 to-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Pedidos',
      value: kpi.pedidosAtendidos.toString(),
      prev: kpi.pedidosPrevios,
      icon: ShoppingBag,
      color: 'from-violet-500 to-violet-600',
      bgLight: 'bg-violet-50 dark:bg-violet-500/10',
      textColor: 'text-violet-600 dark:text-violet-400',
    },
    {
      label: 'Prod. Vendidos',
      value: kpi.productosVendidos.toString(),
      prev: 0,
      icon: Package,
      color: 'from-amber-500 to-orange-600',
      bgLight: 'bg-amber-50 dark:bg-amber-500/10',
      textColor: 'text-amber-600 dark:text-amber-400',
    },
  ]

  const statusBadge = (estado: string) => {
    const colors: Record<string, string> = {
      pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      PAGADO: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      atendido: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      rechazado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[estado] || 'bg-muted text-muted-foreground'
  }

  const periodText = periodLabels[period]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bienvenido, {user?.nombre_persona || 'Administrador'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowPeriodOptions(!showPeriodOptions)}
            className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-xl text-sm font-medium text-foreground hover:bg-muted transition shadow-sm"
          >
            {periodText}
            <ChevronDown className="w-4 h-4" />
          </button>
          {showPeriodOptions && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowPeriodOptions(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-background border border-border rounded-xl shadow-lg z-20 py-1">
                {(Object.entries(periodLabels) as [Period, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setPeriod(key); setShowPeriodOptions(false) }}
                    className={`block w-full text-left px-4 py-2 text-sm transition ${
                      period === key ? 'text-primary font-medium bg-primary-50 dark:bg-primary-900/20' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const pctChange = card.prev > 0 ? ((kpi.ingresos - card.prev) / card.prev) * 100 : 0
          const isPositive = pctChange >= 0
          return (
            <div key={card.label} className="bg-background rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgLight}`}>
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground">{card.value}</p>
              {card.prev > 0 && (
                <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {Math.abs(pctChange).toFixed(1)}% vs período anterior
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Ventas diarias</h3>
          {dailySales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en este período</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="fecha"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  tickFormatter={(v: string) => {
                    const d = new Date(v + 'T00:00:00')
                    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
                  }}
                />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--foreground)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                  labelFormatter={(label: any) => new Date(String(label) + 'T00:00:00').toLocaleDateString('es-PE')}
                />
                <Bar dataKey="ingresos" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="ganancia" fill="#10B981" radius={[4, 4, 0, 0]} name="Ganancia" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Estado de pedidos</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--foreground)',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {statusData.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-foreground capitalize">{s.name}</span>
                    </div>
                    <span className="font-medium text-foreground">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-background rounded-xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Últimos pedidos</h2>
          <Link to="/admin/pedidos" className="text-xs text-primary hover:underline font-medium">Ver todos</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">No hay pedidos aún</td>
                </tr>
              ) : (
                recentOrders.map((o: any) => (
                  <tr key={o.id_pedido} className="hover:bg-muted text-sm transition-colors">
                    <td className="px-6 py-3 text-foreground">{o.usuario?.nombre_persona || '-'}</td>
                    <td className="px-6 py-3 text-muted-foreground">{new Date(o.fecha).toLocaleDateString()}</td>
                    <td className="px-6 py-3 font-medium text-foreground">{formatCurrency(Number(o.monto_total))}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusBadge(o.estado_pago)}`}>
                        {o.estado_pago}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top 10 productos + Ventas por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 10 productos más vendidos</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos en este período</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis type="category" dataKey="nombre" width={140} tick={{ fontSize: 11, fill: 'var(--foreground)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                  formatter={(value: any) => [value, 'Cantidad']}
                />
                <Bar dataKey="cantidad" fill="#3B82F6" radius={[0, 4, 4, 0]} name="cantidad" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Ventas por categoría</h3>
          {categorySales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categorySales} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="ingresos">
                    {categorySales.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {categorySales.slice(0, 6).map((s) => (
                  <div key={s.nombre} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-foreground truncate max-w-[120px]">{s.nombre}</span>
                    </div>
                    <span className="font-medium text-foreground text-xs">{formatCurrency(s.ingresos)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tendencia mensual + Ventas por marca */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Tendencia mensual (12 meses)</h3>
          {monthlyTrend.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Line type="monotone" dataKey="ingresos" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Ingresos" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Ventas por marca</h3>
          {brandSales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={brandSales} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="ingresos">
                    {brandSales.map((entry, i) => (<Cell key={i} fill={entry.color} />))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                    formatter={(value: any) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {brandSales.slice(0, 6).map((s) => (
                  <div key={s.nombre} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-foreground truncate max-w-[120px]">{s.nombre}</span>
                    </div>
                    <span className="font-medium text-foreground text-xs">{formatCurrency(s.ingresos)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Comparativas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Mes actual vs mes anterior</h3>
          {weeklyComparison.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="semana" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar dataKey="actual" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Mes actual" />
                <Bar dataKey="anterior" fill="#94A3B8" radius={[4, 4, 0, 0]} name="Mes anterior" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Este año vs año pasado</h3>
          {yearComparison.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={yearComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--foreground)', fontSize: '12px' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} name="Este año" />
                <Line type="monotone" dataKey="anterior" stroke="#94A3B8" strokeWidth={2} dot={{ r: 3 }} name="Año pasado" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-background rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Stock bajo</h3>
            <span className="text-xs text-muted-foreground">Menos de 10 uds</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin productos con stock bajo</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {lowStock.map((p) => (
                <div key={p.id_producto} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground truncate max-w-[180px]">{p.nombre_producto}</span>
                  <span className="font-medium text-amber-600 dark:text-amber-400">{p.stock_actual}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Sin stock</h3>
            <span className="text-xs text-muted-foreground">Agotados</span>
          </div>
          {noStock.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Todos los productos tienen stock</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {noStock.map((p) => (
                <div key={p.id_producto} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground truncate max-w-[180px]">{p.nombre_producto}</span>
                  <span className="font-medium text-red-500">0</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Últimos productos</h3>
          {recentProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin productos</p>
          ) : (
            <div className="space-y-2">
              {recentProducts.map((p) => (
                <div key={p.id_producto} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground truncate max-w-[180px]">{p.nombre_producto}</span>
                  <span className="font-medium text-foreground">{formatCurrency(p.precio_producto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alertas rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-background rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Pedidos pendientes</h3>
            <span className="text-xs text-muted-foreground">{pendingOrders.length} sin atender</span>
          </div>
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No hay pedidos pendientes</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {pendingOrders.slice(0, 8).map((o) => (
                <div key={o.id_pedido} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">#{o.id_pedido}</span>
                    <span className="text-xs text-muted-foreground">{new Date(o.fecha).toLocaleDateString()}</span>
                  </div>
                  <span className="font-medium text-yellow-600 dark:text-yellow-400">{formatCurrency(Number(o.monto_total))}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Productos con pérdida</h3>
            <span className="text-xs text-muted-foreground">Costo &gt; precio</span>
          </div>
          {lossProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin productos con pérdida</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {lossProducts.map((p) => (
                <div key={p.id_producto} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground truncate max-w-[140px]">{p.nombre_producto}</span>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Comp: {formatCurrency(Number(p.precio_compra))}</div>
                    <div className="text-xs text-red-500">Vent: {formatCurrency(p.precio_producto)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-background rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Ofertas por vencer</h3>
            <span className="text-xs text-muted-foreground">Próximos 30 días</span>
          </div>
          {expiringOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Sin ofertas próximas a vencer</p>
          ) : (
            <div className="space-y-2 max-h-[260px] overflow-y-auto">
              {expiringOffers.map((o) => (
                <div key={o.id_oferta} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="truncate max-w-[140px]">
                    <div className="text-foreground truncate">{o.producto_nombre}</div>
                    <div className="text-xs text-muted-foreground">Vence: {new Date(o.fecha_fin + 'T00:00:00').toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground line-through">{formatCurrency(o.precio_original)}</div>
                    <div className="font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(o.precio_oferta)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
