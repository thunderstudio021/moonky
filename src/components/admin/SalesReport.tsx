import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Package,
  Calendar,
  CreditCard,
  Smartphone,
  Banknote,
  Loader2,
  Award,
  AlertTriangle,
  Percent,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Ticket,
} from "lucide-react";
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subMonths, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Transaction {
  id: string;
  session_id: string;
  operator_id: string;
  items: any[];
  subtotal: number;
  total: number;
  payment_method: string;
  amount_paid: number | null;
  change_amount: number | null;
  discount_type: string | null;
  discount_value: number | null;
  discount_amount: number | null;
  created_at: string;
  source?: 'cash_register' | 'online';
}

interface TicketSale {
  id: string;
  user_id: string;
  event_id: string;
  ticket_type_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  payment_method: string | null;
  payment_status: string;
  created_at: string;
  event_name?: string;
  ticket_name?: string;
}

interface Session {
  id: string;
  operator_id: string;
  initial_fund: number;
  expected_balance: number | null;
  actual_balance: number | null;
  difference: number | null;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'];

export const SalesReport = () => {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [ticketSales, setTicketSales] = useState<TicketSale[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "12m">("30d");

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const loadData = async () => {
    setLoading(true);
    try {
      const startDate = getStartDate();
      
      // Load transactions from cash register
      const { data: transactionsData, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });
      
      if (transactionsError) throw transactionsError;
      
      const parsed: Transaction[] = (transactionsData || []).map(t => {
        const record = t as Record<string, any>;
        return {
          id: t.id,
          session_id: t.session_id,
          operator_id: t.operator_id,
          items: typeof t.items === 'string' ? JSON.parse(t.items) : t.items,
          subtotal: t.subtotal,
          total: t.total,
          payment_method: t.payment_method,
          amount_paid: t.amount_paid,
          change_amount: t.change_amount,
          discount_type: record.discount_type ?? null,
          discount_value: record.discount_value ?? null,
          discount_amount: record.discount_amount ?? null,
          created_at: t.created_at,
          source: 'cash_register' as const
        };
      });
      setTransactions(parsed);

      // Load online ticket sales
      const { data: ticketSalesData, error: ticketSalesError } = await supabase
        .from("ticket_sales")
        .select(`
          *,
          events:event_id (name),
          ticket_types:ticket_type_id (name)
        `)
        .eq("payment_status", "completed")
        .gte("created_at", startDate.toISOString())
        .order("created_at", { ascending: true });

      if (ticketSalesError) {
        console.error("Error loading ticket sales:", ticketSalesError);
      } else {
        const parsedTicketSales: TicketSale[] = (ticketSalesData || []).map((ts: any) => ({
          id: ts.id,
          user_id: ts.user_id,
          event_id: ts.event_id,
          ticket_type_id: ts.ticket_type_id,
          quantity: ts.quantity,
          unit_price: ts.unit_price,
          total_price: ts.total_price,
          payment_method: ts.payment_method,
          payment_status: ts.payment_status,
          created_at: ts.created_at,
          event_name: ts.events?.name,
          ticket_name: ts.ticket_types?.name
        }));
        setTicketSales(parsedTicketSales);
      }

      // Load sessions
      const { data: sessionsData } = await supabase
        .from("cash_register_sessions")
        .select("*")
        .gte("opened_at", startDate.toISOString())
        .order("opened_at", { ascending: false });
      
      setSessions(sessionsData || []);

      // Load products for names
      const { data: productsData } = await supabase
        .from("products")
        .select("id, name, price, image_url");
      
      setProducts(productsData || []);

    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = () => {
    const now = new Date();
    switch (dateRange) {
      case "7d": return subDays(now, 7);
      case "30d": return subDays(now, 30);
      case "90d": return subDays(now, 90);
      case "12m": return subMonths(now, 12);
      default: return subDays(now, 30);
    }
  };

  // Calculate ticket sales revenue
  const ticketSalesRevenue = useMemo(() => {
    return ticketSales.reduce((sum, ts) => sum + ts.total_price, 0);
  }, [ticketSales]);

  // Calculate KPIs (including ticket sales)
  const kpis = useMemo(() => {
    const cashRegisterRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalRevenue = cashRegisterRevenue + ticketSalesRevenue;
    const totalTransactions = transactions.length + ticketSales.length;
    const avgTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalDiscount = transactions.reduce((sum, t) => sum + (t.discount_amount || 0), 0);
    
    const cashSales = transactions.filter(t => t.payment_method === "cash").reduce((sum, t) => sum + t.total, 0);
    const cardSales = transactions.filter(t => t.payment_method === "card").reduce((sum, t) => sum + t.total, 0);
    const pixSales = transactions.filter(t => t.payment_method === "pix").reduce((sum, t) => sum + t.total, 0);
    
    // Add ticket sales to online/pix (since most online payments are via pix/card)
    const onlineTicketSales = ticketSalesRevenue;

    // Previous period comparison
    const midPoint = new Date(getStartDate().getTime() + (new Date().getTime() - getStartDate().getTime()) / 2);
    const currentPeriodTx = transactions.filter(t => new Date(t.created_at) >= midPoint);
    const previousPeriodTx = transactions.filter(t => new Date(t.created_at) < midPoint);
    const currentPeriodTickets = ticketSales.filter(t => new Date(t.created_at) >= midPoint);
    const previousPeriodTickets = ticketSales.filter(t => new Date(t.created_at) < midPoint);
    
    const currentRevenue = currentPeriodTx.reduce((sum, t) => sum + t.total, 0) + 
                          currentPeriodTickets.reduce((sum, t) => sum + t.total_price, 0);
    const previousRevenue = previousPeriodTx.reduce((sum, t) => sum + t.total, 0) +
                           previousPeriodTickets.reduce((sum, t) => sum + t.total_price, 0);
    const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return {
      totalRevenue,
      cashRegisterRevenue,
      ticketSalesRevenue,
      totalTransactions,
      avgTicket,
      totalDiscount,
      cashSales,
      cardSales,
      pixSales,
      onlineTicketSales,
      revenueGrowth,
      closedSessions: sessions.filter(s => s.status === 'closed').length,
      totalDifference: sessions.reduce((sum, s) => sum + Math.abs(s.difference || 0), 0),
      ticketsSold: ticketSales.reduce((sum, ts) => sum + ts.quantity, 0)
    };
  }, [transactions, sessions, ticketSales, ticketSalesRevenue]);

  // Sales by period chart data
  const salesByPeriodData = useMemo(() => {
    if (transactions.length === 0) return [];

    const startDate = getStartDate();
    const endDate = new Date();

    if (period === "daily") {
      const days = eachDayOfInterval({ start: startDate, end: endDate });
      return days.map(day => {
        const dayTransactions = transactions.filter(t => {
          const txDate = parseISO(t.created_at);
          return txDate >= startOfDay(day) && txDate <= endOfDay(day);
        });
        return {
          date: format(day, "dd/MM", { locale: ptBR }),
          fullDate: format(day, "dd 'de' MMMM", { locale: ptBR }),
          receita: dayTransactions.reduce((sum, t) => sum + t.total, 0),
          transacoes: dayTransactions.length,
          ticketMedio: dayTransactions.length > 0 
            ? dayTransactions.reduce((sum, t) => sum + t.total, 0) / dayTransactions.length 
            : 0
        };
      });
    } else if (period === "weekly") {
      const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 0 });
      return weeks.map(week => {
        const weekStart = startOfWeek(week, { weekStartsOn: 0 });
        const weekEnd = endOfWeek(week, { weekStartsOn: 0 });
        const weekTransactions = transactions.filter(t => {
          const txDate = parseISO(t.created_at);
          return txDate >= weekStart && txDate <= weekEnd;
        });
        return {
          date: `${format(weekStart, "dd/MM")} - ${format(weekEnd, "dd/MM")}`,
          fullDate: `Semana de ${format(weekStart, "dd 'de' MMMM", { locale: ptBR })}`,
          receita: weekTransactions.reduce((sum, t) => sum + t.total, 0),
          transacoes: weekTransactions.length,
          ticketMedio: weekTransactions.length > 0 
            ? weekTransactions.reduce((sum, t) => sum + t.total, 0) / weekTransactions.length 
            : 0
        };
      });
    } else {
      const months = eachMonthOfInterval({ start: startDate, end: endDate });
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        const monthTransactions = transactions.filter(t => {
          const txDate = parseISO(t.created_at);
          return txDate >= monthStart && txDate <= monthEnd;
        });
        return {
          date: format(month, "MMM/yy", { locale: ptBR }),
          fullDate: format(month, "MMMM 'de' yyyy", { locale: ptBR }),
          receita: monthTransactions.reduce((sum, t) => sum + t.total, 0),
          transacoes: monthTransactions.length,
          ticketMedio: monthTransactions.length > 0 
            ? monthTransactions.reduce((sum, t) => sum + t.total, 0) / monthTransactions.length 
            : 0
        };
      });
    }
  }, [transactions, period]);

  // Payment method distribution
  const paymentMethodData = useMemo(() => {
    return [
      { name: "Dinheiro", value: kpis.cashSales, color: "#10b981" },
      { name: "Cartão", value: kpis.cardSales, color: "#3b82f6" },
      { name: "Pix", value: kpis.pixSales, color: "#8b5cf6" },
    ].filter(item => item.value > 0);
  }, [kpis]);

  // Product performance
  const productPerformance = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};
    
    transactions.forEach(t => {
      if (Array.isArray(t.items)) {
        t.items.forEach((item: any) => {
          const id = item.product_id || item.id;
          const name = item.name || products.find(p => p.id === id)?.name || "Produto Desconhecido";
          const quantity = item.quantity || 1;
          const price = item.price || 0;
          
          if (!productSales[id]) {
            productSales[id] = { name, quantity: 0, revenue: 0 };
          }
          productSales[id].quantity += quantity;
          productSales[id].revenue += price * quantity;
        });
      }
    });

    const sorted = Object.entries(productSales)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.quantity - a.quantity);

    return {
      topSellers: sorted.slice(0, 10),
      bottomSellers: sorted.length > 10 ? sorted.slice(-5).reverse() : sorted.slice(-Math.min(5, sorted.length)).reverse()
    };
  }, [transactions, products]);

  // Hourly distribution
  const hourlyDistribution = useMemo(() => {
    const hours: Record<number, { transactions: number; revenue: number }> = {};
    
    for (let i = 0; i < 24; i++) {
      hours[i] = { transactions: 0, revenue: 0 };
    }
    
    transactions.forEach(t => {
      const hour = new Date(t.created_at).getHours();
      hours[hour].transactions++;
      hours[hour].revenue += t.total;
    });
    
    return Object.entries(hours).map(([hour, data]) => ({
      hora: `${hour.padStart(2, '0')}h`,
      transacoes: data.transactions,
      receita: data.revenue
    }));
  }, [transactions]);

  // Discount analysis
  const discountAnalysis = useMemo(() => {
    const withDiscount = transactions.filter(t => t.discount_amount && t.discount_amount > 0);
    const totalWithDiscount = withDiscount.length;
    const avgDiscount = totalWithDiscount > 0 
      ? withDiscount.reduce((sum, t) => sum + (t.discount_amount || 0), 0) / totalWithDiscount 
      : 0;
    
    const byType = {
      percent: withDiscount.filter(t => t.discount_type === 'percent').length,
      fixed: withDiscount.filter(t => t.discount_type === 'fixed').length
    };

    return {
      totalWithDiscount,
      percentWithDiscount: transactions.length > 0 ? (totalWithDiscount / transactions.length) * 100 : 0,
      avgDiscount,
      totalDiscountValue: kpis.totalDiscount,
      byType
    };
  }, [transactions, kpis.totalDiscount]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Relatório Financeiro</h2>
          <p className="text-muted-foreground">Análise completa de vendas (caixa + ingressos online)</p>
        </div>
        
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={(v: any) => setDateRange(v)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="12m">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>

          <Select value={period} onValueChange={(v: any) => setPeriod(v)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Agrupar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(kpis.totalRevenue)}</p>
                <div className="flex items-center gap-1 mt-1">
                  {kpis.revenueGrowth >= 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-xs ${kpis.revenueGrowth >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {Math.abs(kpis.revenueGrowth).toFixed(1)}% vs período anterior
                  </span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transações</p>
                <p className="text-2xl font-bold text-blue-600">{kpis.totalTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {kpis.closedSessions} sessões de caixa
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(kpis.avgTicket)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Por transação
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Descontos</p>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(kpis.totalDiscount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {discountAnalysis.percentWithDiscount.toFixed(1)}% das vendas
                </p>
              </div>
              <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Percent className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md border-l-4 border-l-emerald-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <Banknote className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas no Caixa</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.cashRegisterRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-violet-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/30">
                <Ticket className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vendas de Ingressos Online</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.ticketSalesRevenue)}</p>
                <p className="text-xs text-muted-foreground">{kpis.ticketsSold} ingressos vendidos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total Consolidada</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Revenue Over Time */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Evolução da Receita
            </CardTitle>
            <CardDescription>
              Receita e número de transações por {period === 'daily' ? 'dia' : period === 'weekly' ? 'semana' : 'mês'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={salesByPeriodData}>
                <defs>
                  <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={(value) => `R$${(value / 1000).toFixed(0)}k`}
                  className="text-muted-foreground"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    name === 'receita' ? formatCurrency(value) : value,
                    name === 'receita' ? 'Receita' : 'Transações'
                  ]}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                />
                <Legend />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="receita" 
                  stroke="#10b981" 
                  fill="url(#colorReceita)"
                  name="Receita"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="transacoes" 
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  name="Transações"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Métodos de Pagamento
            </CardTitle>
            <CardDescription>Distribuição por forma de pagamento</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 mt-4">
              {paymentMethodData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Sellers */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>Top 10 por quantidade vendida</CardDescription>
          </CardHeader>
          <CardContent>
            {productPerformance.topSellers.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={productPerformance.topSellers.slice(0, 8)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatCurrency(value) : value,
                        name === 'revenue' ? 'Receita' : 'Unidades'
                      ]}
                    />
                    <Bar dataKey="quantity" fill="#10b981" name="Unidades" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <Table className="mt-4">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="text-right">Receita</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productPerformance.topSellers.slice(0, 5).map((product, idx) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Badge variant={idx === 0 ? "default" : "secondary"} className="w-6 h-6 flex items-center justify-center p-0">
                            {idx + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="text-right">{product.quantity}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">
                          {formatCurrency(product.revenue)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhuma venda registrada no período</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bottom Sellers */}
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Produtos Menos Vendidos
            </CardTitle>
            <CardDescription>Produtos com menor saída no período</CardDescription>
          </CardHeader>
          <CardContent>
            {productPerformance.bottomSellers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productPerformance.bottomSellers.map((product, idx) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Badge variant="outline" className="w-6 h-6 flex items-center justify-center p-0">
                          {productPerformance.topSellers.length - productPerformance.bottomSellers.length + idx + 1}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right text-amber-600">{product.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(product.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Dados insuficientes para análise</p>
              </div>
            )}

            {/* Discount Stats */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Análise de Descontos
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Vendas com desconto</p>
                  <p className="font-bold text-lg">{discountAnalysis.totalWithDiscount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Desconto médio</p>
                  <p className="font-bold text-lg">{formatCurrency(discountAnalysis.avgDiscount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Desconto percentual</p>
                  <p className="font-medium">{discountAnalysis.byType.percent} vendas</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Desconto fixo</p>
                  <p className="font-medium">{discountAnalysis.byType.fixed} vendas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hourly Distribution */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Distribuição por Horário
          </CardTitle>
          <CardDescription>Volume de vendas ao longo do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `R$${v}`} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'receita' ? formatCurrency(value) : value,
                  name === 'receita' ? 'Receita' : 'Transações'
                ]}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="transacoes" fill="#3b82f6" name="Transações" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="receita" fill="#10b981" name="Receita" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Online Ticket Sales */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Vendas de Ingressos Online
          </CardTitle>
          <CardDescription>Histórico de vendas de ingressos pelo site</CardDescription>
        </CardHeader>
        <CardContent>
          {ticketSales.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Tipo de Ingresso</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço Unit.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketSales.slice(0, 15).map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>
                      {format(parseISO(sale.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">{sale.event_name || '-'}</TableCell>
                    <TableCell>{sale.ticket_name || '-'}</TableCell>
                    <TableCell className="text-right">{sale.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(sale.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(sale.total_price)}</TableCell>
                    <TableCell>
                      <Badge variant={sale.payment_status === 'completed' ? 'default' : 'secondary'}>
                        {sale.payment_status === 'completed' ? 'Pago' : sale.payment_status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Ticket className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma venda de ingresso online no período</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cash Register Sessions Summary */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sessões de Caixa
          </CardTitle>
          <CardDescription>Histórico de abertura e fechamento de caixa</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Abertura</TableHead>
                  <TableHead>Fechamento</TableHead>
                  <TableHead className="text-right">Fundo Inicial</TableHead>
                  <TableHead className="text-right">Saldo Esperado</TableHead>
                  <TableHead className="text-right">Saldo Real</TableHead>
                  <TableHead className="text-right">Diferença</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.slice(0, 10).map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {format(parseISO(session.opened_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(session.opened_at), "HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      {session.closed_at 
                        ? format(parseISO(session.closed_at), "HH:mm", { locale: ptBR })
                        : "-"
                      }
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(session.initial_fund)}</TableCell>
                    <TableCell className="text-right">
                      {session.expected_balance ? formatCurrency(session.expected_balance) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.actual_balance ? formatCurrency(session.actual_balance) : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {session.difference !== null ? (
                        <span className={session.difference === 0 ? 'text-emerald-600' : 'text-red-500'}>
                          {session.difference >= 0 ? '+' : ''}{formatCurrency(session.difference)}
                        </span>
                      ) : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.status === 'open' ? 'default' : 'secondary'}>
                        {session.status === 'open' ? 'Aberto' : 'Fechado'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma sessão de caixa no período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
