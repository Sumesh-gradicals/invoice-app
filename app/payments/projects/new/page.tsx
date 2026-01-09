"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProjects, ProjectPhase } from "@/components/providers/ProjectContext";
import { useCustomers } from "@/components/providers/CustomerContext";
import { DatePicker } from "@/components/DatePicker";
import { X, ChevronDown, Plus } from "lucide-react";
import { NewCustomerModal } from "@/components/NewCustomerModal";

const phases: ProjectPhase[] = ["Inquiry", "Proposal", "Booked", "In progress", "Complete"];

export default function NewProjectPage() {
  const router = useRouter();
  const { addProject } = useProjects();
  const { customers } = useCustomers();
  
  const [projectName, setProjectName] = useState("");
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase>("Inquiry");
  const [selectedCustomers, setSelectedCustomers] = useState<any[]>([]);
  const [projectDate, setProjectDate] = useState<Date | null>(null);
  const [description, setDescription] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [winConfidence, setWinConfidence] = useState("");
  
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isPhaseDropdownOpen, setIsPhaseDropdownOpen] = useState(false);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const phaseDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
      if (phaseDropdownRef.current && !phaseDropdownRef.current.contains(event.target as Node)) {
        setIsPhaseDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const handleAddCustomer = (customer: any) => {
    if (!selectedCustomers.find((c) => c.id === customer.id)) {
      setSelectedCustomers([...selectedCustomers, customer]);
    }
    setCustomerSearchTerm("");
  };

  const handleRemoveCustomer = (customerId: string) => {
    setSelectedCustomers(selectedCustomers.filter((c) => c.id !== customerId));
  };

  const handleSetPrimary = (customerId: string) => {
    const customer = selectedCustomers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomers([
        customer,
        ...selectedCustomers.filter((c) => c.id !== customerId),
      ]);
    }
  };

  const handleSubmit = async () => {
    if (!projectName.trim()) {
      alert("Please enter a project name");
      return;
    }

    await addProject({
      name: projectName,
      phase: selectedPhase,
      customers: selectedCustomers.map((c, i) => ({ id: c.id, isPrimary: i === 0 })),
      date: projectDate?.toISOString(),
      description,
      estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
      winConfidence,
    });

    router.push("/payments/projects");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">New project</h1>

      {/* Customers Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold mb-2">Customers</h2>
        <p className="text-sm text-slate-600 mb-4">
          Add customers related to this project. Later, you'll be able to share this project with any of the customers listed.
        </p>

        <div className="relative mb-4" ref={customerDropdownRef}>
          <input
            type="text"
            placeholder="Search by name or email address"
            value={customerSearchTerm}
            onChange={(e) => {
              setCustomerSearchTerm(e.target.value);
              setIsCustomerDropdownOpen(true);
            }}
            onFocus={() => setIsCustomerDropdownOpen(true)}
            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />

          {isCustomerDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
              <button
                onClick={() => {
                  setIsModalOpen(true);
                  setIsCustomerDropdownOpen(false);
                }}
                className="w-full p-4 flex items-center gap-3 text-sm hover:bg-slate-50 border-b sticky top-0 bg-white z-10"
              >
                <div className="bg-slate-100 p-2 rounded-lg text-black">
                  <Plus size={16} />
                </div>
                <span className="font-bold">Create new customer</span>
              </button>
              
              {filteredCustomers.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    handleAddCustomer(customer);
                    setIsCustomerDropdownOpen(false);
                  }}
                  className="w-full p-3 text-left hover:bg-slate-50 flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm">{customer.name}</div>
                    <div className="text-xs text-slate-500">{customer.email}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected Customers */}
        {selectedCustomers.map((customer, index) => (
          <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold">
                {customer.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="font-bold text-sm">{customer.name}</div>
                <div className="text-xs text-slate-500">{customer.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {index === 0 ? (
                <span className="text-xs font-bold text-green-600">Primary</span>
              ) : (
                <button
                  onClick={() => handleSetPrimary(customer.id)}
                  className="text-xs text-slate-600 hover:text-black"
                >
                  Set as primary
                </button>
              )}
              <button
                onClick={() => handleRemoveCustomer(customer.id)}
                className="text-slate-400 hover:text-black"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold mb-4">Details</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Project name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="relative" ref={phaseDropdownRef}>
            <label className="text-xs font-bold text-slate-600 block mb-2">Phase</label>
            <div
              onClick={() => setIsPhaseDropdownOpen(!isPhaseDropdownOpen)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm cursor-pointer flex items-center justify-between"
            >
              <span>{selectedPhase}</span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>

            {isPhaseDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border rounded-lg shadow-xl z-50">
                {phases.map((phase) => (
                  <button
                    key={phase}
                    onClick={() => {
                      setSelectedPhase(phase);
                      setIsPhaseDropdownOpen(false);
                    }}
                    className="w-full p-3 text-left text-sm hover:bg-slate-50"
                  >
                    {phase}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DatePicker
            value={projectDate}
            onChange={setProjectDate}
            label="Date and time (optional)"
          />

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">Estimated value (optional)</label>
              <input
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-2">Win confidence (optional)</label>
              <input
                type="text"
                value={winConfidence}
                onChange={(e) => setWinConfidence(e.target.value)}
                placeholder="e.g., High, Medium, Low"
                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => router.back()}
          className="px-6 py-2 border border-slate-300 rounded-full text-sm font-bold hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-zinc-800"
        >
          Create project
        </button>
      </div>
      <NewCustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(customer) => handleAddCustomer(customer)}
      />
    </div>
  );
}
