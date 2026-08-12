import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { validateChecklistCompletion } from '../../services/validationService';
import { IssueCategory, IssuePriority } from '../../types';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Home,
  MessageSquare,
  ShieldAlert,
  ArrowRight,
  Camera,
  CheckSquare,
  Square
} from 'lucide-react';

export const CleanerMobileView: React.FC = () => {
  const {
    currentCleanerId,
    cleaners,
    cleaningTasks,
    startCleaningTask,
    toggleChecklistItem,
    saveCleaningNotes,
    completeCleaningTask,
    reportMaintenanceIssue
  } = useApp();

  const currentCleaner = cleaners.find((c) => c.id === currentCleanerId) || cleaners[0];

  // Filter tasks assigned to this cleaner or active tasks
  const myTasks = cleaningTasks.filter((t) => t.cleanerId === currentCleaner?.id || t.cleanerId === 'cleaner-1');
  const activeTask = myTasks.find((t) => t.status === 'IN_PROGRESS' || t.status === 'PENDING') || myTasks[0];

  const [notesInput, setNotesInput] = useState<string>(activeTask?.notes || '');
  const [showIssueModal, setShowIssueModal] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Issue reporting form state
  const [issueCategory, setIssueCategory] = useState<IssueCategory>('Air conditioner');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [issuePriority, setIssuePriority] = useState<IssuePriority>('MEDIUM');
  const [issuePhoto, setIssuePhoto] = useState<string>('');

  if (!activeTask) {
    return (
      <div className="p-6 max-w-md mx-auto text-center space-y-4 py-16">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">All Tasks Complete!</h2>
        <p className="text-sm text-slate-500">
          Hello {currentCleaner?.name}, there are no active cleaning assignments waiting for you right now. Great job!
        </p>
      </div>
    );
  }

  const validation = validateChecklistCompletion(activeTask.checklist);

  const handleStart = () => {
    startCleaningTask(activeTask.id);
  };

  const handleComplete = () => {
    setErrorMsg(null);
    saveCleaningNotes(activeTask.id, notesInput);
    const result = completeCleaningTask(activeTask.id);
    if (!result.success) {
      setErrorMsg(result.error || 'Failed to complete cleaning task.');
    }
  };

  const handleSubmitIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueDescription) return;

    reportMaintenanceIssue({
      unitId: activeTask.unitId,
      category: issueCategory,
      description: issueDescription,
      priority: issuePriority,
      photoUrl: issuePhoto || undefined,
      taskId: activeTask.id,
    });

    setShowIssueModal(false);
    setIssueDescription('');
    alert('Issue reported successfully to owner!');
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-5 pb-24">
      {/* Cleaner Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>CLEANER WORKFLOW</span>
          <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-500/30">
            {currentCleaner?.name}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">{activeTask.unitName}</h1>
          <span className="text-xs font-bold text-slate-300">
            Checkout: {activeTask.guestCheckoutTime || '12:00 PM'}
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Guest: <strong>{activeTask.guestName}</strong>
        </p>
      </div>

      {/* Task Status & Start Button */}
      {activeTask.status === 'PENDING' ? (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-3">
          <Clock className="w-8 h-8 text-amber-600 mx-auto" />
          <h2 className="font-bold text-slate-900 text-base">Cleaning Task Ready to Begin</h2>
          <p className="text-xs text-slate-600">
            Please tap start before beginning the room cleaning checklist.
          </p>
          <button
            onClick={handleStart}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>START CLEANING</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Progress Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Required Checklist Progress
              </span>
              <span className="text-sm font-black text-emerald-700">
                {validation.completedRequired} / {validation.totalRequired}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-emerald-500 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    validation.totalRequired > 0
                      ? (validation.completedRequired / validation.totalRequired) * 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>

            {!validation.isReadyAllowed && (
              <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validation.missingRequiredItems.length} required item(s) pending.</span>
              </p>
            )}
          </div>

          {/* CHECKLIST ITEMS LIST */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>Cleaning Checklist</span>
            </h2>

            <div className="space-y-2">
              {activeTask.checklist.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleChecklistItem(activeTask.id, item.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    item.isCompleted
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <button className="mt-0.5 text-emerald-600 focus:outline-none">
                    {item.isCompleted ? (
                      <CheckSquare className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`font-semibold ${item.isCompleted ? 'line-through text-slate-500' : ''}`}>
                        {item.title}
                      </span>
                      {item.isRequired ? (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          REQUIRED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-600 font-medium text-[10px]">
                          OPTIONAL
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CLEANING NOTES */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-bold text-slate-700">Cleaning Notes / Observations</label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="e.g. Shampoo bottle low, remote battery replaced..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              rows={2}
            />
          </div>

          {/* REPORT MAINTENANCE ISSUE BUTTON */}
          <button
            onClick={() => setShowIssueModal(true)}
            className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>REPORT MAINTENANCE ISSUE / DAMAGE</span>
          </button>

          {/* ERROR ALERT */}
          {errorMsg && (
            <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* FINAL COMPLETION BUTTON (MANDATORY RULE ENFORCED) */}
          <button
            onClick={handleComplete}
            disabled={!validation.isReadyAllowed}
            className={`w-full py-4 rounded-2xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              validation.isReadyAllowed
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer ring-4 ring-emerald-100'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>UNIT READY</span>
          </button>
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      {showIssueModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Report Issue for {activeTask.unitName}</span>
              </h3>
              <button
                onClick={() => setShowIssueModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitIssue} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Issue Category</label>
                <select
                  value={issueCategory}
                  onChange={(e) => setIssueCategory(e.target.value as IssueCategory)}
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
                  value={issuePriority}
                  onChange={(e) => setIssuePriority(e.target.value as IssuePriority)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                >
                  <option value="LOW">Low - Minor fix later</option>
                  <option value="MEDIUM">Medium - Fix before next check-in</option>
                  <option value="HIGH">High - Immediate attention needed</option>
                  <option value="URGENT">Urgent - Blocks room readiness</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  required
                  value={issueDescription}
                  onChange={(e) => setIssueDescription(e.target.value)}
                  placeholder="Describe damage or malfunction..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  rows={3}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold rounded-xl shadow-md transition-all mt-2"
              >
                Submit Report to Owner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
