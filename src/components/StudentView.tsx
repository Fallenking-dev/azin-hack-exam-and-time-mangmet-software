import React, { useState } from 'react';
import { 
  Program, 
  Semester, 
  Section, 
  ScheduleEntry, 
  Exam, 
  Room, 
  TIME_SLOTS, 
  DAYS_OF_WEEK, 
  DayOfWeek 
} from '../types';
import { 
  GraduationCap, 
  Clock, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Compass, 
  Sparkles, 
  BookOpen, 
  User, 
  Bell 
} from 'lucide-react';
import { exportSem1DatesheetPDF } from '../utils/exportUtils';

interface StudentViewProps {
  schedule: ScheduleEntry[];
  exams: Exam[];
  rooms: Room[];
  onExportICS: () => void;
  initialBranch?: Program;
  initialSemester?: Semester;
  initialSection?: Section;
  initialRoll?: string;
  studentName?: string;
}

export const StudentView: React.FC<StudentViewProps> = ({
  schedule,
  exams,
  rooms,
  onExportICS,
  initialBranch = 'CSE',
  initialSemester = 1,
  initialSection = 'Sec-A',
  initialRoll = '02116403222',
  studentName = 'Arjun Sharma',
}) => {
  const [selectedBranch, setSelectedBranch] = useState<Program>(initialBranch);
  const [selectedSemester, setSelectedSemester] = useState<Semester>(initialSemester);
  const [selectedSection, setSelectedSection] = useState<Section>(initialSection);
  const [studentRoll, setStudentRoll] = useState<string>(initialRoll);

  React.useEffect(() => {
    if (initialBranch) setSelectedBranch(initialBranch);
    if (initialSemester) setSelectedSemester(initialSemester);
    if (initialSection) setSelectedSection(initialSection);
    if (initialRoll) setStudentRoll(initialRoll);
  }, [initialBranch, initialSemester, initialSection, initialRoll]);
  const [simulatedDay, setSimulatedDay] = useState<DayOfWeek>('Monday');
  const [simulatedSlotIndex, setSimulatedSlotIndex] = useState<number>(1); // 10:00 AM

  // Filter schedule for this student batch
  const mySchedule = schedule.filter(
    (e) => e.branch === selectedBranch && e.semester === selectedSemester && e.section === selectedSection
  );

  // Active / Ongoing Lecture
  const ongoingLecture = mySchedule.find(
    (e) => e.day === simulatedDay && e.slotIndex <= simulatedSlotIndex && (e.slotIndex + e.durationHours) > simulatedSlotIndex
  );

  // Next Lecture
  const nextLecture = mySchedule.find(
    (e) => e.day === simulatedDay && e.slotIndex > simulatedSlotIndex
  );

  // Find Exam Details for this batch
  const myExams = exams.filter((e) => e.branch === selectedBranch && e.semester === selectedSemester);

  return (
    <div className="space-y-4">
      {/* Top Banner with Student Identifier & Batch Selectors */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                USICT Student Portal
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Dwarka Campus
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live timetable, walking guidance, and exam hall admit desk lookup
            </p>
          </div>
        </div>

        {/* Batch Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value as Program)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="CSE">B.Tech CSE</option>
            <option value="IT">B.Tech IT</option>
            <option value="ECE">B.Tech ECE</option>
            <option value="AI-DS">B.Tech AI-DS</option>
            <option value="AI-ML">B.Tech AI-ML</option>
            <option value="Dual-Degree">Dual Degree</option>
            <option value="MCA">MCA</option>
          </select>

          <select
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(Number(e.target.value) as Semester)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>
                Sem {s}
              </option>
            ))}
          </select>

          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value as Section)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="Sec-A">Sec-A</option>
            <option value="Sec-B">Sec-B</option>
            <option value="Sec-C">Sec-C</option>
          </select>
        </div>
      </div>

      {/* Live "Happening Right Now" & "Next Lecture" Radar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Happening Right Now Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white p-5 rounded-3xl shadow-lg border border-indigo-700/40 relative overflow-hidden flex flex-col justify-between min-h-[170px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Clock className="w-28 h-28" />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Happening Right Now ({simulatedDay} 10:00 AM)
              </span>
            </div>

            {ongoingLecture ? (
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">
                  {ongoingLecture.subjectCode}: {ongoingLecture.subjectName}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 pt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-300" />
                    {ongoingLecture.facultyName}
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-white">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                    {ongoingLecture.roomName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">
                    {ongoingLecture.slotType} ({ongoingLecture.durationHours} hr)
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-indigo-200">
                No active class scheduled at this hour. You can use Central Library or C-Block Study Lounge.
              </p>
            )}
          </div>

          {/* Time simulation pill */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-300">
            <span>Simulate Time Slot:</span>
            <select
              value={simulatedSlotIndex}
              onChange={(e) => setSimulatedSlotIndex(Number(e.target.value))}
              className="bg-white/10 text-white rounded-lg px-2 py-1 outline-none text-xs"
            >
              {TIME_SLOTS.map((t) => (
                <option key={t.index} value={t.index} className="text-slate-900">
                  {t.startTime} - {t.endTime}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Next Lecture & Campus Wayfinding Guidance */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Next Upcoming Lecture & Walking Navigation</span>
            </div>

            {nextLecture ? (
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {nextLecture.subjectCode}: {nextLecture.subjectName}
                </h3>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span>Starts at {TIME_SLOTS[nextLecture.slotIndex]?.startTime}</span>
                  <span>•</span>
                  <span>Venue: <strong>{nextLecture.roomName}</strong></span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 mt-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>
                    Navigation Guide: Proceed to <strong>{nextLecture.roomName.includes('E-') ? 'E-Block (Main Academic Tower)' : 'C-Block Computing Wing'}</strong>.
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">
                You have completed all scheduled classes for {simulatedDay}!
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">Sync with Phone:</span>
            <button
              onClick={onExportICS}
              className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Add to Apple / Google Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student's Exam Admit Card / Seating Desk Lookup Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Semester {selectedSemester} Examination Datesheet & Admit Slips
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified GGSIPU schedules with anti-cheating seating allocation
            </p>
          </div>

          {/* Quick PDF Download Action Group */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => exportSem1DatesheetPDF(exams, 'Minor 1', selectedBranch, selectedSemester)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              title="Download Minor 1 Date Sheet PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Minor 1 PDF</span>
            </button>
            <button
              onClick={() => exportSem1DatesheetPDF(exams, 'Minor 2', selectedBranch, selectedSemester)}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              title="Download Minor 2 Date Sheet PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Minor 2 PDF</span>
            </button>
            <button
              onClick={() => exportSem1DatesheetPDF(exams, 'End Sem', selectedBranch, selectedSemester)}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
              title="Download End Sem Date Sheet PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>End Sem PDF</span>
            </button>
            <button
              onClick={() => exportSem1DatesheetPDF(exams, 'ALL', selectedBranch, selectedSemester)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Download Complete Semester 1 Datesheet PDF"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>All Cycles PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {myExams.map((exam) => (
            <div
              key={exam.id}
              className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                  {exam.subjectCode}
                </span>
                <span className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                  {exam.date} • {exam.session}
                </span>
              </div>
              <p className="font-semibold text-slate-900 dark:text-white">{exam.subjectName}</p>
              <div className="flex items-center justify-between text-slate-500 pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                <span>Allocated Hall:</span>
                <strong className="text-slate-900 dark:text-white">
                  {rooms.find((r) => r.id === exam.hallIds[0])?.name || 'Central Exam Hall A'}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
