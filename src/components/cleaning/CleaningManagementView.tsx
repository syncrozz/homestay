import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UnitStatusBadge } from '../common/StatusBadge';
import { Send, Sparkles, Clock, CheckCircle2, AlertTriangle, Plus, History, User } from 'lucide-react';

export const CleaningManagementView: React.FC = () => {
  const {
    units,
    cleaners,
    cleaningTasks,
    assignCleaningTask,
    dispatchCleanerWhatsApp,
    completeCleaningTask
  } = useApp();

  const [selectedUnitId, setSelectedUnitId] = useState<string>(units[0]?.id || '');
  const [selectedCleanerId, setSelectedCleanerId] = useState<string>(cleaners[0]?.id || '');

  const activeTasks = cleaningTasks.filter((t) => t.status !== 'COMPLETED');
  const completedTasks = cleaningTasks.filter((t) => t.status === 'COMPLETED');

  const handleAssign = () => {
    if (!selectedUnitId) return;
    assignCleaningTask(selectedUnitId, selectedCleanerId);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-orange-500" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Cleaning Workflow Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Assign tasks, dispatch WhatsApp messages to cleaners, and track room turnaround times.
          </p>
        </div>

        {/* Quick Assign Form */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <select
            value={selectedUnitId}
            onChange={(e) => setSelectedUnitId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.status.replace('_', ' ')})
              </option>
            ))}
          </select>

          <select
            value={selectedCleanerId}
            onChange={(e) => setSelectedCleanerId(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-800"
          >
            {cleaners.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.isDefault ? '(Default)' : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleAssign}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 transition-all shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {/* ACTIVE CLEANING TASKS GRID */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <span>Active Tasks ({activeTasks.length})</span>
        </h2>

        {activeTasks.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 text-sm">
            🟢 No active cleaning tasks currently pending.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTasks.map((task) => {
              const completedCount = task.checklist.filter((c) => c.isCompleted).length;
              const totalCount = task.checklist.length;

              return (
                <div
                  key={task.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900">{task.unitName}</h3>
                      <p className="text-xs text-slate-500">Guest: {task.guestName || 'None'}</p>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-orange-100 text-orange-800 border border-orange-200">
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Cleaner: <strong>{task.cleanerName}</strong></span>
                      <span>Phone: <strong>{task.cleanerPhone}</strong></span>
                    </div>

                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl">
                      <span>Checklist Completion:</span>
                      <span className="font-bold text-emerald-700">
                        {completedCount} / {totalCount} items
                      </span>
                    </div>

                    {task.notes && (
                      <p className="text-[11px] bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 italic">
                        Notes: {task.notes}
                      </p>
                    )}
                  </div>

                  <div className="pt-1 flex gap-2">
                    <button
                      onClick={() => dispatchCleanerWhatsApp(task.id)}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send WhatsApp Task</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CLEANING HISTORY LOGS */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-slate-600" />
          <span>Cleaning History Records ({completedTasks.length})</span>
        </h2>

        {completedTasks.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No completed tasks in history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3">Unit</th>
                  <th className="p-3">Cleaner</th>
                  <th className="p-3">Completed At</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Checklist</th>
                  <th className="p-3">Notes</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedTasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{t.unitName}</td>
                    <td className="p-3">{t.cleanerName}</td>
                    <td className="p-3">{t.completedAt ? new Date(t.completedAt).toLocaleString() : 'N/A'}</td>
                    <td className="p-3 font-semibold text-slate-800">{t.durationMinutes || 45} mins</td>
                    <td className="p-3 text-emerald-700 font-bold">
                      {t.checklist.filter((c) => c.isCompleted).length} / {t.checklist.length}
                    </td>
                    <td className="p-3 max-w-xs truncate">{t.notes || '-'}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        READY
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
