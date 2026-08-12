import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Sparkles,
  Home,
  Users,
  BookOpen,
  Wrench,
  Package,
  LayoutDashboard,
  Settings,
  Bell,
  RefreshCw,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

export type ActiveTab =
  | 'calendar'
  | 'today'
  | 'cleaning'
  | 'units'
  | 'guests'
  | 'bookings'
  | 'maintenance'
  | 'inventory'
  | 'dashboard'
  | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const {
    currentRole,
    setCurrentRole,
    settings,
    inventory,
    cleaningTasks,
    maintenanceIssues,
    units,
    bookings,
    resetDemoData
  } = useApp();

  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  // Compute operational alerts
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minimumStock).length;
  const pendingCleaningCount = cleaningTasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const openMaintenanceCount = maintenanceIssues.filter(m => m.status === 'OPEN').length;
  const awaitingCleaningCount = units.filter(u => u.status === 'AWAITING_CLEANING').length;
  const totalAlerts = lowStockCount + pendingCleaningCount + openMaintenanceCount + awaitingCleaningCount;

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const navItems: NavItem[] = [
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
    { id: 'today', label: 'Today', icon: Clock },
    { id: 'cleaning', label: 'Cleaning', icon: Sparkles, badge: pendingCleaningCount },
    { id: 'units', label: 'Units', icon: Home },
    { id: 'guests', label: 'Guests', icon: Users },
    { id: 'bookings', label: 'Bookings', icon: BookOpen },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, badge: openMaintenanceCount },
    { id: 'inventory', label: 'Inventory', icon: Package, badge: lowStockCount },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'admin', label: 'Admin', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner: Role Switcher & Property Identity */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between text-xs sm:text-sm">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-base italic shadow-xs shrink-0">
            H
          </div>
          <div className="flex items-center gap-2 font-bold text-slate-100 tracking-tight">
            <span>{settings.propertyName || 'HOMS'}</span>
            <span className="font-normal text-slate-400">| Operations</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setCurrentRole('OWNER')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'OWNER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Owner</span>
            </button>
            <button
              onClick={() => setCurrentRole('CLEANER')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                currentRole === 'CLEANER'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Cleaner</span>
            </button>
          </div>

          {/* Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors relative"
              title="Operational Alerts"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Alerts Drawer Modal */}
            {showAlertsDrawer && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-900 rounded-xl shadow-xl border border-slate-200 z-50 p-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-500" /> Operational Alerts
                  </h3>
                  <button
                    onClick={() => setShowAlertsDrawer(false)}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto text-xs">
                  {totalAlerts === 0 ? (
                    <p className="text-slate-500 py-2 text-center">All operational checks look clear! 🟢</p>
                  ) : (
                    <>
                      {awaitingCleaningCount > 0 && (
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 flex justify-between items-center">
                          <span>🚪 {awaitingCleaningCount} Unit(s) awaiting cleaning</span>
                          <button
                            onClick={() => { setActiveTab('cleaning'); setShowAlertsDrawer(false); }}
                            className="text-amber-700 underline font-medium"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                      {pendingCleaningCount > 0 && (
                        <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 flex justify-between items-center">
                          <span>🧹 {pendingCleaningCount} Active cleaning tasks in progress</span>
                          <button
                            onClick={() => { setActiveTab('cleaning'); setShowAlertsDrawer(false); }}
                            className="text-orange-700 underline font-medium"
                          >
                            View
                          </button>
                        </div>
                      )}
                      {openMaintenanceCount > 0 && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 flex justify-between items-center">
                          <span>⚠️ {openMaintenanceCount} Open maintenance issue(s)</span>
                          <button
                            onClick={() => { setActiveTab('maintenance'); setShowAlertsDrawer(false); }}
                            className="text-rose-700 underline font-medium"
                          >
                            Inspect
                          </button>
                        </div>
                      )}
                      {lowStockCount > 0 && (
                        <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-900 flex justify-between items-center">
                          <span>📦 {lowStockCount} Inventory item(s) low on stock</span>
                          <button
                            onClick={() => { setActiveTab('inventory'); setShowAlertsDrawer(false); }}
                            className="text-red-700 underline font-medium"
                          >
                            Stock Up
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Demo Data Reset */}
          <button
            onClick={() => {
              if (window.confirm('Reset all demo data back to initial state?')) {
                resetDemoData();
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Reset Demo Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Navigation Tabs (Owner View) */}
      {currentRole === 'OWNER' && (
        <nav className="px-4 overflow-x-auto scrollbar-none flex items-center gap-1 border-t border-slate-100 py-1.5 bg-white">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};
