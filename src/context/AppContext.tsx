import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserRole,
  Property,
  Unit,
  Booking,
  Guest,
  Cleaner,
  ChecklistItemTemplate,
  CleaningTask,
  MaintenanceIssue,
  InventoryItem,
  SystemSettings,
  AuditLog,
  UnitStatus,
  BookingStatus,
  PaymentStatus,
  IssuePriority,
  IssueCategory
} from '../types';
import {
  initialProperty,
  initialSettings,
  initialUnits,
  initialCleaners,
  initialChecklistTemplates,
  initialBookings,
  initialGuests,
  initialCleaningTasks,
  initialMaintenanceIssues,
  initialInventory,
  initialAuditLogs
} from '../data/initialData';
import { checkBookingConflict, validateChecklistCompletion } from '../services/validationService';
import { formatCleanerTaskMessage, openWhatsAppChat } from '../services/whatsappService';

const STORAGE_KEY = 'homestay_ops_data_v1';

interface AppState {
  currentRole: UserRole;
  currentCleanerId?: string; // If in Cleaner mode, which cleaner is logged in
  property: Property;
  settings: SystemSettings;
  units: Unit[];
  cleaners: Cleaner[];
  checklistTemplates: ChecklistItemTemplate[];
  bookings: Booking[];
  guests: Guest[];
  cleaningTasks: CleaningTask[];
  maintenanceIssues: MaintenanceIssue[];
  inventory: InventoryItem[];
  auditLogs: AuditLog[];
}

interface AppContextType extends AppState {
  // Admin Mode state
  isAdminUnlocked: boolean;
  unlockAdminMode: (pin: string) => { success: boolean; error?: string };
  lockAdminMode: () => void;

  // Role & Mode switching
  setCurrentRole: (role: UserRole) => void;
  setCurrentCleanerId: (cleanerId: string) => void;
  resetDemoData: () => void;

  // Unit Operations
  updateUnitStatus: (unitId: string, status: UnitStatus, notes?: string) => void;
  addUnit: (unit: Omit<Unit, 'id'>) => void;
  updateUnit: (unit: Unit) => void;

  // Booking Operations
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => { success: boolean; error?: string };
  updateBooking: (booking: Booking) => { success: boolean; error?: string };
  cancelBooking: (bookingId: string) => void;
  deleteBookingPermanently: (bookingId: string) => void;
  markGuestCheckedOut: (bookingId: string) => void;
  approveEarlyCheckIn: (bookingId: string, allowedTime: string) => void;

  // Cleaning Workflow Operations
  assignCleaningTask: (unitId: string, cleanerId?: string, bookingId?: string) => void;
  startCleaningTask: (taskId: string) => void;
  toggleChecklistItem: (taskId: string, itemId: string) => void;
  saveCleaningNotes: (taskId: string, notes: string) => void;
  completeCleaningTask: (taskId: string) => { success: boolean; error?: string };

  // Maintenance & Issues
  reportMaintenanceIssue: (issue: {
    unitId: string;
    category: IssueCategory;
    description: string;
    priority: IssuePriority;
    photoUrl?: string;
    taskId?: string;
  }) => void;
  resolveMaintenanceIssue: (issueId: string, resolutionNotes: string, targetUnitStatus?: UnitStatus) => void;

  // Cleaner Management
  addCleaner: (cleaner: Omit<Cleaner, 'id'>) => void;
  updateCleaner: (cleaner: Cleaner) => void;
  setDefaultCleaner: (cleanerId: string) => void;

  // Checklist Management
  addChecklistTemplate: (template: Omit<ChecklistItemTemplate, 'id'>) => void;
  updateChecklistTemplate: (template: ChecklistItemTemplate) => void;
  deleteChecklistTemplate: (templateId: string) => void;

  // Inventory Management
  updateInventoryStock: (itemId: string, newStock: number) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;

  // System Settings
  updateSystemSettings: (newSettings: SystemSettings) => void;

