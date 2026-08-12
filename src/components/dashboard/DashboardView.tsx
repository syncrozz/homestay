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
  DollarSign
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
  const openIssues = maintenanceIssues.filter((m) => m.status === 'OPEN');

  const pendingPayments = bookings.filter((b) => b.paymentStatus !== 'PAID' && b.status !== 'CANCELLED');
  const totalPendingAmount = pendingPayments.reduce((acc, b) => acc + b.balanceAmount, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Executive Dashboard Overview</h1>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          High-level operational metrics and financial pending stats.
        </p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Today's Check-ins
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayCheckins.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <LogOut className="w-3.5 h-3.5 text-amber-600" /> Today's Check-outs
          </div>
          <div className="text-2xl font-bold text-slate-900">{todayCheckouts.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Active Cleaning
          </div>
          <div className="text-2xl font-bold text-slate-900">{activeCleaning.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-emerald-600" /> Units Ready
          </div>
          <div className="text-2xl font-bold text-slate-900">{readyUnits.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Units Occupied
          </div>
          <div className="text-2xl font-bold text-slate-900">{occupiedUnits.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Units Available
          </div>
          <div className="text-2xl font-bold text-slate-900">{availableUnits.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Wrench className="w-3.5 h-3.5 text-red-600" /> Maintenance Issues
          </div>
          <div className="text-2xl font-bold text-slate-900">{openIssues.length}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Uncollected Balance
          </div>
          <div className="text-2xl font-bold text-emerald-700">RM {totalPendingAmount}</div>
        </div>
      </div>
    </div>
  );
};
