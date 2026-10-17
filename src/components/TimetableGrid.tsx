import React, { useState } from 'react';
import { 
  Program, 
  Semester, 
  Section, 
  DayOfWeek, 
  DAYS_OF_WEEK, 
  TIME_SLOTS, 
  ScheduleEntry, 
  Subject, 
  Faculty, 
  Room, 
  ConflictAlert 
} from '../types';
import { 
  Sparkles, 
  Plus, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  Move, 
  CheckCircle2, 
  Maximize2,
  Trash2,
  Edit3,
  Layers,
  ChevronRight,
  Info,
  Download,
  Printer,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportTimetableToPDF, exportTimetableToCSV } from '../utils/exportUtils';

interface TimetableGridProps {
  schedule: ScheduleEntry[];
  subjects: Subject[];
  facultyList: Faculty[];
  rooms: Room[];
  selectedBranch: Program;
  setSelectedBranch: (b: Program) => void;
  selectedSemester: Semester;
  setSelectedSemester: (s: Semester) => void;
  selectedSection: Section;
  setSelectedSection: (sec: Section) => void;
  conflicts: ConflictAlert[];
  entriesWithConflicts: Map<string, string>;
  onSelectConflict: (conflict: ConflictAlert) => void;
  onOpenSmartGenerate: () => void;
  onUpdateEntry: (updated: ScheduleEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  onAddEntry: (entry: Omit<ScheduleEntry, 'id'>) => void;
  isAdmin: boolean;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({
  schedule,
  subjects,
  facultyList,
  rooms,
  selectedBranch,
  setSelectedBranch,
  selectedSemester,
  setSelectedSemester,
  selectedSection,
  setSelectedSection,
  conflicts,
  entriesWithConflicts,
  onSelectConflict,
  onOpenSmartGenerate,
  onUpdateEntry,
  onDeleteEntry,
  onAddEntry,
  isAdmin,
}) => {
  const [draggedEntryId, setDraggedEntryId] = useState<string | null>(null);
  const [hoveredTarget, setHoveredTarget] = useState<{ day: DayOfWeek; slotIndex: number } | null>(null);
  const [selectedEntryForDetail, setSelectedEntryForDetail] = useState<ScheduleEntry | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New entry form state
  const [newSubjectId, setNewSubjectId] = useState<string>('');
  const [newFacultyId, setNewFacultyId] = useState<string>('');
  const [newRoomId, setNewRoomId] = useState<string>('');
  const [newDay, setNewDay] = useState<DayOfWeek>('Monday');
  const [newSlotIndex, setNewSlotIndex] = useState<number>(0);
  const [newDuration, setNewDuration] = useState<number>(1);
  const [newSlotType, setNewSlotType] = useState<'Lecture' | 'Lab' | 'Tutorial'>('Lecture');

  // Filter schedule for currently selected branch, semester, and section
  const currentBatchSchedule = schedule.filter(
    (e) => e.branch === selectedBranch && e.semester === selectedSemester && e.section === selectedSection
  );

  const programs: Program[] = ['CSE', 'IT', 'ECE', 'AI-DS', 'AI-ML', 'Dual-Degree', 'MCA'];
  const semesters: Semester[] = [1, 2, 3, 4, 5, 6, 7, 8];
  const sections: Section[] = ['Sec-A', 'Sec-B', 'Sec-C'];

  // Handle Drag Start
  const handleDragStart = (e: React.DragEvent, entry: ScheduleEntry) => {
    e.dataTransfer.setData('text/plain', entry.id);
    setDraggedEntryId(entry.id);
  };

  // Handle Drag Over
  const handleDragOver = (e: React.DragEvent, day: DayOfWeek, slotIndex: number) => {
    e.preventDefault();
    setHoveredTarget({ day, slotIndex });
  };

  // Handle Drop
  const handleDrop = (e: React.DragEvent, targetDay: DayOfWeek, targetSlotIndex: number) => {
    e.preventDefault();
    const entryId = e.dataTransfer.getData('text/plain') || draggedEntryId;
    setDraggedEntryId(null);
    setHoveredTarget(null);

    if (!entryId) return;
    const entry = schedule.find((item) => item.id === entryId);
    if (!entry) return;

    // Prevent placing on Lunch (slot 4)
    if (targetSlotIndex === 4) {
      alert("Institutional rule: Slot 4 (01:00 PM - 02:00 PM) is designated for Lunch/Recess.");
      return;
    }

    // If 2-hr lab, prevent placing at 12 PM (slot 3) or 4 PM (slot 7)
    if (entry.durationHours === 2 && (targetSlotIndex === 3 || targetSlotIndex >= 7)) {
      alert("A 2-hour practical lab cannot overlap Lunch (01:00 PM) or exceed 05:00 PM campus timing.");
      return;
    }

    onUpdateEntry({
      ...entry,
      day: targetDay,
      slotIndex: targetSlotIndex,
    });
  };

  // Handle New Entry Submission
  const handleCreateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => s.id === newSubjectId);
    const faculty = facultyList.find((f) => f.id === newFacultyId);
    const room = rooms.find((r) => r.id === newRoomId);

    if (!subject || !faculty || !room) {
      alert('Please fill in all required fields');
      return;
    }

    onAddEntry({
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectName: subject.name,
      facultyId: faculty.id,
      facultyName: faculty.name,
      roomId: room.id,
      roomName: room.name.split(' ')[0],
      day: newDay,
      slotIndex: newSlotIndex,
      durationHours: newDuration,
      branch: selectedBranch,
      semester: selectedSemester,
      section: selectedSection,
      slotType: newSlotType,
      colorTag: subject.colorTag?.split(' ')[0]?.replace('border-', '') || 'indigo',
    });

    setShowAddModal(false);
  };

