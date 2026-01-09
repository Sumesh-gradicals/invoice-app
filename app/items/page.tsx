"use client";

import { useItems } from "@/components/providers/ItemContext";
import { Search, Plus, Tag, Trash2, X, Info } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthContext";

export default function ItemLibraryPage() {
  const { items, addItem, deleteItem } = useItems();
  const { role } = useAuth();
  const [quickItemName, setQuickItemName] = useState("");
  const [isDeletingItem, setIsDeletingItem] = useState<string | null>(null);

  const handleQuickCreate = () => {
    if (!quickItemName.trim()) return;
    addItem({
      name: quickItemName,
      price: 0,
      description: "",
    });
    setQuickItemName("");
  };

  return (
    <div className="flex flex-col h-full font-sans text-slate-900">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Items & services</h1>
        </div>
        <div className="flex items-center gap-3">
            {role !== "Ops" && (
              <Link href="/items/new">
                  <button className="bg-black text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-zinc-800">
                     Create an item
                  </button>
              </Link>
            )}
        </div>
      </header>

      {/* SUBNAV (Simplistic for now based on image) */}
      <div className="border-b mb-6 text-sm font-medium text-slate-500 flex gap-6">
          <span className="text-black border-b-2 border-black pb-2">Item library</span>
          <span className="hover:text-black cursor-pointer pb-2">Modifiers</span>
          <span className="hover:text-black cursor-pointer pb-2">Categories</span>
          <span className="hover:text-black cursor-pointer pb-2">Discounts</span>
      </div>


      {items.length === 0 ? (
        /* EMPTY STATE */
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
             <div className="bg-slate-100 p-4 rounded-full">
                 <Tag size={48} className="text-slate-400 rotate-90" />
             </div>
             <div>
                 <h2 className="text-xl font-bold mb-2">Your item library</h2>
                 <p className="text-sm text-slate-500 max-w-lg mx-auto">
                     Organize what you sell with the item library. Create items to help speed up checkout, view sales reports and track inventory. <span className="underline cursor-pointer">Download our template</span> to create and update items with Import.
                 </p>
             </div>
             <div className="flex gap-4">
                 {role !== "Ops" && (
                   <>
                     <Link href="/items/new">
                        <button className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-zinc-800">
                            Create an item
                        </button>
                     </Link>
                     <button className="bg-white border border-slate-300 text-slate-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-slate-50">
                         Import items
                     </button>
                   </>
                 )}
             </div>
        </div>
      ) : (
         /* LIST STATE */
        <div className="flex-1 overflow-y-auto">
             <div className="bg-white border rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b">
                        <tr>
                            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Name</th>
                            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Price</th>
                            <th className="px-6 py-3 font-bold text-slate-500 uppercase text-xs">Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {items.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50 group cursor-pointer">
                                <td className="px-6 py-4 font-bold">{item.name}</td>
                                <td className="px-6 py-4">${item.price.toFixed(2)}</td>
                                <td className="px-6 py-4 text-slate-500">
                                    <div className="flex items-center justify-between">
                                        <span>{item.stock || "Available"}</span>
                                        {role !== "Ops" && (
                                          <button 
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  setIsDeletingItem(item.id);
                                              }}
                                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                          >
                                              <Trash2 size={16} />
                                          </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeletingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="bg-red-50 p-3 rounded-xl">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <button 
                  onClick={() => setIsDeletingItem(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold mb-2">Delete item?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete this item? This action cannot be undone and will remove the item from your library.
              </p>

              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl mb-6">
                <Info size={18} className="text-amber-600 shrink-0" />
                <p className="text-xs text-amber-800">
                  Existing invoices and projects using this item will not be affected.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeletingItem(null)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteItem(isDeletingItem);
                    setIsDeletingItem(null);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                >
                  Delete item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QUICK CREATE FOOTER/SECTION */}
       {role !== "Ops" && (
         <div className="mt-8">
              <h3 className="font-bold text-sm mb-4">Quick create items</h3>
              <div className="flex items-center gap-2">
                  <Plus size={16} />
                  <div className="flex-1 border rounded-lg overflow-hidden flex items-center focus-within:ring-2 ring-black">
                       <input 
                          type="text" 
                          placeholder="Item name" 
                          value={quickItemName}
                          onChange={(e) => setQuickItemName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleQuickCreate()}
                          className="flex-1 p-3 text-sm outline-none"
                       />
                       {quickItemName && (
                           <button 
                              onClick={handleQuickCreate}
                              className="bg-slate-100 font-bold text-xs px-4 py-3 hover:bg-slate-200 border-l"
                           >
                               Save
                           </button>
                       )}
                  </div>
              </div>
         </div>
       )}
    </div>
  );
}
