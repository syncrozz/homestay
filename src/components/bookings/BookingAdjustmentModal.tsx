import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import {
  copyToClipboard,
  formatOwnerBookingAlertMessage,
  formatGuestCheckInMessage,
  openWhatsAppChat
} from '../../services/whatsappService';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Sliders,
  DollarSign,
  Calendar,
  User,
  X,
  Check,
  Copy,
  MessageCircle,
  AlertTriangle,
  FileText,
  RefreshCw,
  Trash2,
  Send,
  Building,
  CheckCircle2,
  Tag
} from 'lucide-react';

interface BookingAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking?: Booking;
}

export const BookingAdjustmentModal: React.FC<BookingAdjustmentModalProps> = ({
  isOpen,
  onClose,
  booking: initialBooking,
}) => {
  const { bookings, units, settings, updateBooking, cancelBooking, deleteBookingPermanently, isAdminUnlocked, unlockAdminMode, lockAdminMode } = useApp();

  // Passcode verification state
  const [localUnlocked, setLocalUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('homs_passcode_unlocked') === 'true';
  });
  const isUnlocked = isAdminUnlocked || localUnlocked;

  const [passcodeInput, setPasscodeInput] = useState<string>('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  // Selected booking state
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const activeBooking = bookings.find((b) => b.id === selectedBookingId) || initialBooking || bookings[0];

  // Adjustment Form States
  const [unitId, setUnitId] = useState<string>('');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkInTime, setCheckInTime] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [checkOutTime, setCheckOutTime] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('DEPOSIT_PAID');

  // Reconciliation Breakdown
  const [originalTotal, setOriginalTotal] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [extraChargeAmount, setExtraChargeAmount] = useState<number>(0);
  const [netTotal, setNetTotal] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  const [adjustmentReason, setAdjustmentReason] = useState<string>('');
  const [remark, setRemark] = useState<string>('');

  // Status feedback
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setFeedbackMessage(null);
      setPasscodeInput('');
      setPasscodeError(null);

      const target = initialBooking || bookings.find((b) => b.id === selectedBookingId) || bookings[0];
      if (target) {
        setSelectedBookingId(target.id);
        populateForm(target);
      }
    }
  }, [isOpen, initialBooking]);

  useEffect(() => {
    if (selectedBookingId) {
      const target = bookings.find((b) => b.id === selectedBookingId);
      if (target) {
        populateForm(target);
      }
    }
  }, [selectedBookingId]);

  const populateForm = (b: Booking) => {
    setUnitId(b.unitId);
    setGuestName(b.guestName);
    setGuestPhone(b.guestPhone);
    setCheckInDate(b.checkInDate);
    setCheckInTime(b.checkInTime);
    setCheckOutDate(b.checkOutDate);
    setCheckOutTime(b.checkOutTime);
    setGuestCount(b.guestCount);
    setStatus(b.status);
    setPaymentStatus(b.paymentStatus);

    setOriginalTotal(b.totalAmount);
    setDiscountAmount(0);
    setExtraChargeAmount(0);
    setNetTotal(b.totalAmount);
    setDepositAmount(b.depositAmount);
    setBalanceAmount(b.balanceAmount);
    setRemark(b.remark || '');
    setAdjustmentReason('');
  };

  // Recalculate Net Total & Balance on inputs change
  useEffect(() => {
    const computedNet = Math.max(0, Number(originalTotal) - Number(discountAmount) + Number(extraChargeAmount));
    setNetTotal(computedNet);
    setBalanceAmount(Math.max(0, computedNet - Number(depositAmount)));
  }, [originalTotal, discountAmount, extraChargeAmount, depositAmount]);

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

  if (!isOpen) return null;

  // Handle Passcode Unlock
  const handleVerifyPasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError(null);

    // Validate secret passcode 5313
    if (passcodeInput.trim() === '5313') {
      unlockAdminMode('5313');
      setLocalUnlocked(true);
      sessionStorage.setItem('homs_passcode_unlocked', 'true');
    } else {
      setPasscodeError('Passcode keselamatan tidak sah. Sila semak semula.');
    }
  };

  const handleLockSession = () => {
    lockAdminMode();
    setLocalUnlocked(false);
    sessionStorage.removeItem('homs_passcode_unlocked');
  };

  // Handle Save Adjustments
  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMessage(null);

    if (!activeBooking) return;

    if (checkOutDate <= checkInDate) {
      setFeedbackMessage({
        type: 'error',
        text: 'Tarikh check-out mestilah selepas tarikh check-in.',
      });
      return;
    }

    const updatedRemark = adjustmentReason
      ? `${remark ? remark + ' | ' : ''}Penyelarasan: ${adjustmentReason}`
      : remark;

    const updatedBooking: Booking = {
      ...activeBooking,
      unitId,
      guestName,
      guestPhone,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      guestCount,
      status,
      paymentStatus,
      totalAmount: netTotal,
      depositAmount,
      balanceAmount,
      remark: updatedRemark,
    };

    const res = updateBooking(updatedBooking);

    if (res.success) {
      setFeedbackMessage({
        type: 'success',
        text: 'Penyelarasan tempahan berjaya dikemas kini!',
      });
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 3000);
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.error || 'Gagal menyimpan penyelarasan.',
      });
    }
  };

  // Handle Cancel Booking
  const handleCancelBooking = () => {
    if (!activeBooking) return;
    if (window.confirm(`Adakah anda pasti mahu membatalkan tempahan bagi ${guestName}?`)) {
      cancelBooking(activeBooking.id);
      setStatus('CANCELLED');
      setFeedbackMessage({
        type: 'success',
        text: 'Tempahan telah ditukar status kepada CANCELLED.',
      });
    }
  };

  // Handle Permanent Delete
  const handlePermanentDelete = () => {
    if (!activeBooking) return;
    if (window.confirm(`Adakah anda pasti mahu MEMADAM KEKAL rekod tempahan bagi ${guestName}? Rekod tidak boleh dipulihkan semula.`)) {
      deleteBookingPermanently(activeBooking.id);
      onClose();
    }
  };

  const getUnitName = (id: string) => units.find((u) => u.id === id)?.name || 'Unit';

  const generateOwnerText = () => {
    return formatOwnerBookingAlertMessage({
      template: settings.whatsappOwnerAlertTemplate,
      propertyName: settings.propertyName,
      guestName,
      guestPhone,
      unitName: getUnitName(unitId),
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      guestCount,
      totalAmount: netTotal,
      depositAmount,
      balanceAmount,
      paymentStatus,
      remark: adjustmentReason ? `${remark} (Penyelarasan: ${adjustmentReason})` : remark,
    });
  };

  const handleCopyOwnerText = async () => {
    const text = generateOwnerText();
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleSendCustomerWhatsApp = () => {
    const text = generateOwnerText();
    openWhatsAppChat(settings.ownerWhatsapp || settings.propertyContact || '+60123456789', text);
  };

  const handleSendOwnerWhatsApp = () => {
    const text = generateOwnerText();
    openWhatsAppChat(settings.ownerWhatsapp || settings.propertyContact || '+60123456789', text);
  };

  const handleSendGuestWhatsApp = () => {
    const text = formatGuestCheckInMessage({
      template: settings.whatsappGuestCheckInTemplate,
      propertyName: settings.propertyName,
      guestName,
      unitName: getUnitName(unitId),
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
    });
    openWhatsAppChat(guestPhone, text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Penyelarasan &amp; Pengubahsuaian Tempahan
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Penyelarasan tarikh, unit, harga, diskaun &amp; status tempahan
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

        {/* LOCKED STATE (PASSCODE INPUT) */}
        {!isUnlocked ? (
          <form onSubmit={handleVerifyPasscode} className="py-6 px-4 space-y-5 text-center max-w-md mx-auto">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-amber-200">
              <Lock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Akses Keselamatan Penyelarasan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sila masukkan passcode keselamatan pengurusan untuk mengakses ruangan detail dan penyelarasan tempahan ini.
              </p>
            </div>

            {passcodeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="relative max-w-xs mx-auto">
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="••••"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 bg-slate-50 border-2 border-slate-300 focus:border-blue-600 focus:bg-white rounded-xl outline-hidden transition-all shadow-2xs text-slate-900"
                  autoFocus
                />
                <KeyRound className="w-5 h-5 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full max-w-xs mx-auto py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Sahkan &amp; Buka Penyelarasan</span>
            </button>
          </form>
        ) : (
          /* UNLOCKED ADJUSTMENT WORKSPACE */
          <div className="space-y-4 text-xs">
            {/* Top Unlock Bar & Booking Picker */}
            <div className="flex flex-wrap items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Akses Disahkan
                </span>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 text-xs shadow-2xs"
                >
                  {bookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.guestName} ({b.checkInDate}) - {getUnitName(b.unitId)} [RM {b.totalAmount}]
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleLockSession}
                className="text-[11px] text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 hover:underline"
              >
                <Lock className="w-3.5 h-3.5" /> Kunci Semula
              </button>
            </div>

            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              {/* SECTION 1: Stay & Unit Details */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span>1. Penyelarasan Unit &amp; Tarikh Penginapan</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Homestay Unit</label>
                    <select
                      value={unitId}
                      onChange={(e) => setUnitId(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900"
                    >
                      {units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} - {u.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Nama Tetamu</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telefon Tetamu</label>
                    <input
                      type="text"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Bilangan Tetamu</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Status Tempahan</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BookingStatus)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                    >
                      <option value="CONFIRMED">Confirmed</option>
                      <option value="PENDING">Pending</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Check-in Date &amp; Time</label>
                    <div className="flex gap-1">
                      <input
                        type="date"
                        required
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-2/3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                      />
                      <input
                        type="time"
                        required
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="w-1/3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Check-out Date &amp; Time</label>
                    <div className="flex gap-1">
                      <input
                        type="date"
                        required
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-2/3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
                      />
                      <input
                        type="time"
                        required
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        className="w-1/3 p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Financial Reconciliation & Adjustment */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-3">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs border-b border-slate-100 pb-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>2. Penyelarasan Kewangan &amp; Kiraan Bayaran (Reconciliation)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Harga Asal (RM)</label>
                    <input
                      type="number"
                      min={0}
                      value={originalTotal}
                      onChange={(e) => setOriginalTotal(Number(e.target.value))}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-rose-700 mb-1">Diskaun / Rebat (-) RM</label>
                    <input
                      type="number"
                      min={0}
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(Number(e.target.value))}
                      className="w-full p-2 bg-rose-50 border border-rose-200 rounded-lg font-bold text-rose-800"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-blue-700 mb-1">Caj Tambahan (+) RM</label>
                    <input
                      type="number"
                      min={0}
                      value={extraChargeAmount}
                      onChange={(e) => setExtraChargeAmount(Number(e.target.value))}
                      className="w-full p-2 bg-blue-50 border border-blue-200 rounded-lg font-bold text-blue-800"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Jumlah Bersih (Net Total)</label>
                    <div className="text-sm font-black text-slate-900">RM {netTotal}</div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-0.5">Deposit Diterima (RM)</label>
                    <input
                      type="number"
                      min={0}
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-md font-bold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Baki Due (Balance)</label>
                    <div className="text-sm font-black text-emerald-700">RM {balanceAmount}</div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status Bayaran (Payment Status)</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
                  >
                    <option value="PAID">PAID (Selesai Sepenuhnya)</option>
                    <option value="DEPOSIT_PAID">DEPOSIT_PAID (Sudah Bayar Deposit)</option>
                    <option value="UNPAID">UNPAID (Belum Bayar)</option>
                    <option value="REFUNDED">REFUNDED (Sudah Dipulangkan)</option>
                  </select>
                </div>
              </div>

              {/* SECTION 3: Reason & Remarks */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>3. Sebab Penyelarasan &amp; Catatan Ops</span>
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="E.g. Diskaun RM30 pelanggan tetap & penambahan tilam ekstra RM20"
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    className="w-full p-2 bg-amber-50 border border-amber-200 rounded-lg font-medium text-amber-900 text-xs"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Catatan ini akan dimasukkan secara automatik ke dalam sejarah penyelarasan rekod tempahan.
                  </p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelBooking}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Tukar status tempahan ke CANCELLED"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Set Cancelled</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePermanentDelete}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Padam rekod tempahan secara kekal dari pangkalan data"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Padam Kekal</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyOwnerText}
                    className={`px-3 py-2 font-bold text-xs rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer ${
                      copiedText
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    }`}
                  >
                    {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>Salin Alert Owner</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCustomerWhatsApp}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Whatsapp Owner</span>
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Simpan Penyelarasan
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
