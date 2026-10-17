import React, { useState, useMemo } from 'react';
import { 
  Program, 
  Semester, 
  Section, 
  ScheduleEntry, 
  Exam, 
  Faculty, 
  Room, 
  TIME_SLOTS, 
  DAYS_OF_WEEK, 
  DayOfWeek 
} from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  User, 
  BookOpen, 
  ShieldCheck, 
  Download, 
  Layers, 
  Sparkles,
  Filter,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  ListFilter,
  Eye,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { exportScheduleToICS } from '../utils/exportUtils';
import confetti from 'canvas-confetti';

interface CalendarViewProps {
  schedule: ScheduleEntry[];
  exams: Exam[];
  facultyList: Faculty[];
  rooms: Room[];
  selectedBranch: Program;
  setSelectedBranch: (b: Program) => void;
  selectedSemester: Semester;
  setSelectedSemester: (s: Semester) => void;
  selectedSection: Section;
  setSelectedSection: (sec: Section) => void;
}

type CalendarViewMode = 'month' | 'week' | 'day';

export const CalendarView: React.FC<CalendarViewProps> = ({
  schedule,
  exams,
  facultyList,
  rooms,
  selectedBranch,
  setSelectedBranch,
  selectedSemester,
  setSelectedSemester,
  selectedSection,
  setSelectedSection,
}) => {
  // Calendar Navigation & Mode State
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 24)); // Default to late August 2026 / current semester
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date(2026, 7, 24));
  
  // Filter Toggles
  const [showLectures, setShowLectures] = useState<boolean>(true);
  const [showLabs, setShowLabs] = useState<boolean>(true);
  const [showTutorials, setShowTutorials] = useState<boolean>(true);
  const [showExams, setShowExams] = useState<boolean>(true);

  // Modal / Inspector state for clicked event
  const [activeEvent, setActiveEvent] = useState<{
    type: 'class' | 'exam';
    title: string;
    code: string;
    time: string;
    dayOrDate: string;
    room: string;
    facultyOrSetter: string;
    colorTag?: string;
    details?: string;
    slotType?: string;
    duration?: number;
    credits?: number;
  } | null>(null);

  // Filtered timetable schedule
  const filteredSchedule = useMemo(() => {
    return schedule.filter((e) => {
      if (e.branch !== selectedBranch || e.semester !== selectedSemester || e.section !== selectedSection) {
        return false;
      }
      if (e.slotType === 'Lecture' && !showLectures) return false;
      if (e.slotType === 'Lab' && !showLabs) return false;
      if (e.slotType === 'Tutorial' && !showTutorials) return false;
      return true;
    });
  }, [schedule, selectedBranch, selectedSemester, selectedSection, showLectures, showLabs, showTutorials]);

  // Filtered exams
  const filteredExams = useMemo(() => {
    if (!showExams) return [];
    return exams.filter((ex) => ex.branch === selectedBranch && ex.semester === selectedSemester);
  }, [exams, selectedBranch, selectedSemester, showExams]);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() - 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(selectedDayDate);
      nextDate.setDate(nextDate.getDate() - 1);
      setSelectedDayDate(nextDate);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (viewMode === 'week') {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 7);
      setCurrentDate(nextDate);
    } else {
      const nextDate = new Date(selectedDayDate);
      nextDate.setDate(nextDate.getDate() + 1);
      setSelectedDayDate(nextDate);
    }
  };

  const handleToday = () => {
    const today = new Date(2026, 7, 24); // Fallback to semester date
    setCurrentDate(today);
    setSelectedDayDate(today);
  };

  // Generate Month Grid Matrix
  const monthMatrix = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sun, 1 = Mon, ...
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      dayNumber: number;
      isCurrentMonth: boolean;
      dayName: DayOfWeek | null;
      isToday: boolean;
    }[] = [];

    // Prepend previous month days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dayIndex = d.getDay();
      const dayName = dayIndex >= 1 && dayIndex <= 5 ? DAYS_OF_WEEK[dayIndex - 1] : null;
      days.push({
        date: d,
        dayNumber: daysInPrevMonth - i,
        isCurrentMonth: false,
        dayName,
        isToday: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const dayIndex = d.getDay();
      const dayName = dayIndex >= 1 && dayIndex <= 5 ? DAYS_OF_WEEK[dayIndex - 1] : null;
      const isToday = d.toDateString() === new Date(2026, 7, 24).toDateString();
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: true,
        dayName,
        isToday,
      });
    }

    // Append next month days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const dayIndex = d.getDay();
      const dayName = dayIndex >= 1 && dayIndex <= 5 ? DAYS_OF_WEEK[dayIndex - 1] : null;
      days.push({
        date: d,
        dayNumber: i,
        isCurrentMonth: false,
        dayName,
        isToday: false,
      });
    }

    return days;
  }, [year, month]);

  // Week View dates calculation (Mon-Fri)
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const day = curr.getDay();
    const diff = curr.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(curr.setDate(diff));

    return DAYS_OF_WEEK.map((dayName, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      return {
        dayName,
        date: d,
        formatted: `${d.getDate()} ${monthNames[d.getMonth()].substring(0, 3)}`,
        isToday: d.toDateString() === new Date(2026, 7, 24).toDateString(),
      };
    });
  }, [currentDate]);

  // Handler: Export current calendar view to iCal (.ics)
  const handleCalendarExport = () => {
    exportScheduleToICS(filteredSchedule, `USICT_${selectedBranch}_Sem${selectedSemester}_Calendar.ics`);
    confetti({ particleCount: 40, spread: 50 });
  };

  // Format Helper for dates
  const formatIsoDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Day Name for selected Day View
  const selectedDayIndex = selectedDayDate.getDay();
  const selectedDayName: DayOfWeek | null =
    selectedDayIndex >= 1 && selectedDayIndex <= 5 ? DAYS_OF_WEEK[selectedDayIndex - 1] : null;

  const dayScheduleEntries = useMemo(() => {
    if (!selectedDayName) return [];
    return filteredSchedule
      .filter((e) => e.day === selectedDayName)
      .sort((a, b) => a.slotIndex - b.slotIndex);
  }, [filteredSchedule, selectedDayName]);

  const dayExamEntries = useMemo(() => {
    const iso = formatIsoDate(selectedDayDate);
    return filteredExams.filter((ex) => ex.date === iso);
  }, [filteredExams, selectedDayDate]);

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Calendar Control Hub: Title, Branch/Sem Selectors, View Modes & Export */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Academic Master Calendar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Monsoon 2026
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline for lectures, lab rotations, exam date-sheets, and faculty schedules
            </p>
          </div>
        </div>

        {/* Action Controls & Selectors */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Branch Selector */}
          <select
            id="cal-branch-select"
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as Program)}
            className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none hover:border-indigo-400 transition"
          >
            <option value="CSE">B.Tech CSE</option>
            <option value="IT">B.Tech IT</option>
            <option value="ECE">B.Tech ECE</option>
            <option value="AI-DS">B.Tech AI-DS</option>
            <option value="AI-ML">B.Tech AI-ML</option>
            <option value="MCA">MCA (SE)</option>
          </select>

          {/* Semester Selector */}
          <select
            id="cal-semester-select"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value) as Semester)}
            className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none hover:border-indigo-400 transition"
          >
            <option value={1}>1st Semester</option>
            <option value={2}>2nd Semester</option>
            <option value={3}>3rd Semester</option>
            <option value={4}>4th Semester</option>
            <option value={5}>5th Semester</option>
            <option value={6}>6th Semester</option>
            <option value={7}>7th Semester</option>
            <option value={8}>8th Semester</option>
          </select>

          {/* Section Selector */}
          <select
            id="cal-section-select"
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value as Section)}
            className="bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none hover:border-indigo-400 transition"
          >
            <option value="Sec-A">Section A</option>
            <option value="Sec-B">Section B</option>
          </select>

          {/* Export to Calendar Button */}
          <button
            id="btn-cal-export-ics"
            onClick={handleCalendarExport}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            title="Download iCal file for Google Calendar, Outlook, and Apple Calendar"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sync to Calendar</span>
          </button>
        </div>
      </div>

      {/* Calendar Header Bar: Navigation (Prev, Today, Next) & View Mode Toggles */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Month & Buttons */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-semibold hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-800 dark:text-slate-200 transition"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 transition"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-base font-bold text-slate-900 dark:text-white px-2">
            {viewMode === 'day' ? (
              <span>
                {selectedDayDate.getDate()} {monthNames[selectedDayDate.getMonth()]} {selectedDayDate.getFullYear()} ({selectedDayName || 'Weekend'})
              </span>
            ) : viewMode === 'week' ? (
              <span>
                Week of {weekDays[0].formatted} – {weekDays[4].formatted}, {year}
              </span>
            ) : (
              <span>
                {monthNames[month]} {year}
              </span>
            )}
          </h3>
        </div>

        {/* View Mode Switcher (Month / Week / Day) & Event Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Chips */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setShowLectures(!showLectures)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                showLectures ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Lectures
            </button>
            <button
              onClick={() => setShowLabs(!showLabs)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                showLabs ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Labs
            </button>
            <button
              onClick={() => setShowTutorials(!showTutorials)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                showTutorials ? 'bg-amber-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Tutorials
            </button>
            <button
              onClick={() => setShowExams(!showExams)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                showExams ? 'bg-purple-600 text-white' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Exams
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              id="view-month-btn"
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'month'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Month</span>
            </button>
            <button
              id="view-week-btn"
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'week'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarRange className="w-3.5 h-3.5" />
              <span>Week</span>
            </button>
            <button
              id="view-day-btn"
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                viewMode === 'day'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Day Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          VIEW MODE 1: MONTH CALENDAR GRID
         ========================================================================= */}
      {viewMode === 'month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 text-center py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Days Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800/80">
            {monthMatrix.map((cell, idx) => {
              const iso = formatIsoDate(cell.date);
              const dayExams = filteredExams.filter((ex) => ex.date === iso);
              const dayClasses = cell.dayName
                ? filteredSchedule.filter((e) => e.day === cell.dayName)
                : [];

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setSelectedDayDate(cell.date);
                    if (dayClasses.length > 0 || dayExams.length > 0) {
                      setViewMode('day');
                    }
                  }}
                  className={`min-h-[110px] p-2 flex flex-col transition cursor-pointer hover:bg-indigo-50/40 dark:hover:bg-slate-800/50 ${
                    !cell.isCurrentMonth
                      ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100'
                  } ${cell.isToday ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/20' : ''}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>
                    {cell.dayName && dayClasses.length > 0 && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {dayClasses.length} classes
                      </span>
                    )}
                  </div>

                  {/* Event Badges inside Month Cell */}
                  <div className="space-y-1 overflow-hidden">
                    {/* Exam Badges */}
                    {dayExams.map((ex) => (
                      <div
                        key={ex.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEvent({
                            type: 'exam',
                            title: ex.subjectName,
                            code: ex.subjectCode,
                            time: ex.timeRange,
                            dayOrDate: ex.date,
                            room: ex.hallIds.join(', '),
                            facultyOrSetter: ex.paperSetterFacultyId || 'USICT Exam Cell',
                            details: `Enrolled Students: ${ex.totalEnrolled} • Session: ${ex.session}`,
                          });
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 truncate border border-purple-200 dark:border-purple-800"
                        title={`Exam: ${ex.subjectCode} - ${ex.subjectName}`}
                      >
                        📝 Exam: {ex.subjectCode}
                      </div>
                    ))}

                    {/* Class Badges (Top 2 shown, remainder grouped) */}
                    {dayClasses.slice(0, 2).map((item) => (
                      <div
                        key={item.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          const slot = TIME_SLOTS[item.slotIndex];
                          setActiveEvent({
                            type: 'class',
                            title: item.subjectName,
                            code: item.subjectCode,
                            time: `${slot?.startTime} - ${TIME_SLOTS[item.slotIndex + item.durationHours - 1]?.endTime}`,
                            dayOrDate: item.day,
                            room: item.roomName,
                            facultyOrSetter: item.facultyName,
                            slotType: item.slotType,
                            duration: item.durationHours,
                          });
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center justify-between ${
                          item.slotType === 'Lab'
                            ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : item.slotType === 'Tutorial'
                            ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                        title={`${item.subjectCode} - ${item.subjectName} (${item.roomName})`}
                      >
                        <span className="truncate">{item.subjectCode}</span>
                        <span className="text-[9px] opacity-75 ml-1">{item.roomName}</span>
                      </div>
                    ))}

                    {dayClasses.length > 2 && (
                      <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                        +{dayClasses.length - 2} more classes
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 2: WEEK TIMETABLE CALENDAR GRID
         ========================================================================= */}
      {viewMode === 'week' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header Row: Days of the week */}
            <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs font-bold">
              <div className="p-3 text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-center">
                Time Slot
              </div>
              {weekDays.map((w, idx) => (
                <div
                  key={idx}
                  className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                    w.isToday ? 'bg-indigo-50/60 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="font-bold">{w.dayName}</div>
                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{w.formatted}</div>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {TIME_SLOTS.map((slot, slotIdx) => (
                <div key={slot.index} className="grid grid-cols-6 min-h-[85px]">
                  {/* Time Label Column */}
                  <div className="p-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-center text-center">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{slot.startTime}</span>
                    <span className="text-[10px] text-slate-500">{slot.endTime}</span>
                  </div>

                  {/* 5 Day Cells for this Time Slot */}
                  {DAYS_OF_WEEK.map((dayName, dayIdx) => {
                    // Check if entry starts at this slot
                    const entry = filteredSchedule.find(
                      (e) => e.day === dayName && e.slotIndex === slotIdx
                    );

                    // Check if this slot is covered by an ongoing multi-hour lab from previous slot
                    const isCoveredByPrevious = filteredSchedule.some(
                      (e) => e.day === dayName && e.slotIndex < slotIdx && e.slotIndex + e.durationHours > slotIdx
                    );

                    if (isCoveredByPrevious) {
                      return null; // Multi-hour lab span continuation
                    }

                    return (
                      <div
                        key={dayIdx}
                        className={`p-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 flex flex-col ${
                          entry && entry.durationHours === 2 ? 'row-span-2' : ''
                        }`}
                      >
                        {entry ? (
                          <div
                            onClick={() => {
                              setActiveEvent({
                                type: 'class',
                                title: entry.subjectName,
                                code: entry.subjectCode,
                                time: `${slot.startTime} - ${TIME_SLOTS[entry.slotIndex + entry.durationHours - 1]?.endTime}`,
                                dayOrDate: entry.day,
                                room: entry.roomName,
                                facultyOrSetter: entry.facultyName,
                                slotType: entry.slotType,
                                duration: entry.durationHours,
                              });
                            }}
                            className={`w-full h-full p-2 rounded-xl text-left cursor-pointer transition hover:shadow-md flex flex-col justify-between ${
                              entry.slotType === 'Lab'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                                : entry.slotType === 'Tutorial'
                                ? 'bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                                : 'bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs">{entry.subjectCode}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold bg-white/80 dark:bg-black/30">
                                  {entry.slotType}
                                </span>
                              </div>
                              <p className="text-[11px] font-medium leading-tight mt-1 line-clamp-2">
                                {entry.subjectName}
                              </p>
                            </div>
                            <div className="mt-2 pt-1 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px] opacity-85">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" /> {entry.roomName}
                              </span>
                              <span className="truncate max-w-[90px]">{entry.facultyName.split(' ')[1] || entry.facultyName}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full rounded-lg border border-dashed border-slate-100 dark:border-slate-800 flex items-center justify-center opacity-30 text-[10px] text-slate-400">
                            Free Slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW MODE 3: DAILY AGENDA TIMETABLE VIEW
         ========================================================================= */}
      {viewMode === 'day' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Day Timetable Timeline (2 Columns) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Schedule for {selectedDayName ? `${selectedDayName}` : 'Weekend'}
                </h4>
                <p className="text-xs text-slate-500">
                  {selectedBranch} • Semester {selectedSemester} ({selectedSection})
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {dayScheduleEntries.length} Scheduled Classes
              </span>
            </div>

            {/* Exams Scheduled for this specific date */}
            {dayExamEntries.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 px-1">
                  Examination Alerts For Today
                </h5>
                {dayExamEntries.map((ex) => (
                  <div
                    key={ex.id}
                    className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                        📝
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-purple-950 dark:text-purple-200">
                            {ex.subjectCode} • {ex.subjectName}
                          </span>
                        </div>
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-0.5">
                          Timing: {ex.timeRange} | Halls: {ex.hallIds.join(', ')} | Cohort: {ex.totalEnrolled} Students
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Daily Classes Stream */}
            {dayScheduleEntries.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
                <CalendarIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800 dark:text-slate-200">
                  No Classes Scheduled
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No academic lectures or laboratories are slotted for {selectedDayName || 'this date'}. Use this time for research, office hours, or project work.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayScheduleEntries.map((entry) => {
                  const startSlot = TIME_SLOTS[entry.slotIndex];
                  const endSlot = TIME_SLOTS[entry.slotIndex + entry.durationHours - 1];
                  const timeLabel = `${startSlot?.startTime} – ${endSlot?.endTime}`;

                  return (
                    <div
                      key={entry.id}
                      onClick={() => {
                        setActiveEvent({
                          type: 'class',
                          title: entry.subjectName,
                          code: entry.subjectCode,
                          time: timeLabel,
                          dayOrDate: entry.day,
                          room: entry.roomName,
                          facultyOrSetter: entry.facultyName,
                          slotType: entry.slotType,
                          duration: entry.durationHours,
                        });
                      }}
                      className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                            entry.slotType === 'Lab'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : entry.slotType === 'Tutorial'
                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                              : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {entry.slotType === 'Lab' ? 'LAB' : entry.slotType === 'Tutorial' ? 'TUT' : 'LEC'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {entry.subjectCode}: {entry.subjectName}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {entry.durationHours} Hr{entry.durationHours > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-indigo-500" /> {entry.facultyName}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Room {entry.roomName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {timeLabel}
                        </span>
                        <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                          Click to inspect
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Date Jumper & Summary Sidebar */}
          <div className="space-y-4">
            {/* Quick Mini Calendar / Date Selector */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Quick Day Jumper
              </h4>
              <div className="grid grid-cols-5 gap-1.5 text-center">
                {DAYS_OF_WEEK.map((dayName, idx) => {
                  const isCurrentSelected = selectedDayName === dayName;
                  const classesForThisDay = filteredSchedule.filter((e) => e.day === dayName).length;

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        // Find date for this day of week
                        const curr = new Date(currentDate);
                        const day = curr.getDay();
                        const diff = curr.getDate() - day + (day === 0 ? -6 : 1) + idx;
                        const target = new Date(curr.setDate(diff));
                        setSelectedDayDate(target);
                      }}
                      className={`p-2 rounded-xl text-xs flex flex-col items-center justify-center transition ${
                        isCurrentSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="font-semibold">{dayName.substring(0, 3)}</span>
                      <span className="text-[10px] opacity-80 mt-0.5">{classesForThisDay} L</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Academic Semester Milestones Card */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Academic Milestones
                </h4>
              </div>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Commencement of Classes</strong>
                    <p className="text-[11px] text-slate-500">August 24, 2026</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">Mid-Term Lab Evaluations</strong>
                    <p className="text-[11px] text-slate-500">September 21 - 25, 2026</p>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></span>
                  <div>
                    <strong className="text-slate-800 dark:text-slate-200">End-Term Theory Exams</strong>
                    <p className="text-[11px] text-slate-500">October 12 - 24, 2026</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          EVENT DETAIL MODAL INSPECTOR
         ========================================================================= */}
      <AnimatePresence>
        {activeEvent && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setActiveEvent(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              {/* Modal Header */}
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                    {activeEvent.type === 'exam' ? '📝' : '📖'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight text-white">
                      {activeEvent.code}
                    </h3>
                    <p className="text-xs text-indigo-200">{activeEvent.slotType || 'Academic Event'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveEvent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4 text-xs">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeEvent.title}
                  </h4>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedBranch} • Semester {selectedSemester} ({selectedSection})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Timing</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeEvent.time}</p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Room / Hall</span>
                    <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{activeEvent.room}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">
                      {activeEvent.type === 'exam' ? 'Exam In-Charge / Setter' : 'Assigned Professor'}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeEvent.facultyOrSetter}</p>
                  </div>
                </div>

                {activeEvent.details && (
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200">
                    {activeEvent.details}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setActiveEvent(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      handleCalendarExport();
                      setActiveEvent(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 transition active:scale-95 shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .ics</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
