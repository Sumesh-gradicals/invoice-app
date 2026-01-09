"use client";

import React, { useState } from "react";
import { X, Info, Paperclip, PenTool } from "lucide-react";
import { useCustomers } from "@/components/providers/CustomerContext";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: any) => void;
}

const ModalInput = ({ label, value, onChange, icon, select, readOnly, placeholder }: any) => (
  <div className={`border rounded-xl p-3 bg-white focus-within:ring-2 ring-black transition-all ${readOnly ? 'bg-slate-50' : ''}`}>
    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        className="w-full text-sm outline-none bg-transparent"
      />
      {icon}
    </div>
  </div>
);

export function NewCustomerModal({ isOpen, onClose, onSuccess }: NewCustomerModalProps) {
  const { addCustomer } = useCustomers();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    notes: "",
    attachment: null as File | null,
    signature: null as File | null
  });

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!form.firstName || !form.email) {
      alert("First name and email are required.");
      return;
    }

    const newCustomer = await addCustomer({
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email,
      phone: form.phone,
      address: form.address,
      location: `${form.city}, ${form.state} ${form.zip}`.trim() === "," ? "" : `${form.city}, ${form.state} ${form.zip}`.trim(),
      notes: form.notes,
      attachmentUrl: form.attachment ? URL.createObjectURL(form.attachment) : undefined,
      signatureUrl: form.signature ? URL.createObjectURL(form.signature) : undefined,
    });

    if (newCustomer) {
      onSuccess(newCustomer);
      onClose();
      // Reset form
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
        phone: "",
        notes: "",
        attachment: null,
        signature: null
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl relative text-left">
        <div className="sticky top-0 bg-white px-8 py-6 flex justify-between items-center border-b z-10">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-xl font-bold absolute left-1/2 -translate-x-1/2">
            New customer
          </h2>
          <button
            onClick={handleSave}
            className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-zinc-800 transition-colors"
          >
            Save
          </button>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1">
              <ModalInput 
                label="First name" 
                value={form.firstName} 
                onChange={(e: any) => setForm({...form, firstName: e.target.value})} 
              />
            </div>
            <div className="col-span-1">
              <ModalInput 
                label="Last name" 
                value={form.lastName} 
                onChange={(e: any) => setForm({...form, lastName: e.target.value})}
              />
            </div>
          </div>
          <ModalInput 
            label="Email address" 
            icon={<Info size={14} className="text-slate-300" />} 
            value={form.email} 
            onChange={(e: any) => setForm({...form, email: e.target.value})} 
          />
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-5">
              <ModalInput
                label="Country code"
                value="United States (+1)"
                readOnly
              />
            </div>
            <div className="col-span-7">
              <ModalInput 
                label="Phone number (optional)" 
                value={form.phone} 
                onChange={(e: any) => setForm({...form, phone: e.target.value})} 
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold text-sm mb-4">Billing address</h3>
            <div className="space-y-4">
              <ModalInput 
                label="Street address" 
                value={form.address} 
                onChange={(e: any) => setForm({...form, address: e.target.value})} 
              />
              <ModalInput 
                label="City" 
                value={form.city} 
                onChange={(e: any) => setForm({...form, city: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-4">
                <ModalInput 
                  label="State" 
                  value={form.state} 
                  onChange={(e: any) => setForm({...form, state: e.target.value})} 
                />
                <ModalInput 
                  label="ZIP" 
                  value={form.zip} 
                  onChange={(e: any) => setForm({...form, zip: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold text-sm mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div className="border rounded-xl p-3 bg-white focus-within:ring-2 ring-black transition-all">
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Notes
                </label>
                <textarea 
                  value={form.notes}
                  onChange={(e) => setForm({...form, notes: e.target.value})}
                  placeholder="Add any internal notes about this customer..."
                  className="w-full text-sm outline-none bg-transparent min-h-[100px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-3 bg-white focus-within:ring-2 ring-black transition-all relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Attachment (JPG/PNG)
                  </label>
                  <div className="flex items-center gap-2">
                    <Paperclip size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500 truncate flex-1">
                      {form.attachment ? form.attachment.name : "Upload file"}
                    </span>
                    {form.attachment && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({...form, attachment: null});
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png"
                    onChange={(e) => setForm({...form, attachment: e.target.files?.[0] || null})}
                    className={`absolute inset-0 opacity-0 cursor-pointer ${form.attachment ? 'pointer-events-none' : ''}`}
                  />
                </div>

                <div className="border rounded-xl p-3 bg-white focus-within:ring-2 ring-black transition-all relative">
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Signature (JPG/PNG)
                  </label>
                  <div className="flex items-center gap-2">
                    <PenTool size={14} className="text-slate-400" />
                    <span className="text-sm text-slate-500 truncate flex-1">
                      {form.signature ? form.signature.name : "Upload signature"}
                    </span>
                    {form.signature && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setForm({...form, signature: null});
                        }}
                        className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png"
                    onChange={(e) => setForm({...form, signature: e.target.files?.[0] || null})}
                    className={`absolute inset-0 opacity-0 cursor-pointer ${form.signature ? 'pointer-events-none' : ''}`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
