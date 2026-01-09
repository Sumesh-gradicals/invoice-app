"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useInvoices } from "@/components/providers/InvoiceContext";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { ArrowUpRight, Plus, ChevronRight, CreditCard, Send, Package } from "lucide-react";

export default function Home() {
  const { invoices } = useInvoices();

  // Calculate Metrics
  const metrics = useMemo(() => {
    const paidInvoices = invoices.filter((inv) => inv.status === "Paid");
    const totalSales = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const transactionCount = paidInvoices.length;
    const averageSale = transactionCount > 0 ? totalSales / transactionCount : 0;

    // Prepare Chart Data (Group by Date)
    const salesByDate = paidInvoices.reduce((acc, inv) => {
      const date = new Date(inv.date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      acc[date] = (acc[date] || 0) + inv.total;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount,
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Basic sort, might need better date parsing for strict ordering

    return {
      totalSales,
      transactionCount,
      averageSale,
      chartData,
    };
  }, [invoices]);

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#f7f7f7] gap-6 p-6 overflow-y-auto">
      {/* LEFT COLUMN - PERFORMANCE */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold">Performance</h2>
            <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold border rounded-full bg-slate-50">Date <span className="text-slate-900">Jan 9</span></button>
                <button className="px-3 py-1 text-xs font-bold border rounded-full">vs <span className="text-slate-900">Prior day</span></button>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-sm text-slate-500 mb-1">Net sales</div>
            <div className="text-3xl font-bold text-slate-900">${metrics.totalSales.toFixed(2)}</div>
            <div className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-500">
                <ArrowUpRight size={12} /> N/A
            </div>
          </div>

          {/* CHART */}
          <div className="mb-8 border-b pb-8">
             {metrics.chartData.length > 0 ? (
                 <SalesChart data={metrics.chartData} />
             ) : (
                 <div className="h-[200px] flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-lg border border-dashed">
                     No sales data available for selected timeframe
                 </div>
             )}
          </div>

          {/* METRICS GRID */}
          <div className="grid grid-cols-2 gap-y-8 gap-x-12">
              <div>
                  <div className="text-sm text-slate-500 mb-1">Gross sales</div>
                  <div className="text-lg font-bold">${metrics.totalSales.toFixed(2)}</div>
              </div>
              <div>
                  <div className="text-sm text-slate-500 mb-1">Transactions</div>
                  <div className="text-lg font-bold">{metrics.transactionCount}</div>
              </div>
              <div>
                  <div className="text-sm text-slate-500 mb-1">Average sale</div>
                  <div className="text-lg font-bold">${metrics.averageSale.toFixed(2)}</div>
              </div>
              <div>
                  <div className="text-sm text-slate-500 mb-1">Tips</div>
                  <div className="text-lg font-bold">$0.00</div>
              </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - SIDEBAR WIDGETS */}
      <div className="w-full md:w-[360px] space-y-6">
          {/* BANKING CARD */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-slate-700">Banking</h3>
              </div>
              <div className="flex justify-between items-end">
                  <div className="text-sm font-bold text-slate-500">Balance</div>
                  <div className="text-xl font-bold text-slate-900">$0.00</div>
              </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-700 mb-4">Quick actions</h3>
              <div className="space-y-1">
                  <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                      <div className="flex items-center gap-3 font-bold text-sm text-slate-700">
                          <CreditCard size={18} className="text-slate-400 group-hover:text-black"/>
                          Take a payment
                      </div>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <Link href="/payments/invoices/new">
                    <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                        <div className="flex items-center gap-3 font-bold text-sm text-slate-700">
                            <Send size={18} className="text-slate-400 group-hover:text-black"/>
                            Send an invoice
                        </div>
                    </button>
                  </Link>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button className="w-full flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors text-left group">
                      <div className="flex items-center gap-3 font-bold text-sm text-slate-700">
                          <Package size={18} className="text-slate-400 group-hover:text-black"/>
                          Add an item
                      </div>
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
}
