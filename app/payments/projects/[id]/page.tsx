"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjects } from "@/components/providers/ProjectContext";
import { useInvoices } from "@/components/providers/InvoiceContext";
import { ArrowLeft, Share, MoreHorizontal, Plus, X, Search, Trash2 } from "lucide-react";
import { useCustomers } from "@/components/providers/CustomerContext";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { projects, addCustomerToProject, removeCustomerFromProject } = useProjects();
  const { invoices, updateStatus } = useInvoices();
  const { customers, refreshCustomers } = useCustomers();
  const [activeTab, setActiveTab] = useState<"documents" | "customers">("documents");
  const [isCreateMenuOpen, setIsCreateMenuOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isAddingCustomer, setIsAddingCustomer] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const createMenuRef = useRef<HTMLDivElement>(null);

  const project = projects.find((p) => p.id === params.id);
  
  // Filter invoices that belong to this project
  const projectInvoices = invoices.filter((invoice) => invoice.projectId === params.id);

  const selectedInvoice = selectedInvoiceId
    ? invoices.find((inv) => inv.id === selectedInvoiceId)
    : null;

  const handleMarkAsPaid = async (id: string) => {
    await updateStatus(id, "Paid");
    alert("Invoice marked as paid!");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(event.target as Node)) {
        setIsCreateMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <button
            onClick={() => router.push("/payments/projects")}
            className="text-blue-600 hover:underline"
          >
            Back to projects
          </button>
        </div>
      </div>
    );
  }

  const primaryCustomer = project.customers?.[0];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return `on ${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().slice(2)}`;
  };

  return (
    <div className="h-full flex">
      {/* Main Content */}
      <div className={`flex-1 pr-6 ${selectedInvoiceId ? "mr-96" : ""}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/payments/projects")}
              className="p-2 hover:bg-slate-100 rounded-full"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">{project.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full">
              <Share size={20} />
            </button>
            <button className="p-2 hover:bg-slate-100 rounded-full">
              <MoreHorizontal size={20} />
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-zinc-800">
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("documents")}
              className={`pb-3 text-sm font-bold border-b-2 ${
                activeTab === "documents"
                  ? "border-black text-black"
                  : "border-transparent text-slate-500"
              }`}
            >
              Documents
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`pb-3 text-sm font-bold border-b-2 ${
                activeTab === "customers"
                  ? "border-black text-black"
                  : "border-transparent text-slate-500"
              }`}
            >
              Customers
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "documents" ? (
          <div>
            {/* Create New Button */}
            <div className="flex justify-end mb-6 relative" ref={createMenuRef}>
              <button
                onClick={() => setIsCreateMenuOpen(!isCreateMenuOpen)}
                className="bg-black text-white p-3 rounded-full hover:bg-zinc-800"
              >
                <Plus size={20} />
              </button>

              {isCreateMenuOpen && (
                <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-xl z-50 w-48">
                  <div className="py-2">
                    <div className="px-4 py-2 text-xs font-bold text-slate-500">Create new</div>
                    <button 
                      onClick={() => {
                        const baseUrl = `/payments/invoices/new?projectId=${params.id}`;
                        if (primaryCustomer) {
                          router.push(`${baseUrl}&customerId=${primaryCustomer.id}`);
                        } else {
                          router.push(baseUrl);
                        }
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50"
                    >
                      Invoice
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Recurring series
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Estimate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Contract
                    </button>
                  </div>
                  <div className="border-t py-2">
                    <div className="px-4 py-2 text-xs font-bold text-slate-500">Add existing</div>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Invoice
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Recurring series
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Estimate
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Contract
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">
                      Attachment
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Invoices Section */}
            <div className="mb-8">
              <h3 className="font-bold text-sm mb-3">Invoices</h3>
              {projectInvoices.length > 0 ? (
                projectInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => setSelectedInvoiceId(invoice.id)}
                    className="flex items-center justify-between p-4 border-b hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-sm">
                        #{invoice.invoiceId} {invoice.customer.name}
                      </div>
                      <div className="text-xs text-slate-500">{invoice.customer.name}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`text-sm ${
                          invoice.status === "Paid"
                            ? "text-green-600"
                            : invoice.status === "Sent"
                            ? "text-green-600"
                            : "text-blue-600"
                        }`}
                      >
                        {invoice.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(invoice.sentAt || invoice.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-500 py-4">No invoices for this project</div>
              )}
            </div>

            {/* Recurring Series Section */}
            <div>
              <h3 className="font-bold text-sm mb-3">Recurring series</h3>
              <div className="text-sm text-slate-500 py-4">No recurring series for this project</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-sm">Project Customers</h3>
              <button 
                onClick={() => setIsAddingCustomer(true)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                <Plus size={14} /> Add existing
              </button>
            </div>
            {project.customers?.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-4 border rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold">{customer.name}</div>
                    <div className="text-sm text-slate-500">{customer.email}</div>
                    {customer.phone && (
                      <div className="text-sm text-slate-500">{customer.phone}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-blue-600">
                    {project.customers?.[0]?.id === customer.id ? "Primary" : "Not shared"}
                  </span>
                  <button 
                    onClick={async () => {
                      if (confirm(`Remove ${customer.name} from this project?`)) {
                        await removeCustomerFromProject(project.id, customer.id);
                        await refreshCustomers();
                      }
                    }}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    title="Remove from project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Project Overview Sidebar */}
      {!selectedInvoiceId && (
        <div className="w-80 border-l pl-6">
          <div className="bg-white rounded-lg border p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Project overview</h3>
              <button className="text-xs underline hover:no-underline">Edit</button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-slate-500 mb-1">Customer</div>
                <div className="text-sm font-medium">{primaryCustomer?.name || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Phase</div>
                <div className="text-sm font-medium">{project.phase}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4 mb-4">
            <h3 className="font-bold text-sm mb-2">Notes</h3>
            <button className="text-xs text-blue-600 hover:underline">Add note</button>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm">Activity</h3>
              <button className="text-xs text-slate-500">Filter tasks: All</button>
            </div>
            <div className="text-center py-8">
              <div className="mb-4">
                <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto">
                  <circle cx="40" cy="40" r="30" fill="#f1f5f9" />
                  <path d="M30 35 L35 40 L50 25" stroke="#64748b" strokeWidth="3" fill="none" />
                </svg>
              </div>
              <div className="text-sm font-bold mb-1">All tasks completed</div>
              <div className="text-xs text-slate-500">
                Your business is all taken care of. Keep up the good work.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Sidebar */}
      {selectedInvoiceId && selectedInvoice && (
        <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-xl overflow-y-auto z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">
                {selectedInvoice.status} invoice for {selectedInvoice.customer.name}
              </h2>
              <button
                onClick={() => setSelectedInvoiceId(null)}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Invoice Total */}
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">
                  ${selectedInvoice.total.toFixed(2)}
                </div>
                <div className="text-sm text-slate-600">Invoice total</div>
              </div>

              {/* Customer Info */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {selectedInvoice.customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold">{selectedInvoice.customer.name}</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div>
                <h3 className="font-bold text-sm mb-3">Recent activity</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                    <div>
                      <div className="text-sm font-medium text-blue-600">
                        {selectedInvoice.status} Invoice
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedInvoice.status === "Sent"
                          ? "Invoice has been sent"
                          : "Invoice has not been sent"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
                    <div>
                      <div className="text-sm">Invoice saved as draft</div>
                      <div className="text-xs text-slate-500">
                        {new Date(selectedInvoice.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Link */}
              <div className="border-t pt-4">
                <h3 className="font-bold text-sm mb-2">Project</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{project.name}</div>
                    <div className="text-xs text-slate-500">
                      Start date: {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-xs text-slate-600">{project.phase}</span>
                </div>
              </div>

              {/* Invoice Details */}
              <div className="border-t pt-4">
                <h3 className="font-bold mb-3">{selectedInvoice.customer.name}</h3>
                <div className="text-sm mb-2">Invoice #{selectedInvoice.invoiceId}</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span>${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Footer */}
          <div className="h-[70px] bg-white border-t flex items-center px-6 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 w-full divide-x">
            {selectedInvoice.status !== "Paid" && (
              <button 
                onClick={() => handleMarkAsPaid(selectedInvoice.id)}
                className="flex-1 font-bold text-sm text-white bg-green-600 hover:bg-green-700 h-full"
              >
                Mark as Paid
              </button>
            )}
            <button 
              onClick={() => router.push(`/payments/invoices/new?id=${selectedInvoice.id}`)}
              className="flex-1 font-bold text-sm text-slate-900 hover:bg-slate-50 h-full"
            >
              Edit
            </button>
          </div>
        </div>
      )}
      {/* ADD CUSTOMER MODAL */}
      {isAddingCustomer && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative text-left overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Add customer to project</h2>
              <button
                onClick={() => {
                  setIsAddingCustomer(false);
                  setCustomerSearchTerm("");
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={customerSearchTerm}
                  onChange={(e) => setCustomerSearchTerm(e.target.value)}
                  placeholder="Search customers"
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  autoFocus
                />
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                {customers
                  .filter(c => 
                    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) || 
                    c.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
                  )
                  .map(c => (
                    <button
                      key={c.id}
                      onClick={async () => {
                        await addCustomerToProject(project.id, c.id);
                        await refreshCustomers();
                        setIsAddingCustomer(false);
                        setCustomerSearchTerm("");
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 text-sm flex items-center gap-3"
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px]">
                        {c.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-xs text-slate-500">{c.email}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
