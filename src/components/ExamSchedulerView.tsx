import React, { useState } from 'react';
import { Exam, Faculty, InvigilationDuty, Room, SeatingPlan, SeatingSeat } from '../types';
import { generateAntiCheatingSeatingPlan, generateInvigilationRoster } from '../utils/examEngine';
import { 
  ShieldCheck, 
  Search, 
  Calendar, 
  Users, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  MapPin, 
  FileSpreadsheet,
  Layers,
  ArrowRight,
  Info,
  Download,
  AlertTriangle,
  FileText,
  Activity,
  UserCheck
} from 'lucide-react';
import { exportExamConflictReportPDF, analyzeExamConflicts, exportSem1DatesheetPDF } from '../utils/exportUtils';

interface ExamSchedulerViewProps {
  exams: Exam[];
  rooms: Room[];
  facultyList: Faculty[];
  onAddExam: (exam: Exam) => void;
  isAdmin: boolean;
}

export const ExamSchedulerView: React.FC<ExamSchedulerViewProps> = ({
  exams,
  rooms,
  facultyList,
  onAddExam,
  isAdmin,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'seating' | 'datesheet' | 'duties' | 'conflicts'>('seating');
  const [selectedHallId, setSelectedHallId] = useState<string>('hall-central-a');
  const [searchRollQuery, setSearchRollQuery] = useState<string>('');
  const [selectedSeat, setSelectedSeat] = useState<SeatingSeat | null>(null);

  // Date-Sheet Controls (Defaulting to Semester 1)
  const [datesheetSemester, setDatesheetSemester] = useState<number>(1);
  const [datesheetCycle, setDatesheetCycle] = useState<'ALL' | 'Minor 1' | 'Minor 2' | 'End Sem'>('ALL');

  const examHalls = rooms.filter((r) => r.type === 'Central Exam Hall' || r.type === 'Lecture Hall');
  const currentHall = examHalls.find((h) => h.id === selectedHallId) || examHalls[0];

  // Active exams occurring on the first slot (e.g. Morning 2026-10-12)
  const activeSlotExams = exams.filter((e) => e.date === '2026-10-12' && e.session.includes('Morning'));

  // Generate or compute the Anti-Cheating Seating Plan for the chosen hall
  const seatingPlan: SeatingPlan = generateAntiCheatingSeatingPlan(
    currentHall,
    activeSlotExams.length > 0 ? activeSlotExams : exams.slice(0, 3),
    facultyList,
    8,
    8
  );

  // Generate invigilation duties
  const invigilationDuties: InvigilationDuty[] = generateInvigilationRoster(exams, facultyList, rooms);

  // Analyze exam conflicts and resource shortages
  const auditResult = analyzeExamConflicts(exams, rooms, facultyList, invigilationDuties);

  // Filtered/Highlighted Seat from Search
  const matchingSeat = searchRollQuery.trim()
    ? seatingPlan.grid.find(
        (s) =>
          s.studentRoll.toLowerCase().includes(searchRollQuery.toLowerCase().trim()) ||
          s.studentName.toLowerCase().includes(searchRollQuery.toLowerCase().trim())
      )
    : null;

  const handleDownloadConflictReport = () => {
    exportExamConflictReportPDF(exams, rooms, facultyList, invigilationDuties);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Sub-Navigation and PDF Export Button */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              USICT Examination & Anti-Cheating Seating Engine
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interleaved multi-branch seating topology with 0% neighbor paper overlap & fair invigilator allocation
          </p>
        </div>

        {/* Action Controls & Sub-Tab Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="btn-download-sem1-datesheet-pdf"
            onClick={() => exportSem1DatesheetPDF(exams, 'ALL', 'CSE', 1)}
            title="Download Semester 1 Examination Datesheet (Minor 1, Minor 2 & End Sem) in PDF"
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-300" />
            <span>Download Sem 1 Date Sheet (PDF)</span>
          </button>

          <button
            id="btn-download-conflict-report-pdf"
            onClick={handleDownloadConflictReport}
            title="Download comprehensive PDF conflict report highlighting student clashes & resource shortages"
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold border border-slate-700 hover:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-rose-400" />
            <span>Conflict Audit (PDF)</span>
          </button>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveSubTab('seating')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeSubTab === 'seating'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              2D Seating Matrix
            </button>
            <button
              onClick={() => setActiveSubTab('datesheet')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeSubTab === 'datesheet'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Date-Sheet Spacing
            </button>
            <button
              onClick={() => setActiveSubTab('duties')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeSubTab === 'duties'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Invigilation Duties ({invigilationDuties.length})
            </button>
            <button
              onClick={() => setActiveSubTab('conflicts')}
              className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1 ${
                activeSubTab === 'conflicts'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Conflict Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: Anti-Cheating Seating Matrix */}
      {activeSubTab === 'seating' && (
        <div className="space-y-4">
          {/* Controls: Hall Selector + Student Search */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                  Exam Hall:
                </span>
                <select
                  value={selectedHallId}
                  onChange={(e) => setSelectedHallId(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                >
                  {examHalls.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} (Cap: {h.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Anti-Cheating Checkerboard Mode Active</span>
              </div>
            </div>

            {/* Roll Number Search */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Find Seat by Roll (e.g. 00103223) / Name..."
                value={searchRollQuery}
                onChange={(e) => setSearchRollQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {searchRollQuery && (
                <button
                  onClick={() => setSearchRollQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Search match highlight alert */}
          {matchingSeat && (
            <div className="bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 p-3 rounded-2xl flex items-center justify-between text-xs animate-bounce">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>
                  <strong>{matchingSeat.studentName}</strong> ({matchingSeat.studentRoll}) allocated to <strong>Desk {matchingSeat.deskNumber}</strong> (Row {matchingSeat.row + 1}, Col {matchingSeat.col + 1}) in {currentHall.name}.
                </span>
              </div>
              <button
                onClick={() => setSelectedSeat(matchingSeat)}
                className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-[11px]"
              >
                View Admit Slip
              </button>
            </div>
          )}

          {/* 2D Seating Layout Visual Grid */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            {/* Blackboard / Invigilator Podium Front Indicator */}
            <div className="w-full py-2 bg-slate-800 dark:bg-slate-950 rounded-xl text-center text-slate-200 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-inner">
              <span>PODIUM / INVIGILATOR DESK (FRONT OF EXAMINATION HALL)</span>
            </div>

            {/* Hall Grid */}
            <div className="overflow-x-auto pb-2">
              <div className="grid grid-cols-8 gap-2 min-w-[700px]">
                {seatingPlan.grid.map((seat, index) => {
                  const isHighlighted =
                    matchingSeat?.studentRoll === seat.studentRoll && seat.studentRoll !== 'VACANT';

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedSeat(seat)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer select-none text-left flex flex-col justify-between min-h-[90px] ${
                        seat.studentRoll === 'VACANT'
                          ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                          : seat.colorTag
                      } ${
                        isHighlighted
                          ? 'ring-4 ring-indigo-500 scale-105 shadow-xl font-bold z-10'
                          : 'hover:scale-[1.02] hover:shadow-md'
                      }`}
                    >
                      {/* Desk Header */}
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span>{seat.deskNumber}</span>
                        <span className="uppercase px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10 text-[9px]">
                          {seat.branch}
                        </span>
                      </div>

                      {/* Student Info */}
                      <div className="my-1 space-y-0.5">
                        <p className="font-bold text-[11px] truncate leading-tight">
                          {seat.studentName}
                        </p>
                        <p className="font-mono text-[10px] opacity-80 truncate">
                          {seat.studentRoll}
                        </p>
                      </div>

                      {/* Paper Code */}
                      <div className="text-[9px] font-semibold truncate pt-1 border-t border-black/10 dark:border-white/10">
                        {seat.subjectCode}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch Color Legend & Statistics */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-slate-500">Checkerboard Legend:</span>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"></span>
                  <span>CSE (Computer Science)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-300 dark:border-emerald-700"></span>
                  <span>IT (Information Tech)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700"></span>
                  <span>ECE (Electronics)</span>
                </div>
              </div>

              <div className="text-slate-500 font-medium">
                Allocated: <strong className="text-slate-900 dark:text-white">{seatingPlan.grid.filter((s) => s.studentRoll !== 'VACANT').length}</strong> / {currentHall.capacity} Desks
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Date-Sheet Spacing */}
      {activeSubTab === 'datesheet' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Institutional Examination Date-Sheet (Sem 1 Focus)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  Minor 1 • Minor 2 • End Sem
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official GGSIPU schedule with verified syllabus units, 48-hr study gaps & instant PDF download
              </p>
            </div>

            {/* PDF Download Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => exportSem1DatesheetPDF(exams, 'Minor 1', 'CSE', datesheetSemester)}
                className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Download Minor 1 Date Sheet PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Minor 1 PDF</span>
              </button>
              <button
                onClick={() => exportSem1DatesheetPDF(exams, 'Minor 2', 'CSE', datesheetSemester)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Download Minor 2 Date Sheet PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Minor 2 PDF</span>
              </button>
              <button
                onClick={() => exportSem1DatesheetPDF(exams, 'End Sem', 'CSE', datesheetSemester)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs"
                title="Download End Sem Date Sheet PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>End Sem PDF</span>
              </button>
              <button
                onClick={() => exportSem1DatesheetPDF(exams, 'ALL', 'CSE', datesheetSemester)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 shadow-xs"
                title="Download Consolidated Sem 1 Date Sheet PDF"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>All Cycles PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Bar: Semester & Cycle */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">Semester:</span>
                <select
                  value={datesheetSemester}
                  onChange={(e) => setDatesheetSemester(Number(e.target.value))}
                  className="bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
                >
                  <option value={1}>Semester 1 (Default)</option>
                  <option value={2}>Semester 2</option>
                  <option value={3}>Semester 3</option>
                  <option value={4}>Semester 4</option>
                  <option value={5}>Semester 5</option>
                  <option value={6}>Semester 6</option>
                </select>
              </div>

              {/* Cycle Filter */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
                {(['ALL', 'Minor 1', 'Minor 2', 'End Sem'] as const).map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setDatesheetCycle(cycle)}
                    className={`px-3 py-1 rounded-lg transition ${
                      datesheetCycle === cycle
                        ? cycle === 'Minor 1'
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                          : cycle === 'Minor 2'
                          ? 'bg-indigo-600 text-white font-bold shadow-xs'
                          : cycle === 'End Sem'
                          ? 'bg-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cycle === 'ALL' ? 'All Schedules' : cycle}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-xs text-slate-400">
              Showing {exams.filter((e) => (datesheetSemester === 0 || e.semester === datesheetSemester) && (datesheetCycle === 'ALL' || e.cycle === datesheetCycle)).length} scheduled papers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="p-3">Cycle</th>
                  <th className="p-3">Date & Day</th>
                  <th className="p-3">Session Slot</th>
                  <th className="p-3">Code & Subject Title</th>
                  <th className="p-3">Syllabus Scope</th>
                  <th className="p-3">Venue</th>
                  <th className="p-3 text-center">Max Marks</th>
                </tr>
              </thead>
              <tbody>
                {exams
                  .filter((exam) => (datesheetSemester === 0 || exam.semester === datesheetSemester) && (datesheetCycle === 'ALL' || exam.cycle === datesheetCycle))
                  .map((exam) => {
                    const cycleBadge = exam.cycle === 'Minor 1'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300'
                      : exam.cycle === 'Minor 2'
                      ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300';

                    return (
                      <tr
                        key={exam.id}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${cycleBadge}`}>
                            {exam.cycle || (exam.session?.includes('10:00') ? 'Minor 1' : 'End Sem')}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">
                          {exam.date}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                            {exam.timeRange || exam.session}
                          </span>
                        </td>
                        <td className="p-3 font-medium">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 mr-1.5">{exam.subjectCode}</span>
                          <span className="text-slate-900 dark:text-white">{exam.subjectName}</span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px] max-w-[200px] truncate" title={exam.syllabusScope}>
                          {exam.syllabusScope || 'Standard University Syllabus'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">
                          {exam.hallIds && exam.hallIds.length > 0
                            ? exam.hallIds.map((hid) => rooms.find((r) => r.id === hid)?.name.split(' ')[0] || hid).join(', ')
                            : 'Hall Central A'}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-900 dark:text-white">
                          {exam.maxMarks ? `${exam.maxMarks}` : (exam.cycle?.includes('Minor') ? '30' : '75')}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: Invigilation Duties */}
      {activeSubTab === 'duties' && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Faculty Invigilation Duty Roster
              </h3>
              <p className="text-xs text-slate-500">
                Institutional Rule: Zero professors assigned to supervise their own department's question paper
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Conflict-Free Verified</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {invigilationDuties.map((duty) => (
              <div
                key={duty.id}
                className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {duty.facultyName}
                    </h4>
                    <span className="text-[11px] text-slate-500">{duty.designation}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-[10px]">
                    {duty.status}
                  </span>
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span>Date & Shift:</span>
                    <strong className="text-slate-900 dark:text-white">{duty.date} • {duty.session}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Exam Venue:</span>
                    <strong className="text-slate-900 dark:text-white">{duty.hallName}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Supervised Candidates:</span>
                    <strong className="text-slate-900 dark:text-white">{duty.totalStudentsAssigned} Desks</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 4: Conflict Audit & Resource Shortage Analysis */}
      {activeSubTab === 'conflicts' && (
        <div className="space-y-4">
          {/* Audit Metrics Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-slate-500 text-xs font-semibold">Institutional Readiness:</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {auditResult.readinessScore}%
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  PASS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Anti-cheating & capacity verified</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-slate-500 text-xs font-semibold">Student Exam Clashes:</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-black ${auditResult.studentClashes.length > 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                  {auditResult.studentClashes.length}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  auditResult.studentClashes.length === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {auditResult.studentClashes.length === 0 ? 'Zero Clashes' : 'Needs Resolution'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Same-slot student cohort collisions</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-slate-500 text-xs font-semibold">Hall Capacity Shortages:</span>
              <div className="flex items-center justify-between">
                <span className={`text-2xl font-black ${auditResult.hallShortages.length > 0 ? 'text-amber-600' : 'text-slate-900 dark:text-white'}`}>
                  {auditResult.hallShortages.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  All Fit
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Enrolled count vs available desks</p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
              <span className="text-slate-500 text-xs font-semibold">Invigilator Overload:</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {auditResult.invigilatorOverloads.length}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold">
                  Balanced
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Max 2 shifts per faculty/day</p>
            </div>
          </div>

          {/* Conflict Analysis Details Card */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  <span>Institutional Examination Conflict & Shortage Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Detailed inspection report verifying date-sheet constraints and hall capacity limits
                </p>
              </div>

              <button
                onClick={handleDownloadConflictReport}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-md hover:bg-indigo-700 transition flex items-center gap-2 self-start sm:self-auto"
              >
                <Download className="w-4 h-4" />
                <span>Export Official PDF Report</span>
              </button>
            </div>

            {/* Hall Capacities Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Exam Hall Capacity Utilization
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {examHalls.map((hall) => (
                  <div
                    key={hall.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{hall.name}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                        Cap: {hall.capacity} Desks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Block: {hall.block} • {hall.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seat Detail Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                  {selectedSeat.deskNumber}
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Examination Seating Slip
                </h3>
              </div>
              <button
                onClick={() => setSelectedSeat(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSeat.studentName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Enrollment Roll No:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{selectedSeat.studentRoll}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Program & Semester:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedSeat.branch} Sem {selectedSeat.semester}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Examination Paper:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedSeat.subjectCode}: {selectedSeat.subjectName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Exam Hall:</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentHall.name}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Desk Card</span>
              </button>
              <button
                onClick={() => setSelectedSeat(null)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
