import React from 'react';
import { UnitStatus, BookingStatus, PaymentStatus } from '../../types';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Wrench,
  Ban,
  Home,
  UserCheck,
  XCircle,
  AlertCircle,
  CreditCard
} from 'lucide-react';

interface UnitStatusBadgeProps {
  status: UnitStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const UnitStatusBadge: React.FC<UnitStatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1 font-bold',
    md: 'px-2.5 py-1 text-xs font-bold gap-1.5',
    lg: 'px-3 py-1.5 text-xs font-bold gap-2',
  }[size];

  switch (status) {
    case 'AVAILABLE':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>AVAILABLE</span>
        </span>
      );
    case 'BOOKED':
      return (
        <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>BOOKED</span>
        </span>
      );
    case 'OCCUPIED':
      return (
        <span className={`inline-flex items-center rounded-md bg-blue-100 text-blue-800 border border-blue-300 ${sizeClasses}`}>
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>OCCUPIED</span>
        </span>
      );
    case 'AWAITING_CLEANING':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>AWAITING CLEANING</span>
        </span>
      );
    case 'CLEANING':
      return (
        <span className={`inline-flex items-center rounded-md bg-orange-50 text-orange-800 border border-orange-200 animate-pulse ${sizeClasses}`}>
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>CLEANING</span>
        </span>
      );
    case 'READY':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 ${sizeClasses}`}>
          <Home className="w-3.5 h-3.5 text-emerald-600" />
          <span>READY</span>
        </span>
      );
    case 'MAINTENANCE':
      return (
        <span className={`inline-flex items-center rounded-md bg-red-50 text-red-800 border border-red-200 ${sizeClasses}`}>
          <Wrench className="w-3.5 h-3.5 text-red-600" />
          <span>MAINTENANCE</span>
        </span>
      );
    case 'BLOCKED':
      return (
        <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <Ban className="w-3.5 h-3.5 text-slate-500" />
          <span>BLOCKED</span>
        </span>
      );
    default:
      return <span className={`inline-flex items-center rounded-md bg-slate-100 text-slate-700 ${sizeClasses}`}>{status}</span>;
  }
};

export const BookingStatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  switch (status) {
    case 'CONFIRMED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 uppercase">
          <CheckCircle2 className="w-3 h-3 text-blue-600" />
          <span>Confirmed</span>
        </span>
      );
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
          <Clock className="w-3 h-3 text-amber-600" />
          <span>Pending</span>
        </span>
      );
    case 'COMPLETED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
          <CheckCircle2 className="w-3 h-3 text-slate-500" />
          <span>Completed</span>
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
          <XCircle className="w-3 h-3 text-red-600" />
          <span>Cancelled</span>
        </span>
      );
  }
};

export const PaymentStatusBadge: React.FC<{ status: PaymentStatus }> = ({ status }) => {
  switch (status) {
    case 'PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase">
          <CreditCard className="w-3 h-3 text-emerald-600" />
          <span>Paid</span>
        </span>
      );
    case 'DEPOSIT_PAID':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase">
          <CreditCard className="w-3 h-3 text-amber-600" />
          <span>Deposit Paid</span>
        </span>
      );
    case 'UNPAID':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-200 uppercase">
          <AlertCircle className="w-3 h-3 text-red-600" />
          <span>Unpaid</span>
        </span>
      );
    case 'REFUNDED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
          <CreditCard className="w-3 h-3 text-slate-500" />
          <span>Refunded</span>
        </span>
      );
  }
};
