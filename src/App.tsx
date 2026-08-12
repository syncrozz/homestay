import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar, ActiveTab } from './components/layout/Navbar';
import { CalendarView } from './components/calendar/CalendarView';
import { TodayOperationsView } from './components/today/TodayOperationsView';
import { CleaningManagementView } from './components/cleaning/CleaningManagementView';
import { UnitManagementView } from './components/units/UnitManagementView';
import { GuestManagementView } from './components/guests/GuestManagementView';
import { BookingListView } from './components/bookings/BookingListView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { InventoryView } from './components/inventory/InventoryView';
import { DashboardView } from './components/dashboard/DashboardView';
import { AdminSettingsView } from './components/admin/AdminSettingsView';
import { CleanerMobileView } from './components/cleaner/CleanerMobileView';
import { BookingModal } from './components/bookings/BookingModal';
import { BookingAdjustmentModal } from './components/bookings/BookingAdjustmentModal';
import { CustomerBookingLookupModal } from './components/customer/CustomerBookingLookupModal';
import { AdminPinModal } from './components/admin/AdminPinModal';
import { Booking } from './types';

const MainContent: React.FC = () => {
  const { currentRole, settings } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');

  // Booking modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>(undefined);
  const [modalUnitId, setModalUnitId] = useState<string | undefined>(undefined);
  const [modalDateStr, setModalDateStr] = useState<string | undefined>(undefined);

  // Booking adjustment modal state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentBooking, setAdjustmentBooking] = useState<Booking | undefined>(undefined);

  // Customer lookup modal state
  const [isCustomerLookupModalOpen, setIsCustomerLookupModalOpen] = useState(false);

  // Admin PIN modal state
  const [isAdminPinModalOpen, setIsAdminPinModalOpen] = useState(false);

  const handleOpenNewBooking = (unitId?: string, dateStr?: string) => {
    setEditingBooking(undefined);
    setModalUnitId(unitId);
    setModalDateStr(dateStr);
    setIsBookingModalOpen(true);
  };

  const handleOpenEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setModalUnitId(booking.unitId);
    setModalDateStr(booking.checkInDate);
    setIsBookingModalOpen(true);
  };

  const handleOpenAdjustmentBooking = (booking?: Booking) => {
    setAdjustmentBooking(booking);
    setIsAdjustmentModalOpen(true);
  };

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-50 text-slate-900 font-sans antialiased flex flex-col justify-between">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAdjustmentModal={() => handleOpenAdjustmentBooking()}
        onOpenCustomerLookupModal={() => setIsCustomerLookupModalOpen(true)}
        onOpenAdminPinModal={() => setIsAdminPinModalOpen(true)}
      />

      <main className="flex-1 pb-8">
        {currentRole === 'CLEANER' ? (
          <CleanerMobileView />
        ) : (
          <>
            {activeTab === 'calendar' && (
              <CalendarView
                onOpenNewBookingModal={handleOpenNewBooking}
                onOpenBookingDetailsModal={handleOpenEditBooking}
                onOpenAdjustmentModal={handleOpenAdjustmentBooking}
                onOpenCustomerLookupModal={() => setIsCustomerLookupModalOpen(true)}
              />
            )}
            {activeTab === 'today' && <TodayOperationsView />}
            {activeTab === 'cleaning' && <CleaningManagementView />}
            {activeTab === 'units' && <UnitManagementView />}
            {activeTab === 'guests' && <GuestManagementView />}
            {activeTab === 'bookings' && (
              <BookingListView
                onOpenNewBookingModal={() => handleOpenNewBooking()}
                onOpenEditBookingModal={handleOpenEditBooking}
                onOpenAdjustmentModal={handleOpenAdjustmentBooking}
              />
            )}
            {activeTab === 'maintenance' && <MaintenanceView />}
            {activeTab === 'inventory' && <InventoryView />}
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'admin' && <AdminSettingsView />}
          </>
        )}
      </main>

      {/* Professional Polish Bottom Status Bar */}
      <footer className="h-8 px-6 bg-slate-800 text-white flex items-center justify-between text-[10px] sm:text-xs shrink-0 font-medium border-t border-slate-700">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            System Status: <span className="text-emerald-400 font-semibold">Operational</span>
          </span>
          <span className="text-slate-400 hidden sm:inline italic">HOMS Ops Console v1.2</span>
        </div>
        <div className="flex items-center gap-4 text-slate-300">
          <span>Property: <span className="text-blue-300 font-semibold">{settings.propertyName || 'Homestay'}</span></span>
        </div>
      </footer>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        existingBooking={editingBooking}
        initialUnitId={modalUnitId}
        initialDateStr={modalDateStr}
      />

      <BookingAdjustmentModal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        booking={adjustmentBooking}
      />

      <CustomerBookingLookupModal
        isOpen={isCustomerLookupModalOpen}
        onClose={() => setIsCustomerLookupModalOpen(false)}
        onOpenNewBooking={() => handleOpenNewBooking()}
      />

      <AdminPinModal
        isOpen={isAdminPinModalOpen}
        onClose={() => setIsAdminPinModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
