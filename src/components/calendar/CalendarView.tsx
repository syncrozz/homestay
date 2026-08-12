import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, Unit, UnitStatus } from '../../types';
import { UnitStatusBadge, BookingStatusBadge } from '../common/StatusBadge';
import { evaluateEarlyCheckInPossibility } from '../../services/validationService';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Send,
  LogOut,
  User,
  Clock,
  Sparkles,
  Home,
  MessageSquare,
  AlertTriangle,
  Users
} from 'lucide-react';

interface CalendarViewProps {
  onOpenNewBookingModal: (unitId?: string, dateStr?: string) => void;
  onOpenBookingDetailsModal: (booking: Booking) => void;
}

type ViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewBookingModal,
  onOpenBookingDetailsModal,
}) => {
  const {
    units,
    bookings,
    cleaningTasks,
    markGuestCheckedOut,
    assignCleaningTask,
    dispatchCleanerWhatsApp,
    approveEarlyCheckIn,
    settings
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ALL');

  // Format YYYY-MM-DD
  const formatDateStr = (d: Date): string => d.toISOString().split('T')[0];
  const todayStr = formatDateStr(new Date());

  // Navigation Handlers
  const handleToday = () => setCurrentDate(new Date());
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    else if (viewMode === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };
  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    else if (viewMode === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  // Filter units
  const activeUnits = useMemo(() => {
    return units.filter((u) => u.isActive && (selectedUnitId === 'ALL' || u.id === selectedUnitId));
  }, [units, selectedUnitId]);

  // Compute month calendar days grid
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon...
    const daysInMonth = lastDayOfMonth.getDate();

    const days: Array<{ date: Date; dateStr: string; isCurrentMonth: boolean; isToday: boolean }> = [];

    // Fill preceding days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      const dStr = formatDateStr(prevDate);
      days.push({ date: prevDate, dateStr: dStr, isCurrentMonth: false, isToday: dStr === todayStr });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const curDate = new Date(year, month, i);
      const dStr = formatDateStr(curDate);
      days.push({ date: curDate, dateStr: dStr, isCurrentMonth: true, isToday: dStr === todayStr });
    }

    // Fill succeeding days to complete grid multiple of 7
    const remaining = 35 - days.length;
    if (remaining > 0) {
      for (let i = 1; i <= remaining; i++) {
        const nextDate = new Date(year, month + 1, i);
        const dStr = formatDateStr(nextDate);
        days.push({ date: nextDate, dateStr: dStr, isCurrentMonth: false, isToday: dStr === todayStr });
      }
    }

    return days;
  }, [currentDate, todayStr]);

  // Compute week calendar days
  const weekDays = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diffToMon = d.getDate() - day + (day === 0 ? -6 : 1); // Start Monday
    const monday = new Date(d.setDate(diffToMon));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);
      const dStr = formatDateStr(dayDate);
      days.push({ date: dayDate, dateStr: dStr, isToday: dStr === todayStr });
    }
    return days;
  }, [currentDate, todayStr]);

  // Helper to find bookings active on a given date for a unit
  const getBookingsForUnitDate = (unitId: string, dateStr: string): Booking[] => {
    return bookings.filter((b) => {
      if (b.unitId !== unitId) return false;
      if (b.status === 'CANCELLED') return false;
      return dateStr >= b.checkInDate && dateStr <= b.checkOutDate;
    });
  };

  const getUnitName = (unitId: string) => units.find((u) => u.id === unitId)?.name || 'Unit';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Calendar Top Control Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Title & Today's Summary */}
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Operational Control Center</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time occupancy calendar & guest checkout workflow dispatcher.
          </p>
        </div>

        {/* Navigation & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Unit Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 hidden sm:inline">Filter Unit:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 border border-slate-300 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Units ({units.length})</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'month' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Day
            </button>
          </div>

          {/* Date Nav Buttons */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-3 py-1 text-xs font-bold text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* New Booking Action */}
          <button
            onClick={() => onOpenNewBookingModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-blue-400" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Date Title Banner */}
      <div className="flex items-center justify-between px-2">
        <h2 className="text-lg font-bold text-slate-800">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
            ...(viewMode === 'day' ? { day: 'numeric', weekday: 'long' } : {}),
          })}
        </h2>
        <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Ready
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Occupied
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Cleaning
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Maintenance
          </span>
        </div>
      </div>

      {/* MONTH VIEW */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center text-xs font-bold text-slate-600 py-2.5">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-100">
            {monthDays.map((dayObj, index) => {
              // Find all bookings across active units for this day
              const dayBookings: Array<{ booking: Booking; unit: Unit }> = [];
              activeUnits.forEach((unit) => {
                const bks = getBookingsForUnitDate(unit.id, dayObj.dateStr);
                bks.forEach((b) => dayBookings.push({ booking: b, unit }));
              });

              return (
                <div
                  key={index}
                  className={`min-h-[120px] p-2 transition-colors ${
                    !dayObj.isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'
                  } ${dayObj.isToday ? 'ring-2 ring-emerald-500 ring-inset bg-emerald-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                        dayObj.isToday
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : dayObj.isCurrentMonth
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </span>
                    {dayObj.isCurrentMonth && (
                      <button
                        onClick={() => onOpenNewBookingModal(undefined, dayObj.dateStr)}
                        className="text-slate-300 hover:text-emerald-600 transition-colors"
                        title="Add booking on this date"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Booking Cards on Grid */}
                  <div className="space-y-1.5">
                    {dayBookings.map(({ booking, unit }) => {
                      const isCheckInDay = booking.checkInDate === dayObj.dateStr;
                      const isCheckOutDay = booking.checkOutDate === dayObj.dateStr;

                      return (
                        <div
                          key={booking.id}
                          onClick={() => onOpenBookingDetailsModal(booking)}
                          className="p-1.5 rounded-lg bg-blue-50/90 border border-blue-200 hover:border-blue-400 hover:shadow-2xs transition-all cursor-pointer group"
                        >
                          {/* Booking Card with Strict Visual Hierarchy */}
                          <div className="flex flex-col gap-1 text-[11px]">
                            {/* 1. Unit Name & Guest Count */}
                            <div className="flex items-center justify-between border-b border-blue-100 pb-0.5">
                              <span className="font-extrabold text-blue-700 text-xs tracking-tight">
                                {unit.name}
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-white/80 px-1.5 py-0.2 rounded border border-slate-200">
                                {booking.guestCount}g
                              </span>
                            </div>

                            {/* 2. Guest Name */}
                            <div className="font-bold text-slate-900 truncate">
                              {booking.guestName}
                            </div>

                            {/* 3. Stay / Check-in / Check-out & Unit Status */}
                            <div className="flex items-center justify-between text-[10px] text-slate-600 font-medium">
                              <span className="truncate">
                                {isCheckInDay ? `🔑 In ${booking.checkInTime}` : isCheckOutDay ? `🚪 Out ${booking.checkOutTime}` : 'Stay'}
                              </span>
                              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0 ml-1">
                                {unit.status.replace('_', ' ')}
                              </span>
                            </div>

                            {/* 4. Important note / Remark */}
                            {booking.remark && (
                              <div className="px-1.5 py-0.5 bg-amber-100/90 text-amber-900 rounded text-[10px] truncate border border-amber-200 font-medium">
                                💬 {booking.remark}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK & DAY VIEWS: Detailed Operational Gantt Matrix */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header row with dates */}
            <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 divide-x divide-slate-200">
              <div className="p-3 text-slate-500">Units</div>
              {(viewMode === 'week' ? weekDays : [{ date: currentDate, dateStr: formatDateStr(currentDate), isToday: formatDateStr(currentDate) === todayStr }]).map((d, i) => (
                <div
                  key={i}
                  className={`p-3 text-center ${d.isToday ? 'bg-emerald-50 text-emerald-900' : ''}`}
                >
                  <div>{d.date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-sm font-extrabold">{d.date.getDate()}</div>
                </div>
              ))}
            </div>

            {/* Rows for each Unit */}
            {activeUnits.map((unit) => {
              const activeCleaningTask = cleaningTasks.find(
                (t) => t.unitId === unit.id && t.status !== 'COMPLETED'
              );

              return (
                <div
                  key={unit.id}
                  className="grid grid-cols-8 divide-x divide-y divide-slate-200 items-center min-h-[100px]"
                >
                  {/* Unit Metadata Column */}
                  <div className="p-3 space-y-1.5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{unit.name}</span>
                      <span className="text-xs text-slate-400">({unit.code})</span>
                    </div>

                    <UnitStatusBadge status={unit.status} size="sm" />

                    <div className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3" /> Max {unit.capacity} guests
                    </div>
                  </div>

                  {/* Day cells for this unit */}
                  {(viewMode === 'week' ? weekDays : [{ date: currentDate, dateStr: formatDateStr(currentDate), isToday: formatDateStr(currentDate) === todayStr }]).map((dayObj, i) => {
                    const unitBookings = getBookingsForUnitDate(unit.id, dayObj.dateStr);

                    return (
                      <div key={i} className="p-2 space-y-2 h-full flex flex-col justify-between">
                        {unitBookings.length === 0 ? (
                          <div className="h-full flex flex-col items-center justify-center p-2 rounded-xl border border-dashed border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all text-center">
                            <span className="text-[11px] text-slate-400 font-medium">Available</span>
                            <button
                              onClick={() => onOpenNewBookingModal(unit.id, dayObj.dateStr)}
                              className="mt-1 text-[10px] text-emerald-700 font-bold hover:underline flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" /> Book
                            </button>
                          </div>
                        ) : (
                          unitBookings.map((booking) => {
                            const isCheckoutToday = booking.checkOutDate === todayStr && dayObj.dateStr === todayStr;
                            const earlyCheckInEval = evaluateEarlyCheckInPossibility(booking, unit, bookings, cleaningTasks);

                            return (
                              <div
                                key={booking.id}
                                className="p-2.5 rounded-xl bg-slate-900 text-white shadow-sm space-y-2"
                              >
                                <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                  <span className="font-bold text-xs flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-emerald-400" />
                                    {booking.guestName}
                                  </span>
                                  <BookingStatusBadge status={booking.status} />
                                </div>

                                <div className="text-[11px] text-slate-300 space-y-1">
                                  <div className="flex items-center justify-between text-slate-400">
                                    <span>In: {booking.checkInDate} ({booking.checkInTime})</span>
                                    <span>Out: {booking.checkOutDate} ({booking.checkOutTime})</span>
                                  </div>

                                  {/* Direct remark display */}
                                  {booking.remark && (
                                    <div className="p-1 rounded bg-amber-950/80 text-amber-200 text-[10px] border border-amber-800/50">
                                      Remark: {booking.remark}
                                    </div>
                                  )}
                                </div>

                                {/* OPERATIONAL ACTION BUTTONS DIRECTLY ON CARD */}
                                <div className="pt-1 flex flex-col gap-1">
                                  {/* Action 1: GUEST CHECKED OUT */}
                                  {isCheckoutToday && unit.status === 'OCCUPIED' && (
                                    <button
                                      onClick={() => markGuestCheckedOut(booking.id)}
                                      className="w-full py-1 px-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all"
                                    >
                                      <LogOut className="w-3.5 h-3.5" />
                                      <span>GUEST CHECKED OUT</span>
                                    </button>
                                  )}

                                  {/* Action 2: SEND CLEANING TASK */}
                                  {unit.status === 'AWAITING_CLEANING' && (
                                    <button
                                      onClick={() => {
                                        if (!activeCleaningTask) {
                                          assignCleaningTask(unit.id, undefined, booking.id);
                                        }
                                        const taskToDispatch = activeCleaningTask || cleaningTasks[0];
                                        if (taskToDispatch) {
                                          dispatchCleanerWhatsApp(taskToDispatch.id);
                                        }
                                      }}
                                      className="w-full py-1 px-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all"
                                    >
                                      <Send className="w-3.5 h-3.5" />
                                      <span>SEND CLEANING TASK</span>
                                    </button>
                                  )}

                                  {/* Action 3: ALLOW EARLY CHECK-IN */}
                                  {booking.checkInDate === todayStr && earlyCheckInEval.canBeApproved && !booking.earlyCheckInApproved && (
                                    <button
                                      onClick={() => approveEarlyCheckIn(booking.id, '14:00')}
                                      className="w-full py-1 px-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all"
                                    >
                                      <Sparkles className="w-3.5 h-3.5" />
                                      <span>ALLOW EARLY CHECK-IN</span>
                                    </button>
                                  )}

                                  {booking.earlyCheckInApproved && (
                                    <span className="text-[10px] text-teal-300 font-bold flex items-center gap-1">
                                      ✨ Early check-in approved ({booking.approvedEarlyCheckInTime || '2:00 PM'})
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
