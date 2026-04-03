"use client";

import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Gem, Search, CheckCircle } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { fetchLiveMarketRates } from "@/app/actions/market";

// Simulated 7-day Historical Data from APIs (Recent baseline adjusted closer to actual values)
const HISTORICAL_DATA = [
  { day: "Day 1", silverRate: 201.50, usdInr: 94.10 },
  { day: "Day 2", silverRate: 205.10, usdInr: 94.25 },
  { day: "Day 3", silverRate: 204.90, usdInr: 94.50 },
  { day: "Day 4", silverRate: 208.20, usdInr: 94.65 },
  { day: "Day 5", silverRate: 211.00, usdInr: 94.60 },
  { day: "Day 6", silverRate: 215.80, usdInr: 94.80 },
  { day: "Day 7", silverRate: 216.50, usdInr: 94.81 },
];

export default function LiveMarketDashboard() {
  const [currentSilver, setCurrentSilver] = useState(HISTORICAL_DATA[6].silverRate);
  const [currentUSD, setCurrentUSD] = useState(HISTORICAL_DATA[6].usdInr);
  
  const { products, setProducts, updateProduct } = useProductStore();
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // FETCH REAL API DATA via Server Action
  const forceSync = async () => {
    setIsSyncing(true);

    try {
      const result = await fetchLiveMarketRates();
      
      if (result.success && result.silverRate > 0) {
        const newSilver = result.silverRate;
        const newUSD = result.usdInrRate;
        
        setCurrentSilver(newSilver);
        setCurrentUSD(newUSD);

        // Recalculate linked product prices using the REAL commodity costs
        const updatedProducts = products.map(p => {
          if (!p.isLinked) return p; 
          const weightGm = parseFloat(p.weight) || 0;
          const rawSilverCost = weightGm * newSilver;
          const newTotal = Math.round(rawSilverCost + (p.makingMargin || 0));
          return { ...p, price: newTotal };
        });
        
        // Push massive recalculation globally across store
        setProducts(updatedProducts);
      } else {
        console.error("Market API Fetch Failed: ", result.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mount sync!
  useEffect(() => {
    forceSync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleLink = (id: string, currentTargetWeightStr: string, currentMargin: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    const isNowLinked = !p.isLinked;
    if (isNowLinked) {
      const weightGm = parseFloat(currentTargetWeightStr) || 0;
      const newPrice = Math.round((weightGm * currentSilver) + currentMargin);
      updateProduct(id, { isLinked: true, price: newPrice });
    } else {
      updateProduct(id, { isLinked: false });
    }
  };

  const syncMargin = (id: string, newMargin: number, isCurrentlyLinked: boolean, weightStr: string) => {
    if (isCurrentlyLinked) {
       const weightGm = parseFloat(weightStr) || 0;
       const newPrice = Math.round((weightGm * currentSilver) + newMargin);
       updateProduct(id, { makingMargin: newMargin, price: newPrice });
    } else {
       updateProduct(id, { makingMargin: newMargin });
    }
  };

  // Metrics diffs
  const silverDiff = currentSilver - HISTORICAL_DATA[5].silverRate;
  const usdDiff = currentUSD - HISTORICAL_DATA[5].usdInr;

  return (
    <div className="space-y-6">
      
      {/* Header & Force Sync */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">Live Market Engine</h1>
          <p className="text-sm text-[#7A7585]">Configure dynamic pricing driven by real-time commodities.</p>
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-[#7A7585] hidden sm:block">Automated Syncs: 6:00 AM, 11:30 AM, 8:00 PM (IST)</p>
          <button 
            onClick={forceSync}
            disabled={isSyncing}
            className={`inline-flex items-center gap-2 px-5 py-2.5 bg-[#1A1A1A] text-white text-sm font-medium rounded-xl hover:bg-black transition-colors ${isSyncing ? "opacity-75 cursor-not-allowed" : ""}`}
          >
            <RefreshCcw size={16} className={isSyncing ? "animate-spin" : ""} /> 
            {isSyncing ? "Fetching APIs..." : "Force API Sync"}
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#7A7585] mb-1 flex items-center gap-2">
              <Gem size={16} className="text-[#C9A84C]" /> Silver Rate (Per Gram)
            </p>
            <h2 className="text-3xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">
              ₹{currentSilver.toFixed(2)}
            </h2>
            <div className={`flex items-center gap-1 text-sm font-semibold mt-2 ${silverDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
              {silverDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(silverDiff).toFixed(2)} vs yesterday
            </div>
          </div>
          <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-full flex items-center justify-center">
            <Gem size={32} className="text-[#C9A84C]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-[#7A7585] mb-1 flex items-center gap-2">
              <DollarSign size={16} className="text-blue-500" /> Exchange Rate (USD to INR)
            </p>
            <h2 className="text-3xl font-[family-name:var(--font-heading)] font-semibold text-[#1A1A1A]">
              ₹{currentUSD.toFixed(2)}
            </h2>
            <div className={`flex items-center gap-1 text-sm font-semibold mt-2 ${usdDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
              {usdDiff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {Math.abs(usdDiff).toFixed(2)} vs yesterday
            </div>
          </div>
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-blue-500 font-bold text-xl">$</span>
          </div>
        </div>
      </div>

      {/* Historical Chart */}
      <div className="bg-white p-6 rounded-2xl border border-[#E8E8E8] shadow-sm">
        <h3 className="text-[#1A1A1A] font-semibold mb-6 flex items-center gap-2">7-Day Market Trend History</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...HISTORICAL_DATA.slice(0, 6), { day: "Live (Current)", silverRate: currentSilver, usdInr: currentUSD }]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8E8E8" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A09DAB" }} dy={10} />
              <YAxis yAxisId="left" domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A09DAB" }} />
              <YAxis yAxisId="right" orientation="right" domain={['dataMin - 1', 'dataMax + 1']} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A09DAB" }} />
              <RechartsTooltip 
                contentStyle={{ borderRadius: '12px', border: '1px solid #E8E8E8', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '14px', fontWeight: 600 }}
              />
              <Line yAxisId="left" type="monotone" name="Silver Target (₹)" dataKey="silverRate" stroke="#C9A84C" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" name="USD/INR Base" dataKey="usdInr" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Linked Products Rules */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        <div className="p-6 border-b border-[#E8E8E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-[#1A1A1A]">Dynamic Pricing Registry</h3>
            <p className="text-xs text-[#7A7585] mt-1">If "Market Sync" is active, product price equates to: <strong>(Weight × Live Silver Rate) + Making Margin</strong>.</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7585]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registry..."
              className="w-full pl-10 pr-4 py-2 bg-[#F5F3EF] border border-transparent rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[#7A7585] bg-[#FDFAF5]">
                <th className="px-6 py-3 font-medium">Product Base</th>
                <th className="px-6 py-3 font-medium">Recorded Weight</th>
                <th className="px-6 py-3 font-medium text-center">Market Sync</th>
                <th className="px-6 py-3 font-medium">Making Margin (₹)</th>
                <th className="px-6 py-3 font-medium text-right shadow-sm">Final Listed Price</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const weightGm = parseFloat(p.weight) || 0;
                const rawSilverCost = weightGm * currentSilver;
                const activeMargin = p.makingMargin || 0;

                return (
                  <tr key={p.id} className="border-t border-[#E8E8E8] hover:bg-[#FDFAF5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1A1A1A]">{p.name}</p>
                      <p className="text-xs text-[#A09DAB]">{p.carat} {p.colour}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{p.weight}</td>
                    
                    {/* Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleLink(p.id, p.weight, activeMargin)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${p.isLinked ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${p.isLinked ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[#7A7585]">₹</span>
                        <input
                          type="number"
                          value={activeMargin}
                          onChange={(e) => syncMargin(p.id, Number(e.target.value), p.isLinked, p.weight)}
                          disabled={!p.isLinked}
                          className="w-24 px-3 py-1.5 bg-[#F5F3EF] border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 disabled:opacity-50 font-medium"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right bg-amber-50/10">
                      <p className="text-lg font-[family-name:var(--font-heading)] font-bold text-[#1A1A1A]">₹{p.price.toLocaleString('en-IN')}</p>
                      {p.isLinked && (
                        <p className="text-[10px] text-[#A09DAB] mt-0.5" title={`Silver Base: ${rawSilverCost.toFixed(2)} + Margin: ${activeMargin}`}>
                          {rawSilverCost.toFixed(0)} (Base) + {activeMargin} (Make)
                        </p>
                      )}
                      {!p.isLinked && (
                        <p className="text-[10px] text-[#A09DAB] mt-0.5">Manual Pricing (Frozen)</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-[#7A7585] text-sm">
              No products found in the pricing registry.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
