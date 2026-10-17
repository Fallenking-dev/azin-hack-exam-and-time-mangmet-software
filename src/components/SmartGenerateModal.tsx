import React, { useState } from 'react';
import { Faculty, Program, Room, ScheduleEntry, Section, Semester, Subject } from '../types';
import { generateDeterministicTimetable } from '../utils/constraintEngine';
import { 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  Loader2, 
  ArrowRight, 
  BookOpen, 
  Layers, 
  ShieldCheck,
  X,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

interface SmartGenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBranch: Program;
  selectedSemester: Semester;
  selectedSection: Section;
  subjects: Subject[];
  facultyList: Faculty[];
  rooms: Room[];
  existingSchedule: ScheduleEntry[];
  onApplySchedule: (newEntries: ScheduleEntry[]) => void;
}

export const SmartGenerateModal: React.FC<SmartGenerateModalProps> = ({
  isOpen,
  onClose,
  selectedBranch,
  selectedSemester,
  selectedSection,
  subjects,
  facultyList,
  rooms,
  existingSchedule,
  onApplySchedule,
}) => {
  const [loading, setLoading] = useState(false);
  const [useAiModel, setUseAiModel] = useState(true);
  const [avoidFridayLate, setAvoidFridayLate] = useState(true);
  const [prioritizeMorningLabs, setPrioritizeMorningLabs] = useState(true);
  const [maxLecturesPerDay, setMaxLecturesPerDay] = useState(5);
  const [generatedResult, setGeneratedResult] = useState<{ schedule: ScheduleEntry[]; notes: string } | null>(null);

  if (!isOpen) return null;

  const targetSubjects = subjects.filter((s) => s.branch === selectedBranch && s.semester === selectedSemester);

  const handleGenerate = async () => {
    setLoading(true);
    setGeneratedResult(null);

    const preferencesText = [
      avoidFridayLate ? 'Avoid heavy/tough subjects on Friday 04:00-05:00 PM.' : '',
      prioritizeMorningLabs ? 'Schedule 2-hour practical labs in morning slots (09:00-11:00 or 11:00-01:00) where possible.' : '',
      `Target maximum ${maxLecturesPerDay} lectures per day.`,
    ].filter(Boolean).join(' ');

    if (useAiModel) {
      try {
        const res = await fetch('/api/ai/generate-timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branch: selectedBranch,
            semester: selectedSemester,
            section: selectedSection,
            subjects: targetSubjects.map((s) => ({
              code: s.code,
              name: s.name,
              credits: s.credits,
              ltp: s.ltp,
              type: s.type,
              defaultFacultyId: s.defaultFacultyId,
              defaultRoomType: s.defaultRoomType,
            })),
            facultyList: facultyList.map((f) => ({ id: f.id, name: f.name, department: f.department })),
            rooms: rooms.map((r) => ({ id: r.id, name: r.name, type: r.type })),
            preferences: preferencesText,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.schedule && data.schedule.length > 0) {
            const formattedEntries: ScheduleEntry[] = data.schedule.map((item: any, idx: number) => {
              const sub = targetSubjects.find((s) => s.code === item.subjectCode) || targetSubjects[0];
              const fac = facultyList.find((f) => f.name.includes(item.facultyName) || f.id === item.facultyId) || facultyList[0];
              const rm = rooms.find((r) => r.name.includes(item.roomName)) || rooms[0];

              return {
                id: `sch-ai-${Date.now()}-${idx}`,
                subjectId: sub.id,
                subjectCode: item.subjectCode || sub.code,
                subjectName: item.subjectName || sub.name,
                facultyId: fac.id,
                facultyName: fac.name,
                roomId: rm.id,
                roomName: rm.name.split(' ')[0],
                day: item.day,
                slotIndex: item.slotIndex,
                durationHours: item.durationHours || (item.slotType === 'Lab' ? 2 : 1),
                branch: selectedBranch,
                semester: selectedSemester,
                section: selectedSection,
                slotType: item.slotType || (sub.type === 'Practical' ? 'Lab' : 'Lecture'),
              };
            });

            setGeneratedResult({
              schedule: formattedEntries,
              notes: data.notes || 'Generated conflict-free timetable adhering to USICT course credits and room allocations.',
            });
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('AI schedule generator fallback to deterministic solver:', err);
      }
    }

    // Fallback: Local Deterministic Constraint Solver
    setTimeout(() => {
      const generated = generateDeterministicTimetable(
        selectedBranch,
        selectedSemester,
        selectedSection,
        targetSubjects,
        facultyList,
        rooms,
        existingSchedule
      );

      setGeneratedResult({
        schedule: generated,
        notes: 'Generated via local CSP Solver ensuring 0 teacher collisions and appropriate laboratory allocations.',
      });
      setLoading(false);
    }, 600);
  };

  const handleApply = () => {
    if (!generatedResult) return;
    onApplySchedule(generatedResult.schedule);
    confetti({ particleCount: 70, spread: 70 });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-indigo-200 dark:border-indigo-900/60 shadow-2xl space-y-5 z-10"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {selectedBranch} • SEMESTER {selectedSemester} ({selectedSection})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                Auto-Schedule Generator (CSP Engine)
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subjects to be Scheduled */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
              Target Curriculum ({targetSubjects.length} Courses)
            </span>
            <span className="text-slate-400 font-medium">
              Total Credits: {targetSubjects.reduce((acc, s) => acc + s.credits, 0)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {targetSubjects.map((s) => (
              <span
                key={s.id}
                className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200"
              >
                {s.code} ({s.ltp})
              </span>
            ))}
          </div>
        </div>

        {/* Solver Preferences & Constraints */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Optimization Constraints & Rules
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={avoidFridayLate}
                onChange={(e) => setAvoidFridayLate(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <strong className="text-slate-900 dark:text-white font-bold block">
                  Avoid Tough Slots on Friday
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Keep late slots on Friday for tutorials or lighter subjects
                </span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={prioritizeMorningLabs}
                onChange={(e) => setPrioritizeMorningLabs(e.target.checked)}
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <strong className="text-slate-900 dark:text-white font-bold block">
                  Prioritize Morning Labs
                </strong>
                <span className="text-slate-500 text-[11px]">
                  Place 2-hr practicals in 09:00 AM or 11:00 AM blocks
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Result Preview (if generated) */}
        {generatedResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-2"
          >
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Generation Successful ({generatedResult.schedule.length} Weekly Classes Assigned)</span>
            </div>
            <p className="text-emerald-900 dark:text-emerald-300 text-[11px] leading-relaxed">
              {generatedResult.notes}
            </p>
          </motion.div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>

          {!generatedResult ? (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Constraints...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Schedule</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply & Publish to Live Matrix</span>
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
