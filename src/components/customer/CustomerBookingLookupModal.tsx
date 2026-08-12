import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import {
  Search,
  Mail,
  Phone,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Edit3,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  KeyRound,
  FileText,
  Plus
} from 'lucide-react';

interface CustomerBookingLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBooking?: () => void;
  initialEmail?: string;
}

export const CustomerBookingLookupModal: React.FC<CustomerBookingLookupModalProps> = ({
  isOpen,
  onClose,
  onOpenNewBooking,
  initialEmail = '',
}) => {
  const {
    bookings,
    units,
    updateBooking,
    cancelBooking,
    deleteBookingPermanently,
    isAdminUnlocked,
    unlockAdminMode,
    settings
  } = useApp();

  // Search input state
  const [searchEmail, setSearchEmail] = useState<string>(initialEmail);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [matchingBookings, setMatchingBookings] = useState<Booking[]>([]);
  const [showAllAdminBookings, setShowAllAdminBookings] = useState<boolean>(false);

  // Verification state for editing / deleting
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'EDIT' | 'DELETE' | null>(null);
  
  // Security inputs
  const [verifyEmail, setVerifyEmail] = useState<string>('');
  const [verifyLast4Phone, setVerifyLast4Phone] = useState<string>('');
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Edit form inputs (when verified)
  const [editCheckInDate, setEditCheckInDate] = useState<string>('');
  const [editCheckInTime, setEditCheckInTime] = useState<string>('');
  const [editCheckOutDate, setEditCheckOutDate] = useState<string>('');
  const [editCheckOutTime, setEditCheckOutTime] = useState<string>('');
  const [editGuestCount, setEditGuestCount] = useState<number>(1);
  const [editRemark, setEditRemark] = useState<string>('');

  // Status notification
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFeedback(null);
      setAuthError(null);
      if (isAdminUnlocked) {
        setMatchingBookings(bookings);
        setHasSearched(true);
        setShowAllAdminBookings(true);
      } else if (initialEmail) {
        setSearchEmail(initialEmail);
        handleSearchWithEmail(initialEmail);
      }
    } else {
      resetModalState();
    }
  }, [isOpen, initialEmail, isAdminUnlocked]);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const resetModalState = () => {
    setSelectedBooking(null);
    setActionType(null);
    setVerifyEmail('');
    setVerifyLast4Phone('');
    setAdminPinInput('');
    setIsVerified(false);
    setAuthError(null);
    setFeedback(null);
  };

  const handleSearchWithEmail = (emailToSearch: string) => {
    setShowAllAdminBookings(false);
    const clean = emailToSearch.trim().toLowerCase();
    if (!clean) {
      setMatchingBookings([]);
      setHasSearched(false);
      return;
    }

    const found = bookings.filter((b) => {
      const email = (b.guestEmail || '').trim().toLowerCase();
      const name = (b.guestName || '').trim().toLowerCase();
      const phone = (b.guestPhone || '').trim();
      return email.includes(clean) || name.includes(clean) || phone.includes(clean);
    });

    setMatchingBookings(found);
    setHasSearched(true);
  };

  const handleShowAllBookings = () => {
    setMatchingBookings(bookings);
    setHasSearched(true);
    setShowAllAdminBookings(true);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    resetModalState();
    handleSearchWithEmail(searchEmail);
  };

  const getUnitName = (unitId: string) => {
    return units.find((u) => u.id === unitId)?.name || 'Homestay Unit';
  };

  // Trigger Action (Edit or Delete)
  const handleInitiateAction = (booking: Booking, type: 'EDIT' | 'DELETE') => {
    setSelectedBooking(booking);
    setActionType(type);
    setVerifyEmail('');
    setVerifyLast4Phone('');
    setAdminPinInput('');
    
    // Auto-verify if Admin Mode is unlocked via PIN 5313!
    if (isAdminUnlocked) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
    }

    setAuthError(null);
    setFeedback(null);

    // Pre-fill edit form
    setEditCheckInDate(booking.checkInDate);
    setEditCheckInTime(booking.checkInTime);
    setEditCheckOutDate(booking.checkOutDate);
    setEditCheckOutTime(booking.checkOutTime);
    setEditGuestCount(booking.guestCount);
    setEditRemark(booking.remark || '');
  };

  // Verify Email + Last 4 Digits OR Admin PIN 5313
  const handleVerifyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Check PIN 5313 directly
    if (adminPinInput.trim() === '5313' || verifyLast4Phone.trim() === '5313') {
      const res = unlockAdminMode('5313');
      if (res.success) {
        setIsVerified(true);
        setAuthError(null);
        return;
      }
    }

    if (!selectedBooking) return;

    const emailMatch =
      (selectedBooking.guestEmail || '').trim().toLowerCase() === verifyEmail.trim().toLowerCase();

    // Extract digits from guestPhone
    const phoneDigits = selectedBooking.guestPhone.replace(/\D/g, '');
    const userLast4 = verifyLast4Phone.trim();
    const phoneMatch = phoneDigits.endsWith(userLast4) && userLast4.length === 4;

    if (emailMatch && phoneMatch) {
      setIsVerified(true);
      setAuthError(null);
    } else {
      setAuthError('Alamat e-mel / 4 digit telefon tidak sepadan. Jika anda Admin, masukkan PIN 5313.');
    }
  };

  // Save Edit Booking
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking || !isVerified) return;

    if (editCheckOutDate <= editCheckInDate) {
      setFeedback({
        type: 'error',
        text: 'Tarikh check-out mestilah selepas tarikh check-in.',
      });
      return;
    }

    const updated: Booking = {
      ...selectedBooking,
      checkInDate: editCheckInDate,
      checkInTime: editCheckInTime,
      checkOutDate: editCheckOutDate,
      checkOutTime: editCheckOutTime,
      guestCount: editGuestCount,
      remark: editRemark,
    };

    const res = updateBooking(updated);
    if (res.success) {
      setFeedback({
        type: 'success',
        text: 'Tempahan anda berjaya dikemas kini!',
      });
      // Refresh list
      handleSearchWithEmail(searchEmail);
      setTimeout(() => {
        resetModalState();
      }, 2000);
    } else {
      setFeedback({
        type: 'error',
        text: res.error || 'Gagal mengemaskini tempahan.',
      });
    }
  };

  // Confirm Delete / Cancel Booking
  const handleConfirmDelete = () => {
    if (!selectedBooking || !isVerified) return;

    cancelBooking(selectedBooking.id);
    setFeedback({
      type: 'success',
      text: 'Tempahan anda telah berjaya dibatalkan.',
    });
    if (showAllAdminBookings) {
      setMatchingBookings(bookings.map(b => b.id === selectedBooking.id ? { ...b, status: 'CANCELLED' } : b));
    } else {
      handleSearchWithEmail(searchEmail);
    }
    setTimeout(() => {
      resetModalState();
    }, 2000);
  };

  const handleConfirmPermanentDelete = () => {
    if (!selectedBooking || !isVerified) return;

    deleteBookingPermanently(selectedBooking.id);
    setFeedback({
      type: 'success',
      text: 'Tempahan telah dipadam secara kekal dari sistem.',
    });
    if (showAllAdminBookings) {
      setMatchingBookings(bookings.filter(b => b.id !== selectedBooking.id));
    } else {
      handleSearchWithEmail(searchEmail);
    }
    setTimeout(() => {
      resetModalState();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-6 border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Cari @ Urus Tempahan Saya
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Masukkan alamat e-mel anda untuk menyemak, mengubah atau memadam tempahan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin Mode Badge / Quick Unlock Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
          {isAdminUnlocked ? (
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>👑 Mod Admin Aktif — Akses Kawalan Bebas</span>
            </div>
          ) : (
            <div className="text-slate-600 font-medium">
              Tetamu: Guna e-mel &amp; 4 digit nombor tel. Admin: Guna <strong className="text-slate-900 font-black">PIN Admin</strong>.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShowAllBookings}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Lihat Semua Tempahan ({bookings.length})</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Alert */}
        {feedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-800">
            Cari Mengikut Alamat E-mel, Nama Tetamu atau No. Telefon
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="contoh: e-mel, nama tetamu, atau nombor telefon"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl text-xs font-semibold outline-hidden transition-all text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>View</span>
            </button>
          </div>
        </form>

        {/* Action / Verification Workspace */}
        {selectedBooking ? (
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-4 text-xs">
            {/* Header of Action */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                {actionType === 'EDIT' ? (
                  <>
                    <Edit3 className="w-4 h-4 text-blue-600" /> Ubah Tempahan
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 text-rose-600" /> Memadam / Batalkan Tempahan
                  </>
                )}
                ({getUnitName(selectedBooking.unitId)})
              </span>
              <button
                type="button"
                onClick={resetModalState}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-bold underline"
              >
                Batal &amp; Kembali
              </button>
            </div>

            {/* VERIFICATION FORM IF NOT VERIFIED YET */}
            {!isVerified ? (
              <form onSubmit={handleVerifyCredentials} className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Pengesahan Keselamatan Tetamu</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sila masukkan e-mel pendaftaran dan <strong>4 digit terakhir nombor telefon</strong> anda untuk meneruskan.
                </p>

                {authError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Alamat E-mel Tetamu
                    </label>
                    <input
                      type="email"
                      placeholder="e-mel pendaftaran"
                      value={verifyEmail}
                      onChange={(e) => setVerifyEmail(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      4 Digit Last No. Telefon
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={4}
                        pattern="\d{4}"
                        placeholder="contoh: 8877"
                        value={verifyLast4Phone}
                        onChange={(e) => setVerifyLast4Phone(e.target.value)}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-center"
                      />
                      <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                >
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sahkan Pengesahan Tetamu</span>
                </button>

                {/* Admin Mode Bypass using PIN */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <div className="text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Akses Pentadbir (Admin PIN Code)</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      placeholder="••••"
                      value={adminPinInput}
                      onChange={(e) => setAdminPinInput(e.target.value)}
                      className="flex-1 p-2 bg-amber-50/50 border border-amber-300 focus:bg-white rounded-lg text-xs font-mono font-black text-center tracking-widest text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (adminPinInput.trim() === '5313') {
                          unlockAdminMode('5313');
                          setIsVerified(true);
                          setAuthError(null);
                        } else {
                          setAuthError('PIN Code Admin tidak sah.');
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Bypass PIN Admin
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VERIFIED WORKSPACE (EDIT FORM OR DELETE CONFIRMATION) */
              <div>
                {actionType === 'EDIT' ? (
                  <form onSubmit={handleSaveEdit} className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Check-in Date &amp; Time</label>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            required
                            value={editCheckInDate}
                            onChange={(e) => setEditCheckInDate(e.target.value)}
                            className="w-2/3 p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                          />
                          <input
                            type="time"
                            required
                            value={editCheckInTime}
                            onChange={(e) => setEditCheckInTime(e.target.value)}
                            className="w-1/3 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Check-out Date &amp; Time</label>
                        <div className="flex gap-1">
                          <input
                            type="date"
                            required
                            value={editCheckOutDate}
                            onChange={(e) => setEditCheckOutDate(e.target.value)}
                            className="w-2/3 p-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold"
                          />
                          <input
                            type="time"
                            required
                            value={editCheckOutTime}
                            onChange={(e) => setEditCheckOutTime(e.target.value)}
                            className="w-1/3 p-1.5 bg-slate-50 border border-slate-300 rounded-lg text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Bilangan Tetamu</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={editGuestCount}
                          onChange={(e) => setEditGuestCount(Number(e.target.value))}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Catatan / Permintaan Special</label>
                        <input
                          type="text"
                          value={editRemark}
                          onChange={(e) => setEditRemark(e.target.value)}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                          placeholder="contoh: Minta katil tambahan"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={resetModalState}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs"
                      >
                        Simpan Perubahan
                      </button>
                    </div>
                  </form>
                ) : (
                  /* DELETE CONFIRMATION */
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-3">
                    <div className="flex items-center gap-2 text-rose-900 font-black text-xs">
                      <AlertTriangle className="w-5 h-5 text-rose-600" />
                      <span>Pengesahan Pembatalan / Pemadaman Tempahan</span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed">
                      Sila pilih tindakan bagi tempahan tetamu <strong>{selectedBooking.guestName}</strong> di unit <strong>{getUnitName(selectedBooking.unitId)}</strong> ({selectedBooking.checkInDate}):
                    </p>
                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={resetModalState}
                        className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmDelete}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                        title="Tukar status tempahan ke CANCELLED"
                      >
                        Set Cancelled
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmPermanentDelete}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        title="Padam rekod tempahan secara kekal dari database"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Padam Kekal</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}

        {/* SEARCH RESULTS LIST */}
        {hasSearched && !selectedBooking && (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 pb-1.5">
              <span>Hasil Carian Tempahan ({matchingBookings.length})</span>
            </div>

            {matchingBookings.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs font-bold text-slate-700">Tiada Tempahan Ditemui</div>
                <p className="text-[11px] text-slate-500">
                  Tiada sebarang tempahan aktif berdaftar di bawah e-mel <strong className="text-slate-800">{searchEmail}</strong>.
                </p>
                {onOpenNewBooking && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenNewBooking();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Buat Tempahan Baru
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {matchingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 transition-all space-y-2 text-xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span>{getUnitName(b.unitId)}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                          <span>{b.guestName}</span>
                          <span>•</span>
                          <span>{b.guestPhone}</span>
                        </div>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md font-extrabold text-[10px] uppercase border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : b.status === 'CANCELLED'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-lg text-[11px]">
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">Check-in</span>
                        <span className="font-extrabold text-slate-800">
                          {b.checkInDate} ({b.checkInTime})
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold block text-[10px]">Check-out</span>
                        <span className="font-extrabold text-slate-800">
                          {b.checkOutDate} ({b.checkOutTime})
                        </span>
                      </div>
                    </div>

                    {b.remark && (
                      <div className="px-2 py-1 bg-amber-50 text-amber-900 rounded-md text-[11px] border border-amber-200">
                        💬 <strong>Catatan:</strong> {b.remark}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-700">
                        Jumlah: <span className="text-blue-700 font-extrabold">RM {b.totalAmount}</span>
                        <span className="text-slate-400 font-normal ml-1">
                          (Baki: RM {b.balanceAmount})
                        </span>
                      </div>

                      {(b.status !== 'CANCELLED' || isAdminUnlocked) && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInitiateAction(b, 'EDIT')}
                            className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Ubah</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateAction(b, 'DELETE')}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Memadam</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
