"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useInvoices } from "@/components/providers/InvoiceContext";
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  X,
  Clock,
  CreditCard,
  ChevronRight,
  Send,
  Printer,
  Edit2
} from "lucide-react";

import { useRouter } from "next/navigation";
import { sendInvoiceEmail } from "@/app/actions/send-invoice-email";
import { useAuth } from "@/components/providers/AuthContext";

export default function InvoiceListPage() {
  const router = useRouter();
  const { invoices, addInvoice, updateInvoice, deleteInvoice, updateStatus } = useInvoices();
  const { role } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<{ type: 'row' | 'sidebar', id?: string } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [paidTotal, setPaidTotal] = useState(0);

  useEffect(() => {
    // Calculate paid total for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const total = invoices
      .filter(inv => inv.status === 'Paid' && new Date(inv.date) >= thirtyDaysAgo)
      .reduce((sum, inv) => sum + inv.total, 0);
    
    setPaidTotal(total);
  }, [invoices]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = (id: string) => {
      if (confirm("Are you sure you want to delete this invoice?")) {
          deleteInvoice(id);
          setSelectedInvoice(null);
          setActiveDropdown(null);
      }
  };

  const handleDuplicateSeries = () => {
      alert("Duplicate as recurring series functionality coming soon!");
      setActiveDropdown(null);
  };

  const filteredInvoices = invoices.filter((inv) =>
    inv.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.invoiceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (invoice: any) => {
      router.push(`/payments/invoices/new?id=${invoice.id}`);
  };

  const handleDuplicate = (invoice: any) => {
      addInvoice({
          ...invoice,
          title: `${invoice.title} (Copy)`,
          status: "Draft",
          date: new Date().toISOString(),
          sentAt: undefined
      });
      // Optionally select the new invoice or show a toast
      alert("Invoice duplicated!");
  };

  const handleSend = async (invoice: any, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      
      if (!invoice.customer || !invoice.customer.email) {
          alert("Cannot send: Customer has no email.");
          return;
      }

      setIsSending(true);
      try {
          const result = await sendInvoiceEmail({
              customerName: invoice.customer.name,
              customerEmail: invoice.customer.email,
              invoiceId: invoice.invoiceId,
              date: new Date(invoice.date).toLocaleDateString(),
              items: invoice.items,
              total: invoice.total,
          });

          if (result.success) {
              await updateStatus(invoice.id, "Sent");
              alert("Invoice sent successfully!");
          } else {
              alert(`Failed to send: ${result.error}`);
          }
      } catch (error) {
          console.error(error);
          alert("An error occurred while sending.");
      } finally {
          setIsSending(false);
      }
  };

  const handleMarkAsPaid = async (invoice: any) => {
      await updateStatus(invoice.id, "Paid");
      alert("Invoice marked as paid!");
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900 relative">
      {/* HEADER STATS */}
      <div className="mb-8">
        <div className="text-sm font-bold text-slate-500 mb-1">
          Paid <span className="underline cursor-pointer">(Last 30 days)</span>
        </div>
        <div className="text-3xl font-bold flex items-center gap-4">
          ${paidTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {/* Mock Progress Bar */}
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative max-w-4xl opacity-50">
             <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_5px,#e2e8f0_5px,#e2e8f0_10px)]" />
          </div>
        </div>
      </div>

      <div className="border-t pt-6"></div>

      {/* FILTER BAR */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
            <input 
                type="text" 
                placeholder="Search Invoices" 
                className="pl-10 pr-4 py-2 border rounded-full text-sm outline-none w-64 focus:border-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold hover:bg-slate-50 bg-slate-100">
              Filter <span className="font-normal text-slate-900">All invoices</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-bold hover:bg-slate-50">
              Date <span className="font-normal text-slate-900">All time</span>
          </button>
        </div>
        <div className="flex gap-3">
             <button className="px-5 py-2 rounded-full font-bold text-sm bg-slate-100 hover:bg-slate-200">
                 Export
             </button>
             {role !== "Ops" && (
               <Link href="/payments/invoices/new">
                  <button className="bg-black text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-zinc-800 flex items-center gap-2">
                      Create Invoice <ChevronDown size={14} />
                  </button>
               </Link>
             )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white flex-1 overflow-visible">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b">
                <tr>
                    <th className="py-3 pl-4 w-10">
                        <input type="checkbox" className="rounded border-slate-300" />
                    </th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500 cursor-pointer hover:text-black">
                        <div className="flex items-center gap-1">Date <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500 cursor-pointer hover:text-black">
                         <div className="flex items-center gap-1">Customer <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500 cursor-pointer hover:text-black">
                         <div className="flex items-center gap-1">ID <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500 cursor-pointer hover:text-black">
                         <div className="flex items-center gap-1">Title <ArrowUpDown size={12}/></div>
                    </th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500">Status</th>
                    <th className="py-3 font-bold text-xs uppercase text-slate-500 cursor-pointer hover:text-black">
                        <div className="flex items-center gap-1">Amount <ArrowUpDown size={12}/></div>
                    </th>
                     <th className="py-3 pr-4 text-right">
                        <span className="underline cursor-pointer text-slate-500 text-xs font-bold">+ Customize</span>
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y relative">
                {filteredInvoices.length === 0 ? (
                    <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                            No invoices found.
                        </td>
                    </tr>
                ) : (
                    filteredInvoices.map((inv) => (
                        <tr 
                            key={inv.id} 
                            onClick={() => setSelectedInvoice(inv)}
                            className={`hover:bg-slate-50 group cursor-pointer ${selectedInvoice?.id === inv.id ? 'bg-slate-50' : ''}`}
                        >
                             <td className="py-4 pl-4" onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" className="rounded border-slate-300" />
                            </td>
                            <td className="py-4 text-slate-600">
                                {new Date(inv.date).toLocaleDateString()}
                            </td>
                            <td className="py-4 font-medium">
                                {inv.customer?.name || "Unknown"}
                            </td>
                            <td className="py-4 text-slate-500 text-xs">
                                {inv.invoiceId}
                                <div className="text-[10px] text-slate-400">Not viewed</div>
                            </td>
                            <td className="py-4 text-slate-600">
                                {inv.title || "—"}
                            </td>
                            <td className="py-4">
                                <span className={`text-xs font-bold ${
                                    inv.status === "Draft" ? "text-blue-600" : 
                                    inv.status === "Paid" || inv.status === "Sent" ? "text-green-600" : "text-slate-600"
                                }`}>
                                    {inv.status}
                                </span>
                                {inv.status === "Draft" && (
                                    <div 
                                        onClick={(e) => handleSend(inv, e)}
                                        className="text-[10px] underline cursor-pointer font-bold mt-0.5 hover:text-blue-800"
                                    >
                                        {isSending ? "Sending..." : "Send now"}
                                    </div>
                                )}
                            </td>
                            <td className="py-4 font-mono text-slate-600">
                                ${inv.total.toFixed(2)}
                            </td>
                            <td className="py-4 pr-4 text-right relative">
                                <button 
                                    className="p-1 hover:bg-slate-200 rounded text-slate-400 group-hover:text-black" 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveDropdown(activeDropdown?.id === inv.id ? null : { type: 'row', id: inv.id });
                                    }}
                                >
                                    <MoreHorizontal size={16} />
                                </button>
                                {activeDropdown?.type === 'row' && activeDropdown.id === inv.id && (
                                    <div 
                                        ref={dropdownRef}
                                        className="absolute right-4 top-8 bg-white shadow-xl border rounded-lg py-2 w-56 z-50 text-left"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                         {role !== "Ops" && (
                                           <>
                                              <button 
                                                  onClick={() => handleEdit(inv)}
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                              >
                                                  Edit
                                              </button>
                                              <button 
                                                  onClick={() => handleDuplicate(inv)}
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                              >
                                                  Duplicate as invoice
                                              </button>
                                              <button 
                                                  onClick={handleDuplicateSeries}
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                              >
                                                  Duplicate as recurring series
                                              </button>
                                              <button 
                                                  onClick={() => handleDelete(inv.id)}
                                                  className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-red-600"
                                              >
                                                  Delete
                                              </button>
                                           </>
                                         )}
                                         {role === "Ops" && (
                                           <div className="px-4 py-2 text-xs text-slate-400 italic">
                                             View-only access
                                           </div>
                                         )}
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>
      </div>


       {selectedInvoice && (
          <div className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#f7f7f7] shadow-2xl border-l z-20 flex flex-col font-sans transition-transform transform translate-x-0">
               {/* SIDEBAR HEADER */}
              <div className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10 w-full h-[60px] shadow-sm">
                  <button 
                    onClick={() => setSelectedInvoice(null)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full text-slate-500"
                  >
                      <X size={20} />
                  </button>
                  <h2 className="font-bold text-lg">{selectedInvoice.status} invoice</h2>
                  <div className="w-8"></div> {/* Spacer for centering */}
              </div>

              {/* SIDEBAR CONTENT */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  
                  {/* Total Card */}
                  <div className="bg-white p-6 shadow-sm border border-slate-200">
                       <div className="text-3xl font-bold text-blue-600 mb-1">
                           ${selectedInvoice.total.toFixed(2)}
                       </div>
                       <div className="text-sm text-slate-500">Invoice total</div>
                  </div>

                  {/* Activity Card */}
                   <div className="bg-white p-6 shadow-sm border border-slate-200">
                       <h3 className="font-bold text-sm mb-6">Recent activity</h3>
                       
                       <div className="ml-1 relative border-l-2 border-slate-100 pl-6 pb-2 space-y-8">
                           {/* Current Status */}
                           <div className="relative">
                               <div className={`absolute -left-[30px] top-0 w-4 h-4 rounded-full border-[4px] ${
                                   selectedInvoice.status === "Sent" ? "border-green-600" : "border-blue-600"
                               } bg-white`}></div>
                               <div>
                                   <div className={`text-sm font-bold ${
                                       selectedInvoice.status === "Sent" ? "text-green-600" : "text-blue-600"
                                   }`}>{selectedInvoice.status} Invoice</div>
                                   <div className="text-xs text-slate-500 mt-1">
                                       {selectedInvoice.status === "Sent" 
                                           ? `Invoice sent on ${new Date(selectedInvoice.sentAt!).toLocaleDateString()} at ${new Date(selectedInvoice.sentAt!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`
                                           : (
                                               <button 
                                                    onClick={() => handleSend(selectedInvoice)}
                                                    disabled={isSending}
                                                    className="underline hover:text-blue-800 disabled:opacity-50"
                                               >
                                                   {isSending ? "Sending..." : "Send now"}
                                               </button>
                                           )
                                       }
                                   </div>
                               </div>
                           </div>
                           
                           {/* History Item */}
                           <div className="relative">
                                <div className="absolute -left-[27px] top-1.5 w-2.5 h-2.5 rounded-full bg-black"></div>
                                <div>
                                    <div className="text-sm text-slate-700">
                                        {selectedInvoice.status === "Sent" ? "Invoice sent" : `Invoice saved as ${selectedInvoice.status.toLowerCase()}`}
                                    </div>
                                    <div className="text-xs text-slate-400 mt-1">
                                        {selectedInvoice.status === "Sent" && selectedInvoice.sentAt 
                                            ? new Date(selectedInvoice.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                            : "Just now"
                                        }
                                    </div>
                                </div>
                           </div>
                       </div>
                   </div>

                   {/* Details Card */}
                   <div className="bg-white p-6 shadow-sm border border-slate-200 space-y-6">
                       <h3 className="font-bold text-base">Invoice #{selectedInvoice.invoiceId}</h3>
                       
                       <div>
                           <div className="font-bold text-sm mb-2">Customer</div>
                           {selectedInvoice.customer ? (
                               <div className="flex items-center gap-3">
                                   <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                                       {selectedInvoice.customer.name.substring(0,2).toUpperCase()}
                                   </div>
                                    <div className="text-sm">
                                        <div className="font-medium">{selectedInvoice.customer.name}</div>
                                        <div className="text-slate-500 text-xs">{selectedInvoice.customer.email}</div>
                                    </div>
                               </div>
                           ) : (
                               <div className="text-sm text-slate-400 italic">No customer selected</div>
                           )}
                       </div>

                       <div className="border-t pt-4 space-y-3">
                           <div className="flex justify-between text-sm text-slate-600">
                               <span>Subtotal</span>
                               <span>${selectedInvoice.subtotal?.toFixed(2) || "0.00"}</span>
                           </div>
                           <div className="flex justify-between text-sm text-slate-600">
                               <span>Tax</span>
                               <span>$0.00</span>
                           </div>
                       </div>
                       
                       <div className="border-t pt-4 flex justify-between items-center">
                           <span className="font-bold text-lg">Total</span>
                           <span className="font-bold text-lg">${selectedInvoice.total.toFixed(2)}</span>
                       </div>
                   </div>
              </div>

                {/* SIDEBAR FOOTER */}
                <div className="h-[70px] bg-white border-t flex items-center px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 w-full divide-x">
                     {selectedInvoice.status !== "Paid" && role !== "Ops" && (
                         <button 
                             onClick={() => handleMarkAsPaid(selectedInvoice)}
                             className="flex-1 font-bold text-sm text-white bg-green-600 hover:bg-green-700 h-full"
                         >
                             Mark as Paid
                         </button>
                     )}
                     {role !== "Ops" && (
                       <>
                         <button 
                             onClick={() => handleEdit(selectedInvoice)}
                             className="flex-1 font-bold text-sm text-slate-900 hover:bg-slate-50 h-full"
                          >
                              Edit
                          </button>
                          <button 
                             onClick={() => handleDuplicate(selectedInvoice)}
                             className="flex-1 font-bold text-sm text-slate-900 hover:bg-slate-50 h-full whitespace-nowrap px-4"
                          >
                              Duplicate as invoice
                          </button>
                       </>
                     )}
                     <div className="flex-1 h-full relative">
                        <button 
                            onClick={() => setActiveDropdown(activeDropdown?.type === 'sidebar' ? null : { type: 'sidebar' })}
                            className="w-full font-bold text-sm text-slate-900 hover:bg-slate-50 h-full flex items-center justify-center gap-1"
                        >
                            More <ChevronDown size={14} />
                        </button>
                        {activeDropdown?.type === 'sidebar' && (
                            <div 
                                ref={dropdownRef}
                                className="absolute right-4 bottom-16 bg-white shadow-xl border rounded-lg py-2 w-64 z-50 text-left"
                            >
                                {role !== "Ops" && (
                                  <>
                                    <button 
                                        onClick={handleDuplicateSeries}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-slate-700"
                                    >
                                        Duplicate as recurring series
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(selectedInvoice.id)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 text-red-600"
                                    >
                                        Delete
                                    </button>
                                  </>
                                )}
                                {role === "Ops" && (
                                  <div className="px-4 py-2 text-xs text-slate-400 italic">
                                    View-only access
                                  </div>
                                )}
                            </div>
                        )}
                     </div>
                </div>
          </div>
       )}
    </div>
  );
}
