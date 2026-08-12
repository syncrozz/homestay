import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calendar,
  LogOut,
  Sparkles,
  Home,
  UserCheck,
  CheckCircle2,
  Wrench,
  DollarSign,
  Building,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { units, bookings, cleaningTasks, maintenanceIssues } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const todayCheckins = bookings.filter((b) => b.checkInDate === todayStr && b.status !== 'CANCELLED');
  const todayCheckouts = bookings.filter((b) => b.checkOutDate === todayStr && b.status !== 'CANCELLED');
  const activeCleaning = cleaningTasks.filter((t) => t.status !== 'COMPLETED');

  const readyUnits = units.filter((u) => u.status === 'READY');
  const occupiedUnits = units.filter((u) => u.status === 'OCCUPIED');
  const availableUnits = units.filter((u) => u.status === 'AVAILABLE');
  const awaitingCleaningUnits = units.filter((u) => u.status === 'AWAITING_CLEANING');
  const maintenanceUnits = units.filter((u) => u.status === 'MAINTENANCE');
  const openIssues = maintenanceIssues.filter((m) => m.status === 'OPEN');

  const pendingPayments = bookings.filter((b) => b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED');
  const totalPendingAmount = pendingPayments.reduce((acc, b) => acc + b.balanceAmount, 0);

  const totalUnits = units.length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits.length / totalUnits) * 100) : 0;

  return (
    <div className="p-3.5 sm:p-5 max-w-7xl mx-auto space-y-4 sm:space-y-5">
      {/* Executive Header & Quick Pulse Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
              <p className="text-xs text-slate-500 font-medium">
                Real-time operational metrics &amp; property overview
              </p>
            </div>
          </div>
        </div>

        {/* Quick Snapshot Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>{totalUnits} Total Units</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span>{occupancyRate}% Occupancy</span>
          </div>
          {totalPendingAmount > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-bold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-600" />
              <span>RM {totalPendingAmount} Uncollected</span>
            </div>
          )}
        </div>
      </div>

      {/* Occupancy & Unit Health Distribution Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Home className="w-4 h-4 text-blue-600" /> Unit Status Allocation
          </span>
          <span className="text-slate-500 font-medium">{occupiedUnits.length} Occupied / {totalUnits} Total</span>
        </div>
        {/* Progress distribution track */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex stroke-none">
          <div style={{ width: `${(occupiedUnits.length / totalUnits) * 100}%` }} className="bg-blue-600 h-full" title="Occupied" />
          <div style={{ width: `${(readyUnits.length / totalUnits) * 100}%` }} className="bg-emerald-500 h-full" title="Ready" />
          <div style={{ width: `${(awaitingCleaningUnits.length / totalUnits) * 100}%` }} className="bg-amber-400 h-full" title="Awaiting Cleaning" />
          <div style={{ width: `${(maintenanceUnits.length / totalUnits) * 100}%` }} className="bg-red-500 h-full" title="Maintenance" />
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1 border-t border-slate-100 text-slate-600">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Occupied ({occupiedUnits.length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready ({readyUnits.length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Cleaning Needed ({awaitingCleaningUnits.length})
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Maintenance ({maintenanceUnits.length})
          </span>
        </div>
      </div>

      {/* Primary Operational Metrics Grid (Dense 8-card grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-blue-600" /> Check-ins</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">TODAY</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{todayCheckins.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">guests arriving</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><LogOut className="w-3.5 h-3.5 text-amber-600" /> Check-outs</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">TODAY</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{todayCheckouts.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">departures</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-orange-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-orange-500" /> Active Cleaning</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">TASKS</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{activeCleaning.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">in progress</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Home className="w-3.5 h-3.5 text-emerald-600" /> Units Ready</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">CLEAN</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{readyUnits.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">available to host</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-blue-600" /> Occupied Units</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">ACTIVE</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{occupiedUnits.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">checked in</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Total Available</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">VACANT</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{availableUnits.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">unbooked</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-red-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5 text-red-600" /> Open Issues</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-50 text-red-700">ALERT</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900">{openIssues.length}</div>
            <span className="text-[11px] text-slate-500 font-medium">pending maintenance</span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-colors">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Pending Balance</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700">DUE</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-xl font-black text-emerald-700">RM {totalPendingAmount}</div>
            <span className="text-[11px] text-slate-500 font-medium">{pendingPayments.length} bookings</span>
          </div>
        </div>
      </div>

      {/* Split Operational Feed: Compact 2-Column Info Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today's Arrival Feed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" /> Today's Movement
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {todayCheckins.length} In / {todayCheckouts.length} Out
            </span>
          </div>

          <div className="space-y-2">
            {todayCheckins.length === 0 && todayCheckouts.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">No check-ins or check-outs scheduled for today.</p>
            ) : (
              <>
                {todayCheckins.map((b) => {
                  const unit = units.find((u) => u.id === b.unitId);
                  return (
                    <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-extrabold text-[10px]">IN {b.checkInTime}</span>
                        <div>
                          <div className="font-bold text-slate-900">{b.guestName}</div>
                          <div className="text-[10px] text-slate-500">{unit?.name || 'Unit'} • {b.guestCount} guests</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${b.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                        {b.paymentStatus === 'PAID' ? 'PAID' : `DUE RM${b.balanceAmount}`}
                      </span>
                    </div>
                  );
                })}

                {todayCheckouts.map((b) => {
                  const unit = units.find((u) => u.id === b.unitId);
                  return (
                    <div key={b.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-extrabold text-[10px]">OUT {b.checkOutTime}</span>
                        <div>
                          <div className="font-bold text-slate-900">{b.guestName}</div>
                          <div className="text-[10px] text-slate-500">{unit?.name || 'Unit'} • Departed</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {unit?.status.replace('_', ' ') || 'STATUS'}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Action Items & Attention Spotlight */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Operational Attention
            </h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {openIssues.length + pendingPayments.length + activeCleaning.length} items
            </span>
          </div>

          <div className="space-y-2">
            {openIssues.length === 0 && pendingPayments.length === 0 && activeCleaning.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-4">All operations running smoothly with zero alerts.</p>
            ) : (
              <>
                {openIssues.slice(0, 2).map((issue) => {
                  const unit = units.find((u) => u.id === issue.unitId);
                  return (
                    <div key={issue.id} className="p-2.5 rounded-lg bg-red-50/80 border border-red-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        <div>
                          <span className="font-bold text-red-900">{unit?.name}:</span> <span className="text-red-800">{issue.description}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-200 text-red-900 shrink-0">
                        {issue.priority}
                      </span>
                    </div>
                  );
                })}

                {pendingPayments.slice(0, 2).map((b) => (
                  <div key={b.id} className="p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <div>
                        <span className="font-bold text-amber-900">{b.guestName}:</span> <span className="text-amber-800">Uncollected balance</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-900 shrink-0">
                      RM {b.balanceAmount}
                    </span>
                  </div>
                ))}

                {activeCleaning.slice(0, 2).map((task) => {
                  const unit = units.find((u) => u.id === task.unitId);
                  return (
                    <div key={task.id} className="p-2.5 rounded-lg bg-orange-50/80 border border-orange-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                        <div>
                          <span className="font-bold text-orange-900">{unit?.name}:</span> <span className="text-orange-800">Cleaning task in progress</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-orange-900 shrink-0">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
