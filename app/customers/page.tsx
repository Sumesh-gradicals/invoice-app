"use client";

import React, { useState } from "react";
import { useCustomers, Customer } from "@/components/providers/CustomerContext";
import { useProjects } from "@/components/providers/ProjectContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search,
  ChevronDown,
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  X,
  Info,
  Trash2
} from "lucide-react";
import { NewCustomerModal } from "@/components/NewCustomerModal";
import { useAuth } from "@/components/providers/AuthContext";

function ModalInput({ label, value, onChange, icon, select, readOnly }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          className={`w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black ${
            select ? "cursor-pointer" : ""
          }`}
        />
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        {select && (
          <ChevronDown
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { customers, addCustomer, refreshCustomers, deleteCustomer } = useCustomers();
  const { projects, addCustomerToProject } = useProjects();
  const { role } = useAuth();
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [groupSearchTerm, setGroupSearchTerm] = useState("");
  const [isAddingCustomerToProject, setIsAddingCustomerToProject] = useState<string | null>(null);
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [isDeletingCustomer, setIsDeletingCustomer] = useState<string | null>(null);
  const [grouping, setGrouping] = useState<"all" | "byProject">("all");
  const [isGroupingDropdownOpen, setIsGroupingDropdownOpen] = useState(false);

  const handleCreateCustomerSuccess = async () => {
    await refreshCustomers();
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold">Customers</h1>
        </div>
        <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
             Import / Export <ChevronDown size={14} />
            </button>
            {role !== "Ops" && (
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800"
              >
                Create customer
              </button>
            )}
        </div>
      </header>

      {/* FILTERS & SEARCH */}
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2 bg-white border rounded-full px-4 py-2 w-full max-w-sm">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search" className="bg-transparent outline-none text-sm w-full"/>
         </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white border rounded-xl shadow-sm flex-1 flex flex-col">
          {/* TOOLBAR */}
          <div className="p-4 border-b flex justify-between items-center">
             <div className="flex items-center gap-2 relative">
                 <h2 
                   className="font-bold text-lg flex items-center gap-2 cursor-pointer hover:text-slate-600 transition-colors"
                   onClick={() => setIsGroupingDropdownOpen(!isGroupingDropdownOpen)}
                 > 
                   Group: {grouping === "all" ? "All customers" : "By project"} 
                   <ChevronDown size={16} className={`text-slate-500 transition-transform ${isGroupingDropdownOpen ? 'rotate-180' : ''}`}/>
                 </h2>
                 {isGroupingDropdownOpen && (
                   <div className="absolute top-full left-0 mt-2 w-48 bg-white border rounded-xl shadow-xl z-20 py-2">
                     <button 
                       onClick={() => { setGrouping("all"); setIsGroupingDropdownOpen(false); }}
                       className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${grouping === "all" ? "font-bold text-black" : "text-slate-600"}`}
                     >
                       All customers
                     </button>
                     <button 
                       onClick={() => { setGrouping("byProject"); setIsGroupingDropdownOpen(false); }}
                       className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${grouping === "byProject" ? "font-bold text-black" : "text-slate-600"}`}
                     >
                       By project
                     </button>
                   </div>
                 )}
                 <span className="text-slate-400 cursor-help">ⓘ</span>
             </div>
             <div className="flex items-center gap-3">
                 {role !== "Ops" && (
                   <button 
                     onClick={() => setIsCreateGroupModalOpen(true)}
                     className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                   >
                       <Plus size={16}/> Create group
                   </button>
                 )}
                 <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                     Filters
                 </button>
             </div>
          </div>
          
          <div className="px-6 py-4 bg-slate-50 border-b">
               <p className="text-sm text-slate-600">{customers.length} total customer in your directory</p>
          </div>
          
          {/* TABLE HEADER */}
          <div className="grid grid-cols-12 px-6 py-3 border-b bg-white text-[10px] font-bold text-slate-400 uppercase tracking-wider">
             <div className="col-span-3">
                 <span>Name</span>
             </div>
             <div className="col-span-2">Project</div>
             <div className="col-span-3">Email</div>
             <div className="col-span-2">Phone</div>
             <div className="col-span-2 text-right">Last Visited</div>
          </div>

          {/* TABLE BODY */}
          <div className="flex-1 overflow-y-auto">
             {grouping === "all" ? (
               customers.map(customer => (
                  <CustomerRow 
                    key={customer.id} 
                    customer={customer} 
                    role={role}
                    onDelete={() => setIsDeletingCustomer(customer.id)}
                  />
               ))
             ) : (
               (() => {
                 const groups: Record<string, any[]> = {};
                 customers.forEach(c => {
                   if (!c.projects || c.projects.length === 0) {
                     if (!groups["No Project"]) groups["No Project"] = [];
                     groups["No Project"].push(c);
                   } else {
                     c.projects.forEach(p => {
                       const projectName = typeof p === 'string' ? p : p.name;
                       if (!groups[projectName]) groups[projectName] = [];
                       groups[projectName].push(c);
                     });
                   }
                 });

                 return Object.keys(groups).sort().map(projectName => {
                   const project = projects.find(p => p.name === projectName);
                   return (
                     <div key={projectName}>
                       <div className="px-6 py-2 bg-slate-50 border-b text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center">
                         <span>{projectName}</span>
                         {projectName !== "No Project" && role !== "Ops" && (
                           <button 
                             onClick={() => setIsAddingCustomerToProject(project?.id || null)}
                             className="p-1 hover:bg-slate-200 rounded transition-colors text-slate-500"
                             title="Add customer to project"
                           >
                             <Plus size={14} />
                           </button>
                         )}
                       </div>
                       {groups[projectName].map(customer => (
                         <CustomerRow 
                           key={`${projectName}-${customer.id}`} 
                           customer={customer} 
                           role={role}
                           onDelete={() => setIsDeletingCustomer(customer.id)}
                         />
                       ))}
                     </div>
                   );
                 });
               })()
             )}
             {customers.length === 0 && (
                 <div className="p-8 text-center text-slate-500">No customers found.</div>
             )}
          </div>
      </div>

      {/* NEW CUSTOMER MODAL */}
      <NewCustomerModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleCreateCustomerSuccess} 
      />

      {/* CREATE GROUP MODAL */}
      {isCreateGroupModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative text-left overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Create group</h2>
              <button
                onClick={() => {
                  setIsCreateGroupModalOpen(false);
                  setGroupSearchTerm("");
                }}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">Project name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={groupSearchTerm}
                    onChange={(e) => setGroupSearchTerm(e.target.value)}
                    placeholder="Search or enter project name"
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    autoFocus
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-lg divide-y">
                <button
                  onClick={() => {
                    router.push("/payments/projects/new");
                  }}
                  className="w-full px-4 py-4 text-left hover:bg-slate-50 text-sm text-black font-bold flex items-center gap-3 border-b"
                >
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Plus size={16} />
                  </div>
                  <span>Create new project</span>
                </button>

                {projects
                  .filter(p => p.name.toLowerCase().includes(groupSearchTerm.toLowerCase()))
                  .map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setGrouping("byProject");
                        setIsCreateGroupModalOpen(false);
                        setGroupSearchTerm("");
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50 text-sm flex justify-between items-center"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{p.phase}</span>
                    </button>
                  ))}
                
                {groupSearchTerm && !projects.some(p => p.name.toLowerCase() === groupSearchTerm.toLowerCase()) && (
                  <button
                    onClick={() => {
                      router.push(`/payments/projects/new?name=${encodeURIComponent(groupSearchTerm)}`);
                    }}
                    className="w-full px-4 py-4 text-left hover:bg-slate-50 text-sm text-black font-bold flex items-center gap-3"
                  >
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <Plus size={16} />
                    </div>
                    <span>Create project "{groupSearchTerm}"</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER TO PROJECT MODAL */}
      {isAddingCustomerToProject && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative text-left overflow-hidden">
            <div className="px-8 py-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold">Add customer to project</h2>
              <button
                onClick={() => {
                  setIsAddingCustomerToProject(null);
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
                        await addCustomerToProject(isAddingCustomerToProject, c.id);
                        await refreshCustomers();
                        setIsAddingCustomerToProject(null);
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

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingCustomer && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative text-left overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Delete customer?</h2>
                <p className="text-slate-500 text-sm">
                  Are you sure you want to delete this customer? This will also remove them from all associated projects. This action cannot be undone.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeletingCustomer(null)}
                  className="flex-1 px-4 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await deleteCustomer(isDeletingCustomer);
                    setIsDeletingCustomer(null);
                  }}
                  className="flex-1 px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerRow({ customer, role, onDelete }: { customer: Customer; role: string | null; onDelete: (id: string) => void }) {
  return (
    <div className="grid grid-cols-12 px-6 py-4 border-b hover:bg-slate-50 items-center text-sm group cursor-pointer">
       <div className="col-span-3">
         <Link href={`/customers/${customer.id}`} className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
              {customer.name.charAt(0)}
            </div>
            <div className="font-bold text-slate-900">{customer.name}</div>
         </Link>
       </div>
       <div className="col-span-2">
         <Link href={`/customers/${customer.id}`} className="flex flex-wrap gap-1">
            {customer.projects && customer.projects.length > 0 ? (
              customer.projects.map((p, i) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-medium">
                  {typeof p === 'string' ? p : p.name}
                </span>
              ))
            ) : (
              <span className="text-slate-400">—</span>
            )}
         </Link>
       </div>
       <div className="col-span-3">
         <Link href={`/customers/${customer.id}`} className="text-slate-600 truncate">
            {customer.email}
         </Link>
       </div>
       <div className="col-span-2">
         <Link href={`/customers/${customer.id}`} className="text-slate-600">
            {customer.phone || "—"}
         </Link>
       </div>
       <div className="col-span-2 flex items-center justify-end gap-3 text-slate-600">
         <Link href={`/customers/${customer.id}`}>
            {customer.lastVisited || "Never"}
         </Link>
         {role !== "Ops" && (
           <button 
             onClick={(e) => {
               e.stopPropagation();
               e.preventDefault();
               onDelete(customer.id);
             }}
             className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
           >
             <Trash2 size={16} />
           </button>
         )}
       </div>
    </div>
  );
}
