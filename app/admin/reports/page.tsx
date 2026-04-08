"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowUpDown,
  Check,
  BarChart3,
  Users,
  Plus,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { subscribeToOrders } from "@/lib/firebase/orders";
import { Order } from "@/types";

// ─── Helpers ─────────────────────────────────────────────────────
function getDayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function fmtPeriod(start: Date, end: Date) {
  const s = start.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const e = end.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${s}–${e}`;
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

type MetricKey = "orders" | "revenue" | "visitors";

const METRIC_CONFIG: Record<MetricKey, { label: string; format: (v: number) => string }> = {
  orders: { label: "Orders", format: (v) => String(v) },
  revenue: { label: "Revenue", format: (v) => `₹${v.toLocaleString("en-IN")}` },
  visitors: { label: "Online store visitors", format: (v) => String(v) },
};

// ─── Build daily data for a period ──────────────────────────────
function buildDailyData(orders: Order[], startDate: Date, endDate: Date) {
  const map: Record<string, { revenue: number; orders: number; visitors: number }> = {};
  const cur = new Date(startDate);
  while (cur <= endDate) {
    map[getDayKey(cur)] = { revenue: 0, orders: 0, visitors: 0 };
    cur.setDate(cur.getDate() + 1);
  }
  orders.forEach((o) => {
    const key = getDayKey(o.createdAt);
    if (map[key]) {
      map[key].revenue += o.total;
      map[key].orders += 1;
      map[key].visitors += 1; // Approximate visitors from orders
    }
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, label: formatShortDate(date), ...val }));
}

function formatTooltipDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Custom Chart Tooltip ────────────────────────────────────────
function ReportTooltip({
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
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#1A8CFF] shrink-0"></span>
        <span className="text-xs text-[#7A7585]">{formatTooltipDate(data.currentDate)}</span>
      </div>
      <p className="text-lg font-semibold text-[#1A1A1A] mb-2 pl-4">{fmt(curVal)}</p>
      <p className={`text-xs font-medium mb-3 pl-4 ${pct >= 0 ? "text-emerald-600" : "text-[#7A7585]"}`}>
        {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}% from comparison
      </p>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-[#1A8CFF]/35 shrink-0"></span>
        <span className="text-xs text-[#7A7585]">{formatTooltipDate(data.previousDate)}</span>
      </div>
      <p className="text-lg font-semibold text-[#1A1A1A] pl-4">{fmt(prevVal)}</p>
    </div>
  );
}

// ─── Main Report Page ────────────────────────────────────────────
export default function AdminReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<MetricKey>("orders");
  const [queryExpanded, setQueryExpanded] = useState(false);
  const [sortAsc, setSortAsc] = useState(true);

  // Right sidebar state
  const [activeMetrics, setActiveMetrics] = useState<MetricKey[]>(["orders", "visitors"]);

  useEffect(() => {
    const unsub = subscribeToOrders((data) => {
      setOrders(data);
      setLoading(false);
    });
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

  const currentLabel = fmtPeriod(currentPeriod.start, currentPeriod.end);
  const previousLabel = fmtPeriod(previousPeriod.start, previousPeriod.end);

  // ─── Daily data ───────────────────────────────────────────────
  const currentDaily = useMemo(
    () => buildDailyData(currentOrders, currentPeriod.start, currentPeriod.end),
    [currentOrders, currentPeriod]
  );
  const previousDaily = useMemo(
    () => buildDailyData(previousOrders, previousPeriod.start, previousPeriod.end),
    [previousOrders, previousPeriod]
  );

  // Chart data
  const chartData = useMemo(() => {
    return currentDaily.map((cur, i) => {
      const prev = i < previousDaily.length ? previousDaily[i] : null;
      return {
        label: cur.label,
        current: cur[selectedMetric],
        previous: prev ? prev[selectedMetric] : 0,
        currentDate: cur.date,
        previousDate: prev?.date || "",
      };
    });
  }, [currentDaily, previousDaily, selectedMetric]);

  // ─── Totals ───────────────────────────────────────────────────
  const currentTotals = useMemo(() => {
    return {
      orders: currentOrders.length,
      revenue: currentOrders.reduce((s, o) => s + o.total, 0),
      visitors: currentOrders.length, // approximate
    };
  }, [currentOrders]);

  const previousTotals = useMemo(() => {
    return {
      orders: previousOrders.length,
      revenue: previousOrders.reduce((s, o) => s + o.total, 0),
      visitors: previousOrders.length,
    };
  }, [previousOrders]);

  // ─── Table data (daily rows) ──────────────────────────────────
  const tableRows = useMemo(() => {
    const rows = currentDaily.map((cur, i) => {
      const prev = i < previousDaily.length ? previousDaily[i] : null;
      return {
        currentDate: cur.date,
        previousDate: prev?.date || "",
        currentValues: cur,
        previousValues: prev,
      };
    });
    return sortAsc ? rows : [...rows].reverse();
  }, [currentDaily, previousDaily, sortAsc]);

  const metricConfig = METRIC_CONFIG[selectedMetric];
  const totalCurrent = currentTotals[selectedMetric];
  const totalPrevious = previousTotals[selectedMetric];
  const totalPct = pctChange(totalCurrent, totalPrevious);

  const lastRefreshed = new Date().toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-0 -m-4 lg:-m-8 min-h-[calc(100vh-140px)]">
      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {/* Report Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 text-sm text-[#7A7585] mb-1">
            <span>📊</span>
            <span>Reports</span>
            <span className="text-[#E8E8E8]">›</span>
            <span className="text-[#1A1A1A] font-medium">{metricConfig.label} over time</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">
              {metricConfig.label} over time
            </h1>
            <span className="text-sm text-[#A1A1AA]">
              Last refreshed: {lastRefreshed}
            </span>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-6 pb-4 flex flex-wrap items-center gap-2">
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors">
            <Clock size={14} className="text-[#7A7585]" />
            Last 30 days
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors">
            {previousLabel}
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-[#E8E8E8] rounded-lg text-sm font-medium text-[#1A1A1A] hover:bg-[#FAFAFA] transition-colors">
            ₹ INR
          </button>
        </div>

        {/* Query Indicator */}
        <div className="mx-6 mb-4">
          <button
            onClick={() => setQueryExpanded(!queryExpanded)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-[#E8E8E8] rounded-xl hover:bg-[#FAFAFA] transition-colors"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#1A8CFF]"></span>
            <span className="text-sm font-medium text-[#1A1A1A] flex-1 text-left">
              {metricConfig.format(totalCurrent)} {metricConfig.label} + {activeMetrics.length} metric{activeMetrics.length !== 1 ? "s" : ""}
            </span>
            {queryExpanded ? (
              <ChevronUp size={16} className="text-[#7A7585]" />
            ) : (
              <ChevronDown size={16} className="text-[#7A7585]" />
            )}
          </button>
          {queryExpanded && (
            <div className="mt-1 bg-white border border-[#E8E8E8] rounded-xl p-4 font-mono text-sm space-y-1">
              <div className="flex gap-4">
                <span className="text-[#A1A1AA] w-6 text-right">1</span>
                <span>
                  <span className="text-blue-600 font-semibold">FROM</span>{" "}
                  <span className="text-[#1A1A1A]">{selectedMetric}</span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A1A1AA] w-6 text-right">2</span>
                <span>
                  <span className="text-purple-600 font-semibold">SHOW</span>{" "}
                  <span className="text-[#1A1A1A]">
                    {activeMetrics.map((m) => METRIC_CONFIG[m].label.toLowerCase().replace(/ /g, "_")).join(", ")}
                  </span>
                </span>
              </div>
              <div className="flex gap-4">
                <span className="text-[#A1A1AA] w-6 text-right">3</span>
                <span className="text-[#A1A1AA]">
                  <span className="text-gray-500 font-semibold">WHERE</span>{" "}
                  period IN (&apos;current&apos;, &apos;previous&apos;)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metric Summary */}
        <div className="px-6 mb-2">
          <h2 className="text-sm font-medium text-[#7A7585]">{metricConfig.label}</h2>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-semibold text-[#1A1A1A]">
              {metricConfig.format(totalCurrent)}
            </span>
            <span
              className={`text-sm font-medium ${totalPct >= 0 ? "text-emerald-600" : "text-[#7A7585]"}`}
            >
              {totalPct >= 0 ? "↑" : "↓"} {Math.abs(totalPct)}%
            </span>
          </div>
        </div>

        {/* Chart */}
        <div className="px-6 pb-4">
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#A1A1AA" }}
                  dy={10}
                  minTickGap={50}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#A1A1AA" }}
                  width={50}
                />
                <RechartsTooltip
                  content={
                    <ReportTooltip
                      metricLabel={metricConfig.label}
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
                  activeDot={{ r: 5, fill: "#1A8CFF", stroke: "#fff", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="#1A8CFF"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                  opacity={0.35}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-[#7A7585]">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A8CFF] inline-block"></span>
              {currentLabel}
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1A8CFF]/35 inline-block"></span>
              {previousLabel}
            </span>
          </div>
        </div>

        {/* ─── Data Table ──────────────────────────────────────── */}
        <div className="px-6 pb-8">
          <div className="bg-white border border-[#E8E8E8] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E8E8E8] bg-[#FAFAFA]">
                  <th className="text-left px-5 py-3 font-medium text-[#1A1A1A]">
                    <button
                      onClick={() => setSortAsc(!sortAsc)}
                      className="inline-flex items-center gap-1.5 hover:text-[#C9A84C] transition-colors"
                    >
                      Day
                      <ArrowUpDown size={13} className="text-[#A1A1AA]" />
                    </button>
                  </th>
                  {activeMetrics.map((m) => (
                    <th key={m} className="text-right px-5 py-3 font-medium text-[#1A1A1A]">
                      <span className="inline-flex items-center gap-1.5">
                        {m === selectedMetric && <Check size={13} className="text-[#1A1A1A]" />}
                        {METRIC_CONFIG[m].label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Totals row */}
                <tr className="border-b border-[#E8E8E8] bg-[#FAFAFA]/50">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-[#1A1A1A]">{currentLabel}</div>
                    <div className="text-[#7A7585] text-xs">{previousLabel}</div>
                    <div className="text-[#7A7585] text-xs">% Change</div>
                  </td>
                  {activeMetrics.map((m) => {
                    const curVal = currentTotals[m];
                    const prevVal = previousTotals[m];
                    const pct = pctChange(curVal, prevVal);
                    return (
                      <td key={m} className="px-5 py-3 text-right">
                        <div className="font-semibold text-[#1A1A1A]">
                          {METRIC_CONFIG[m].format(curVal)}
                        </div>
                        <div className="text-[#7A7585] text-xs">
                          {METRIC_CONFIG[m].format(prevVal)}
                        </div>
                        <div
                          className={`text-xs font-medium ${pct >= 0 ? "text-emerald-600" : "text-[#7A7585]"}`}
                        >
                          {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* Daily rows */}
                {tableRows.map((row, i) => (
                  <tr
                    key={row.currentDate}
                    className="border-b border-[#E8E8E8]/50 last:border-0 hover:bg-[#FAFAFA]/50 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-[#1A1A1A]">
                        {formatFullDate(row.currentDate)}
                      </div>
                      {row.previousDate && (
                        <div className="text-[#7A7585] text-xs">
                          {formatFullDate(row.previousDate)}
                        </div>
                      )}
                    </td>
                    {activeMetrics.map((m) => {
                      const curVal = row.currentValues[m];
                      const prevVal = row.previousValues ? row.previousValues[m] : 0;
                      return (
                        <td key={m} className="px-5 py-3 text-right">
                          <div className="text-[#1A1A1A]">{METRIC_CONFIG[m].format(curVal)}</div>
                          <div className="text-[#7A7585] text-xs">
                            {METRIC_CONFIG[m].format(prevVal)}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Right Sidebar ─────────────────────────────────────── */}
      <div className="hidden xl:flex flex-col w-[280px] border-l border-[#E8E8E8] bg-white shrink-0">
        {/* Tabs */}
        <div className="flex border-b border-[#E8E8E8]">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-[#1A1A1A] border-b-2 border-[#1A1A1A]">
            <BarChart3 size={14} />
            Freeform
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-[#A1A1AA] hover:text-[#7A7585] transition-colors">
            <Users size={14} />
            Cohorts
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 space-y-6">
          {/* Metrics */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Metrics</h3>
              <button className="text-[#7A7585] hover:text-[#1A1A1A] transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-1">
              {(["visitors", "orders", "revenue"] as MetricKey[]).map((m) => {
                const isActive = activeMetrics.includes(m);
                const isSelected = selectedMetric === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMetric(m);
                      if (!isActive) {
                        setActiveMetrics([...activeMetrics, m]);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      isSelected
                        ? "bg-[#F5F3EF] text-[#1A1A1A] font-medium"
                        : "text-[#7A7585] hover:bg-[#FAFAFA]"
                    }`}
                  >
                    <span>{METRIC_CONFIG[m].label}</span>
                    {isSelected && <Check size={14} className="text-[#1A1A1A]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Dimensions</h3>
              <button className="text-[#7A7585] hover:text-[#1A1A1A] transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="px-3 py-2 text-sm text-[#1A1A1A]">Day</div>
          </div>

          {/* Visualization */}
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] mb-3">Visualization</h3>
            <div className="flex items-center justify-between px-3 py-2 bg-[#FAFAFA] rounded-lg border border-[#E8E8E8]">
              <span className="text-sm text-[#1A1A1A]">Line</span>
              <ChevronDown size={14} className="text-[#7A7585]" />
            </div>
          </div>

          {/* Filters */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Filters</h3>
              <button className="text-[#7A7585] hover:text-[#1A1A1A] transition-colors">
                <Plus size={14} />
              </button>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-[#7A7585]">Period comparison</p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 bg-[#F5F3EF] border border-[#E8E8E8] rounded-md text-xs font-medium text-[#1A1A1A]">
                  is one of
                </span>
                <span className="px-2.5 py-1 bg-[#F5F3EF] border border-[#E8E8E8] rounded-md text-xs font-medium text-[#1A1A1A]">
                  Current &amp; Previous
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
