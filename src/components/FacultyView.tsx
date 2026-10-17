import React, { useState } from 'react';
import { Faculty, InvigilationDuty, LeaveSwapRequest, ScheduleEntry, TIME_SLOTS, DAYS_OF_WEEK, DayOfWeek } from '../types';
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  ArrowRightLeft, 
  CheckCircle2, 
  Mail, 
  Award,
  Sparkles,
  Send,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FacultyViewProps {
  facultyList: Faculty[];
  schedule: ScheduleEntry[];
  invigilationDuties: InvigilationDuty[];
  onAddSwapRequest: (req: LeaveSwapRequest) => void;
  activeFacultyId?: string;
}

export const FacultyView: React.FC<FacultyViewProps> = ({
  facultyList,
  schedule,
  invigilationDuties,
  onAddSwapRequest,
  activeFacultyId,
}) => {
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    activeFacultyId || facultyList[0]?.id || 'fac-pravin'
  );

  React.useEffect(() => {
    if (activeFacultyId) {
      setSelectedFacultyId(activeFacultyId);
    }
  }, [activeFacultyId]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapEntry, setSwapEntry] = useState<ScheduleEntry | null>(null);
  const [targetFacultyId, setTargetFacultyId] = useState<string>('');
  const [swapReason, setSwapReason] = useState<string>('Attending Department Research Review Committee');

  const currentFaculty = facultyList.find((f) => f.id === selectedFacultyId) || facultyList[0];

  // Faculty's personal timetable
  const facultySchedule = schedule.filter((e) => e.facultyId === currentFaculty.id);

  // Faculty's invigilation duties
  const myDuties = invigilationDuties.filter((d) => d.facultyId === currentFaculty.id);

  // Calculate total active teaching hours
  const totalWeeklyTeachingHours = facultySchedule.reduce((acc, curr) => acc + curr.durationHours, 0);

  // Eligible substitute faculty in the same department
  const peerFaculty = facultyList.filter(
    (f) => f.department === currentFaculty.department && f.id !== currentFaculty.id
  );

  const handleCreateSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapEntry) return;

    const targetFac = facultyList.find((f) => f.id === targetFacultyId);

    onAddSwapRequest({
      id: `swap-${Date.now()}`,
      facultyId: currentFaculty.id,
      facultyName: currentFaculty.name,
      dateOrDay: swapEntry.day,
      slotTime: `${TIME_SLOTS[swapEntry.slotIndex]?.startTime} - ${TIME_SLOTS[swapEntry.slotIndex + swapEntry.durationHours - 1]?.endTime}`,
      originalSubject: `${swapEntry.subjectCode}: ${swapEntry.subjectName}`,
      originalRoom: swapEntry.roomName,
      targetFacultyId: targetFac?.id,
      targetFacultyName: targetFac?.name || 'Department Pool',
      status: 'PENDING',
      reason: swapReason,
      createdAt: 'Just now',
    });

    setShowSwapModal(false);
    alert(`Swap & Substitute request submitted to Dean Academics queue for ${swapEntry.subjectCode}!`);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Faculty Selector */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentFaculty.avatarColor || 'from-indigo-600 to-blue-700'} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
            {currentFaculty.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {currentFaculty.name}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {currentFaculty.designation}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Department of {currentFaculty.department} • USICT GGSIPU Dwarka
            </p>
          </div>
        </div>

        {/* Switch Faculty Member Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">View As:</span>
          <select
            value={selectedFacultyId}
            onChange={(e) => setSelectedFacultyId(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Weekly Teaching Load</span>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {totalWeeklyTeachingHours} / {currentFaculty.maxHoursPerWeek} Hours
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Exam Invigilation Duties</span>
            <p className="text-base font-bold text-slate-900 dark:text-white">
              {myDuties.length} Sessions Assigned
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500">Specialization Domain</span>
            <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
              {currentFaculty.specialization}
            </p>
          </div>
        </div>
      </div>

      {/* Faculty's Weekly Schedule Grid */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-500" />
            <span>Personal Weekly Teaching Timetable</span>
          </h3>
          <span className="text-xs text-slate-500">
            Click any lecture to request a 1-click slot swap or substitute
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <th className="p-3 w-28 text-center border-r border-slate-200 dark:border-slate-800">Day</th>
                {TIME_SLOTS.map((slot) => (
                  <th
                    key={slot.index}
                    className={`p-2.5 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                      slot.isLunch ? 'bg-amber-500/10 text-amber-700' : ''
                    }`}
                  >
                    <div>{slot.startTime}</div>
                    <div className="text-[10px] font-normal text-slate-400">
                      {slot.isLunch ? 'LUNCH' : `Slot ${slot.index + 1}`}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS_OF_WEEK.map((day) => {
                const dayEntries = facultySchedule.filter((e) => e.day === day);

                return (
                  <tr
                    key={day}
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition"
                  >
                    <td className="p-3 text-center font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800">
                      {day}
                    </td>

                    {TIME_SLOTS.map((slot) => {
                      const coveredByPrevLab = dayEntries.find(
                        (e) => e.slotIndex === slot.index - 1 && e.durationHours === 2
                      );
                      if (coveredByPrevLab) return null;

                      const entry = dayEntries.find((e) => e.slotIndex === slot.index);

                      if (slot.isLunch && !entry) {
                        return (
                          <td key={slot.index} className="p-2 border-r border-slate-200 dark:border-slate-800 bg-amber-500/5 text-center text-[10px] text-amber-600/80">
                            Recess
                          </td>
                        );
                      }

                      return (
                        <td
                          key={slot.index}
                          colSpan={entry?.durationHours === 2 ? 2 : 1}
                          className="p-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top"
                        >
                          {entry ? (
                            <div
                              onClick={() => {
                                setSwapEntry(entry);
                                setShowSwapModal(true);
                              }}
                              className="p-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 hover:border-indigo-500 cursor-pointer transition shadow-xs group"
                            >
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className="font-bold text-indigo-700 dark:text-indigo-300">
                                  {entry.subjectCode}
                                </span>
                                <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-semibold">
                                  {entry.branch} S{entry.semester}
                                </span>
                              </div>
                              <p className="font-semibold text-slate-900 dark:text-white line-clamp-1 text-[11px]">
                                {entry.subjectName}
                              </p>
                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                                <span>{entry.roomName}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                                  Swap →
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="h-14 rounded-xl border border-slate-100 dark:border-slate-800/40"></div>
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

      {/* Faculty's Invigilation Duties Card */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>My Assigned Examination Supervision Duties</span>
        </h3>

        {myDuties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myDuties.map((duty) => (
              <div
                key={duty.id}
                className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>{duty.date} • {duty.session}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px]">
                    Confirmed
                  </span>
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Venue: <strong className="text-slate-900 dark:text-white">{duty.hallName}</strong> ({duty.totalStudentsAssigned} Candidates)
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500">No invigilation duties scheduled for this session.</p>
        )}
      </div>

      {/* 1-Click Request Leave / Swap Slot Modal */}
      <AnimatePresence>
        {showSwapModal && swapEntry && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowSwapModal(false)}
            />
            <motion.form
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onSubmit={handleCreateSwap}
              className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Request Lecture Swap / Substitute
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white">
                  {swapEntry.subjectCode}: {swapEntry.subjectName}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  Scheduled on <strong>{swapEntry.day}</strong> in <strong>{swapEntry.roomName}</strong> for {swapEntry.branch} Sem {swapEntry.semester}.
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Select Department Peer / Substitute:
                  </label>
                  <select
                    value={targetFacultyId}
                    onChange={(e) => setTargetFacultyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  >
                    <option value="">Any Available Faculty (Department Pool)</option>
                    {peerFaculty.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Reason for Rescheduling / Leave:
                  </label>
                  <textarea
                    rows={3}
                    value={swapReason}
                    onChange={(e) => setSwapReason(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSwapModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Dean Academics</span>
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
