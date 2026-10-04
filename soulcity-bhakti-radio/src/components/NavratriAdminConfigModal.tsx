import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Save,
  RotateCcw,
  Calendar,
  Palette,
  Check,
  Flame,
  Layers,
  Edit2
} from 'lucide-react';
import { Aarti, NavratriDayConfig, NavratriSettings, AartiType } from '../types.ts';
import { DEFAULT_NAVRATRI_DAYS_2026, DEFAULT_NAVRATRI_SETTINGS } from '../data/navratriConfig.ts';

interface NavratriAdminConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: NavratriSettings;
  onSaveSettings: (newSettings: NavratriSettings) => void;
  aartis: Aarti[];
  onUpdateAarti: (updated: Aarti) => void;
}

const CATEGORY_OPTIONS: AartiType[] = ['Aarti', 'Bhajan', 'Mantra', 'Chalisa', 'Stotram'];

export const NavratriAdminConfigModal: React.FC<NavratriAdminConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  aartis,
  onUpdateAarti,
}) => {
  const [currentSettings, setCurrentSettings] = useState<NavratriSettings>(() => ({
    ...settings,
    days: settings.days.map((d) => ({ ...d })),
  }));

  const [activeTab, setActiveTab] = useState<'calendar' | 'tracks'>('calendar');
  const [editingDayNum, setEditingDayNum] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleDayFieldChange = (dayNum: number, field: keyof NavratriDayConfig, value: any) => {
    setCurrentSettings((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.dayNumber === dayNum ? { ...d, [field]: value } : d)),
    }));
  };

  const handleCategoryToggle = (dayNum: number, cat: AartiType) => {
    setCurrentSettings((prev) => ({
      ...prev,
      days: prev.days.map((d) => {
        if (d.dayNumber !== dayNum) return d;
        const exists = d.associatedCategories.includes(cat);
        const updated = exists
          ? d.associatedCategories.filter((c) => c !== cat)
          : [...d.associatedCategories, cat];
        return { ...d, associatedCategories: updated };
      }),
    }));
  };

  const handleSave = () => {
    onSaveSettings(currentSettings);
    onClose();
  };

  const handleReset = () => {
    if (window.confirm('Reset Navratri calendar and colors to default 2026 Shardiya configuration?')) {
      setCurrentSettings({
        ...DEFAULT_NAVRATRI_SETTINGS,
        days: DEFAULT_NAVRATRI_DAYS_2026.map((d) => ({ ...d })),
      });
    }
  };

  const handleAssignTrack = (trackId: string, dayNum: number | null) => {
    const track = aartis.find((a) => a.id === trackId);
    if (!track) return;

    const dayConfig = dayNum ? currentSettings.days.find((d) => d.dayNumber === dayNum) : null;
    const tags = new Set(track.festivalTags || []);

    if (dayNum) {
      tags.add('Navratri');
    }

    const updated: Aarti = {
      ...track,
      festivalTags: Array.from(tags),
      navratriDay: dayNum || undefined,
      deviForm: dayConfig ? dayConfig.deviForm : track.deviForm,
      themeColor: dayConfig ? dayConfig.colorHex : track.themeColor,
    };

    onUpdateAarti(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-2xl border border-amber-600/50 bg-[#140e0b] p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-stone-200 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <span>Administrative Controls</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gold-gradient font-serif-temple">
                Navratri Calendar &amp; Theme Configuration
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Navratri Controls */}
        <div className="py-4 border-b border-amber-950/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Enabled Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a120d] border border-amber-900/40">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Navratri Mode Active</span>
              <span className="text-[11px] text-stone-400">Enable festival portal and dynamic themes</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={currentSettings.isEnabled}
                onChange={(e) =>
                  setCurrentSettings((prev) => ({ ...prev, isEnabled: e.target.checked }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          {/* Preview Day Override */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#1a120d] border border-amber-900/40">
            <div>
              <span className="text-xs font-bold text-stone-200 block">Preview / Force Day</span>
              <span className="text-[11px] text-stone-400">Simulate any day outside Oct 11–20</span>
            </div>
            <select
              value={currentSettings.manualOverrideDay === null ? 'live' : String(currentSettings.manualOverrideDay)}
              onChange={(e) => {
                const val = e.target.value === 'live' ? null : parseInt(e.target.value, 10);
                setCurrentSettings((prev) => ({ ...prev, manualOverrideDay: val }));
              }}
              className="rounded-lg bg-[#251b14] border border-amber-700/50 px-3 py-1.5 text-xs text-amber-300 focus:outline-none"
            >
              <option value="live">Auto (Live India IST)</option>
              {currentSettings.days.map((d) => (
                <option key={d.dayNumber} value={d.dayNumber}>
                  Day {d.dayNumber} ({d.deviForm.replace('Maa ', '')})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tab switcher: Calendar Config vs Track Assignments */}
        <div className="pt-3 pb-2 flex items-center gap-2 border-b border-amber-950/60">
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            10-Day Calendar &amp; Color Sequences
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tracks')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Assign Tracks to Navratri Days ({aartis.length})
          </button>
        </div>

        {/* Tab 1: Calendar & Colors */}
        {activeTab === 'calendar' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
            <p className="text-xs text-stone-400">
              Customize dates, Devi forms, day colors, and associated rituals for each day.
            </p>

            <div className="space-y-3">
              {currentSettings.days.map((day) => {
                const isEditing = editingDayNum === day.dayNumber;

                return (
                  <div
                    key={day.dayNumber}
                    className="rounded-xl border border-amber-900/40 bg-[#18110c] p-3.5 transition-all"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded-full border border-white/30 shrink-0 shadow"
                          style={{ backgroundColor: day.colorHex }}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                              Day {day.dayNumber} · {day.tithi}
                            </span>
                            <span className="text-stone-500">·</span>
                            <span className="text-xs text-stone-400">{day.dateString}</span>
                          </div>
                          <p className="text-sm font-bold text-stone-100 font-serif-temple">
                            {day.deviForm} <span className="text-xs font-normal text-amber-300">({day.deviHindi})</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded border hidden sm:inline"
                          style={{
                            backgroundColor: `${day.colorHex}22`,
                            borderColor: `${day.colorHex}66`,
                            color: day.colorHex === '#fef08a' ? '#fde047' : day.colorHex,
                          }}
                        >
                          {day.colorName}
                        </span>

                        <button
                          type="button"
                          onClick={() => setEditingDayNum(isEditing ? null : day.dayNumber)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-[#251a13] hover:bg-stone-800 text-stone-300 hover:text-amber-300 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{isEditing ? 'Close' : 'Edit'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Inline Editor */}
                    {isEditing && (
                      <div className="mt-4 pt-4 border-t border-amber-900/40 space-y-3 animate-in fade-in">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Date (YYYY-MM-DD)
                            </label>
                            <input
                              type="date"
                              value={day.dateString}
                              onChange={(e) => handleDayFieldChange(day.dayNumber, 'dateString', e.target.value)}
                              className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Devi Form (English)
                            </label>
                            <input
                              type="text"
                              value={day.deviForm}
                              onChange={(e) => handleDayFieldChange(day.dayNumber, 'deviForm', e.target.value)}
                              className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Devi Name (Devanagari)
                            </label>
                            <input
                              type="text"
                              value={day.deviHindi}
                              onChange={(e) => handleDayFieldChange(day.dayNumber, 'deviHindi', e.target.value)}
                              className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Color Name
                            </label>
                            <input
                              type="text"
                              value={day.colorName}
                              onChange={(e) => handleDayFieldChange(day.dayNumber, 'colorName', e.target.value)}
                              className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Color Hex Code
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={day.colorHex}
                                onChange={(e) => handleDayFieldChange(day.dayNumber, 'colorHex', e.target.value)}
                                className="w-8 h-8 rounded border border-amber-800 bg-transparent cursor-pointer"
                              />
                              <input
                                type="text"
                                value={day.colorHex}
                                onChange={(e) => handleDayFieldChange(day.dayNumber, 'colorHex', e.target.value)}
                                className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs font-mono text-stone-100"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-stone-400 mb-1">
                              Tithi Name
                            </label>
                            <input
                              type="text"
                              value={day.tithi}
                              onChange={(e) => handleDayFieldChange(day.dayNumber, 'tithi', e.target.value)}
                              className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100"
                            />
                          </div>
                        </div>

                        {/* Associated Categories Checkboxes */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-400 mb-1.5">
                            Associated Devotional Categories
                          </label>
                          <div className="flex flex-wrap items-center gap-2">
                            {CATEGORY_OPTIONS.map((cat) => {
                              const checked = day.associatedCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  type="button"
                                  onClick={() => handleCategoryToggle(day.dayNumber, cat)}
                                  className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                                    checked
                                      ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                                      : 'bg-[#18110c] border-stone-800 text-stone-400 hover:text-stone-200'
                                  }`}
                                >
                                  {cat} {checked ? '✓' : ''}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Significance and Mantra */}
                        <div>
                          <label className="block text-[11px] font-medium text-stone-400 mb-1">
                            Dhyan Mantra
                          </label>
                          <input
                            type="text"
                            value={day.mantra}
                            onChange={(e) => handleDayFieldChange(day.dayNumber, 'mantra', e.target.value)}
                            className="w-full rounded bg-[#251b14] border border-amber-900/50 px-2.5 py-1 text-xs text-stone-100 font-serif-temple"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-medium text-stone-400 mb-1">
                            Spiritual Significance
                          </label>
                          <textarea
                            rows={2}
                            value={day.significance}
                            onChange={(e) => handleDayFieldChange(day.dayNumber, 'significance', e.target.value)}
                            className="w-full rounded bg-[#251b14] border border-amber-900/50 p-2 text-xs text-stone-100"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Track Assignments */}
        {activeTab === 'tracks' && (
          <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-0 pr-1">
            <p className="text-xs text-stone-400">
              Assign tracks from your library to specific Navratri Days or tag them as Navratri specials.
            </p>

            <div className="space-y-2">
              {aartis.map((track) => {
                return (
                  <div
                    key={track.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-[#18110c] border border-amber-950/60 text-xs"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="font-semibold text-stone-200 truncate">{track.title}</span>
                      {track.type && (
                        <span className="text-[10px] text-amber-400 font-medium px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-800/40">
                          {track.type}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-stone-400 text-[11px]">Navratri Day:</span>
                      <select
                        value={track.navratriDay || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          handleAssignTrack(track.id, val);
                        }}
                        className="rounded bg-[#251b14] border border-amber-800/40 px-2 py-1 text-xs text-amber-300 focus:outline-none"
                      >
                        <option value="">None (Standard)</option>
                        {currentSettings.days.map((d) => (
                          <option key={d.dayNumber} value={d.dayNumber}>
                            Day {d.dayNumber}: {d.deviForm.replace('Maa ', '')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-4 border-t border-amber-900/40 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/60 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to 2026 Default</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-lg text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