  // Dispatch Cleaner via WhatsApp
  dispatchCleanerWhatsApp: (taskId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.settings) {
          if (
            !parsed.settings.whatsappOwnerAlertTemplate ||
            parsed.settings.whatsappOwnerAlertTemplate.includes('Mohon pemilik / pengurus mengambil maklum')
          ) {
            parsed.settings.whatsappOwnerAlertTemplate = initialSettings.whatsappOwnerAlertTemplate;
          }
          if (!parsed.settings.propertyName || parsed.settings.propertyName.toLowerCase().includes('your')) {
            parsed.settings.propertyName = (parsed.settings.propertyName || '').replace(/your\s*/gi, '').trim() || 'Homestay';
          }
        }
        if (parsed.property) {
          if (!parsed.property.name || parsed.property.name.toLowerCase().includes('your')) {
            parsed.property.name = (parsed.property.name || '').replace(/your\s*/gi, '').trim() || 'Homestay';
          }
        }
        return parsed;
      } catch (e) {
        console.error('Failed to parse saved state, resetting to initial data', e);
      }
    }
    return {
      currentRole: 'OWNER',
      currentCleanerId: 'cleaner-1',
      property: initialProperty,
      settings: initialSettings,
      units: initialUnits,
      cleaners: initialCleaners,
      checklistTemplates: initialChecklistTemplates,
      bookings: initialBookings,
      guests: initialGuests,
      cleaningTasks: initialCleaningTasks,
      maintenanceIssues: initialMaintenanceIssues,
      inventory: initialInventory,
      auditLogs: initialAuditLogs,
    };
  });

  // Admin Mode state (PIN 5313)
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('homs_passcode_unlocked') === 'true';
  });

  const unlockAdminMode = (pin: string) => {
    if (pin.trim() === '5313') {
      setIsAdminUnlocked(true);
      sessionStorage.setItem('homs_passcode_unlocked', 'true');
      return { success: true };
    } else {
      return { success: false, error: 'PIN Code keselamatan tidak sah.' };
    }
  };

  const lockAdminMode = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem('homs_passcode_unlocked');
  };

  // Save state on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: state.currentRole === 'OWNER' ? 'usr-owner' : state.currentCleanerId || 'usr-cleaner',
      userName: state.currentRole === 'OWNER' ? 'Homestay Owner' : (state.cleaners.find(c => c.id === state.currentCleanerId)?.name || 'Cleaner'),
      userRole: state.currentRole,
      action,
      details,
    };
    setState(prev => ({ ...prev, auditLogs: [newLog, ...prev.auditLogs] }));
  };

  const resetDemoData = () => {
    const freshState: AppState = {
      currentRole: 'OWNER',
      currentCleanerId: 'cleaner-1',
      property: initialProperty,
      settings: initialSettings,
      units: initialUnits,
      cleaners: initialCleaners,
      checklistTemplates: initialChecklistTemplates,
      bookings: initialBookings,
      guests: initialGuests,
      cleaningTasks: initialCleaningTasks,
      maintenanceIssues: initialMaintenanceIssues,
      inventory: initialInventory,
      auditLogs: initialAuditLogs,
    };
    setState(freshState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(freshState));
  };

  const setCurrentRole = (role: UserRole) => {
    setState(prev => ({ ...prev, currentRole: role }));
  };

  const setCurrentCleanerId = (cleanerId: string) => {
    setState(prev => ({ ...prev, currentCleanerId: cleanerId }));
  };

  const updateUnitStatus = (unitId: string, status: UnitStatus, notes?: string) => {
    setState(prev => {
      const updatedUnits = prev.units.map(u => u.id === unitId ? { ...u, status, notes: notes !== undefined ? notes : u.notes } : u);
      return { ...prev, units: updatedUnits };
    });
    addAuditLog('UPDATE_UNIT_STATUS', `Updated unit ${unitId} status to ${status}.`);
  };

  const addUnit = (unitData: Omit<Unit, 'id'>) => {
    const newUnit: Unit = { ...unitData, id: `unit-${Date.now()}` };
    setState(prev => ({ ...prev, units: [...prev.units, newUnit] }));
    addAuditLog('ADD_UNIT', `Added new unit ${newUnit.name} (${newUnit.code}).`);
  };

  const updateUnit = (unit: Unit) => {
    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === unit.id ? unit : u),
    }));
    addAuditLog('UPDATE_UNIT', `Updated configuration for unit ${unit.name}.`);
  };

  const createBooking = (bookingData: Omit<Booking, 'id' | 'createdAt'>) => {
    // Validate double booking conflict
    const conflictCheck = checkBookingConflict({
      unitId: bookingData.unitId,
      checkInDate: bookingData.checkInDate,
      checkOutDate: bookingData.checkOutDate,
      existingBookings: state.bookings,
    });

    if (conflictCheck.hasConflict) {
      return {
        success: false,
        error: `Booking Conflict! Unit is already reserved by ${conflictCheck.conflictingBooking?.guestName} from ${conflictCheck.conflictingBooking?.checkInDate} to ${conflictCheck.conflictingBooking?.checkOutDate}.`,
      };
    }

    const newBooking: Booking = {
      ...bookingData,
      id: `bk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    // Auto update or register guest profile
    let updatedGuests = [...state.guests];
    const existingGuest = updatedGuests.find(g => g.phone === bookingData.guestPhone);
    if (existingGuest) {
      existingGuest.totalBookings += 1;
      existingGuest.lastStayDate = bookingData.checkInDate;
    } else {
      updatedGuests.push({
        id: `gst-${Date.now()}`,
        name: bookingData.guestName,
        phone: bookingData.guestPhone,
        totalBookings: 1,
        lastStayDate: bookingData.checkInDate,
        remarks: bookingData.remark,
      });
    }

    setState(prev => ({
      ...prev,
      bookings: [newBooking, ...prev.bookings],
      guests: updatedGuests,
    }));

    addAuditLog('CREATE_BOOKING', `Created booking for ${newBooking.guestName} (${newBooking.checkInDate} -> ${newBooking.checkOutDate}).`);
    return { success: true };
  };

  const updateBooking = (booking: Booking) => {
    const conflictCheck = checkBookingConflict({
      unitId: booking.unitId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      existingBookings: state.bookings,
      excludeBookingId: booking.id,
    });

    if (conflictCheck.hasConflict) {
      return {
        success: false,
        error: `Date overlap detected! Unit is already reserved by ${conflictCheck.conflictingBooking?.guestName}.`,
      };
    }

    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === booking.id ? booking : b),
    }));

    addAuditLog('UPDATE_BOOKING', `Updated booking for ${booking.guestName}.`);
    return { success: true };
  };

  const cancelBooking = (bookingId: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === bookingId ? { ...b, status: 'CANCELLED' } : b),
    }));
    addAuditLog('CANCEL_BOOKING', `Cancelled booking ID ${bookingId}.`);
  };

  const deleteBookingPermanently = (bookingId: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.filter(b => b.id !== bookingId),
    }));
    addAuditLog('DELETE_BOOKING_PERMANENT', `Permanently deleted booking ID ${bookingId}.`);
  };

  const markGuestCheckedOut = (bookingId: string) => {
    const booking = state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updatedBooking: Booking = {
      ...booking,
      status: 'COMPLETED',
      guestCheckedOutAt: new Date().toISOString(),
    };

    // Transition physical Unit status from OCCUPIED -> AWAITING_CLEANING
    const updatedUnits = state.units.map(u =>
      u.id === booking.unitId ? { ...u, status: 'AWAITING_CLEANING' as UnitStatus } : u
    );

    // Auto assign or generate pending cleaning task
    const defaultCleaner = state.cleaners.find(c => c.isDefault && c.isActive) || state.cleaners[0];
    const unit = state.units.find(u => u.id === booking.unitId);

    const newCleaningTask: CleaningTask = {
      id: `task-${Date.now()}`,
      unitId: booking.unitId,
      unitName: unit?.name || 'Unit',
      bookingId: booking.id,
      guestName: booking.guestName,
      guestCheckoutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cleanerId: defaultCleaner?.id || 'cleaner-1',
      cleanerName: defaultCleaner?.name || 'Assigned Cleaner',
      cleanerPhone: defaultCleaner?.phone || '',
      status: 'PENDING',
      checklist: state.checklistTemplates.filter(t => t.isActive).map(t => ({
        id: `task-ck-${Date.now()}-${t.id}`,
        templateId: t.id,
        category: t.category,
        title: t.title,
        isRequired: t.isRequired,
        isCompleted: false,
      })),
      createdAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === bookingId ? updatedBooking : b),
      units: updatedUnits,
      cleaningTasks: [newCleaningTask, ...prev.cleaningTasks],
    }));

    addAuditLog('GUEST_CHECKOUT', `Guest ${booking.guestName} checked out from ${unit?.name}. Unit is now AWAITING CLEANING.`);
  };

  const approveEarlyCheckIn = (bookingId: string, allowedTime: string) => {
    setState(prev => ({
      ...prev,
      bookings: prev.bookings.map(b => b.id === bookingId ? {
        ...b,
        earlyCheckInApproved: true,
        approvedEarlyCheckInTime: allowedTime
      } : b)
    }));
    addAuditLog('EARLY_CHECKIN_APPROVED', `Approved early check-in at ${allowedTime} for booking ${bookingId}.`);
  };

  const assignCleaningTask = (unitId: string, cleanerId?: string, bookingId?: string) => {
    const targetCleaner = state.cleaners.find(c => c.id === (cleanerId || state.cleaners.find(cl => cl.isDefault)?.id || state.cleaners[0]?.id));
    const unit = state.units.find(u => u.id === unitId);
    const relatedBooking = bookingId ? state.bookings.find(b => b.id === bookingId) : undefined;

    // Change unit status to CLEANING
    const updatedUnits = state.units.map(u => u.id === unitId ? { ...u, status: 'CLEANING' as UnitStatus } : u);

    // Create or update active task
    const newTask: CleaningTask = {
      id: `task-${Date.now()}`,
      unitId,
      unitName: unit?.name || 'Unit',
      bookingId,
      guestName: relatedBooking?.guestName || 'Upcoming Guest',
      guestCheckoutTime: '12:00 PM',
      cleanerId: targetCleaner?.id || 'cleaner-1',
      cleanerName: targetCleaner?.name || 'Cleaner',
      cleanerPhone: targetCleaner?.phone || '',
      status: 'PENDING',
      checklist: state.checklistTemplates.filter(t => t.isActive).map(t => ({
        id: `task-ck-${Date.now()}-${t.id}`,
        templateId: t.id,
        category: t.category,
        title: t.title,
        isRequired: t.isRequired,
        isCompleted: false,
      })),
      createdAt: new Date().toISOString(),
      assignedAt: new Date().toISOString(),
    };

    setState(prev => ({
      ...prev,
      units: updatedUnits,
      cleaningTasks: [newTask, ...prev.cleaningTasks.filter(t => !(t.unitId === unitId && t.status !== 'COMPLETED'))],
    }));

    addAuditLog('ASSIGN_CLEANING_TASK', `Assigned cleaning task for ${unit?.name} to cleaner ${targetCleaner?.name}.`);
  };

  const dispatchCleanerWhatsApp = (taskId: string) => {
    const task = state.cleaningTasks.find(t => t.id === taskId);
    if (!task) return;

    const message = formatCleanerTaskMessage({
      template: state.settings.whatsappCleanerTemplate,
      propertyName: state.settings.propertyName,
      unitName: task.unitName,
      guestName: task.guestName || 'Guest',
      checkoutTime: task.guestCheckoutTime || '12:00 PM',
    });

    openWhatsAppChat(task.cleanerPhone, message);
    addAuditLog('WHATSAPP_DISPATCH', `Dispatched WhatsApp task notification to ${task.cleanerName} (${task.cleanerPhone}).`);
  };

  const startCleaningTask = (taskId: string) => {
    const task = state.cleaningTasks.find(t => t.id === taskId);
    if (!task) return;

    setState(prev => ({
      ...prev,
      units: prev.units.map(u => u.id === task.unitId ? { ...u, status: 'CLEANING' as UnitStatus } : u),
      cleaningTasks: prev.cleaningTasks.map(t => t.id === taskId ? {
        ...t,
        status: 'IN_PROGRESS',
        startedAt: new Date().toISOString(),
      } : t),
    }));

    addAuditLog('START_CLEANING', `Cleaner ${task.cleanerName} started cleaning ${task.unitName}.`);
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setState(prev => ({
      ...prev,
      cleaningTasks: prev.cleaningTasks.map(t => {
        if (t.id !== taskId) return t;
        const updatedChecklist = t.checklist.map(item =>
          item.id === itemId ? { ...item, isCompleted: !item.isCompleted } : item
        );
        return { ...t, checklist: updatedChecklist };
      }),
    }));
  };

  const saveCleaningNotes = (taskId: string, notes: string) => {
    setState(prev => ({
      ...prev,
      cleaningTasks: prev.cleaningTasks.map(t => t.id === taskId ? { ...t, notes } : t),
    }));
  };

  const completeCleaningTask = (taskId: string) => {
    const task = state.cleaningTasks.find(t => t.id === taskId);
    if (!task) return { success: false, error: 'Task not found' };

    // MANDATORY COMPLETION RULE: Check required items
    const validation = validateChecklistCompletion(task.checklist);
    if (!validation.isReadyAllowed) {
      return {
        success: false,
        error: `Cannot mark Unit Ready! ${validation.missingRequiredItems.length} required checklist item(s) are still incomplete.`,
      };
    }

    const completedAt = new Date().toISOString();
    const startTime = task.startedAt ? new Date(task.startedAt).getTime() : new Date().getTime();
    const durationMinutes = Math.max(1, Math.round((new Date().getTime() - startTime) / 60000));

    // Transition Unit status to READY!
    const updatedUnits = state.units.map(u => u.id === task.unitId ? { ...u, status: 'READY' as UnitStatus } : u);

    const updatedTask: CleaningTask = {
      ...task,
      status: 'COMPLETED',
      completedAt,
      durationMinutes,
    };

    setState(prev => ({
      ...prev,
      units: updatedUnits,
      cleaningTasks: prev.cleaningTasks.map(t => t.id === taskId ? updatedTask : t),
    }));

    addAuditLog('COMPLETE_CLEANING', `Cleaning completed for ${task.unitName} by ${task.cleanerName}. Unit is now READY.`);
    return { success: true };
  };

  const reportMaintenanceIssue = (issueData: {
    unitId: string;
    category: IssueCategory;
    description: string;
    priority: IssuePriority;
    photoUrl?: string;
    taskId?: string;
  }) => {
    const unit = state.units.find(u => u.id === issueData.unitId);
    const newIssue: MaintenanceIssue = {
      id: `maint-${Date.now()}`,
      unitId: issueData.unitId,
      unitName: unit?.name || 'Unit',
      taskId: issueData.taskId,
      reporterName: state.currentRole === 'OWNER' ? 'Owner' : (state.cleaners.find(c => c.id === state.currentCleanerId)?.name || 'Cleaner'),
      reporterRole: state.currentRole,
      category: issueData.category,
      description: issueData.description,
      priority: issueData.priority,
      photoUrl: issueData.photoUrl,
      status: 'OPEN',
      reportedAt: new Date().toISOString(),
    };

    // If High or Urgent issue, set unit to MAINTENANCE status
    let updatedUnits = state.units;
    if (issueData.priority === 'HIGH' || issueData.priority === 'URGENT') {
      updatedUnits = state.units.map(u => u.id === issueData.unitId ? { ...u, status: 'MAINTENANCE' as UnitStatus } : u);
    }

    setState(prev => ({
      ...prev,
      units: updatedUnits,
      maintenanceIssues: [newIssue, ...prev.maintenanceIssues],
    }));

    addAuditLog('REPORT_MAINTENANCE_ISSUE', `Reported ${issueData.priority} maintenance issue for ${unit?.name}: ${issueData.category}.`);
  };

  const resolveMaintenanceIssue = (issueId: string, resolutionNotes: string, targetUnitStatus: UnitStatus = 'READY') => {
    const issue = state.maintenanceIssues.find(m => m.id === issueId);
    if (!issue) return;

    const updatedIssues = state.maintenanceIssues.map(m => m.id === issueId ? {
      ...m,
      status: 'RESOLVED' as const,
      resolvedAt: new Date().toISOString(),
      resolutionNotes,
    } : m);

    // If unit was in MAINTENANCE status, restore it to targetUnitStatus
    const updatedUnits = state.units.map(u => u.id === issue.unitId && u.status === 'MAINTENANCE' ? { ...u, status: targetUnitStatus } : u);

    setState(prev => ({
      ...prev,
      maintenanceIssues: updatedIssues,
      units: updatedUnits,
    }));

    addAuditLog('RESOLVE_MAINTENANCE_ISSUE', `Resolved maintenance issue on ${issue.unitName}. Unit status set to ${targetUnitStatus}.`);
  };

  const addCleaner = (cleanerData: Omit<Cleaner, 'id'>) => {
    const newCleaner: Cleaner = { ...cleanerData, id: `cleaner-${Date.now()}` };
    setState(prev => ({ ...prev, cleaners: [...prev.cleaners, newCleaner] }));
    addAuditLog('ADD_CLEANER', `Added new cleaner ${newCleaner.name}.`);
  };

  const updateCleaner = (cleaner: Cleaner) => {
    setState(prev => ({
      ...prev,
      cleaners: prev.cleaners.map(c => c.id === cleaner.id ? cleaner : c),
    }));
    addAuditLog('UPDATE_CLEANER', `Updated cleaner profile for ${cleaner.name}.`);
  };

  const setDefaultCleaner = (cleanerId: string) => {
    setState(prev => ({
      ...prev,
      cleaners: prev.cleaners.map(c => ({
        ...c,
        isDefault: c.id === cleanerId,
      })),
    }));
    addAuditLog('SET_DEFAULT_CLEANER', `Set cleaner ID ${cleanerId} as default cleaner.`);
  };

  const addChecklistTemplate = (templateData: Omit<ChecklistItemTemplate, 'id'>) => {
    const newTemplate: ChecklistItemTemplate = { ...templateData, id: `ck-${Date.now()}` };
    setState(prev => ({ ...prev, checklistTemplates: [...prev.checklistTemplates, newTemplate] }));
    addAuditLog('ADD_CHECKLIST_TEMPLATE', `Added checklist item "${newTemplate.title}".`);
  };

  const updateChecklistTemplate = (template: ChecklistItemTemplate) => {
    setState(prev => ({
      ...prev,
      checklistTemplates: prev.checklistTemplates.map(t => t.id === template.id ? template : t),
    }));
  };

  const deleteChecklistTemplate = (templateId: string) => {
    setState(prev => ({
      ...prev,
      checklistTemplates: prev.checklistTemplates.filter(t => t.id !== templateId),
    }));
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    setState(prev => ({
      ...prev,
      inventory: prev.inventory.map(inv => inv.id === itemId ? { ...inv, currentStock: Math.max(0, newStock) } : inv),
    }));
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...itemData, id: `inv-${Date.now()}` };
    setState(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
  };

  const updateSystemSettings = (newSettings: SystemSettings) => {
    setState(prev => ({ ...prev, settings: newSettings }));
    addAuditLog('UPDATE_SETTINGS', 'Updated system settings & templates.');
  };

  return (
    <AppContext.Provider
      value={{
        ...state,
        isAdminUnlocked,
        unlockAdminMode,
        lockAdminMode,
        setCurrentRole,
        setCurrentCleanerId,
        resetDemoData,
        updateUnitStatus,
        addUnit,
        updateUnit,
        createBooking,
        updateBooking,
        cancelBooking,
        deleteBookingPermanently,
        markGuestCheckedOut,
        approveEarlyCheckIn,
        assignCleaningTask,
        startCleaningTask,
        toggleChecklistItem,
        saveCleaningNotes,
        completeCleaningTask,
        reportMaintenanceIssue,
        resolveMaintenanceIssue,
        addCleaner,
        updateCleaner,
        setDefaultCleaner,
        addChecklistTemplate,
        updateChecklistTemplate,
        deleteChecklistTemplate,
        updateInventoryStock,
        addInventoryItem,
        updateSystemSettings,
        dispatchCleanerWhatsApp,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
