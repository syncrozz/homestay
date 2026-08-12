import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { openWhatsAppChat, formatGuestCheckInMessage } from '../../services/whatsappService';
import { Users, Search, MessageCircle, Phone, Calendar, BookOpen } from 'lucide-react';

export const GuestManagementView: React.FC = () => {
  const { guests, bookings, settings, units } = useApp();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.phone.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Guest Directory</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Guest CRM records, stay history, and quick pre-filled WhatsApp communication.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search guest name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Guest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuests.map((guest) => {
          const guestBookings = bookings.filter((b) => b.guestPhone === guest.phone);

          return (
            <div key={guest.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{guest.name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" /> {guest.phone}
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
                  {guest.totalBookings} Stays
                </span>
              </div>

              {guest.remarks && (
                <p className="text-xs text-amber-900 bg-amber-50 p-2 rounded-xl border border-amber-200">
                  💬 {guest.remarks}
                </p>
              )}

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">
                  Last stay: <strong>{guest.lastStayDate || 'N/A'}</strong>
                </span>

                <button
                  onClick={() => {
                    const msg = `Hi ${guest.name},\n\nThank you for choosing ${settings.propertyName}! We look forward to hosting you again.\n\nBest regards,\n${settings.propertyName}`;
                    openWhatsAppChat(guest.phone, msg);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-2xs transition-all"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
