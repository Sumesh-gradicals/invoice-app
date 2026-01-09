"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface CustomerDetailsModalProps {
  customer: any;
  isOpen: boolean;
  onClose: () => void;
  onRemove: () => void;
  onUpdate?: (customer: any) => void;
}

export function CustomerDetailsModal({
  customer,
  isOpen,
  onClose,
  onRemove,
  onUpdate,
}: CustomerDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: customer?.name?.split(" ")[0] || "",
    lastName: customer?.name?.split(" ").slice(1).join(" ") || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    company: customer?.company || "",
    address: customer?.address || "",
    city: customer?.city || "",
    state: customer?.state || "",
    zip: customer?.zip || "",
  });

  if (!isOpen || !customer) return null;

  const handleSave = () => {
    if (onUpdate) {
      const updatedCustomer = {
        ...customer,
        name: `${editForm.firstName} ${editForm.lastName}`.trim(),
        email: editForm.email,
        phone: editForm.phone,
        company: editForm.company,
        address: `${editForm.address}, ${editForm.city}, ${editForm.state} ${editForm.zip}`,
      };
      onUpdate(updatedCustomer);
    }
    setIsEditing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full"
          >
            <X size={20} />
          </button>
          <h2 className="font-bold text-lg">
            {isEditing ? "Edit customer" : "Customer details"}
          </h2>
          <button
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="px-4 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800"
          >
            {isEditing ? "Save" : "Edit"}
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {!isEditing ? (
            <>
              {/* View Mode */}
              <div>
                <div className="font-bold text-lg mb-1">{customer.name}</div>
                <div className="text-sm text-blue-600 mb-2">{customer.email}</div>
                {customer.address && (
                  <>
                    <div className="text-sm text-slate-600">{customer.address}</div>
                    <div className="text-sm text-slate-600">{customer.location}</div>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50"
                >
                  Edit customer
                </button>
                <button
                  onClick={() => {
                    onRemove();
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm font-bold hover:bg-slate-50 text-red-600"
                >
                  Remove
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Edit Mode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">
                    First name
                  </label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, firstName: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">
                    Last name
                  </label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, lastName: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-2">
                  Phone number (optional)
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-sm mb-4">Additional information</h3>
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-2">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={editForm.company}
                    onChange={(e) =>
                      setEditForm({ ...editForm, company: e.target.value })
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold text-sm mb-4">Billing address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">
                      Street address
                    </label>
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      value={editForm.city}
                      onChange={(e) =>
                        setEditForm({ ...editForm, city: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">
                      State
                    </label>
                    <input
                      type="text"
                      value={editForm.state}
                      onChange={(e) =>
                        setEditForm({ ...editForm, state: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-2">
                      Postal code
                    </label>
                    <input
                      type="text"
                      value={editForm.zip}
                      onChange={(e) =>
                        setEditForm({ ...editForm, zip: e.target.value })
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