  const [selectedDayFilter, setSelectedDayFilter] = useState<'All' | DayOfWeek>('All');

  return (
    <div className="space-y-4">
      {/* Top Controls: Batch Filter & Action Buttons */}
      <div className="bg-white dark:bg-slate-900 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Program, Semester, Section Selectors */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Program:
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-[240px] sm:max-w-none">
                {programs.map((prog) => (
                  <button
                    key={prog}
                    onClick={() => setSelectedBranch(prog)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                      selectedBranch === prog
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {prog}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Sem:
              </span>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value) as Semester)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {semesters.map((sem) => (
                  <option key={sem} value={sem}>
                    {sem}{sem === 1 ? 'st' : sem === 2 ? 'nd' : sem === 3 ? 'rd' : 'th'} Sem
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Section:
              </span>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {sections.map((sec) => (
                  <button
                    key={sec}
                    onClick={() => setSelectedSection(sec)}
                    className={`px-2 sm:px-2.5 py-1 text-xs font-medium rounded-lg transition ${
                      selectedSection === sec
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: PDF Export, AI Generate & Add Class Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-download-timetable-pdf"
              onClick={() => exportTimetableToPDF(schedule, selectedBranch, selectedSemester, selectedSection, facultyList, rooms)}
              title="Download clean formatted academic timetable as PDF"
              className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold border border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" />
              <span>PDF</span>
            </button>

            {isAdmin && (
              <>
                <button
                  id="btn-open-smart-generate"
                  onClick={onOpenSmartGenerate}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 transition flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
                  <span>Smart AI</span>
                </button>

                <button
                  id="btn-add-class-slot"
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Add Class</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* View Mode & Day Switcher for Mobile & Desktop */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Day View:
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedDayFilter('All')}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                  selectedDayFilter === 'All'
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All Days (Grid)
              </button>
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDayFilter(day)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition whitespace-nowrap ${
                    selectedDayFilter === day
                      ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/30 border border-blue-500"></span>
              <span>Lecture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500"></span>
              <span>2h Lab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500"></span>
              <span>Tutorial</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clashes Banner if any exist */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 shadow-sm animate-pulse">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-sm">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span>
                {conflicts.length} Constraint Conflict{conflicts.length > 1 ? 's' : ''} Detected in Institutional Master Schedule
              </span>
            </div>
          </div>
          <div className="mt-2.5 grid grid-cols-1 md:grid-cols-2 gap-2">
            {conflicts.slice(0, 4).map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectConflict(c)}
                className="cursor-pointer bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/60 hover:border-rose-400 transition flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-rose-700 dark:text-rose-300">{c.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">{c.message}</p>
                </div>
                <span className="ml-2 px-2 py-1 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-[10px] font-bold whitespace-nowrap">
                  Fix with AI →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Primary Weekly Interactive Timetable Grid / Mobile Day Card View */}
      {selectedDayFilter !== 'All' ? (
        /* Mobile-Friendly Day-by-Day Card View */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>📅 {selectedDayFilter}'s Schedule</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedBranch} Sem {selectedSemester} ({selectedSection})
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentBatchSchedule.filter((e) => e.day === selectedDayFilter).length} classes scheduled on {selectedDayFilter}
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setNewDay(selectedDayFilter);
                  setShowAddModal(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add on {selectedDayFilter.slice(0, 3)}</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {TIME_SLOTS.map((slot) => {
              const dayEntries = currentBatchSchedule.filter((e) => e.day === selectedDayFilter);
              const coveredByPrevLab = dayEntries.find(
                (e) => e.slotIndex === slot.index - 1 && e.durationHours === 2
              );
              if (coveredByPrevLab) return null;

              const entry = dayEntries.find((e) => e.slotIndex === slot.index);
              const hasConflict = entry && entriesWithConflicts.has(entry.id);
              const conflictReason = entry ? entriesWithConflicts.get(entry.id) : null;

              if (slot.isLunch && !entry) {
                return (
                  <div
                    key={slot.index}
                    className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300 font-medium">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span className="font-bold uppercase tracking-wider text-[11px] bg-amber-200/50 dark:bg-amber-900/50 px-2 py-0.5 rounded">
                        Lunch / Recess Break
                      </span>
                    </div>
                  </div>
                );
              }

              if (entry) {
                return (
                  <div
                    key={slot.index}
                    onClick={() => {
                      if (hasConflict) {
                        const matchingConflict = conflicts.find((c) => c.involvedEntries.includes(entry.id));
                        if (matchingConflict) {
                          onSelectConflict(matchingConflict);
                          return;
                        }
                      }
                      setSelectedEntryForDetail(entry);
                    }}
                    className={`p-3.5 rounded-xl border transition cursor-pointer ${
                      hasConflict
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 dark:border-rose-800 shadow-xs'
                        : entry.slotType === 'Lab'
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : entry.slotType === 'Tutorial'
                        ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                        : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                          {entry.subjectCode}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                          entry.slotType === 'Lab'
                            ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                            : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200'
                        }`}>
                          {entry.slotType} {entry.durationHours === 2 ? '(2 Hours)' : '(1 Hour)'}
                        </span>
                        {hasConflict && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-500 text-white flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Conflict Alert</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {slot.startTime} - {entry.durationHours === 2 ? TIME_SLOTS[slot.index + 1]?.endTime || slot.endTime : slot.endTime}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
                      {entry.subjectName}
                    </h4>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{entry.facultyName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{entry.roomName}</span>
                      </div>
                    </div>

                    {conflictReason && (
                      <p className="mt-2 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
                        ⚠️ {conflictReason}
                      </p>
                    )}
                  </div>
                );
              }

              return (
                <div
                  key={slot.index}
                  onClick={() => {
                    if (isAdmin) {
                      setNewDay(selectedDayFilter);
                      setNewSlotIndex(slot.index);
                      setShowAddModal(true);
                    }
                  }}
                  className={`p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 transition ${
                    isAdmin ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.startTime} - {slot.endTime} (Slot {slot.index + 1})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    {isAdmin ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Class</span>
                      </span>
                    ) : (
                      <span>Free Slot</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden timetable-print-card">
        {/* Print Header (Visible only when printed) */}
        <div className="hidden print-only p-4 border-b border-slate-300 text-center">
          <h2 className="text-lg font-bold">UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY (USICT)</h2>
          <p className="text-xs">Guru Gobind Singh Indraprastha University, Sector 16-C, Dwarka, New Delhi</p>
          <h3 className="text-sm font-semibold mt-1">
            Weekly Master Timetable: {selectedBranch} - Semester {selectedSemester} ({selectedSection})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold">
                <th className="p-3.5 w-28 text-center border-r border-slate-200 dark:border-slate-800">
                  Day / Time
                </th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot.index}
                    className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                      slot.isLunch ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold' : ''
                    }`}
                  >
                    <div className="text-xs">{slot.startTime} - {slot.endTime}</div>
                    <div className="text-[10px] font-normal text-slate-400 dark:text-slate-500">
                      {slot.isLunch ? 'LUNCH BREAK' : `Slot ${slot.index + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => {
                // Find entries for this day in this batch
                const dayEntries = currentBatchSchedule.filter((e) => e.day === day);

                return (
                  <tr
                    key={day}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                  >
                    {/* Day Column */}
                    <td className="p-3 text-center font-bold text-xs text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800">
                      {day}
                    </td>

                    {/* Time Slots 0 to 7 */}
                    {TIME_SLOTS.map((slot) => {
                      // Check if a 2-hour lab started at previous slot and covers this slot
                      const coveredByPrevLab = dayEntries.find(
                        (e) => e.slotIndex === slot.index - 1 && e.durationHours === 2
                      );
                      if (coveredByPrevLab) {
                        // Skip cell because previous cell had colSpan 2
                        return null;
                      }

                      // Check if an entry starts at this slot
                      const entry = dayEntries.find((e) => e.slotIndex === slot.index);

                      // Lunch Break Cell
                      if (slot.isLunch && !entry) {
                        return (
                          <td
                            key={slot.index}
                            className="p-2 border-r border-slate-200 dark:border-slate-800 bg-amber-500/5 text-center align-middle"
                          >
                            <span className="text-[11px] font-medium text-amber-600/80 dark:text-amber-400/80 tracking-wide uppercase">
                              Recess / Lunch
                            </span>
                          </td>
                        );
                      }

                      const isHovered = hoveredTarget?.day === day && hoveredTarget?.slotIndex === slot.index;
                      const hasConflict = entry && entriesWithConflicts.has(entry.id);
                      const conflictReason = entry ? entriesWithConflicts.get(entry.id) : null;

                      return (
                        <td
                          key={slot.index}
                          colSpan={entry?.durationHours === 2 ? 2 : 1}
                          onDragOver={(e) => handleDragOver(e, day, slot.index)}
                          onDrop={(e) => handleDrop(e, day, slot.index)}
                          className={`p-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top transition ${
                            isHovered ? 'bg-indigo-50/80 dark:bg-indigo-950/40' : ''
                          }`}
                        >
                          {entry ? (
                            <div
                              draggable={isAdmin}
                              onDragStart={(e) => handleDragStart(e, entry)}
                              onClick={() => {
                                if (hasConflict) {
                                  const matchingConflict = conflicts.find((c) => c.involvedEntries.includes(entry.id));
                                  if (matchingConflict) {
                                    onSelectConflict(matchingConflict);
                                    return;
                                  }
                                }
                                setSelectedEntryForDetail(entry);
                              }}
                              className={`group relative p-2 transition cursor-pointer select-none text-xs ${
                                hasConflict
                                  ? 'bg-red-50 dark:bg-red-950/70 border-2 border-red-500 rounded-lg shadow-sm text-red-950 dark:text-red-100 animate-pulse'
                                  : entry.slotType === 'Lab'
                                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-l-4 border-emerald-500 rounded-r-lg shadow-xs text-slate-800 dark:text-slate-100'
                                  : entry.slotType === 'Tutorial'
                                  ? 'bg-amber-50/90 dark:bg-amber-950/40 border-l-4 border-amber-500 rounded-r-lg shadow-xs text-slate-800 dark:text-slate-100'
                                  : 'bg-blue-50/90 dark:bg-blue-950/40 border-l-4 border-blue-500 rounded-r-lg shadow-xs text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {/* Header with Subject Code and Type Badge */}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white">
                                  {entry.subjectCode}
                                </span>
                                <div className="flex items-center gap-1">
                                  {hasConflict && (
                                    <span className="p-0.5 rounded-full bg-red-500 text-white" title={conflictReason || "Conflict detected"}>
                                      <AlertTriangle className="w-3 h-3" />
                                    </span>
                                  )}
                                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                    entry.slotType === 'Lab'
                                      ? 'bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200'
                                      : 'bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                                  }`}>
                                    {entry.slotType === 'Lab' ? 'LAB' : entry.slotType}
                                    {entry.durationHours === 2 ? ' (2h)' : ''}
                                  </span>
                                </div>
                              </div>

                              {/* Subject Title */}
                              <p className="font-medium line-clamp-1 text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                                {entry.subjectName}
                              </p>

                              {/* Details: Faculty & Room */}
                              <div className="space-y-0.5 text-[10px] text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-1 line-clamp-1">
                                  <User className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="truncate">{entry.facultyName}</span>
                                </div>
                                <div className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span>{entry.roomName}</span>
                                </div>
                              </div>

                              {/* Hover Drag Grip for Admins */}
                              {isAdmin && (
                                <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition no-print">
                                  <Move className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                              )}
                            </div>
                          ) : (
                            /* Empty Slot Box */
                            <div
                              onClick={() => {
                                if (isAdmin && slot.index !== 4) {
                                  setNewDay(day);
                                  setNewSlotIndex(slot.index);
                                  setShowAddModal(true);
                                }
                              }}
                              className={`h-16 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800/30 flex items-center justify-center transition group ${
                                isAdmin ? 'cursor-pointer' : ''
                              }`}
                            >
                              {isAdmin && (
                                <Plus className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition opacity-0 group-hover:opacity-100" />
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Professional Polish Bottom 3-Column Resource & Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 no-print">
        {/* 1. Conflict Resolver Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Conflict Resolver
              </h3>
              {conflicts.length > 0 ? (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 rounded-full text-[10px] font-bold">
                  {conflicts.length} {conflicts.length === 1 ? 'ALERT' : 'ALERTS'}
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full text-[10px] font-bold">
                  ZERO CONFLICTS
                </span>
              )}
            </div>

            {conflicts.length > 0 ? (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/60 rounded-lg p-2.5 flex gap-3">
                <div className="text-lg">⚠️</div>
                <div>
                  <p className="text-[11px] font-bold text-red-800 dark:text-red-300 leading-tight">
                    {conflicts[0].title}
                  </p>
                  <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5 line-clamp-2">
                    {conflicts[0].message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-lg p-2.5 flex gap-3">
                <div className="text-lg">✅</div>
                <div>
                  <p className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 leading-tight">
                    All Constraints Satisfied
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Faculty, room capacity, and contiguous 2-hr practical lab rules verified.
                  </p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (conflicts.length > 0) {
                onSelectConflict(conflicts[0]);
              } else {
                onOpenSmartGenerate();
              }
            }}
            className="mt-3 w-full py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition text-center"
          >
            {conflicts.length > 0 ? 'Apply AI Auto-fix Suggestion' : 'Run Master Schedule Optimizer'}
          </button>
        </div>

        {/* 2. AI Seating & Timetable Insights Widget */}
        <div className="bg-[#0f172a] rounded-xl p-4 shadow-sm flex flex-col text-white border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              AI Seating Insights
            </h3>
            <span className="text-indigo-400">✨</span>
          </div>
          <div className="space-y-3 flex-1 overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-1 bg-indigo-500 h-8 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-[11px] font-medium text-slate-200">Branch Mixing Protocol</p>
                <p className="text-[10px] text-slate-400">
                  Anti-cheating seating active: 45% CSE / 55% IT alternating in E-212.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1 bg-emerald-500 h-8 rounded-full flex-shrink-0"></div>
              <div>
                <p className="text-[11px] font-medium text-slate-200">Room Capacity Optimized</p>
                <p className="text-[10px] text-slate-400">
                  30 students assigned to Lab-2. 2.5ft minimum spacing maintained.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Campus Resource Pulse Widget */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Campus Resource Pulse
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3 flex-1">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-400 uppercase leading-none font-medium">Room Load</p>
              <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">82%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-400 uppercase leading-none font-medium">Active Exams</p>
              <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">04</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-400 uppercase leading-none font-medium">Faculty on Duty</p>
              <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">12/48</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700/60">
              <p className="text-[10px] text-slate-400 uppercase leading-none font-medium">Avg. Student Gap</p>
              <p className="text-lg font-bold mt-1 text-slate-800 dark:text-slate-100">1.2h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class Detail / Edit Modal */}
      <AnimatePresence>
        {selectedEntryForDetail && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedEntryForDetail(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                    {selectedEntryForDetail.slotType} Session ({selectedEntryForDetail.durationHours} hr)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                    {selectedEntryForDetail.subjectCode}: {selectedEntryForDetail.subjectName}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedEntryForDetail(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Instructor:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedEntryForDetail.facultyName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Room / Lab:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{selectedEntryForDetail.roomName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Day & Timing:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedEntryForDetail.day} ({TIME_SLOTS[selectedEntryForDetail.slotIndex]?.startTime} - {TIME_SLOTS[selectedEntryForDetail.slotIndex + selectedEntryForDetail.durationHours - 1]?.endTime})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Batch:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedEntryForDetail.branch} Sem {selectedEntryForDetail.semester} ({selectedEntryForDetail.section})
                  </span>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      onDeleteEntry(selectedEntryForDetail.id);
                      setSelectedEntryForDetail(null);
                    }}
                    className="px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Slot</span>
                  </button>
                  <button
                    onClick={() => setSelectedEntryForDetail(null)}
                    className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manual Add Slot Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowAddModal(false)}
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onSubmit={handleCreateEntry}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Add Timetable Slot ({selectedBranch} Sem {selectedSemester})
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    required
                    value={newSubjectId}
                    onChange={(e) => {
                      setNewSubjectId(e.target.value);
                      const s = subjects.find((sub) => sub.id === e.target.value);
                      if (s) {
                        setNewFacultyId(s.defaultFacultyId);
                        setNewSlotType(s.type === 'Practical' ? 'Lab' : 'Lecture');
                        setNewDuration(s.type === 'Practical' ? 2 : 1);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select USICT Subject...</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.code}: {sub.name} ({sub.branch} Sem {sub.semester})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Faculty Instructor</label>
                  <select
                    required
                    value={newFacultyId}
                    onChange={(e) => setNewFacultyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select Faculty...</option>
                    {facultyList.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name} ({fac.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Room / Lab</label>
                  <select
                    required
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="">Select Room...</option>
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Day</label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as DayOfWeek)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Time Slot</label>
                  <select
                    value={newSlotIndex}
                    onChange={(e) => setNewSlotIndex(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t.index} value={t.index} disabled={t.isLunch}>
                        {t.startTime} - {t.endTime} {t.isLunch ? '(Lunch)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Type</label>
                  <select
                    value={newSlotType}
                    onChange={(e) => {
                      const type = e.target.value as any;
                      setNewSlotType(type);
                      setNewDuration(type === 'Lab' ? 2 : 1);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  >
                    <option value="Lecture">Lecture (1 hr)</option>
                    <option value="Lab">Practical Lab (2 hrs)</option>
                    <option value="Tutorial">Tutorial (1 hr)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="2"
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20"
                >
                  Add Class Slot
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
