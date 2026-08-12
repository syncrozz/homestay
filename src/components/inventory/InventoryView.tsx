import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Package, AlertTriangle, Plus, Minus, CheckCircle2 } from 'lucide-react';

export const InventoryView: React.FC = () => {
  const { inventory, updateInventoryStock, addInventoryItem } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [currentStock, setCurrentStock] = useState(10);
  const [minimumStock, setMinimumStock] = useState(5);
  const [unit, setUnit] = useState('rolls');
  const [category, setCategory] = useState('Bathroom');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addInventoryItem({
      name,
      currentStock,
      minimumStock,
      unit,
      category,
      isActive: true,
    });
    setShowAddModal(false);
    setName('');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Supply Inventory Tracking</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor consumables, toilet tissue, shampoo, refreshments, and cleaning supplies stock levels.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => {
          const isLow = item.currentStock <= item.minimumStock;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border shadow-xs transition-all space-y-4 ${
                isLow ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{item.name}</h3>
                  <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                </div>

                {isLow ? (
                  <span className="px-2.5 py-1 bg-red-600 text-white rounded-full text-xs font-black flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>LOW STOCK</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>In Stock</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[11px] text-slate-500">Current Level</div>
                  <div className="text-xl font-black text-slate-900">
                    {item.currentStock} <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] text-slate-500">Minimum Threshold</div>
                  <div className="text-xs font-bold text-slate-700">
                    {item.minimumStock} {item.unit}
                  </div>
                </div>
              </div>

              {/* Adjust Stock Counter Controls */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-600">Quick Adjust:</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateInventoryStock(item.id, item.currentStock - 1)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-extrabold w-6 text-center">{item.currentStock}</span>
                  <button
                    onClick={() => updateInventoryStock(item.id, item.currentStock + 1)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Add Inventory Stock Item</h3>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toilet Tissue Rolls"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bathroom, Refreshments, Cleaning"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Current Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min={0}
                    value={minimumStock}
                    onChange={(e) => setMinimumStock(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. rolls, bottles"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
