"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInvoiceStats, getInvoices } from "@/app/actions/invoices";
import { ArrowUpRight, Clock, CheckCircle2, AlertCircle, Plus, ChevronRight } from "lucide-react";

export default function PaymentsOverview() {
  const [stats, setStats] = useState({
    totalPaid: 0,
    totalOutstanding: 0,
    totalDraft: 0,
    totalCount: 0
  });
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsData, invoicesData] = await Promise.all([
          getInvoiceStats(),
          getInvoices()
        ]);
        setStats(statsData);
        setRecentInvoices(invoicesData.slice(0, 5));
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setIsLoading(true); // Set to false when done, but I'll use it for skeleton if needed
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 font-sans text-left">
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-black mb-2">Dashboard</h1>
          <p className="text-slate-500">Overview of your business performance</p>
        </div>
        <Link
          href="/payments/invoices/new"
          className="bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-zinc-800 transition-all text-sm flex items-center gap-2"
        >
          <Plus size={18} /> Create invoice
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Paid" 
          amount={stats.totalPaid} 
          icon={<CheckCircle2 className="text-green-500" />} 
          color="bg-green-50"
        />
        <StatCard 
          title="Outstanding" 
          amount={stats.totalOutstanding} 
          icon={<Clock className="text-blue-500" />} 
          color="bg-blue-50"
        />
        <StatCard 
          title="Drafts" 
          amount={stats.totalDraft} 
          icon={<AlertCircle className="text-slate-400" />} 
          color="bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link href="/payments/invoices" className="text-sm font-bold text-blue-600 hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            {recentInvoices.length > 0 ? (
              <div className="divide-y">
                {recentInvoices.map((invoice) => (
                  <Link 
                    key={invoice.id} 
                    href={`/payments/invoices?id=${invoice.id}`}
                    className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                        {invoice.customer.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-sm">#{invoice.invoiceId} {invoice.customer.name}</div>
                        <div className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">${invoice.total.toFixed(2)}</div>
                      <div className={`text-[10px] font-bold uppercase ${
                        invoice.status === 'Paid' ? 'text-green-600' : 
                        invoice.status === 'Draft' ? 'text-slate-400' : 'text-blue-600'
                      }`}>
                        {invoice.status}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                  <Plus className="text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm">No invoices yet. Create your first one to see it here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Tips */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="space-y-4">
            <QuickAction 
              title="Add Customer" 
              desc="Grow your directory" 
              href="/customers" 
              icon={<Plus size={18} />}
            />
            <QuickAction 
              title="New Project" 
              desc="Organize your work" 
              href="/payments/projects" 
              icon={<ArrowUpRight size={18} />}
            />
          </div>

          <div className="bg-blue-600 rounded-3xl p-8 text-white space-y-4 shadow-lg shadow-blue-200">
            <h3 className="font-bold text-lg leading-tight">Get paid 2x faster with Square</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Enable online payments and let your customers pay with credit cards, Apple Pay, or Google Pay.
            </p>
            <button className="bg-white text-blue-600 px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-50 transition-colors">
              Enable Payments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, icon, color }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color}`}>
          {icon}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{title}</p>
        <h2 className="text-3xl font-bold text-black">${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
      </div>
    </div>
  );
}

function QuickAction({ title, desc, href, icon }: any) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors group"
    >
      <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-white transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-bold text-sm">{title}</div>
        <div className="text-xs text-slate-500">{desc}</div>
      </div>
    </Link>
  );
}
