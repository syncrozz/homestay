import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceIssue, IssueCategory, IssuePriority, UnitStatus } from '../../types';
import { Wrench, AlertTriangle, CheckCircle2, ShieldAlert, Plus, Camera } from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const { maintenanceIssues, units, reportMaintenanceIssue, resolveMaintenanceIssue } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState(units[0]?.id || '');
  const [category, setCategory] = useState<IssueCategory>('Air conditioner');
  const [priority, setPriority] = useState<IssuePriority>('HIGH');
  const [description, setDescription] = useState('');

  const [resolvingIssue, setResolvingIssue] = useState<MaintenanceIssue | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<UnitStatus>('READY');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showModal) setShowModal(false);
        if (resolvingIssue) setResolvingIssue(null);
      }
    };
    if (showModal || resolvingIssue) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showModal, resolvingIssue]);

  const openReport = () => {
    setShowModal(true);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportMaintenanceIssue({
      unitId: selectedUnitId,
      category,
      priority,
      description,
    });
    setShowModal(false);
    setDescription('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvingIssue) return;
    resolveMaintenanceIssue(resolvingIssue.id, resolutionNotes, targetStatus);
    setResolvingIssue(null);
    setResolutionNotes('');
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-6 h-6 text-rose-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Maintenance & Damage Reports</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track equipment issues reported by cleaners or staff, assign resolution priorities, and unblock room statuses.
          </p>
        </div>

        <button
          onClick={openReport}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Issues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {maintenanceIssues.map((issue) => {
          const isResolved = issue.status === 'RESOLVED';

          return (
            <div key={issue.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{issue.unitName}</h3>
                  <span className="text-xs font-semibold text-rose-700">{issue.category}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    issue.priority === 'URGENT' ? 'bg-rose-600 text-white animate-pulse' :
                    issue.priority === 'HIGH' ? 'bg-rose-100 text-rose-800' :
                    issue.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {issue.priority}
                  </span>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {issue.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {issue.description}
              </p>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Reporter: {issue.reporterName} ({issue.reporterRole})</span>
                <span>Reported: {new Date(issue.reportedAt).toLocaleDateString()}</span>
              </div>

              {isResolved && (
                <div className="p-2.5 bg-emerald-50 text-emerald-900 text-xs rounded-xl border border-emerald-200">
                  <strong>Resolution Notes:</strong> {issue.resolutionNotes || 'Fixed'}
                </div>
              )}

              {!isResolved && (
                <button
                  onClick={() => setResolvingIssue(issue)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Issue Resolved</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* REPORT ISSUE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" /> Report Maintenance Issue
            </h3>

            <form onSubmit={handleReport} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Select Unit</label>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Air conditioner">Air conditioner</option>
                  <option value="Water heater">Water heater</option>
                  <option value="Light">Light</option>
                  <option value="Fan">Fan</option>
                  <option value="Remote">Remote</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Kitchen equipment">Kitchen equipment</option>
                  <option value="Plate / glass">Plate / glass</option>
                  <option value="Bathroom">Bathroom</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IssuePriority)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High (Sets Unit to Maintenance)</option>
                  <option value="URGENT">Urgent (Blocks Room Readiness)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of damage or required repair..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                />
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
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE ISSUE MODAL */}
      {resolvingIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Resolve Issue for {resolvingIssue.unitName}
            </h3>

            <form onSubmit={handleResolveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Resolution Notes</label>
                <textarea
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="e.g. Replaced AC battery, repaired plumbing leak..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Set Unit Status To</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as UnitStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  <option value="READY">READY (Unit is now clean and ready for guests)</option>
                  <option value="AWAITING_CLEANING">AWAITING CLEANING (Needs cleaning first)</option>
                  <option value="AVAILABLE">AVAILABLE</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResolvingIssue(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Complete Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
