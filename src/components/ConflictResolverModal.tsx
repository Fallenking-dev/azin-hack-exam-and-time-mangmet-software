import React, { useState, useEffect } from 'react';
import { ConflictAlert, DayOfWeek, Faculty, Room, ScheduleEntry } from '../types';
import { findZeroConflictSlots } from '../utils/constraintEngine';
import { 
  AlertTriangle, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  MapPin, 
  Loader2, 
  X, 
  ShieldAlert, 
  Layers 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface ConflictResolverModalProps {
  conflict: ConflictAlert | null;
  onClose: () => void;
  schedule: ScheduleEntry[];
  rooms: Room[];
  facultyList: Faculty[];
  onApplySlot: (entryId: string, newDay: DayOfWeek, newSlotIndex: number, newRoomId: string, newRoomName: string) => void;
}

export const ConflictResolverModal: React.FC<ConflictResolverModalProps> = ({
  conflict,
  onClose,
  schedule,
  rooms,
  facultyList,
  onApplySlot,
}) => {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagnostic, setAiDiagnostic] = useState<string | null>(null);
  const [aiSolutions, setAiSolutions] = useState<any[] | null>(null);

  if (!conflict) return null;

  const targetEntryId = conflict.involvedEntries[0];
  const targetEntry = schedule.find((e) => e.id === targetEntryId);

  // Local zero-conflict candidate slots
  const localSuggestions = targetEntry
    ? findZeroConflictSlots(targetEntry, schedule, rooms, facultyList)
    : [];

  useEffect(() => {
    if (!conflict || !targetEntry) return;

    // Trigger AI Diagnostic from Gemini
    const fetchAiResolution = async () => {
      setAiLoading(true);
      try {
        const res = await fetch('/api/ai/resolve-clash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conflict,
            currentEntry: targetEntry,
            existingSchedule: schedule,
            rooms: rooms.map((r) => ({ id: r.id, name: r.name, type: r.type })),
            facultyList: facultyList.map((f) => ({ id: f.id, name: f.name, department: f.department })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setAiDiagnostic(data.diagnostic || null);
          if (data.suggestedSolutions && data.suggestedSolutions.length > 0) {
            setAiSolutions(data.suggestedSolutions);
          }
        }
      } catch (err) {
        console.warn('AI resolve clash fallback to local solver:', err);
      } finally {
        setAiLoading(false);
      }
    };

    fetchAiResolution();
  }, [conflict?.id]);

  const candidateSlots = aiSolutions && aiSolutions.length > 0 ? aiSolutions : localSuggestions;

  const handleApplyResolution = (slot: any) => {
    onApplySlot(
      targetEntryId,
      slot.day,
      slot.slotIndex,
      slot.roomId || rooms[0].id,
      slot.roomName || rooms[0].name.split(' ')[0]
    );
    confetti({ particleCount: 50, spread: 60 });
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

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 border border-rose-200 dark:border-rose-900/60 shadow-2xl space-y-5 z-10"
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                  {conflict.severity} CONFLICT
                </span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {conflict.type}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {conflict.title}
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

        {/* Conflict Description & Current Allocation */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/40 text-xs space-y-2">
          <p className="text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
            {conflict.description}
          </p>
          {targetEntry && (
            <div className="pt-1.5 border-t border-rose-200/50 dark:border-rose-900/40 flex flex-wrap items-center gap-3 text-rose-800 dark:text-rose-300">
              <span><strong>Subject:</strong> {targetEntry.subjectCode} ({targetEntry.subjectName})</span>
              <span>•</span>
              <span><strong>Faculty:</strong> {targetEntry.facultyName}</span>
              <span>•</span>
              <span><strong>Current Room:</strong> {targetEntry.roomName}</span>
            </div>
          )}
        </div>

        {/* AI Diagnostic Summary */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>CSP Automated Diagnostic & Recommendation</span>
            {aiLoading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}
          </div>
          <p className="text-indigo-950 dark:text-indigo-200 leading-relaxed">
            {aiDiagnostic || conflict.suggestedFix || 'Analyzing zero-collision alternative time blocks and available lecture halls across USICT E-Block and B-Block...'}
          </p>
        </div>

        {/* Alternative Candidate Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Available Zero-Conflict Solutions ({candidateSlots.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400 font-medium">Ranked by minimum disruption</span>
          </div>

          {candidateSlots.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-500">
                No immediate 1-slot shifts available. Consider swapping with an elective subject or using an alternate laboratory.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {candidateSlots.slice(0, 4).map((slot, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 flex items-center justify-between gap-3 transition shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                      #{idx + 1}
                    </div>
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 dark:text-white font-bold">
                          {slot.day} • Slot {slot.slotIndex + 1} ({slot.timeRange || 'Academic Slot'})
                        </strong>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-indigo-500" /> {slot.roomName || 'Classroom Hall'}
                        </span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">0 Teacher / Room Clashes</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleApplyResolution(slot)}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition active:scale-95 whitespace-nowrap"
                  >
                    <span>Apply Shift</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
