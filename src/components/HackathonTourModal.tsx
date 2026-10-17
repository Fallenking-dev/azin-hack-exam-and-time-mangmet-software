import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  AlertTriangle, 
  ShieldCheck, 
  Users, 
  Building2, 
  FileCode, 
  Database, 
  X, 
  Play, 
  Award,
  Layers,
  ChevronRight,
  ExternalLink,
  Code2,
  Globe,
  Bot,
  BarChart3,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface HackathonTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onTriggerSimulateClash: () => void;
  onTriggerSmartGenerate: () => void;
  onOpenMongoModal: () => void;
  onOpenSyllabusOCR: () => void;
}

export const HackathonTourModal: React.FC<HackathonTourModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onTriggerSimulateClash,
  onTriggerSmartGenerate,
  onOpenMongoModal,
  onOpenSyllabusOCR,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);

  const demoSteps = [
    {
      id: 'ai-timetable',
      title: '1. AI Smart Timetable Generator (Gemini 3.7 Flash)',
      badge: 'Core AI Engine',
      icon: Sparkles,
      color: 'indigo',
      problem: 'Manual university timetable creation takes weeks, leading to faculty burnout and room collisions.',
      solution: 'Dean AI agent balances theory (1 hr) and lab (2 hr) slots across Monday-Friday, reserving lunch recess and checking room capacities.',
      presenterTip: 'Tell judges: "We use Gemini 3.7 Flash with structured JSON output enforcing hard constraints (no double-booking, lunch recess, 2-hr lab blocks)."',
      actionLabel: 'Launch AI Timetable Generator',
      onAction: () => {
        onClose();
        onTriggerSmartGenerate();
      },
    },
    {
      id: 'conflict-engine',
      title: '2. Real-Time Constraint Engine & Instant AI Clash Fix',
      badge: 'Constraint Logic',
      icon: AlertTriangle,
      color: 'amber',
      problem: 'Faculty leave, sudden room repairs, and elective overlaps cause invisible schedule collisions.',
      solution: 'Real-time graph collision algorithm detects teacher clashes, room overlaps, and lab continuity breaches with instant zero-conflict slot recommendations.',
      presenterTip: 'Tell judges: "Watch the instant visual clash indicator with pulsing badge and 1-click AI recommendation engine."',
      actionLabel: 'Simulate Faculty Clash & Test Resolver',
      onAction: () => {
        onClose();
        onNavigateTab('timetable');
        onTriggerSimulateClash();
      },
    },
    {
      id: 'exam-seating',
      title: '3. Anti-Cheating Exam Seating Matrix Generator',
      badge: 'Algorithm Design',
      icon: ShieldCheck,
      color: 'purple',
      problem: 'Standard classroom exam seating allows students from the same section/subject to sit side-by-side.',
      solution: 'Implements alternating section checkerboard seating with Chebyshev distance > 1. Auto-generates student desk labels and PDF door notices.',
      presenterTip: 'Tell judges: "Notice how CSE 1st Sem and IT 3rd Sem students are interleaved in a checkerboard layout, preventing answer copying."',
      actionLabel: 'View Anti-Cheating Seating Matrix',
      onAction: () => {
        onClose();
        onNavigateTab('exams');
      },
    },
    {
      id: 'faculty-duty',
      title: '4. Faculty Workload & Peer Invigilation Duty Swapping',
      badge: 'Institutional Equity',
      icon: Users,
      color: 'blue',
      problem: 'Unbalanced teaching hours cause faculty dissatisfaction, while sudden leaves break exam hall invigilation.',
      solution: 'Interactive workload analytics bar with UGC/AICTE compliance metrics (max 16 hrs/week) and 1-click peer duty swap workflow.',
      presenterTip: 'Tell judges: "Faculty can request duty swaps directly, notifying Dean office with zero paperwork."',
      actionLabel: 'Explore Faculty Duty Allocator',
      onAction: () => {
        onClose();
        onNavigateTab('faculty-workload');
      },
    },
    {
      id: 'ocr-syllabus',
      title: '5. Gemini Vision OCR Syllabus & Notice Parser',
      badge: 'Multimodal Vision',
      icon: FileCode,
      color: 'rose',
      problem: 'Academic ordinances and schemes are locked in messy scanned PDF tables and physical notice boards.',
      solution: 'Gemini Multimodal Vision extracts course codes (IT-201, CS-203), credit schemes (3-1-0), and Lab/Theory classification directly into the scheduling engine.',
      presenterTip: 'Tell judges: "Upload any university syllabus image and it auto-populates all course requirements in seconds."',
      actionLabel: 'Open Syllabus OCR Parser',
      onAction: () => {
        onClose();
        onNavigateTab('syllabus-ocr');
      },
    },
    {
      id: 'mongodb-cloud',
      title: '6. Full-Stack MongoDB Cloud Storage & Dynamic Persistence',
      badge: 'Enterprise Backend',
      icon: Database,
      color: 'emerald',
      problem: 'Schedules stored in browser memory are lost on device switch or cache clearing.',
      solution: 'Full-stack Express backend with Mongoose schemas for Timetables, Faculty, Rooms, and Exams, supporting live MongoDB Atlas clustering and cloud sync.',
      presenterTip: 'Tell judges: "Our full-stack backend connects to MongoDB Atlas with live status pinging and 1-click database synchronization."',
      actionLabel: 'Inspect MongoDB Cloud Engine',
      onAction: () => {
        onClose();
        onOpenMongoModal();
      },
    },
    {
      id: 'tinyfish-agent',
      title: '7. TinyFish AI Web Agent & Academic Web Crawler',
      badge: 'Live Web Automation',
      icon: Globe,
      color: 'blue',
      problem: 'University datesheets, circulars, and syllabus revisions live across disconnected web portals with high token overhead.',
      solution: 'TinyFish autonomous web agent navigates live university portals (ipu.ac.in, ugc.gov.in), strips 98% HTML fluff for clean Markdown/JSON, and syncs extracted dates directly into CampusScheduler.',
      presenterTip: 'Tell judges: "We integrated TinyFish Web Automation to autonomously crawl university circulars, datesheets, and UGC norms with 98% token savings and 1-click sync."',
      actionLabel: 'Launch TinyFish Web Agent Hub',
      onAction: () => {
        onClose();
        onNavigateTab('tinyfish');
      },
    },
    {
      id: 'room-utilization',
      title: '8. Recharts Room Utilization, Heatmap & Predictive Demand',
      badge: 'Data Analytics & AICTE Eco-Ops',
      icon: BarChart3,
      color: 'indigo',
      problem: 'Classrooms sit vacant for large blocks while faculty battle over peak slots, HVAC wastes power in empty wings, and future enrollment surges threaten capacity deficits.',
      solution: 'Recharts-powered suite featuring: 1) Hourly Peak Curve, 2) Weekly Availability Heatmap Matrix with automated Idle Cluster detection for HVAC eco-lockdowns & lab servicing, and 3) Multi-semester Demand Trend Line chart with confidence intervals projecting future room needs.',
      presenterTip: 'Tell judges: "Notice our Recharts Availability Heatmap detecting consecutive idle blocks to cut ~180 kWh/week in HVAC waste, plus the predictive trend line forecasting capacity deficits ahead of semester registration."',
      actionLabel: 'Explore Room Utilization & Heatmap',
      onAction: () => {
        onClose();
        onNavigateTab('rooms');
      },
    },
    {
      id: 'login-and-2026-data',
      title: '9. Multi-Role Login System & Live 2026 USICT Data Extraction',
      badge: 'SSO & 2026 Data Engine',
      icon: KeyRound,
      color: 'amber',
      problem: 'Campus scheduling applications suffer from fragmented authentication boundaries, while outdated mock data fails to match active 2026 university guidelines, examination datesheets, and NEP mandates.',
      solution: 'Role-Based Authentication Gateway with Dean, Faculty, and Student SSO portals, fast 1-click verified demo profiles, and autonomous TinyFish live extraction of latest 2026 USICT academic data (May-June 2026 datesheets, NEP credits, and 2026 calendar) with 98.2% token savings.',
      presenterTip: 'Tell judges: "Notice our enterprise login system with instant role switching, plus TinyFish autonomously pulling the latest 2026 USICT examination datesheets and NEP course credits directly into the live timetable!"',
      actionLabel: 'Launch 2026 TinyFish Extractor',
      onAction: () => {
        onClose();
        onNavigateTab('tinyfish');
      },
    },
  ];

  const handleCelebrate = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  if (!isOpen) return null;

  const currentStep = demoSteps[activeStep];
  const Icon = currentStep.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] z-50"
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 shadow-inner">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                  Hackathon Pitch & Live Demo Guide
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200">
                    Judge Mode
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  6-Step Winning Presentation Script & Interactive Scenarios for USICT CampusScheduler
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
          <div className="p-6 overflow-y-auto space-y-6">
            
            {/* Step Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
              {demoSteps.map((step, idx) => {
                const StepIcon = step.icon;
                const isCurrent = idx === activeStep;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(idx)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl text-xs font-semibold transition text-left ${
                      isCurrent
                        ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200 dark:border-slate-700'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <StepIcon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">Step {idx + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Card */}
            <motion.div
              key={currentStep.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 space-y-4"
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      {currentStep.badge}
                    </div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {currentStep.title}
                    </h4>
                  </div>
                </div>

                <button
                  onClick={currentStep.onAction}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{currentStep.actionLabel}</span>
                </button>
              </div>

              {/* Problem vs Solution Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50">
                  <div className="text-xs font-bold text-rose-700 dark:text-rose-300 mb-1 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    Problem at University:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentStep.problem}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
                  <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Our Engineered Solution:
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {currentStep.solution}
                  </p>
                </div>
              </div>

              {/* Presenter Pitch Tip Box */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">🎤 Hackathon Pitch Script: </span>
                  <span>{currentStep.presenterTip}</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Demo Fast Triggers */}
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                Quick Hackathon Actions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    handleCelebrate();
                    onClose();
                    onTriggerSmartGenerate();
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Run AI Generator</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Gemini 3.7 Flash Engine</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onTriggerSimulateClash();
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">Simulate Clash</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Test Real-time Constraint</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 transition" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenMongoModal();
                  }}
                  className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-left transition flex items-center justify-between group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">MongoDB Cloud Sync</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">Full-Stack Persistence</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition" />
                </button>
              </div>
            </div>

          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-40"
              >
                Previous Step
              </button>
              <button
                disabled={activeStep === demoSteps.length - 1}
                onClick={() => setActiveStep((prev) => Math.min(demoSteps.length - 1, prev + 1))}
                className="px-3 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-slate-700 text-xs font-semibold hover:bg-slate-800 transition disabled:opacity-40"
              >
                Next Step
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCelebrate}
                className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center gap-1.5 hover:bg-amber-200 transition"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Celebrate Demo</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition"
              >
                Done
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
