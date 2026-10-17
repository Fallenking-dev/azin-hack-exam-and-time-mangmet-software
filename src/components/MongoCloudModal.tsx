import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  CloudUpload, 
  CloudDownload, 
  Server, 
  HardDrive, 
  Lock, 
  ExternalLink, 
  Sparkles, 
  X,
  Layers,
  FileCode,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { 
  checkDatabaseStatus, 
  connectCustomMongoUri, 
  pushFullCampusCloudSync, 
  pullCampusCloudSync, 
  DatabaseStatus 
} from '../utils/cloudSync';
import { ScheduleEntry, Faculty, Room, Exam, Subject } from '../types';

interface MongoCloudModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: ScheduleEntry[];
  subjects: Subject[];
  facultyList: Faculty[];
  rooms: Room[];
  exams: Exam[];
  onDataRestored?: (data: {
    schedule?: ScheduleEntry[];
    subjects?: Subject[];
    facultyList?: Faculty[];
    rooms?: Room[];
    exams?: Exam[];
  }) => void;
}

export const MongoCloudModal: React.FC<MongoCloudModalProps> = ({
  isOpen,
  onClose,
  schedule,
  subjects,
  facultyList,
  rooms,
  exams,
  onDataRestored,
}) => {
  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(false);
  const [mongoUriInput, setMongoUriInput] = useState<string>('');
  const [connecting, setConnecting] = useState<boolean>(false);
  const [connectMessage, setConnectMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState<boolean>(true);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    const status = await checkDatabaseStatus();
    setDbStatus(status);
    setLoadingStatus(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
      setConnectMessage(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  const handleConnectCustomUri = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mongoUriInput.trim()) return;

    setConnecting(true);
    setConnectMessage(null);
    const res = await connectCustomMongoUri(mongoUriInput.trim());
    setConnecting(false);
    setConnectMessage({
      text: res.message,
      success: res.success,
    });
    if (res.success) {
      fetchStatus();
    }
  };

  const handleSyncToCloud = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await pushFullCampusCloudSync({
      schedule,
      subjects,
      facultyList,
      rooms,
      exams,
    });
    setSyncing(false);
    if (res.success) {
      setSyncResult(`Successfully synchronized ${res.stats?.scheduleCount || schedule.length} timetable entries and campus records to MongoDB backend.`);
      fetchStatus();
    } else {
      setSyncResult(`Sync Error: ${res.error || 'Failed to sync to database'}`);
    }
  };

  const handlePullFromCloud = async () => {
    setSyncing(true);
    setSyncResult(null);
    const res = await pullCampusCloudSync();
    setSyncing(false);
    if (res.error) {
      setSyncResult(`Error restoring cloud data: ${res.error}`);
    } else if (onDataRestored) {
      onDataRestored({
        schedule: res.schedule,
        subjects: res.subjects,
        facultyList: res.facultyList,
        rooms: res.rooms,
        exams: res.exams,
      });
      setSyncResult(`Loaded latest snapshot from cloud with ${res.schedule?.length || 0} scheduled sessions.`);
      fetchStatus();
    }
  };

  const handleExportJsonDump = () => {
    const dump = {
      institution: 'USICT, GGSIPU Dwarka',
      exportedAt: new Date().toISOString(),
      databaseEngine: dbStatus?.mode || 'MongoDB',
      collections: {
        schedule,
        subjects,
        facultyList,
        rooms,
        exams,
      },
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `USICT_CampusScheduler_MongoDB_Dump_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] z-50"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white/15 backdrop-blur-md shadow-inner">
                <Database className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                  MongoDB Cloud Storage & Sync Engine
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-100">
                    Full-Stack DB
                  </span>
                </h3>
                <p className="text-xs text-emerald-100/90 mt-0.5">
                  Real-time synchronization, Atlas cluster integration & campus data persistence
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:bg-white/10 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-200">
            
            {/* Live Database Status Banner */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                  dbStatus?.isMongoConnected ? 'bg-emerald-500 ring-4 ring-emerald-500/20' : 'bg-blue-500 ring-4 ring-blue-500/20'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    {dbStatus?.isMongoConnected ? 'MongoDB Atlas Cluster Connected' : 'High-Speed Campus Document Store Active'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Host: {dbStatus?.host || 'embedded-in-memory://usict_scheduler'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={fetchStatus}
                  disabled={loadingStatus}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-600 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Document Collection Metrics Grid */}
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                MongoDB Document Collections
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{schedule.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Timetable Slots</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 text-center">
                  <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{facultyList.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Faculty Profiles</div>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/50 text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{rooms.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Rooms & Labs</div>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 text-center">
                  <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{exams.length}</div>
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">Exam Schedules</div>
                </div>
              </div>
            </div>

            {/* Cloud Sync Action Section */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <CloudUpload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Real-Time Cloud Synchronization
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Push your live timetable edits, exam seatings, and faculty duty rosters to the MongoDB backend.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={handleSyncToCloud}
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <CloudUpload className={`w-4 h-4 ${syncing ? 'animate-bounce' : ''}`} />
                  <span>{syncing ? 'Pushing to MongoDB...' : 'Push Snapshot to Cloud DB'}</span>
                </button>

                <button
                  onClick={handlePullFromCloud}
                  disabled={syncing}
                  className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs flex items-center gap-2 transition disabled:opacity-50"
                >
                  <CloudDownload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Fetch Cloud Snapshot</span>
                </button>

                <button
                  onClick={handleExportJsonDump}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs flex items-center gap-2 transition ml-auto"
                >
                  <FileCode className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Export JSON Dump</span>
                </button>
              </div>

              {syncResult && (
                <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{syncResult}</span>
                </div>
              )}
            </div>

            {/* Custom MongoDB Atlas Cluster Dynamic Connector */}
            <form onSubmit={handleConnectCustomUri} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Connect Your Own MongoDB Atlas Cluster
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paste your MongoDB Connection String (e.g., from MongoDB Atlas) to connect live.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/usict_scheduler"
                  value={mongoUriInput}
                  onChange={(e) => setMongoUriInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={connecting || !mongoUriInput.trim()}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50 flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${connecting ? 'animate-spin' : ''}`} />
                  <span>{connecting ? 'Connecting...' : 'Connect DB'}</span>
                </button>
              </div>

              {connectMessage && (
                <div className={`p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${
                  connectMessage.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
                }`}>
                  {connectMessage.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{connectMessage.text}</span>
                </div>
              )}
            </form>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Full-Stack MongoDB Schema v2.4 • USICT GGSIPU Dwarka</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 font-semibold text-xs transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
