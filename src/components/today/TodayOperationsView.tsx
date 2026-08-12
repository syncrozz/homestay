import React from 'react';
import { useApp } from '../../context/AppContext';
import { UnitStatusBadge } from '../common/StatusBadge';
import { openWhatsAppChat, formatGuestCheckInMessage } from '../../services/whatsappService';
import {
  Clock,
  LogOut,
  Sparkles,
  Home,
  Key,
  MessageCircle,
  Send,
  AlertCircle,
  UserCheck
} from 'lucide-react';

export const TodayOperationsView: React.FC = () => {
  const {
    units,
    bookings,
    cleaningTasks,
    markGuestCheckedOut,
    assignCleaningTask,
    dispatchCleanerWhatsApp,
    settings,
    approveEarlyCheckIn
  } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  // Find today's operational events
  const checkoutsToday = bookings.filter((b) => b.checkOutDate === todayStr && b.status !== 'CANCELLED');
  const checkinsToday = bookings.filter((b) => b.checkInDate === todayStr && b.status !== 'CANCELLED');
  const cleaningTasksToday = cleaningTasks.filter((t) => t.createdAt.startsWith(todayStr) || t.status !== 'COMPLETED');

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            <h1 className="text-xl font-extrabold tracking-tight">Today's Operational Pulse</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time daily workflow schedule for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
            Check-outs: <strong className="text-amber-400">{checkoutsToday.length}</strong>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
            Check-ins: <strong className="text-blue-400">{checkinsToday.length}</strong>
          </div>
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
            Active Cleaning: <strong className="text-orange-400">{cleaningTasksToday.length}</strong>
          </div>
        </div>
      </div>

      {/* Units Real-time Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {units.map((unit) => {
          const currentBooking = bookings.find(
            (b) => b.unitId === unit.id && b.status !== 'CANCELLED' && b.checkInDate <= todayStr && b.checkOutDate >= todayStr
          );

          return (
            <div key={unit.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{unit.name}</h3>
                  <p className="text-xs text-slate-500">{unit.description}</p>
                </div>
                <UnitStatusBadge status={unit.status} size="sm" />
              </div>

              {currentBooking ? (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{currentBooking.guestName}</span>
                    <span className="text-emerald-700">{currentBooking.guestCount} Guests</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex justify-between">
                    <span>In: {currentBooking.checkInDate}</span>
                    <span>Out: {currentBooking.checkOutDate}</span>
                  </div>
                  {currentBooking.remark && (
                    <p className="text-[10px] text-amber-800 bg-amber-50 p-1 rounded font-medium mt-1">
                      💬 {currentBooking.remark}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200/60 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                  <span>No active guest currently in room</span>
                  <span>🟢 Available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CHRONOLOGICAL TIMELINE SEQUENCE */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-emerald-600" />
          <span>Timeline Schedule</span>
        </h2>

        <div className="relative border-l-2 border-slate-200 ml-4 space-y-6 pl-6">
          {/* 12:00 PM CHECK-OUT SECTION */}
          {checkoutsToday.map((b) => {
            const unit = units.find((u) => u.id === b.unitId);
            const isCheckedOut = b.status === 'COMPLETED' || b.guestCheckedOutAt;

            return (
              <div key={b.id} className="relative group">
                <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white ring-4 ring-white shadow-xs">
                  <LogOut className="w-3.5 h-3.5" />
                </span>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-xs font-bold">
                        12:00 PM
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        🚪 Check-out: {unit?.name}
                      </h3>
                    </div>
                    {isCheckedOut ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5" /> Guest Checked Out
                      </span>
                    ) : (
                      <button
                        onClick={() => markGuestCheckedOut(b.id)}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Confirm Guest Checked Out</span>
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap justify-between items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <strong>Guest:</strong> {b.guestName} ({b.guestPhone})
                    </div>
                    <div>
                      <strong>Remarks:</strong> {b.remark || 'None'}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* CLEANING WORKFLOW SECTION */}
          {cleaningTasksToday.map((task) => (
            <div key={task.id} className="relative group">
              <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white ring-4 ring-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </span>

              <div className="bg-orange-50/60 p-4 rounded-2xl border border-orange-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-orange-200 text-orange-900 text-xs font-bold">
                      12:15 PM
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-sm">
                      🧹 Cleaning Task: {task.unitName}
                    </h3>
                  </div>

                  <button
                    onClick={() => dispatchCleanerWhatsApp(task.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send WhatsApp Task to Cleaner</span>
                  </button>
                </div>

                <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-orange-100 flex justify-between items-center">
                  <div>
                    <strong>Cleaner:</strong> {task.cleanerName} ({task.cleanerPhone})
                  </div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className="font-bold text-orange-700">{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 3:00 PM CHECK-IN SECTION */}
          {checkinsToday.map((b) => {
            const unit = units.find((u) => u.id === b.unitId);

            return (
              <div key={b.id} className="relative group">
                <span className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white shadow-xs">
                  <Key className="w-3.5 h-3.5" />
                </span>

                <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-xs font-bold">
                        3:00 PM
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm">
                        🔑 Check-in: {unit?.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {unit?.status === 'READY' && !b.earlyCheckInApproved && (
                        <button
                          onClick={() => approveEarlyCheckIn(b.id, '2:00 PM')}
                          className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition-all"
                        >
                          Allow Early Check-In
                        </button>
                      )}

                      <button
                        onClick={() => {
                          const msg = formatGuestCheckInMessage({
                            template: settings.whatsappGuestCheckInTemplate,
                            propertyName: settings.propertyName,
                            guestName: b.guestName,
                            unitName: unit?.name || 'Unit',
                            checkInDate: b.checkInDate,
                            checkInTime: b.checkInTime,
                            checkOutDate: b.checkOutDate,
                            checkOutTime: b.checkOutTime,
                          });
                          openWhatsAppChat(b.guestPhone, msg);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Guest</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-emerald-100 space-y-1">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Guest: {b.guestName} ({b.guestPhone})</span>
                      <span>Payment: {b.paymentStatus}</span>
                    </div>
                    {b.remark && (
                      <p className="text-[11px] text-slate-600 italic">
                        Special Requests: {b.remark}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
