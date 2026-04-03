"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, RefreshCcw, DollarSign, Gem, Search, CheckCircle } from "lucide-react";

// Simulated 7-day Historical Data from APIs
const HISTORICAL_DATA = [
  { day: "Day 1", silverRate: 88.50, usdInr: 82.90 },
  { day: "Day 2", silverRate: 89.10, usdInr: 83.05 },
  { day: "Day 3", silverRate: 88.90, usdInr: 83.00 },
  { day: "Day 4", silverRate: 90.20, usdInr: 83.15 },
  { day: "Day 5", silverRate: 91.00, usdInr: 83.10 },
  { day: "Day 6", silverRate: 90.80, usdInr: 83.20 },
  { day: "Day 7", silverRate: 92.50, usdInr: 83.35 },
];

interface LinkedProduct {
  id: string;
  name: string;
  specs: string;
  weightGm: number;
  isLinked: boolean;
  makingMargin: number; // Flat explicit profit/labor margin
  currentPrice: number; // The final output price
}

const INITIAL_PRODUCTS: LinkedProduct[] = [
  { id: "P001", name: "Silver Elegance Ring", specs: "22K Silver", weightGm: 4.2, isLinked: true, makingMargin: 1200, currentPrice: 1588 },
  { id: "P002", name: "Luna Necklace", specs: "925 Silver Cube", weightGm: 12, isLinked: true, makingMargin: 2500, currentPrice: 3610 },
  { id: "P003", name: "Aria Earrings", specs: "24K Silver Drop", weightGm: 6, isLinked: false, makingMargin: 800, currentPrice: 1899 },
  { id: "P004", name: "Charm Bracelet", specs: "18K Silver Chain", weightGm: 18, isLinked: true, makingMargin: 1500, currentPrice: 3165 },
];

export default function LiveMarketDashboard() {
  const [currentSilver, setCurrentSilver] = useState(HISTORICAL_DATA[6].silverRate);
  const [currentUSD, setCurrentUSD] = useState(HISTORICAL_DATA[6].usdInr);
  
  const [products, setProducts] = useState<LinkedProduct[]>(INITIAL_PRODUCTS);
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Simulates the CRON Job hitting Metals.Dev and FED APIs
  const forceSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      // Simulate Market Flux (Silver goes up or down randomly, USD fluctuates)
      const newSilver = Number((currentSilver + (Math.random() * 4 - 1.5)).toFixed(2));
      const newUSD = Number((currentUSD + (Math.random() * 0.5 - 0.2)).toFixed(2));
      
      setCurrentSilver(newSilver);
      setCurrentUSD(newUSD);

      // Recalculate linked product prices dynamically based strictly on formulas
      setProducts(prev => prev.map(p => {
        if (!p.isLinked) return p; // Do not touch unlinked (manual) products
        
        const rawSilverCost = p.weightGm * newSilver;
        const newTotal = Math.round(rawSilverCost + p.makingMargin);
        
        return { ...p, currentPrice: newTotal };
      }));

      setIsSyncing(false);
    }, 1500);
  };

  const toggleLink = (id: string) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const isNowLinked = !p.isLinked;
        if (isNowLinked) {
          // If turning ON, immediately calculate the current live price
          const newPrice = Math.round((p.weightGm * currentSilver) + p.makingMargin);
          return { ...p, isLinked: true, currentPrice: newPrice };
        }
        return { ...p, isLinked: false };
      }
      return p;
    }));
  };

  const updateMargin = (id: string, newMargin: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, makingMargin: newMargin };
        if (updated.isLinked) {
           updated.currentPrice = Math.round((updated.weightGm * currentSilver) + newMargin);
        }
        return updated;
      }
      return p;
    }));
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
                const rawSilverCost = p.weightGm * currentSilver;

                return (
                  <tr key={p.id} className="border-t border-[#E8E8E8] hover:bg-[#FDFAF5]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1A1A1A]">{p.name}</p>
                      <p className="text-xs text-[#A09DAB]">{p.specs}</p>
                    </td>
                    <td className="px-6 py-4 font-mono font-medium">{p.weightGm}g</td>
                    
                    {/* Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => toggleLink(p.id)}
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
                          value={p.makingMargin}
                          onChange={(e) => updateMargin(p.id, Number(e.target.value))}
                          disabled={!p.isLinked}
                          className="w-24 px-3 py-1.5 bg-[#F5F3EF] border border-[#E8E8E8] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#C9A84C]/40 disabled:opacity-50 font-medium"
                        />
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right bg-amber-50/10">
                      <p className="text-lg font-[family-name:var(--font-heading)] font-bold text-[#1A1A1A]">₹{p.currentPrice.toLocaleString('en-IN')}</p>
                      {p.isLinked && (
                        <p className="text-[10px] text-[#A09DAB] mt-0.5" title={`Silver Base: ${rawSilverCost.toFixed(2)} + Margin: ${p.makingMargin}`}>
                          {rawSilverCost.toFixed(0)} (Base) + {p.makingMargin} (Make)
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
