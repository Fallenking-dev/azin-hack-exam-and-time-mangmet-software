import React, { useState } from 'react';
import { CampusNotification, LeaveSwapRequest } from '../types';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRightLeft, 
  X, 
  Check, 
  Trash2, 
  ShieldAlert, 
  Sparkles, 
  Clock, 
  Filter 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: CampusNotification[];
  swapRequests: LeaveSwapRequest[];
  onMarkAllRead: () => void;
  onApproveSwap: (requestId: string) => void;
}

type TabType = 'all' | 'clashes' | 'swaps' | 'notices';

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  swapRequests,
  onMarkAllRead,
  onApproveSwap,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [localNotifs, setLocalNotifs] = useState<CampusNotification[]>(notifications);

  // Sync with prop changes
  React.useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  const handleDeleteNotif = (id: string) => {
    setLocalNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const pendingSwaps = swapRequests.filter((r) => r.status === 'PENDING');
  const clashNotifs = localNotifs.filter((n) => n.type === 'CLASH_ALERT');
  const generalNotifs = localNotifs.filter((n) => n.type !== 'CLASH_ALERT' && n.type !== 'SWAP_REQUEST');

  const filteredNotifs = localNotifs.filter((n) => {
    if (activeTab === 'clashes') return n.type === 'CLASH_ALERT';
    if (activeTab === 'swaps') return n.type === 'SWAP_REQUEST';
    if (activeTab === 'notices') return n.type !== 'CLASH_ALERT' && n.type !== 'SWAP_REQUEST';
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Sliding Drawer Container */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full z-10"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                    Campus Alerts & Dean Queue
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Real-time notifications & swap authorizations
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Close Drawer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition relative ${
                    activeTab === 'all'
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All ({localNotifs.length + pendingSwaps.length})
                </button>
                <button
                  onClick={() => setActiveTab('clashes')}
                  className={`px-2.5 py-1 rounded-lg transition relative ${
                    activeTab === 'clashes'
                      ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clashes ({clashNotifs.length})
                </button>
                <button
                  onClick={() => setActiveTab('swaps')}
                  className={`px-2.5 py-1 rounded-lg transition relative ${
                    activeTab === 'swaps'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Swaps ({pendingSwaps.length})
                </button>
                <button
                  onClick={() => setActiveTab('notices')}
                  className={`px-2.5 py-1 rounded-lg transition relative ${
                    activeTab === 'notices'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-semibold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Notices ({generalNotifs.length})
                </button>
              </div>

              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold hover:underline whitespace-nowrap"
              >
                Mark Read
              </button>
            </div>

            {/* Scrollable Notification List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Swap & Leave Requests Section (Visible in 'all' and 'swaps' tab) */}
              {(activeTab === 'all' || activeTab === 'swaps') && swapRequests.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <ArrowRightLeft className="w-3.5 h-3.5 text-amber-500" />
                      <span>Pending Lecture Swaps ({pendingSwaps.length})</span>
                    </h4>
                  </div>

                  <AnimatePresence>
                    {swapRequests.map((req) => (
                      <motion.div
                        key={req.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="p-4 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/30 text-xs space-y-2.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <strong className="text-slate-900 dark:text-white font-bold text-sm">
                              {req.facultyName}
                            </strong>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              req.status === 'APPROVED'
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            }`}
                          >
                            {req.status}
                          </span>
                        </div>

                        <p className="text-slate-700 dark:text-slate-300 text-xs">
                          Requested substitute for <strong>{req.originalSubject}</strong> ({req.dateOrDay} • {req.slotTime}).
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 italic text-[11px] bg-white/60 dark:bg-black/20 p-2 rounded-xl border border-amber-200/40 dark:border-amber-900/40">
                          "{req.reason}"
                        </p>

                        {req.status === 'PENDING' && (
                          <button
                            onClick={() => onApproveSwap(req.id)}
                            className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-xs hover:shadow-md transition active:scale-[0.98]"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve & Notify Department</span>
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* General / Clash Notifications */}
              {(activeTab === 'all' || activeTab === 'clashes' || activeTab === 'notices') && (
                <div className="space-y-2.5">
                  {filteredNotifs.length === 0 && (activeTab !== 'swaps' || swapRequests.length === 0) ? (
                    <div className="text-center py-12 px-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        All Caught Up!
                      </h5>
                      <p className="text-xs text-slate-500 mt-1">
                        No unread notifications or conflict alerts in this view.
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredNotifs.map((n) => (
                        <motion.div
                          key={n.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.2 }}
                          className={`p-4 rounded-2xl border transition text-xs space-y-1.5 relative group shadow-xs ${
                            n.type === 'CLASH_ALERT'
                              ? 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60'
                              : n.type === 'SWAP_REQUEST'
                              ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60'
                              : 'bg-white dark:bg-slate-800/70 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {n.type === 'CLASH_ALERT' ? (
                                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                              ) : (
                                <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                              )}
                              <span className="font-bold text-slate-900 dark:text-white text-xs">
                                {n.title}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 flex-shrink-0">{n.timestamp}</span>
                          </div>

                          <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                            {n.message}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                              {n.type === 'CLASH_ALERT' ? 'High Priority' : 'Institutional Notice'}
                            </span>
                            <button
                              onClick={() => handleDeleteNotif(n.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 rounded-lg transition"
                              title="Dismiss"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Footer Status */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Socket Live Sync Active
              </span>
              <span>USICT Portal v2.4</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
