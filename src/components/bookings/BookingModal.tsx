import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import { AlertTriangle, Calendar, Clock, DollarSign, User, MessageSquare, X } from 'lucide-react';

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
  const { units, settings, createBooking, updateBooking } = useApp();

  const [unitId, setUnitId] = useState<string>(initialUnitId || units[0]?.id || '');
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
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

  useEffect(() => {
    if (existingBooking) {
      setUnitId(existingBooking.unitId);
      setGuestName(existingBooking.guestName);
      setGuestPhone(existingBooking.guestPhone);
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
  }, [existingBooking, initialUnitId, initialDateStr]);

  useEffect(() => {
    setBalanceAmount(Math.max(0, totalAmount - depositAmount));
  }, [totalAmount, depositAmount]);

  if (!isOpen) return null;

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
    if (existingBooking) {
      res = updateBooking({ ...existingBooking, ...payload });
    } else {
      res = createBooking(payload);
    }

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to save booking');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-xl space-y-4 my-8">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Guest Full Name</label>
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
              <label className="block font-bold text-slate-700 mb-1">Guest Phone Number</label>
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

          {/* Check In / Out Dates & Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Check-in Date & Time</label>
              <div className="flex gap-1">
                <input
                  type="date"
                  required
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="w-2/3 p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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
              <label className="block font-bold text-slate-700 mb-1">Check-out Date & Time</label>
              <div className="flex gap-1">
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="w-2/3 p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
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

          {/* Booking Remark (Visible directly on Calendar) */}
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

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all mt-2"
          >
            {existingBooking ? 'Save Changes' : 'Confirm & Create Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};
