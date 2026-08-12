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
  AlertTriangle,
  Calendar,
  Clock,
  DollarSign,
  User,
  MessageSquare,
  X,
  CheckCircle2,
  Copy,
  Check,
  Send,
  MessageCircle,
  Share2,
  Trash2
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingBooking?: Booking;
  initialUnitId?: string;
  initialDateStr?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  existingBooking,
  initialUnitId,
  initialDateStr,
}) => {
  const { units, settings, createBooking, updateBooking, deleteBookingPermanently, isAdminUnlocked } = useApp();

  const handleDeleteBooking = () => {
    if (!existingBooking) return;
    if (window.confirm(`Adakah anda pasti mahu MEMADAM KEKAL tempahan bagi ${existingBooking.guestName}? Rekod tidak boleh dipulihkan semula.`)) {
      deleteBookingPermanently(existingBooking.id);
      onClose();
    }
  };

  const [unitId, setUnitId] = useState<string>(initialUnitId || units[0]?.id || '');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState<string>('');
  const [checkInDate, setCheckInDate] = useState<string>(initialDateStr || new Date().toISOString().split('T')[0]);
  const [checkInTime, setCheckInTime] = useState<string>(settings.defaultCheckInTime || '15:00');
  const [checkOutDate, setCheckOutDate] = useState<string>(
    initialDateStr
      ? new Date(new Date(initialDateStr).getTime() + 86400000).toISOString().split('T')[0]
      : new Date(new Date().getTime() + 86400000).toISOString().split('T')[0]
  );
  const [checkOutTime, setCheckOutTime] = useState<string>(settings.defaultCheckOutTime || '12:00');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [status, setStatus] = useState<BookingStatus>('CONFIRMED');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('DEPOSIT_PAID');
  const [totalAmount, setTotalAmount] = useState<number>(300);
  const [depositAmount, setDepositAmount] = useState<number>(100);
  const [balanceAmount, setBalanceAmount] = useState<number>(200);
  const [remark, setRemark] = useState<string>('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Success Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showSuccessStep, setShowSuccessStep] = useState<boolean>(false);
  const [copiedOwner, setCopiedOwner] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setShowSuccessStep(false);
      setConfirmedBooking(null);
      setCopiedOwner(false);
      setErrorMessage(null);

      if (existingBooking) {
        setUnitId(existingBooking.unitId);
        setGuestName(existingBooking.guestName);
        setGuestPhone(existingBooking.guestPhone);
        setGuestEmail(existingBooking.guestEmail || '');
        setCheckInDate(existingBooking.checkInDate);
        setCheckInTime(existingBooking.checkInTime);
        setCheckOutDate(existingBooking.checkOutDate);
        setCheckOutTime(existingBooking.checkOutTime);
        setGuestCount(existingBooking.guestCount);
        setStatus(existingBooking.status);
        setPaymentStatus(existingBooking.paymentStatus);
        setTotalAmount(existingBooking.totalAmount);
        setDepositAmount(existingBooking.depositAmount);
        setBalanceAmount(existingBooking.balanceAmount);
        setRemark(existingBooking.remark);
      } else {
        if (initialUnitId) setUnitId(initialUnitId);
        if (initialDateStr) {
          setCheckInDate(initialDateStr);
          setCheckOutDate(new Date(new Date(initialDateStr).getTime() + 86400000).toISOString().split('T')[0]);
        }
      }
    }
  }, [isOpen, existingBooking, initialUnitId, initialDateStr]);

  useEffect(() => {
    setBalanceAmount(Math.max(0, totalAmount - depositAmount));
  }, [totalAmount, depositAmount]);

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

  const targetUnit = units.find((u) => u.id === (confirmedBooking ? confirmedBooking.unitId : unitId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Date order check
    if (checkOutDate <= checkInDate) {
      setErrorMessage('Check-out date must be strictly AFTER check-in date.');
      return;
    }

    const payload = {
      unitId,
      guestName,
      guestPhone,
      guestEmail,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      guestCount,
      status,
      paymentStatus,
      totalAmount,
      depositAmount,
      balanceAmount,
      remark,
    };

    let res;
    let savedBooking: Booking;
    if (existingBooking) {
      savedBooking = { ...existingBooking, ...payload };
      res = updateBooking(savedBooking);
    } else {
      res = createBooking(payload);
      savedBooking = {
        ...payload,
        id: `bk-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
    }

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to save booking');
    } else {
      setConfirmedBooking(savedBooking);
      setShowSuccessStep(true);
    }
  };

  const generateOwnerAlertText = (b: Booking) => {
    const uName = units.find((u) => u.id === b.unitId)?.name || 'Unit';
    return formatOwnerBookingAlertMessage({
      template: settings.whatsappOwnerAlertTemplate,
      propertyName: settings.propertyName,
      guestName: b.guestName,
      guestPhone: b.guestPhone,
      unitName: uName,
      checkInDate: b.checkInDate,
      checkInTime: b.checkInTime,
      checkOutDate: b.checkOutDate,
      checkOutTime: b.checkOutTime,
      guestCount: b.guestCount,
      totalAmount: b.totalAmount,
      depositAmount: b.depositAmount,
      balanceAmount: b.balanceAmount,
      paymentStatus: b.paymentStatus,
      remark: b.remark,
    });
  };

  const handleCopyOwnerText = async () => {
    if (!confirmedBooking) return;
    const text = generateOwnerAlertText(confirmedBooking);
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopiedOwner(true);
      setTimeout(() => setCopiedOwner(false), 2500);
    }
  };

  const handleSendCustomerWhatsApp = () => {
    if (!confirmedBooking) return;
    const text = generateOwnerAlertText(confirmedBooking);
    openWhatsAppChat(confirmedBooking.guestPhone, text);
  };

  const handleSendOwnerWhatsApp = () => {
    if (!confirmedBooking) return;
    const text = generateOwnerAlertText(confirmedBooking);
    const ownerPhone = settings.propertyContact || '+60123456789';
    openWhatsAppChat(ownerPhone, text);
  };

  const handleSendGuestWhatsApp = () => {
    if (!confirmedBooking) return;
    const uName = units.find((u) => u.id === confirmedBooking.unitId)?.name || 'Unit';
    const text = formatGuestCheckInMessage({
      template: settings.whatsappGuestCheckInTemplate,
      propertyName: settings.propertyName,
      guestName: confirmedBooking.guestName,
      unitName: uName,
      checkInDate: confirmedBooking.checkInDate,
      checkInTime: confirmedBooking.checkInTime,
      checkOutDate: confirmedBooking.checkOutDate,
      checkOutTime: confirmedBooking.checkOutTime,
    });
    openWhatsAppChat(confirmedBooking.guestPhone, text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 my-8 transition-all">
        {showSuccessStep && confirmedBooking ? (
          /* SUCCESS CONFIRMATION & WHATSAPP ALERT STEP */
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Tempahan Disahkan!</h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Maklumat tempahan berjaya disimpan dalam sistem.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Booking Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-800">
              <div className="flex justify-between items-start border-b border-slate-200 pb-2">
                <div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Homestay</div>
                  <div className="font-black text-sm text-slate-900">{targetUnit?.name || 'Unit'}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Bayaran</div>
                  <span className="px-2 py-0.5 rounded font-extrabold text-[10px] bg-emerald-100 text-emerald-800">
                    {confirmedBooking.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-semibold block">Tetamu:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.guestName}</span> ({confirmedBooking.guestPhone})
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Bilangan Tetamu:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.guestCount} orang</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 font-semibold block">Check-in:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.checkInDate} ({confirmedBooking.checkInTime})</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Check-out:</span>
                  <span className="font-bold text-slate-900">{confirmedBooking.checkOutDate} ({confirmedBooking.checkOutTime})</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white p-2.5 rounded-lg border border-slate-200 font-semibold text-center">
                <div>
                  <span className="text-[10px] text-slate-500 block">Jumlah</span>
                  <span className="font-extrabold text-slate-900">RM {confirmedBooking.totalAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Deposit</span>
                  <span className="font-extrabold text-slate-900">RM {confirmedBooking.depositAmount}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Baki Due</span>
                  <span className="font-extrabold text-emerald-700">RM {confirmedBooking.balanceAmount}</span>
                </div>
              </div>

              {confirmedBooking.remark && (
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-amber-900 text-[11px] font-medium">
                  💬 <strong>Catatan:</strong> {confirmedBooking.remark}
                </div>
              )}
            </div>

            {/* Alert Owner Actions */}
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-emerald-600" /> Alert Owner &amp; Tetamu (WhatsApp)
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Hantar notifikasi pemilik</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Salin Teks Alert Owner */}
                <button
                  type="button"
                  onClick={handleCopyOwnerText}
                  className={`w-full py-2.5 px-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                    copiedOwner
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                  }`}
                >
                  {copiedOwner ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Berjaya Disalin! ✅</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-600" />
                      <span>Salin Alert Customer</span>
                    </>
                  )}
                </button>

                {/* Hantar WhatsApp ke Customer */}
                <button
                  type="button"
                  onClick={handleSendCustomerWhatsApp}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Whatsapp Customer</span>
                </button>
              </div>

              {/* Hantar WhatsApp Guest */}
              <button
                type="button"
                onClick={handleSendGuestWhatsApp}
                className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 mt-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-blue-600" />
                <span>Hantar WhatsApp Surat Check-In ke Guest</span>
              </button>
            </div>

            {/* Done Button */}
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Selesai &amp; Tutup
              </button>
            </div>
          </div>
        ) : (
          /* FORM STEP */
          <>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>{existingBooking ? 'Edit Booking' : 'Create New Reservation'}</span>
              </h2>
              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-100 border border-rose-300 text-rose-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Unit selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Target Homestay Unit</label>
                <select
                  required
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} - {u.description} (Max {u.capacity} guests)
                    </option>
                  ))}
                </select>
              </div>

              {/* Guest details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmad Razak"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guest Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +60123456789"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Guest Email Address */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Guest Email Address * <span className="text-slate-400 font-normal">(Diperlukan untuk carian/carian tempahan)</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ahmad@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                />
              </div>

              {/* Check In / Out Dates & Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-in Date &amp; Time</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      required
                      min={existingBooking ? undefined : new Date().toISOString().split('T')[0]}
                      value={checkInDate}
                      onChange={(e) => setCheckInDate(e.target.value)}
                      className="w-2/3 p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                    <input
                      type="time"
                      required
                      value={checkInTime}
                      onChange={(e) => setCheckInTime(e.target.value)}
                      className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Check-out Date &amp; Time</label>
                  <div className="flex gap-1">
                    <input
                      type="date"
                      required
                      min={checkInDate || new Date().toISOString().split('T')[0]}
                      value={checkOutDate}
                      onChange={(e) => setCheckOutDate(e.target.value)}
                      className="w-2/3 p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                    <input
                      type="time"
                      required
                      value={checkOutTime}
                      onChange={(e) => setCheckOutTime(e.target.value)}
                      className="w-1/3 p-2 bg-slate-50 border border-slate-200 rounded-xl text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Guest Count & Statuses */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Booking Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as BookingStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  >
                    <option value="PAID">Paid</option>
                    <option value="DEPOSIT_PAID">Deposit Paid</option>
                    <option value="UNPAID">Unpaid</option>
                    <option value="REFUNDED">Refunded</option>
                  </select>
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Total (RM)</label>
                  <input
                    type="number"
                    min={0}
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Deposit (RM)</label>
                  <input
                    type="number"
                    min={0}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full p-2 bg-white border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Balance Due (RM)</label>
                  <input
                    type="number"
                    disabled
                    value={balanceAmount}
                    className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Booking Remark */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Booking Remark / Special Request (Directly visible on Calendar)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Family + baby cot, Late arrival 8pm, Extra mattress"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="w-full p-2.5 bg-amber-50 border border-amber-200 rounded-xl font-medium text-amber-900"
                />
              </div>

              <div className="flex gap-2 mt-2">
                {existingBooking && isAdminUnlocked && (
                  <button
                    type="button"
                    onClick={handleDeleteBooking}
                    className="px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    title="Padam Tempahan secara kekal dari pangkalan data"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Padam Tempahan</span>
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {existingBooking ? 'Save Changes' : 'Confirm & Create Booking'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
