import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Unit } from '../../types';
import { UnitStatusBadge } from '../common/StatusBadge';
import { Home, Plus, Edit2, CheckCircle2, Users, Clock, AlertCircle } from 'lucide-react';

export const UnitManagementView: React.FC = () => {
  const { units, addUnit, updateUnit, updateUnitStatus } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [defaultCheckIn, setDefaultCheckIn] = useState('15:00');
  const [defaultCheckOut, setDefaultCheckOut] = useState('12:00');

  const openCreate = () => {
    setEditingUnit(null);
    setName('');
    setCode('');
    setDescription('');
    setCapacity(4);
    setDefaultCheckIn('15:00');
    setDefaultCheckOut('12:00');
    setShowModal(true);
  };

  const openEdit = (u: Unit) => {
    setEditingUnit(u);
    setName(u.name);
    setCode(u.code);
    setDescription(u.description);
    setCapacity(u.capacity);
    setDefaultCheckIn(u.defaultCheckIn);
    setDefaultCheckOut(u.defaultCheckOut);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUnit) {
      updateUnit({
        ...editingUnit,
        name,
        code,
        description,
        capacity,
        defaultCheckIn,
        defaultCheckOut,
      });
    } else {
      addUnit({
        propertyId: 'prop-1',
        name,
        code,
        description,
        capacity,
        defaultCheckIn,
        defaultCheckOut,
        status: 'READY',
        isActive: true,
      });
    }
    setShowModal(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Home className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Unit Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure homestay units, capacity limits, and manual operational status overrides.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Unit</span>
        </button>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{unit.name}</h3>
                <span className="text-xs text-slate-400">Code: {unit.code}</span>
              </div>
              <UnitStatusBadge status={unit.status} />
            </div>

            <p className="text-xs text-slate-600">{unit.description}</p>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-700">
              <div className="flex justify-between">
                <span>Max Capacity:</span>
                <strong>{unit.capacity} Guests</strong>
              </div>
              <div className="flex justify-between">
                <span>Default Check-In:</span>
                <strong>{unit.defaultCheckIn}</strong>
              </div>
              <div className="flex justify-between">
                <span>Default Check-Out:</span>
                <strong>{unit.defaultCheckOut}</strong>
              </div>
            </div>

            {/* Operational Override Bar */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-slate-500">Override Unit Status:</label>
              <select
                value={unit.status}
                onChange={(e) => updateUnitStatus(unit.id, e.target.value as any)}
                className="w-full p-2 text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl"
              >
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="BOOKED">BOOKED</option>
                <option value="OCCUPIED">OCCUPIED</option>
                <option value="AWAITING_CLEANING">AWAITING CLEANING</option>
                <option value="CLEANING">CLEANING</option>
                <option value="READY">READY</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>

            <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-100">
              <span className={`font-bold ${unit.isActive ? 'text-emerald-700' : 'text-slate-400'}`}>
                {unit.isActive ? 'Active' : 'Inactive'}
              </span>

              <button
                onClick={() => openEdit(unit)}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1 transition-all"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingUnit ? 'Edit Unit' : 'Add New Homestay Unit'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Unit Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. A01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Features, bed layout, view..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in</label>
                  <input
                    type="time"
                    value={defaultCheckIn}
                    onChange={(e) => setDefaultCheckIn(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out</label>
                  <input
                    type="time"
                    value={defaultCheckOut}
                    onChange={(e) => setDefaultCheckOut(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
