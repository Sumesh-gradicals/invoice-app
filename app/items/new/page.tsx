"use client";

import { useItems } from "@/components/providers/ItemContext";
import { ArrowLeft, ChevronDown, Upload, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateItemPage() {
  const { addItem } = useItems();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
  });

  const handleSave = () => {
    if (!form.name) return; // Basic validation
    addItem({
      name: form.name,
      price: parseFloat(form.price) || 0,
      description: form.description,
    });
    router.push("/items");
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900 bg-white">
      {/* HEADER */}
      <header className="flex justify-between items-center px-8 py-4 border-b sticky top-0 bg-white z-10">
        <div className="flex items-center gap-4">
            <Link href="/items" className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold">Create item</h1>
        </div>
        <div className="flex items-center gap-3">
             <button className="flex items-center gap-1 text-sm font-bold text-slate-600 hover:text-black">
                 <span className="cursor-help">Provide feedback</span>
             </button>
            <button 
                onClick={handleSave}
                className="bg-black text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800"
            >
               Save
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-8 flex justify-center">
          <div className="w-full max-w-5xl grid grid-cols-12 gap-6">
              
              {/* LEFT COLUMN */}
              <div className="col-span-8 space-y-6">
                   {/* DETAILS CARD */}
                  <div className="bg-white p-6 rounded-lg border shadow-sm space-y-6">
                       <div className="grid grid-cols-2 gap-6">
                           <div className="p-3 border rounded-lg bg-white flex justify-between items-center cursor-pointer hover:border-black">
                               <div className="text-xs">
                                   <div className="font-bold text-slate-500 uppercase mb-1">Item type</div>
                                   <div className="font-medium">Digital</div>
                               </div>
                               <ChevronDown size={16} className="text-slate-400"/>
                           </div>
                       </div>
                       
                       <div className="border rounded-lg p-3 focus-within:ring-2 ring-black">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Name (required)
                            </label>
                            <input 
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({...form, name: e.target.value})}
                                className="w-full text-sm outline-none"
                            />
                       </div>

                       <div className="border rounded-lg p-3 focus-within:ring-2 ring-black flex gap-4">
                           <div className="flex-1">
                                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                    Price
                                </label>
                                <input 
                                    type="number"
                                    value={form.price}
                                    onChange={(e) => setForm({...form, price: e.target.value})}
                                    className="w-full text-sm outline-none"
                                />
                           </div>
                           <div className="flex items-center gap-2 border-l pl-4">
                               <span className="text-sm font-bold">ea</span>
                               <ChevronDown size={14} />
                           </div>
                       </div>

                       <div className="border rounded-lg p-3 focus-within:ring-2 ring-black">
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Customer-facing description
                            </label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm({...form, description: e.target.value})}
                                className="w-full text-sm outline-none min-h-[80px] resize-none"
                            />
                       </div>

                       {/* IMAGE DROPZONE */}
                       <div className="border border-dashed border-slate-300 rounded-lg p-12 flex flex-col items-center justify-center text-center gap-2 hover:bg-slate-50 cursor-pointer transition-colors">
                           <Upload size={24} className="text-slate-400"/>
                           <p className="text-sm font-bold text-slate-700">
                               Drop images here, <span className="underline">browse files</span>, or <span className="underline">add from image library</span>
                           </p>
                       </div>
                  </div>

                  {/* INVENTORY CARD */}
                   <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="font-bold text-base">Manage inventory</h2>
                        </div>
                        <div className="border-t pt-4">
                             <div className="flex justify-between items-center py-2">
                                 <span className="text-sm font-bold">Location</span>
                                 <span className="text-xs font-bold uppercase text-slate-500">Availability</span>
                             </div>
                             <div className="flex justify-between items-center py-3 border-b">
                                 <span className="text-sm">Test</span>
                                 <span className="text-sm font-bold underline cursor-pointer">Available</span>
                             </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="border rounded-lg p-3">
                                 <div className="flex justify-between">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">SKU</label>
                                    <Info size={12} className="text-slate-300"/>
                                 </div>
                                <input type="text" className="w-full text-sm outline-none"/>
                            </div>
                            <div className="border rounded-lg p-3">
                                 <div className="flex justify-between">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">GTIN</label>
                                    <Info size={12} className="text-slate-300"/>
                                 </div>
                                <input type="text" className="w-full text-sm outline-none"/>
                            </div>
                        </div>
                   </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="col-span-4 space-y-6">
                  {/* CATEGORIES */}
                   <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h2 className="font-bold text-sm mb-4">Categories</h2>
                         <button className="w-full py-2 bg-slate-100 font-bold text-sm rounded-full hover:bg-slate-200 transition-colors">
                             Create your first category
                         </button>
                   </div>
                   
                   {/* LOCATIONS */}
                   <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="font-bold text-sm">Locations and channels</h2>
                            <span className="text-xs font-bold text-blue-600 cursor-pointer">Edit POS tile</span>
                        </div>
                         
                         <div className="space-y-4">
                             <div className="flex items-start gap-3">
                                 <div className="mt-0.5"><div className="w-4 h-4 border-2 border-black rounded-sm flex items-center justify-center bg-black"></div></div>
                                 <div className="flex-1">
                                      <div className="flex justify-between">
                                          <div className="text-sm font-bold">Locations</div>
                                          <span className="text-xs font-bold underline cursor-pointer">Edit</span>
                                      </div>
                                      <div className="text-xs text-slate-500">Test</div>
                                 </div>
                             </div>
                             
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                      <div className="w-4 h-4 border-2 border-slate-300 rounded-sm"></div>
                                      <span className="text-sm font-bold">Points of sale</span>
                                 </div>
                                 <div className="w-8 h-4 bg-slate-300 rounded-full relative cursor-pointer">
                                     <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                                 </div>
                             </div>

                             <button className="flex items-center gap-2 text-sm font-bold hover:bg-slate-50 w-full p-2 rounded-lg -ml-2">
                                 <span className="text-xl leading-none">+</span> Add channel
                             </button>
                         </div>
                   </div>
              </div>
          </div>
      </div>
    </div>
  );
}
