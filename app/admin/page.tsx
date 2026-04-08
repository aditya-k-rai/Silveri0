"use client";

import { useEffect, useState, useMemo } from "react";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { useProductStore } from "@/store/productStore";
import { subscribeToOrders } from "@/lib/firebase/orders";
import { Order } from "@/types";
import Link from "next/link";

// ─── Helpers ─────────────────────────────────────────────────────
function getDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function buildDailyData(orders: Order[], startDate: Date, endDate: Date) {
  const map: Record<string, { revenue: number; orders: number }> = {};
  const cur = new Date(startDate);
  while (cur <= endDate) {
    map[getDayKey(cur)] = { revenue: 0, orders: 0 };
    cur.setDate(cur.getDate() + 1);
  }
  orders.forEach((o) => {
    const key = getDayKey(o.createdAt);
    if (map[key]) {
      map[key].revenue += o.total;
      map[key].orders += 1;
    }
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, label: formatShortDate(date), ...val }));
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatTooltipDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Custom Chart Tooltip ────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  metricLabel,
  isRevenue,
}: {
  active?: boolean;
  payload?: any[];
  metricLabel: string;
  isRevenue: boolean;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  const curVal = data.current;
  const prevVal = data.previous;
  const pct = pctChange(curVal, prevVal);
  const fmt = (v: number) => (isRevenue ? `₹${v.toLocaleString("en-IN")}` : String(v));

  return (
    <div className="bg-white rounded-xl border border-[#E8E8E8] shadow-lg p-4 min-w-[180px]">
      <p className="text-sm font-semibold text-[#1A1A1A] mb-3">{metricLabel}</p>
      {/* Current */}
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#1A8CFF] shrink-0"></span>
        <span className="text-xs text-[#7A7585]">{formatTooltipDate(data.currentDate)}</span>
      </div>
      <p className="text-lg font-semibold text-[#1A1A1A] mb-2 pl-4">{fmt(curVal)}</p>
      {/* % Change */}
      <p className={`text-xs font-medium mb-3 pl-4 ${pct >= 0 ? "text-emerald-600" : "text-[#7A7585]"}`}>
        {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}% from comparison
      </p>
      {/* Previous */}
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#1A8CFF]/35 shrink-0"></span>
        <span className="text-xs text-[#7A7585]">{formatTooltipDate(data.previousDate)}</span>
      </div>
      <p className="text-lg font-semibold text-[#1A1A1A] pl-4">{fmt(prevVal)}</p>
    </div>
  );
}

