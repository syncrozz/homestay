import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking } from '../../types';
import { BookingStatusBadge, PaymentStatusBadge } from '../common/StatusBadge';
import { openWhatsAppChat, formatGuestCheckInMessage } from '../../services/whatsappService';
import {
  BookOpen,
  Plus,
  Search,
  MessageCircle,
  Edit2,
  Trash2,
  Calendar,
  LogOut,
  User,
  Phone
} from 'lucide-react';

interface BookingListViewProps {
  onOpenNewBookingModal: () => void;
  onOpenEditBookingModal: (booking: Booking) => void;
}

export const BookingListView: React.FC<BookingListViewProps> = ({
  onOpenNewBookingModal,
  onOpenEditBookingModal,
}) => {
  const { bookings, units, cancelBooking, markGuestCheckedOut, settings } = useApp();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('ALL');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guestPhone.includes(searchTerm) ||
      b.remark.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUnit = selectedUnitFilter === 'ALL' || b.unitId === selectedUnitFilter;
    return matchesSearch && matchesUnit;
  });

  const getUnitName = (id: string) => units.find((u) => u.id === id)?.name || 'Unit';

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Booking Management</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all guest reservations, payment balances, and check-in/out workflows.
          </p>
        </div>

        <button
          onClick={onOpenNewBookingModal}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs transition-all"
        >
          <Plus className="w-4 h-4 text-blue-400" />
          <span>New Reservation</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search guest name, phone, or remark..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedUnitFilter}
            onChange={(e) => setSelectedUnitFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
          >
            <option value="ALL">All Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BOOKINGS TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                <th className="p-3">Guest</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Dates & Times</th>
                <th className="p-3">Status</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Remark</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 italic">
                    No bookings matched your search filter.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.guestName}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {b.guestPhone}
                      </div>
                    </td>

                    <td className="p-3 font-extrabold text-slate-900">{getUnitName(b.unitId)}</td>

                    <td className="p-3 space-y-0.5">
                      <div className="text-slate-800 font-medium">
                        In: {b.checkInDate} ({b.checkInTime})
                      </div>
                      <div className="text-slate-500">
                        Out: {b.checkOutDate} ({b.checkOutTime})
                      </div>
                    </td>

                    <td className="p-3">
                      <BookingStatusBadge status={b.status} />
                    </td>

                    <td className="p-3 space-y-0.5">
                      <PaymentStatusBadge status={b.paymentStatus} />
                      <div className="text-[11px] font-bold text-slate-800">
                        Total: RM {b.totalAmount} | Bal: RM {b.balanceAmount}
                      </div>
                    </td>

                    <td className="p-3 max-w-xs">
                      {b.remark ? (
                        <span className="px-2 py-1 rounded bg-amber-50 text-amber-900 font-medium border border-amber-200 text-[11px] inline-block">
                          💬 {b.remark}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>

                    <td className="p-3 text-right space-x-1">
                      {/* WhatsApp Guest */}
                      <button
                        onClick={() => {
                          const msg = formatGuestCheckInMessage({
                            template: settings.whatsappGuestCheckInTemplate,
                            propertyName: settings.propertyName,
                            guestName: b.guestName,
                            unitName: getUnitName(b.unitId),
                            checkInDate: b.checkInDate,
                            checkInTime: b.checkInTime,
                            checkOutDate: b.checkOutDate,
                            checkOutTime: b.checkOutTime,
                          });
                          openWhatsAppChat(b.guestPhone, msg);
                        }}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="WhatsApp Guest"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onOpenEditBookingModal(b)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Booking"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Cancel */}
                      {b.status !== 'CANCELLED' && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancel booking for ${b.guestName}?`)) {
                              cancelBooking(b.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Cancel Booking"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
