"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Package,
  CreditCard,
  Globe,
  Users,
  BarChart3,
  UserCircle,
  Landmark,
  Settings,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Bell,
  MessageSquare,
  HelpCircle,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthContext";

export function Sidebar() {
  const [view, setView] = useState<"main" | "payments">("main");
  const [invoicesOpen, setInvoicesOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, signOut } = useAuth();

  // Animation settings for the slide effect
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 256 : -256,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 256 : -256,
      opacity: 0,
    }),
  };

  return (
    <aside className="w-64 h-full border-r bg-white flex flex-col shrink-0 font-sans overflow-hidden relative">
      <AnimatePresence initial={false} custom={view === "main" ? -1 : 1}>
        {view === "main" ? (
          /* --- FULL MAIN MENU VIEW --- */
          <motion.div
            key="main"
            custom={-1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="absolute inset-0 flex flex-col bg-white"
          >
            {/* Business Switcher */}
            <div className="p-4">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <UserCircle size={20} className="text-slate-400" />
                  <div>
                    <p className="text-sm font-bold leading-none">{user?.email?.split('@')[0] || "User"}</p>
                    <p className="text-[10px] text-slate-500 mt-1">
                      Role: <span className="font-bold text-black">{role || "Ops"}</span>
                    </p>
                  </div>
                </div>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 mb-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full bg-slate-50 border rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none"
                />
              </div>
            </div>

            {/* Full Nav List from your Image */}
            <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
              <Link
                href="/"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                <Home size={18} className="text-slate-500" /> Home
              </Link>
              <Link
                href="/items"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                <Package size={18} className="text-slate-500" /> Items &
                services
              </Link>
              <Link
                href="/customers"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                <Users size={18} className="text-slate-500" /> Customers
              </Link>

              {/* Trigger for Payments View */}
              <button
                onClick={() => setView("payments")}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md group"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-black font-bold" />
                  <span className="font-bold text-black">
                    Payments & invoices
                  </span>
                </div>
                <ChevronRight size={14} className="text-slate-400" />
              </button>

              <Link
                href="/banking"
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
              >
                <Landmark size={18} className="text-slate-500" /> Banking
              </Link>
              {role === "Admin" && (
                <>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-md"
                  >
                    <Settings size={18} className="text-slate-500" /> Settings
                  </Link>
                  <button className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 w-full hover:bg-slate-100 rounded-md">
                    <Plus size={18} /> Add more
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        ) : (
          /* --- PAYMENTS SUB-MENU VIEW --- */
          <motion.div
            key="payments"
            custom={1}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="absolute inset-0 flex flex-col bg-white"
          >
            <div className="p-4 border-b">
              <button
                onClick={() => setView("main")}
                className="flex items-center gap-4 text-slate-900 hover:bg-slate-50 p-2 rounded-lg transition-colors w-full"
              >
                <ArrowLeft size={20} />
                <span className="font-bold text-sm text-black">
                  Payments & invoices
                </span>
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              <Link
                href="/payments/transactions"
                className="block px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md"
              >
                Transactions
              </Link>

              <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-md cursor-pointer">
                <span>Orders</span>
                <ChevronDown size={14} className="text-slate-400" />
              </div>

              {/* Invoices Section with Square-Style Divider */}
              <div className="border-t-2 border-black mt-2 pt-2">
                <button
                  onClick={() => setInvoicesOpen(!invoicesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-bold text-black"
                >
                  <span>Invoices</span>
                  <ChevronDown
                    size={14}
                    className={invoicesOpen ? "" : "-rotate-90"}
                  />
                </button>

                {invoicesOpen && (
                  <div className="mt-1 space-y-0.5">
                    {[
                      "Overview",
                      "Projects",
                      "Invoices",
                      "Customers",
                      "Recurring series",
                      "Estimates",
                      "Reports",
                      "Apps",
                    ].map((sub) => (
                      <Link
                        key={sub}
                        href={`/payments/${sub
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          pathname.includes(sub.toLowerCase())
                            ? "bg-slate-100 font-bold text-black"
                            : "text-slate-600 hover:text-black hover:bg-slate-50"
                        }`}
                      >
                        {sub}
                      </Link>
                    ))}
                    {role === "Admin" && (
                      <div className="flex items-center justify-between px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md cursor-pointer">
                        <span>Settings</span>
                        <ChevronDown size={14} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- FIXED FOOTER (Never moves during animation) --- */}
      <div className="mt-auto border-t bg-white z-10">
        {role === "Admin" && (
          <div className="p-4">
            <button className="w-full flex items-center justify-center gap-2 bg-[#f4f4f4] hover:bg-slate-200 text-black py-2.5 rounded-full text-sm font-bold border border-slate-200 transition-all">
              <CreditCard size={18} />
              Take payment
            </button>
          </div>
        )}
        <div className="flex justify-between items-center px-6 py-3 text-slate-400 border-t">
          <button 
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
            className="hover:text-red-600 transition-colors text-xs font-bold flex items-center gap-2"
          >
            Sign out
          </button>
          <div className="flex gap-4">
            <button className="hover:text-black transition-colors">
              <Bell size={18} />
            </button>
            <button className="hover:text-black transition-colors">
              <HelpCircle size={18} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