// ─── Sparkline Component ─────────────────────────────────────────
function Sparkline({ data, dataKey, color }: { data: any[]; dataKey: string; color: string }) {
  return (
    <div className="w-[72px] h-[32px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stat Metric Component ───────────────────────────────────────
function StatMetric({
  label,
  value,
  trend,
  sparkData,
  sparkKey,
  sparkColor,
  isSelected,
  onClick,
}: {
  label: string;
  value: string;
  trend: number;
  sparkData: any[];
  sparkKey: string;
  sparkColor: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isUp = trend > 0;
  const trendColor = isUp ? "text-emerald-600" : "text-[#7A7585]";
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <button
      onClick={onClick}
      className={`flex-1 text-left px-5 py-4 transition-all border-l-2 ${
        isSelected
          ? "border-l-[#1A1A1A] bg-[#FAFAFA]"
          : "border-l-transparent hover:bg-[#FAFAFA]/60"
      }`}
    >
      <p className="text-sm text-[#7A7585] font-medium mb-1">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-xl font-semibold text-[#1A1A1A] leading-tight">{value}</p>
          <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${trendColor}`}>
            <TrendIcon size={12} />
            <span>{Math.abs(trend)}%</span>
          </div>
        </div>
        <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor} />
      </div>
    </button>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────
export default function AdminDashboard() {
  const { products } = useProductStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [chartExpanded, setChartExpanded] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<"revenue" | "orders">("revenue");

  useEffect(() => {
    const unsub = subscribeToOrders((data) => setOrders(data));
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // ─── Period calculations ──────────────────────────────────────
  const now = useMemo(() => new Date(), []);

  const { currentPeriod, previousPeriod, currentOrders, previousOrders } = useMemo(() => {
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);

    const prevEnd = new Date(start);
    prevEnd.setDate(prevEnd.getDate() - 1);
    prevEnd.setHours(23, 59, 59, 999);
    const prevStart = new Date(prevEnd);
    prevStart.setDate(prevStart.getDate() - 29);
    prevStart.setHours(0, 0, 0, 0);

    const currentOrds = orders.filter((o) => o.createdAt >= start && o.createdAt <= end);
    const prevOrds = orders.filter((o) => o.createdAt >= prevStart && o.createdAt <= prevEnd);

    return {
      currentPeriod: { start, end },
      previousPeriod: { start: prevStart, end: prevEnd },
      currentOrders: currentOrds,
      previousOrders: prevOrds,
    };
  }, [orders, now]);

  // ─── Metrics ──────────────────────────────────────────────────
  const currentRevenue = currentOrders.reduce((s, o) => s + o.total, 0);
  const previousRevenue = previousOrders.reduce((s, o) => s + o.total, 0);

  const currentOrderCount = currentOrders.length;
  const previousOrderCount = previousOrders.length;

  const activeProducts = products.filter((p) => p.status === "Active").length;

  const currentAvgOrder = currentOrderCount > 0 ? Math.round(currentRevenue / currentOrderCount) : 0;
  const previousAvgOrder =
    previousOrderCount > 0 ? Math.round(previousRevenue / previousOrderCount) : 0;

  // ─── Chart data ───────────────────────────────────────────────
  const currentDaily = useMemo(
    () => buildDailyData(currentOrders, currentPeriod.start, currentPeriod.end),
    [currentOrders, currentPeriod]
  );
  const previousDaily = useMemo(
    () => buildDailyData(previousOrders, previousPeriod.start, previousPeriod.end),
    [previousOrders, previousPeriod]
  );

  // Merge for comparison chart
  const chartData = useMemo(() => {
    return currentDaily.map((cur, i) => {
      const prev = i < previousDaily.length ? previousDaily[i] : null;
      const curVal = selectedMetric === "revenue" ? cur.revenue : cur.orders;
      const prevVal = prev
        ? selectedMetric === "revenue"
          ? prev.revenue
          : prev.orders
        : 0;
      return {
        label: cur.label,
        current: curVal,
        previous: prevVal,
        currentDate: cur.date,
        previousDate: prev?.date || "",
      };
    });
  }, [currentDaily, previousDaily, selectedMetric]);

  // ─── Action items ─────────────────────────────────────────────
  const ordersToFulfill = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;
  const paymentsToCapture = orders.filter((o) => !o.paymentId && o.status !== "cancelled").length;

  // ─── Period labels ────────────────────────────────────────────
  const fmtPeriod = (start: Date, end: Date) => {
    const s = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    const e = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return `${s}–${e}`;
  };

  const currentLabel = fmtPeriod(currentPeriod.start, currentPeriod.end);
  const previousLabel = fmtPeriod(previousPeriod.start, previousPeriod.end);

  return (
    <div className="space-y-5">
      {/* ─── Filter Bar ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E8E8] rounded-full text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors">
          <Calendar size={14} className="text-[#7A7585]" />
          Last 30 days
          <ChevronDown size={14} className="text-[#7A7585]" />
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E8E8] rounded-full text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors">
          <Layers size={14} className="text-[#7A7585]" />
          All channels
        </button>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E8E8] rounded-full text-sm font-medium text-[#1A1A1A]">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          {orders.length > 0 ? `${orders.length} total orders` : "Live"}
        </div>
      </div>

      {/* ─── Unified Stats Card ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        {/* Stats Row */}
        <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#E8E8E8]">
          <StatMetric
            label="Revenue"
            value={`₹${currentRevenue.toLocaleString("en-IN")}`}
            trend={pctChange(currentRevenue, previousRevenue)}
            sparkData={currentDaily}
            sparkKey="revenue"
            sparkColor="#1A1A1A"
            isSelected={selectedMetric === "revenue" && chartExpanded}
            onClick={() => {
              setSelectedMetric("revenue");
              setChartExpanded(true);
            }}
          />
          <StatMetric
            label="Total Sales"
            value={`₹${currentRevenue.toLocaleString("en-IN")}`}
            trend={pctChange(currentRevenue, previousRevenue)}
            sparkData={currentDaily}
            sparkKey="revenue"
            sparkColor="#10B981"
            isSelected={false}
            onClick={() => {
              setSelectedMetric("revenue");
              setChartExpanded(true);
            }}
          />
          <StatMetric
            label="Orders"
            value={String(currentOrderCount)}
            trend={pctChange(currentOrderCount, previousOrderCount)}
            sparkData={currentDaily}
            sparkKey="orders"
            sparkColor="#6366F1"
            isSelected={selectedMetric === "orders" && chartExpanded}
            onClick={() => {
              setSelectedMetric("orders");
              setChartExpanded(true);
            }}
          />
          <StatMetric
            label="Avg. Order Value"
            value={currentAvgOrder > 0 ? `₹${currentAvgOrder.toLocaleString("en-IN")}` : "—"}
            trend={pctChange(currentAvgOrder, previousAvgOrder)}
            sparkData={currentDaily}
            sparkKey="revenue"
            sparkColor="#F59E0B"
            isSelected={false}
            onClick={() => {
              setSelectedMetric("revenue");
              setChartExpanded(true);
            }}
          />

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setChartExpanded(!chartExpanded)}
            className="hidden sm:flex items-center justify-center px-4 hover:bg-[#FAFAFA] transition-colors text-[#7A7585]"
          >
            {chartExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* ─── Expanded Chart ──────────────────────────────────── */}
        {chartExpanded && (
          <div className="border-t border-[#E8E8E8] p-6">
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#A1A1AA" }}
                    dy={10}
                    minTickGap={40}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#A1A1AA" }}
                    width={50}
                    tickFormatter={(v) =>
                      selectedMetric === "revenue" ? `₹${v.toLocaleString("en-IN")}` : String(v)
                    }
                  />
                  <RechartsTooltip
                    content={
                      <ChartTooltip
                        metricLabel={selectedMetric === "revenue" ? "Revenue" : "Orders"}
                        isRevenue={selectedMetric === "revenue"}
                      />
                    }
                    cursor={{ stroke: "#E8E8E8", strokeWidth: 1 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#1A8CFF"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#1A8CFF" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#1A8CFF"
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    dot={false}
                    opacity={0.4}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Legend + View Report */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-6 text-xs text-[#7A7585]">
                <span className="flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-[#1A8CFF] rounded inline-block"></span>
                  {currentLabel}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className="w-4 h-[2px] rounded inline-block"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, #1A8CFF 0, #1A8CFF 3px, transparent 3px, transparent 6px)",
                    }}
                  ></span>
                  {previousLabel}
                </span>
              </div>
              <Link
                href="/admin/reports"
                className="text-xs font-medium text-[#7A7585] hover:text-[#1A1A1A] border border-[#E8E8E8] px-3 py-1.5 rounded-lg hover:bg-[#FAFAFA] transition-colors"
              >
                View report
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ─── Action Items ────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/admin/orders"
          className="flex-1 flex items-center gap-3 px-5 py-4 bg-white border border-[#E8E8E8] rounded-2xl hover:border-[#C9A84C]/40 hover:bg-[#FDFAF5]/50 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#7A7585] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors">
            <ClipboardList size={18} />
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">
            {ordersToFulfill} order{ordersToFulfill !== 1 ? "s" : ""} to fulfill
          </span>
          <ArrowRight size={14} className="ml-auto text-[#A1A1AA] group-hover:text-[#C9A84C] transition-colors" />
        </Link>

        <Link
          href="/admin/orders"
          className="flex-1 flex items-center gap-3 px-5 py-4 bg-white border border-[#E8E8E8] rounded-2xl hover:border-[#C9A84C]/40 hover:bg-[#FDFAF5]/50 transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#F5F3EF] flex items-center justify-center text-[#7A7585] group-hover:bg-[#C9A84C]/10 group-hover:text-[#C9A84C] transition-colors">
            <CreditCard size={18} />
          </div>
          <span className="text-sm font-medium text-[#1A1A1A]">
            {paymentsToCapture} payment{paymentsToCapture !== 1 ? "s" : ""} to capture
          </span>
          <ArrowRight size={14} className="ml-auto text-[#A1A1AA] group-hover:text-[#C9A84C] transition-colors" />
        </Link>
      </div>

      {/* ─── Recent Orders & Products (below fold) ───────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-medium text-[#C9A84C] hover:underline"
            >
              View all
            </Link>
          </div>
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[#7A7585] border-b border-[#E8E8E8]">
                    <th className="pb-3 font-medium">Order ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o) => (
                    <tr
                      key={o.id}
                      className="border-b border-[#E8E8E8]/50 last:border-0"
                    >
                      <td className="py-3 font-medium">{o.id}</td>
                      <td className="py-3">{o.customerName || "—"}</td>
                      <td className="py-3 text-[#7A7585]">
                        {o.createdAt.toLocaleDateString("en-IN")}
                      </td>
                      <td className="py-3 text-right">
                        ₹{o.total.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            o.status === "delivered"
                              ? "bg-green-50 text-green-700"
                              : o.status === "shipped"
                                ? "bg-blue-50 text-blue-700"
                                : o.status === "processing"
                                  ? "bg-amber-50 text-amber-700"
                                  : o.status === "pending"
                                    ? "bg-purple-50 text-purple-700"
                                    : o.status === "cancelled"
                                      ? "bg-red-50 text-red-700"
                                      : "bg-silver-100 text-silver-600"
                          }`}
                        >
                          {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#7A7585] text-center py-8">No orders yet.</p>
          )}
        </div>

        {/* Products Overview */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-[family-name:var(--font-heading)] font-semibold text-lg">
              Top Products
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-medium text-[#C9A84C] hover:underline"
            >
              View all
            </Link>
          </div>
          {products.filter((p) => p.status === "Active").length > 0 ? (
            <div className="space-y-4">
              {products
                .filter((p) => p.status === "Active")
                .slice(0, 5)
                .map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] text-xs font-semibold">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-[#7A7585]">Stock: {p.stock}</p>
                    </div>
                    <span className="text-sm font-medium">
                      ₹{p.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-[#7A7585] text-center py-8">No active products.</p>
          )}
        </div>
      </div>
    </div>
  );
}
