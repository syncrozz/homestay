import { Booking, Unit, CleaningTask, TaskChecklistItem } from '../types';

/**
 * Checks whether two date ranges overlap.
 * Range A: [startA, endA)
 * Range B: [startB, endB)
 * Overlap occurs if startA < endB && endA > startB
 */
export function doDateRangesOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const sA = new Date(startA).getTime();
  const eA = new Date(endA).getTime();
  const sB = new Date(startB).getTime();
  const eB = new Date(endB).getTime();

  return sA < eB && eA > sB;
}

/**
 * Checks if a proposed booking conflicts with existing active bookings for a unit.
 */
export function checkBookingConflict(params: {
  unitId: string;
  checkInDate: string;
  checkOutDate: string;
  existingBookings: Booking[];
  excludeBookingId?: string;
}): { hasConflict: boolean; conflictingBooking?: Booking } {
  const { unitId, checkInDate, checkOutDate, existingBookings, excludeBookingId } = params;

  // Filter bookings for the same unit that are confirmed or pending
  const relevantBookings = existingBookings.filter((b) => {
    if (b.unitId !== unitId) return false;
    if (b.status === 'CANCELLED') return false;
    if (excludeBookingId && b.id === excludeBookingId) return false;
    return true;
  });

  for (const booking of relevantBookings) {
    if (doDateRangesOverlap(checkInDate, checkOutDate, booking.checkInDate, booking.checkOutDate)) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
      };
    }
  }

  return { hasConflict: false };
}

/**
 * Early Check-In Logic Evaluator
 * Checks whether early check-in can be offered for a booking.
 */
export interface EarlyCheckInStatus {
  canBeApproved: boolean;
  reason: string;
  previousBooking?: Booking;
  unitCurrentStatus: Unit['status'];
}

export function evaluateEarlyCheckInPossibility(
  booking: Booking,
  unit: Unit,
  allBookings: Booking[],
  cleaningTasks: CleaningTask[]
): EarlyCheckInStatus {
  // If unit is currently READY, early check-in is immediately possible
  if (unit.status === 'READY') {
    return {
      canBeApproved: true,
      reason: 'Unit is currently READY and cleaned. Early check-in can be granted by the owner.',
      unitCurrentStatus: unit.status,
    };
  }

  // Find if there is a booking checking out on the same day as this booking's check-in date
  const previousSameDayBooking = allBookings.find(
    (b) =>
      b.unitId === booking.unitId &&
      b.id !== booking.id &&
      b.checkOutDate === booking.checkInDate &&
      b.status !== 'CANCELLED'
  );

  if (!previousSameDayBooking) {
    // No previous guest on check-in day!
    const s = unit.status as string;
    if (s === 'AVAILABLE' || s === 'BOOKED' || s === 'READY') {
      return {
        canBeApproved: true,
        reason: 'No previous guest on check-in day. Unit is prepared or available early.',
        unitCurrentStatus: unit.status,
      };
    } else if (s === 'CLEANING' || s === 'AWAITING_CLEANING') {
      return {
        canBeApproved: false,
        reason: 'Cleaning is currently in progress. Early check-in will be available once cleaner finishes.',
        unitCurrentStatus: unit.status,
      };
    }
  }

  // If previous guest exists
  if (previousSameDayBooking) {
    const activeTask = cleaningTasks.find(
      (t) => t.unitId === booking.unitId && t.status !== 'COMPLETED'
    );

    if (activeTask && (activeTask.status === 'PENDING' || activeTask.status === 'IN_PROGRESS')) {
      return {
        canBeApproved: false,
        reason: `Previous guest (${previousSameDayBooking.guestName}) checked out. Cleaning is currently in progress.`,
        previousBooking: previousSameDayBooking,
        unitCurrentStatus: unit.status,
      };
    }
  }

  if (unit.status === 'MAINTENANCE') {
    return {
      canBeApproved: false,
      reason: 'Unit is currently under MAINTENANCE for reported issue.',
      unitCurrentStatus: unit.status,
    };
  }

  return {
    canBeApproved: (unit.status as string) === 'READY',
    reason: `Unit status is ${unit.status}.`,
    unitCurrentStatus: unit.status,
  };
}

/**
 * Validates cleaning task completion rule.
 * The cleaner MUST NOT be able to mark UNIT READY if any REQUIRED checklist item remains incomplete.
 */
export function validateChecklistCompletion(checklist: TaskChecklistItem[]): {
  isReadyAllowed: boolean;
  totalRequired: number;
  completedRequired: number;
  totalOptional: number;
  completedOptional: number;
  missingRequiredItems: TaskChecklistItem[];
} {
  const requiredItems = checklist.filter((item) => item.isRequired);
  const optionalItems = checklist.filter((item) => !item.isRequired);

  const completedRequired = requiredItems.filter((item) => item.isCompleted);
  const completedOptional = optionalItems.filter((item) => item.isCompleted);

  const missingRequiredItems = requiredItems.filter((item) => !item.isCompleted);
  const isReadyAllowed = missingRequiredItems.length === 0;

  return {
    isReadyAllowed,
    totalRequired: requiredItems.length,
    completedRequired: completedRequired.length,
    totalOptional: optionalItems.length,
    completedOptional: completedOptional.length,
    missingRequiredItems,
  };
}
