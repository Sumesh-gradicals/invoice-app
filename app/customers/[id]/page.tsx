"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCustomers } from "@/components/providers/CustomerContext";
import { useProjects } from "@/components/providers/ProjectContext";
import { 
  ChevronLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Paperclip, 
  PenTool, 
  Clock, 
  ExternalLink, 
  Plus,
  Trash2,
  Search
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthContext";

export default function CustomerProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const { getCustomerById, updateCustomer, deleteCustomer } = useCustomers();
  const { projects, addCustomerToProject, removeCustomerFromProject } = useProjects();
  const { role } = useAuth();
  
  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingToProject, setIsAddingToProject] = useState(false);
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [editForm, setEditForm] = useState<any>({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
    attachmentUrl: "",
    signatureUrl: ""
  });

  useEffect(() => {
    const fetchCustomer = async () => {
      if (typeof id === "string") {
        const data = await getCustomerById(id);
        if (data) {
          setCustomer(data);
          setEditForm({
            ...data,
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            notes: data.notes || "",
            attachmentUrl: data.attachmentUrl || "",
            signatureUrl: data.signatureUrl || ""
          });
        }
        setIsLoading(false);
      }
    };
    fetchCustomer();
  }, [id, getCustomerById]);

  const handleSave = async () => {
    await updateCustomer(id as string, editForm);
    setCustomer({...customer, ...editForm});
    setIsEditing(false);
  };

  const handleAddToProject = async (projectId: string) => {
    await addCustomerToProject(projectId, id as string);
    setIsAddingToProject(false);
    // Refresh customer data to show new project
    const data = await getCustomerById(id as string);
    if (data) setCustomer(data);
  };

  const handleRemoveFromProject = async (projectId: string) => {
    await removeCustomerFromProject(projectId, id as string);
    // Refresh customer data
    const data = await getCustomerById(id as string);
    if (data) setCustomer(data);
  };

  const handleDelete = async () => {
    await deleteCustomer(id as string);
    router.push("/customers");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Customer not found</h2>
        <button 
          onClick={() => router.push("/customers")}
          className="text-blue-600 hover:underline flex items-center gap-2 mx-auto"
        >
          <ChevronLeft size={16} /> Back to customers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <button 
          onClick={() => router.push("/customers")}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div className="flex gap-3">
          {role !== "Ops" && (
            isEditing ? (
              <>
                <button 
                  onClick={() => setIsDeleting(true)}
                  className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 flex items-center gap-2"
                >
                  <Trash2 size={16} /> Delete Customer
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditForm({
                      ...customer,
                      name: customer.name || "",
                      email: customer.email || "",
                      phone: customer.phone || "",
                      address: customer.address || "",
                      notes: customer.notes || "",
                      attachmentUrl: customer.attachmentUrl || "",
                      signatureUrl: customer.signatureUrl || ""
                    });
                  }}
                  className="px-4 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-zinc-800 flex items-center gap-2"
                >
                  <Save size={16} /> Save Changes
                </button>
              </>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-bold text-white bg-black rounded-lg hover:bg-zinc-800 flex items-center gap-2"
              >
                <Edit2 size={16} /> Edit Profile
              </button>
            )
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* LEFT COLUMN - BASIC INFO */}
        <div className="col-span-12 lg:col-span-4 space-y-6 text-left">
          <div className="bg-white border rounded-3xl p-8 text-center space-y-4 shadow-sm">
            <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-3xl mx-auto shadow-inner">
              {customer.name.charAt(0)}
            </div>
            <div>
              {isEditing ? (
                <input 
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="text-2xl font-bold text-center w-full border-b border-slate-200 outline-none focus:border-black"
                />
              ) : (
                <h1 className="text-2xl font-bold">{customer.name}</h1>
              )}
              <p className="text-slate-500 text-sm mt-1">Customer since {new Date().getFullYear()}</p>
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-sm uppercase text-slate-400 tracking-wider">Contact Details</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Mail size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                  {isEditing ? (
                    <input 
                      type="email"
                      value={editForm.email || ""}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full border-b border-slate-200 outline-none focus:border-black py-0.5"
                    />
                  ) : (
                    <p className="font-medium">{customer.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <Phone size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phone</p>
                  {isEditing ? (
                    <input 
                      type="text"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full border-b border-slate-200 outline-none focus:border-black py-0.5"
                    />
                  ) : (
                    <p className="font-medium">{customer.phone || "—"}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                  <MapPin size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Address</p>
                  {isEditing ? (
                    <textarea 
                      value={editForm.address || ""}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full border-b border-slate-200 outline-none focus:border-black py-0.5 resize-none h-20"
                    />
                  ) : (
                    <p className="font-medium">{customer.address || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - PROJECTS, NOTES, ATTACHMENTS */}
        <div className="col-span-12 lg:col-span-8 space-y-6 text-left">
          {/* PROJECTS */}
          <div className="bg-white border rounded-3xl p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Associated Projects</h3>
              {role !== "Ops" && (
                <button 
                  onClick={() => setIsAddingToProject(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition-colors"
                >
                  <Plus size={14} /> Add to project
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customer.projects && customer.projects.length > 0 ? (
                customer.projects.map((p: any, i: number) => (
                  <div key={i} className="p-4 border rounded-2xl hover:border-black transition-colors group cursor-pointer relative">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <div className="flex items-center gap-2">
                        {isEditing && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromProject(p.id);
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove from project"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        <ExternalLink size={14} className="text-slate-300 group-hover:text-black" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock size={12} />
                      <span>Active</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-8 text-center border-2 border-dashed rounded-2xl text-slate-400">
                  No projects associated with this customer yet.
                </div>
              )}
            </div>
          </div>

          {/* NOTES */}
          <div className="bg-white border rounded-3xl p-8 space-y-4 shadow-sm">
            <h3 className="font-bold text-lg">Internal Notes</h3>
            {isEditing ? (
              <textarea 
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                placeholder="Add any internal notes about this customer..."
                className="w-full min-h-[150px] p-4 border rounded-2xl outline-none focus:ring-2 ring-black resize-none text-sm"
              />
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 min-h-[100px]">
                {customer.notes || "No notes available for this customer."}
              </div>
            )}
          </div>

          {/* ATTACHMENTS & SIGNATURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-3xl p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <Paperclip size={18} className="text-slate-400" />
                <h3 className="font-bold">Attachment</h3>
              </div>
              {customer.attachmentUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border aspect-video bg-slate-50">
                  <img 
                    src={customer.attachmentUrl} 
                    alt="Attachment" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a 
                      href={customer.attachmentUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      View Full Image
                    </a>
                    {isEditing && (
                      <button 
                        onClick={() => setEditForm({...editForm, attachmentUrl: ""})}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Remove attachment"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                  <Paperclip size={24} />
                  <span>No attachment</span>
                </div>
              )}
              {isEditing && (
                <div className="mt-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Update Attachment</label>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditForm({...editForm, attachmentUrl: URL.createObjectURL(file)});
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              )}
            </div>

            <div className="bg-white border rounded-3xl p-8 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <PenTool size={18} className="text-slate-400" />
                <h3 className="font-bold">Signature</h3>
              </div>
              {customer.signatureUrl ? (
                <div className="relative group rounded-2xl overflow-hidden border aspect-video bg-slate-50">
                  <img 
                    src={customer.signatureUrl} 
                    alt="Signature" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <a 
                      href={customer.signatureUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-100 transition-colors"
                    >
                      View Full Image
                    </a>
                    {isEditing && (
                      <button 
                        onClick={() => setEditForm({...editForm, signatureUrl: ""})}
                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                        title="Remove signature"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                  <PenTool size={24} />
                  <span>No signature</span>
                </div>
              )}
              {isEditing && (
                <div className="mt-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Update Signature</label>
                  <input 
                    type="file" 
                    accept="image/jpeg,image/png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditForm({...editForm, signatureUrl: URL.createObjectURL(file)});
                      }
                    }}
                    className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ADD TO PROJECT MODAL */}
      {isAddingToProject && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="font-bold">Add to project</h2>
              <button onClick={() => setIsAddingToProject(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search projects..."
                  value={projectSearchTerm}
                  onChange={(e) => setProjectSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl text-sm outline-none focus:ring-2 ring-black"
                />
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto mb-4">
                <button 
                  onClick={() => router.push(`/payments/projects/new?customerId=${id}`)}
                  className="w-full p-3 flex items-center gap-3 text-sm font-bold hover:bg-slate-50 rounded-xl border-2 border-dashed border-slate-100"
                >
                  <div className="bg-slate-100 p-2 rounded-lg">
                    <Plus size={16} />
                  </div>
                  Create new project
                </button>
                
                {projects
                  .filter(p => p.name.toLowerCase().includes(projectSearchTerm.toLowerCase()))
                  .filter(p => !customer.projects?.some((cp: any) => cp.id === p.id))
                  .map(project => (
                    <button 
                      key={project.id}
                      onClick={() => handleAddToProject(project.id)}
                      className="w-full p-3 flex items-center justify-between hover:bg-slate-50 rounded-xl transition-colors text-left"
                    >
                      <div>
                        <div className="font-bold text-sm">{project.name}</div>
                        <div className="text-xs text-slate-500">{project.phase}</div>
                      </div>
                      <Plus size={14} className="text-slate-400" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/40 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">Delete Customer?</h2>
            <p className="text-slate-500 text-sm mb-8">
              Are you sure you want to delete <strong>{customer.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsDeleting(false)}
                className="flex-1 px-6 py-3 border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
