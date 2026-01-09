"use client";

import {
  X,
  Send,
  ChevronDown,
  Plus,
  Info,
  Calendar,
  CreditCard,
  Mail,
  Bell,
  Truck,
  Zap,
  Trash2,
  GripVertical,
} from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from "next/navigation";
import { InvoicePDF } from '@/components/InvoicePDF';
import { useCustomers } from "@/components/providers/CustomerContext";
import { useItems } from "@/components/providers/ItemContext";
import { useInvoices } from "@/components/providers/InvoiceContext";
import { sendInvoiceEmail } from "@/app/actions/send-invoice-email";
import { DatePicker } from "@/components/DatePicker";
import { CustomerDetailsModal } from "@/components/CustomerDetailsModal";
import { NewCustomerModal } from "@/components/NewCustomerModal";
import { useAuth } from "@/components/providers/AuthContext";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => <p>Loading PDF...</p>,
  }
);

export default function NewInvoice() {
  // --- STATE MANAGEMENT ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [serviceDate, setServiceDate] = useState<Date | null>(new Date());
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const { addInvoice, updateInvoice, invoices } = useInvoices();
  
  // Use Context
  const { customers, addCustomer } = useCustomers();
  const { items } = useItems(); // Get items from context
  const { role } = useAuth();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  const [lineItems, setLineItems] = useState<any[]>([]);

  // Load data if editing or if customerId is provided
  useEffect(() => {
    if (editId) {
      const invoiceToEdit = invoices.find(inv => inv.id === editId);
      if (invoiceToEdit) {
        setSelectedCustomer(invoiceToEdit.customer);
        setLineItems(invoiceToEdit.items);
      }
    } else {
      const customerId = searchParams.get("customerId");
      if (customerId && customers.length > 0) {
        const customer = customers.find(c => c.id === customerId);
        if (customer) {
          setSelectedCustomer(customer);
        }
      }
    }
  }, [editId, invoices, searchParams, customers]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const addItemDropdownRef = useRef<HTMLDivElement>(null);

  // Redirect Ops users if they try to access this page
  useEffect(() => {
    if (role === "Ops") {
      router.push("/payments/invoices");
    }
  }, [role, router]);

  // Helper to handle item selection
  const handleItemSelect = (index: number, item: any) => {
    const newLineItems = [...lineItems];
    newLineItems[index] = {
      ...newLineItems[index],
      name: item.name,
      price: item.price,
    };
    setLineItems(newLineItems);
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
      const newLineItems = [...lineItems];
      newLineItems[index] = { ...newLineItems[index], [field]: value };
      setLineItems(newLineItems);
  }
  
  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        addItemDropdownRef.current &&
        !addItemDropdownRef.current.contains(event.target as Node)
      ) {
        setIsAddItemOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const subtotal = lineItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  const handleSaveDraft = () => {
      const projectId = searchParams.get("projectId");
      const invoiceData = {
          invoiceId: "000001", 
          title: "almamiles", 
          customer: selectedCustomer,
          items: lineItems,
          subtotal: subtotal,
          total: subtotal,
          status: "Draft" as const,
          date: new Date().toISOString(),
          projectId: projectId || null
      };

      if (editId) {
          updateInvoice(editId, invoiceData);
      } else {
          addInvoice(invoiceData);
      }
      router.push("/payments/invoices");
  };

  const handleSendEmail = async () => {
    if (!selectedCustomer || !selectedCustomer.email) {
      alert("Please select a customer with an email address.");
      return;
    }

    setIsSending(true);
    try {
      const projectId = searchParams.get("projectId");
      const result = await sendInvoiceEmail({
        customerName: selectedCustomer.name,
        customerEmail: selectedCustomer.email,
        invoiceId: "000001", // Dynamic ID in real app
        date: new Date().toLocaleDateString(),
        items: lineItems,
        total: subtotal,
      });

      if (result.success) {
        // Save the invoice as "Sent"
        addInvoice({
          invoiceId: "000001", // Dynamic ID in real app
          title: "almamiles",
          customer: selectedCustomer,
          items: lineItems,
          subtotal: subtotal,
          total: subtotal,
          status: "Sent",
          date: new Date().toISOString(),
          sentAt: new Date().toISOString(),
          projectId: projectId || null
        });
        
        alert("Invoice sent successfully!");
        router.push("/payments/invoices");
      } else {
        alert(`Failed to send invoice: ${result.error}`);
      }
    } catch (error) {
      alert("An unexpected error occurred.");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col font-sans antialiased text-slate-900">
      {/* ... header ... */}
      <header className="bg-white border-b px-6 py-2 flex justify-between items-center sticky top-0 z-50 h-14">
        <Link
          href="/payments/overview"
          className="p-2 hover:bg-slate-100 rounded-full"
        >
          <X size={20} className="text-slate-600" />
        </Link>
        <h1 className="font-bold text-sm absolute left-1/2 -translate-x-1/2">
          {editId ? "Edit invoice" : "New invoice"}
        </h1>
        <div className="flex items-center gap-2">
          <button 
             onClick={() => setIsPreviewOpen(true)}
             className="px-4 py-2 text-sm font-bold hover:bg-slate-50 rounded-md"
          >
             Preview
          </button>
          <button 
             onClick={handleSaveDraft}
             className="px-4 py-2 text-sm font-bold hover:bg-slate-50 rounded-md"
          >
             {editId ? "Update Draft" : "Save as Draft"}
          </button>
          <button 
            onClick={handleSendEmail}
            disabled={isSending}
            className="bg-black text-white px-5 py-2 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? "Sending..." : "Send"} <Send size={14} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* --- MAIN FORM --- */}
        <main className="flex-1 overflow-y-auto p-8 flex justify-center">
          <div className="w-full max-w-2xl space-y-6 pb-20">
            {/* DETAILS SECTION */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-6 text-left">
              <h2 className="font-bold text-lg">Details</h2>

              <div className="space-y-4">
                {!selectedCustomer ? (
                  <div className="relative" ref={dropdownRef}>
                    <div
                      className={`border rounded-lg p-3 cursor-pointer ${
                        isDropdownOpen
                          ? "ring-2 ring-black"
                          : "border-slate-200"
                      }`}
                      onClick={() => setIsDropdownOpen(true)}
                    >
                      <label
                        className={`text-[10px] uppercase font-bold block mb-1 ${
                          isDropdownOpen ? "text-blue-600" : "text-slate-400"
                        }`}
                      >
                        Add customer
                      </label>
                      <input
                        type="text"
                        placeholder="Name, email address or phone number"
                        className="w-full text-sm outline-none bg-transparent cursor-pointer"
                        readOnly
                      />
                    </div>
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                        <button
                          onClick={() => {
                            setIsModalOpen(true);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full p-4 flex items-center gap-3 text-sm hover:bg-slate-50 border-b sticky top-0 bg-white z-10"
                        >
                          <div className="bg-slate-100 p-2 rounded-lg text-black">
                            <Plus size={16} />
                          </div>
                          <span className="font-bold">Create new customer</span>
                        </button>
                        
                         {customers.map((c: any) => (
                             <button
                                key={c.id}
                                onClick={() => {
                                    setSelectedCustomer(c);
                                    setIsDropdownOpen(false);
                                }}
                                className="w-full p-4 text-left text-sm hover:bg-slate-50 flex items-center gap-3"
                             >
                                <div className="bg-slate-200 text-slate-600 font-bold rounded-lg w-10 h-10 flex items-center justify-center text-xs shrink-0">
                                    {c.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold">{c.name}</div>
                                    <div className="text-slate-500 text-xs">{c.email}</div>
                                </div>
                             </button>
                         ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex justify-between items-start pb-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-sm text-black">
                        {selectedCustomer.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedCustomer.email}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedCustomer.address}
                      </div>
                      <div className="text-xs text-slate-500">
                        {selectedCustomer.location}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center text-xs font-bold">
                      <button 
                        onClick={() => setIsCustomerModalOpen(true)}
                        className="underline underline-offset-4 text-slate-900"
                      >
                        View details
                      </button>
                      <span className="text-slate-300 font-light text-base mx-1">|</span>
                      <button
                        onClick={() => setSelectedCustomer(null)}
                        className="underline underline-offset-4 text-slate-900"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="border rounded-lg p-3">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Invoice title
                  </label>
                  <input
                    type="text"
                    defaultValue="almamiles"
                    className="w-full text-sm outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <DatePicker
                    value={serviceDate}
                    onChange={setServiceDate}
                    label="Service date"
                  />
                  <div className="border rounded-lg p-3 bg-slate-50">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Invoice ID
                    </label>
                    <span className="text-sm font-mono text-slate-600">
                      000001
                    </span>
                  </div>
                </div>

                <textarea
                  placeholder="Message"
                  className="w-full border rounded-lg p-4 text-sm min-h-[100px] outline-none resize-none"
                />
                <button className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                  <Zap size={14} className="text-purple-600 fill-purple-600" />{" "}
                  Write with AI
                </button>
              </div>
            </div>

            {/* LINE ITEMS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-left">
              <div className="p-6 flex justify-between items-center border-b">
                <h2 className="font-bold text-lg">Line items</h2>
                <ChevronDown size={18} className="text-slate-400" />
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase px-2 mb-2">
                  <div className="col-span-5">Item</div>
                  <div className="col-span-2 text-center">Qty</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-3 text-right">Total</div>
                </div>

                {lineItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-4 items-center group relative z-10 py-1"
                  >
                    <div className="col-span-5 flex items-center gap-2 relative">
                      <GripVertical
                        size={16}
                        className="text-slate-300 cursor-grab shrink-0"
                      />
                      <div className="w-full relative group/input">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleLineItemChange(index, 'name', e.target.value)}
                            className="w-full border-b py-2 text-sm outline-none focus:border-black transition-colors"
                            placeholder="Item name"
                          />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleLineItemChange(index, 'qty', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded-lg p-2 text-sm text-center outline-none focus:ring-2 ring-black transition-all"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        value={item.price} 
                        onChange={(e) => handleLineItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full border rounded-lg p-2 text-sm text-center outline-none focus:ring-2 ring-black transition-all"
                      />
                    </div>
                    <div className="col-span-3 text-right text-sm font-bold">
                      <div className="flex justify-end items-center gap-3">
                          ${(item.qty * item.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          <button 
                            onClick={() => {
                                const newItems = lineItems.filter((_, i) => i !== index);
                                setLineItems(newItems);
                            }}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 size={14} />
                          </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ADD ITEM DROPDOWN */}
                <div className="relative" ref={addItemDropdownRef}>
                    <button 
                        onClick={() => setIsAddItemOpen(!isAddItemOpen)}
                        className="w-full border-2 border-dashed border-slate-200 rounded-lg p-4 flex items-center gap-3 text-slate-400 hover:border-slate-400 transition-colors"
                    >
                      <Plus size={18} /> Add an item
                    </button>
                    
                    {isAddItemOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 shadow-xl rounded-xl z-20 p-2">
                           <div className="max-h-60 overflow-y-auto">
                              <button
                                  onClick={() => {
                                      setLineItems([...lineItems, { id: Math.random(), name: "", qty: 1, price: 0 }]);
                                      setIsAddItemOpen(false);
                                  }}
                                  className="w-full text-left px-3 py-2 text-sm font-bold hover:bg-slate-50 rounded-lg flex items-center gap-2 mb-2"
                              >
                                  <Plus size={14} /> Create blank item
                              </button>
                              
                              {items.length > 0 && (
                                <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-1 mb-1">
                                  Your item library
                                </div>
                              )}
                              
                              {items.map(item => (
                                  <button
                                      key={item.id}
                                      onClick={() => {
                                          setLineItems([...lineItems, { id: Math.random(), name: item.name, qty: 1, price: item.price }]);
                                          setIsAddItemOpen(false);
                                      }}
                                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded-lg flex justify-between items-center group"
                                  >
                                      <span className="font-medium">{item.name}</span>
                                      <span className="text-slate-500">${item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                  </button>
                              ))}
                              
                              {items.length === 0 && (
                                <div className="px-3 py-4 text-center">
                                  <p className="text-xs text-slate-500 mb-2">No items in library</p>
                                  <Link href="/items/new" className="text-xs font-bold text-blue-600 hover:underline">
                                    + Create new item
                                  </Link>
                                </div>
                              )}
                           </div>
                      </div>
                    )}
                </div>

                <div className="flex flex-col items-end pt-4 space-y-2 text-sm">
                  <div className="flex justify-between w-64 text-slate-600">
                    <span>Subtotal</span> <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between w-64 font-bold text-lg pt-2 border-t">
                    <span>Total</span> <span>${subtotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* SIDEBAR */}
        <aside className="w-[340px] bg-white border-l p-6 overflow-y-auto hidden xl:block text-left">
          <h2 className="font-bold text-sm mb-1">Settings at a glance</h2>
          <p className="text-[10px] text-slate-400 mb-8 flex items-center gap-1">
            <span className="underline decoration-dotted">Square invoice</span>{" "}
            settings applied <Info size={12} />
          </p>
          <div className="space-y-6">
            <SidebarAction
              icon={Calendar}
              title="Schedule"
              sub="Send immediately; Due today"
            />
            <SidebarAction
              icon={CreditCard}
              title="Accepted payment methods"
              sub="Credit, debit; ACH on; Cash App Pay on"
            />
            <SidebarAction icon={Mail} title="Share via" sub="Email" />
          </div>
        </aside>
      </div>

      <NewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(customer) => {
          setSelectedCustomer(customer);
          setIsModalOpen(false);
        }}
      />

       {/* PDF PREVIEW MODAL */}
       {isPreviewOpen && (
        <div className="fixed inset-0 bg-white z-[100] flex flex-col">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
                 <h2 className="font-bold text-lg">Invoice Preview</h2>
                 <div className="flex gap-4 items-center">
                    <button onClick={() => setIsPreviewOpen(false)} className="text-sm font-bold text-slate-500 hover:text-black">
                        Close
                    </button>
                 </div>
            </div>
            <div className="flex-1 bg-white flex justify-center overflow-hidden">
                <PDFViewer showToolbar={false} className="w-full h-full shadow-none border-none">
                    <InvoicePDF 
                        customer={selectedCustomer}
                        items={lineItems}
                        subtotal={subtotal}
                        total={subtotal}
                        invoiceId="000001"
                        date="01/16/2026"
                    />
                </PDFViewer>
            </div>
        </div>
       )}

      {/* Customer Details Modal */}
      <CustomerDetailsModal
        customer={selectedCustomer}
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onRemove={() => {
          setSelectedCustomer(null);
          setIsCustomerModalOpen(false);
        }}
        onUpdate={(updatedCustomer) => {
          setSelectedCustomer(updatedCustomer);
        }}
      />
    </div>
  );
}

// --- HELPERS ---
function SidebarAction({ icon: Icon, title, sub }: any) {
  return (
    <div className="flex gap-4 group cursor-pointer border-b border-slate-50 pb-6">
      <div className="p-2.5 bg-slate-50 rounded-lg h-fit group-hover:bg-slate-100 transition-colors">
        <Icon size={18} className="text-slate-600" />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold">{title}</span>
          <ChevronDown size={14} className="text-slate-300" />
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{sub}</p>
      </div>
    </div>
  );
}
