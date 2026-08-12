import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Cleaner, ChecklistItemTemplate } from '../../types';
import {
  Settings,
  Users,
  CheckSquare,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Save,
  Phone
} from 'lucide-react';

export const AdminSettingsView: React.FC = () => {
  const {
    settings,
    updateSystemSettings,
    cleaners,
    addCleaner,
    updateCleaner,
    setDefaultCleaner,
    checklistTemplates,
    addChecklistTemplate,
    updateChecklistTemplate,
    deleteChecklistTemplate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'property' | 'cleaners' | 'checklist' | 'whatsapp'>('property');

  // Property form state
  const [propertyName, setPropertyName] = useState(settings.propertyName);
  const [propertyAddress, setPropertyAddress] = useState(settings.propertyAddress);
  const [propertyContact, setPropertyContact] = useState(settings.propertyContact);
  const [defaultCheckInTime, setDefaultCheckInTime] = useState(settings.defaultCheckInTime);
  const [defaultCheckOutTime, setDefaultCheckOutTime] = useState(settings.defaultCheckOutTime);

  // WhatsApp form state
  const [cleanerTemplate, setCleanerTemplate] = useState(settings.whatsappCleanerTemplate);
  const [guestTemplate, setGuestTemplate] = useState(settings.whatsappGuestCheckInTemplate);

  // Cleaner modal state
  const [showCleanerModal, setShowCleanerModal] = useState(false);
  const [editingCleaner, setEditingCleaner] = useState<Cleaner | null>(null);
  const [cleanerName, setCleanerName] = useState('');
  const [cleanerPhone, setCleanerPhone] = useState('');

  // Checklist modal state
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ChecklistItemTemplate | null>(null);
  const [ckCategory, setCkCategory] = useState<'BEDROOM' | 'BATHROOM' | 'GENERAL' | 'KITCHEN' | 'REFRESHMENTS'>('BEDROOM');
  const [ckTitle, setCkTitle] = useState('');
  const [ckIsRequired, setCkIsRequired] = useState(true);

  const handleSaveProperty = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      ...settings,
      propertyName,
      propertyAddress,
      propertyContact,
      defaultCheckInTime,
      defaultCheckOutTime,
    });
    alert('Property settings saved successfully!');
  };

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    updateSystemSettings({
      ...settings,
      whatsappCleanerTemplate: cleanerTemplate,
      whatsappGuestCheckInTemplate: guestTemplate,
    });
    alert('WhatsApp message templates updated!');
  };

  const handleCleanerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCleaner) {
      updateCleaner({
        ...editingCleaner,
        name: cleanerName,
        phone: cleanerPhone,
      });
    } else {
      addCleaner({
        name: cleanerName,
        phone: cleanerPhone,
        isActive: true,
        isDefault: cleaners.length === 0,
      });
    }
    setShowCleanerModal(false);
  };

  const handleChecklistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTemplate) {
      updateChecklistTemplate({
        ...editingTemplate,
        category: ckCategory,
        title: ckTitle,
        isRequired: ckIsRequired,
      });
    } else {
      addChecklistTemplate({
        category: ckCategory,
        title: ckTitle,
        isRequired: ckIsRequired,
        isActive: true,
        sortOrder: checklistTemplates.length + 1,
      });
    }
    setShowChecklistModal(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Admin System Settings</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure property defaults, cleaner staff profiles, master checklist templates, and WhatsApp message formats.
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('property')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'property' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Property
          </button>
          <button
            onClick={() => setActiveTab('cleaners')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'cleaners' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Cleaners
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'checklist' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Checklist Templates
          </button>
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'whatsapp' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            WhatsApp Templates
          </button>
        </div>
      </div>

      {/* PROPERTY TAB */}
      {activeTab === 'property' && (
        <form onSubmit={handleSaveProperty} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            Property & Default Rules
          </h2>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Property Name</label>
            <input
              type="text"
              required
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Property Address</label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Contact Phone Number</label>
            <input
              type="text"
              value={propertyContact}
              onChange={(e) => setPropertyContact(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Check-in Time</label>
              <input
                type="time"
                value={defaultCheckInTime}
                onChange={(e) => setDefaultCheckInTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Check-out Time</label>
              <input
                type="time"
                value={defaultCheckOutTime}
                onChange={(e) => setDefaultCheckOutTime(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Property Settings
          </button>
        </form>
      )}

      {/* CLEANERS TAB */}
      {activeTab === 'cleaners' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-900">Cleaner Directory & Assignment</h2>
            <button
              onClick={() => {
                setEditingCleaner(null);
                setCleanerName('');
                setCleanerPhone('');
                setShowCleanerModal(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Cleaner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cleaners.map((c) => (
              <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      {c.name}
                      {c.isDefault && (
                        <span className="px-2 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded-full font-bold">
                          DEFAULT CLEANER
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {c.phone}
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  {!c.isDefault && (
                    <button
                      onClick={() => setDefaultCleaner(c.id)}
                      className="text-emerald-700 hover:underline font-bold text-[11px]"
                    >
                      Set as Default Cleaner
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingCleaner(c);
                      setCleanerName(c.name);
                      setCleanerPhone(c.phone);
                      setShowCleanerModal(true);
                    }}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHECKLIST TEMPLATES TAB */}
      {activeTab === 'checklist' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-extrabold text-slate-900">Mandatory & Optional Checklist Master Items</h2>
            <button
              onClick={() => {
                setEditingTemplate(null);
                setCkTitle('');
                setCkIsRequired(true);
                setShowChecklistModal(true);
              }}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs text-slate-700 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="p-3">Category</th>
                  <th className="p-3">Checklist Requirement Title</th>
                  <th className="p-3">Requirement Type</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checklistTemplates.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{t.category}</td>
                    <td className="p-3 font-medium text-slate-800">{t.title}</td>
                    <td className="p-3">
                      {t.isRequired ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold text-[10px]">
                          REQUIRED (Blocks Ready)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium text-[10px]">
                          OPTIONAL
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => {
                          setEditingTemplate(t);
                          setCkCategory(t.category);
                          setCkTitle(t.title);
                          setCkIsRequired(t.isRequired);
                          setShowChecklistModal(true);
                        }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteChecklistTemplate(t.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WHATSAPP TEMPLATES TAB */}
      {activeTab === 'whatsapp' && (
        <form onSubmit={handleSaveWhatsApp} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-2xl text-xs">
          <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            WhatsApp Dispatch Template Configuration
          </h2>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Cleaner Dispatch Template (Tokens: &#123;property_name&#125;, &#123;unit_name&#125;, &#123;guest_name&#125;, &#123;checkout_time&#125;)
            </label>
            <textarea
              value={cleanerTemplate}
              onChange={(e) => setCleanerTemplate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              rows={6}
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Guest Check-In Template (Tokens: &#123;guest_name&#125;, &#123;unit_name&#125;, &#123;check_in_date&#125;, &#123;check_in_time&#125;)
            </label>
            <textarea
              value={guestTemplate}
              onChange={(e) => setGuestTemplate(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
              rows={6}
            />
          </div>

          <button
            type="submit"
            className="py-2.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save WhatsApp Templates
          </button>
        </form>
      )}

      {/* CLEANER MODAL */}
      {showCleanerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingCleaner ? 'Edit Cleaner Profile' : 'Add New Cleaner'}
            </h3>

            <form onSubmit={handleCleanerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Cleaner Full Name</label>
                <input
                  type="text"
                  required
                  value={cleanerName}
                  onChange={(e) => setCleanerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number (with WhatsApp)</label>
                <input
                  type="text"
                  required
                  value={cleanerPhone}
                  onChange={(e) => setCleanerPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCleanerModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Cleaner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHECKLIST ITEM MODAL */}
      {showChecklistModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">
              {editingTemplate ? 'Edit Checklist Item' : 'Add Checklist Item'}
            </h3>

            <form onSubmit={handleChecklistSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={ckCategory}
                  onChange={(e) => setCkCategory(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="BEDROOM">BEDROOM</option>
                  <option value="BATHROOM">BATHROOM</option>
                  <option value="GENERAL">GENERAL</option>
                  <option value="KITCHEN">KITCHEN</option>
                  <option value="REFRESHMENTS">REFRESHMENTS</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Checklist Item Title</label>
                <input
                  type="text"
                  required
                  value={ckTitle}
                  onChange={(e) => setCkTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reqChk"
                  checked={ckIsRequired}
                  onChange={(e) => setCkIsRequired(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="reqChk" className="font-bold text-slate-700">
                  Required Item (Cleaner must check this before marking Unit READY)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChecklistModal(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
