import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  Users, 
  FileSpreadsheet, 
  Building2, 
  Sparkles, 
  AlertTriangle, 
  Bell, 
  Printer, 
  Moon, 
  Sun, 
  GraduationCap, 
  ShieldCheck,
  CheckCircle2,
  Download,
  FileCode,
  LayoutGrid,
  LogIn,
  UserCheck,
  ChevronDown,
  Menu,
  X,
  Sliders,
  Layers,
  Trophy,
  Database,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, AuthUser } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  conflictCount: number;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onLoadSampleData: () => void;
  onLoad1stSemData?: () => void;
  onLoad3rdSemData?: () => void;
  onSimulateClash: () => void;
  onAutoGenerateExams: () => void;
  onPrint: () => void;
  onExportCSV: () => void;
  onExportICS: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onOpenTourModal?: () => void;
  onOpenMongoModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  currentUser,
  onOpenLoginModal,
  onLogout,
  activeTab,
  setActiveTab,
  conflictCount,
  unreadNotifications,
  onOpenNotifications,
  onLoadSampleData,
  onLoad1stSemData,
  onLoad3rdSemData,
  onSimulateClash,
  onAutoGenerateExams,
  onPrint,
  onExportCSV,
  onExportICS,
  darkMode,
  setDarkMode,
  onOpenTourModal,
  onOpenMongoModal,
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMobileNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 shadow-xs backdrop-blur-md no-print min-h-[64px] flex items-center transition-colors duration-200">
      <div className="w-full px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left Side: Mobile Admin Menu Button & Logo Identity */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Left Mobile Menu Toggle Button */}
            <button
              id="btn-left-admin-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-slate-700 transition shadow-2xs flex items-center justify-center gap-1"
              title="Open Left Side Admin Menu & All Controls"
              aria-label="Toggle Admin Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              <span className="text-[11px] font-bold hidden xs:inline">Menu</span>
            </button>

            {/* University Logo & Identity */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg sm:text-xl text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-500/40 select-none flex-shrink-0">
                U
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <h1 className="text-sm sm:text-lg font-bold leading-none tracking-tight text-slate-900 dark:text-white truncate">
                    USICT Scheduler
                  </h1>
                  <span className="hidden xs:inline-block px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60 flex-shrink-0">
                    GGSIPU
                  </span>
                </div>
                <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider sm:tracking-widest mt-0.5 font-medium truncate">
                  Academic Timetable & Exam Engine
                </p>
              </div>
            </div>
          </div>

          {/* Quick Controls & Status Area */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Live Conflict Status Pill */}
            {conflictCount > 0 ? (
              <div className="flex items-center gap-1 sm:gap-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 sm:px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800 text-[10px] sm:text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span>{conflictCount} Clash{conflictCount > 1 ? 'es' : ''}</span>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">Live Matrix Synced</span>
              </div>
            )}

            {/* Desktop View Switcher Navigation */}
            <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                id="btn-nav-timetable"
                onClick={() => setActiveTab('timetable')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'timetable'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Weekly Timetable Grid"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Timetable</span>
              </button>
              <button
                id="btn-nav-calendar"
                onClick={() => setActiveTab('calendar')}
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Interactive Academic Calendar"
              >
                <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span>Calendar</span>
              </button>
              <button
                id="btn-auto-exam"
                onClick={onAutoGenerateExams}
                title="Exam Seating & Invigilation Matrix"
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'exams'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span>Exams</span>
              </button>
              <button
                id="btn-nav-tinyfish"
                onClick={() => setActiveTab('tinyfish')}
                title="TinyFish Web Agent & Academic Crawler"
                className={`px-2.5 py-1 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'tinyfish'
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-xs">🐟</span>
                <span>TinyFish</span>
              </button>
            </div>

            {/* Simulation Presets (Sample Data & Clash Tester) - Desktop */}
            <div className="hidden xl:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <button
                id="btn-load-sample"
                onClick={onLoadSampleData}
                title="Reset to official USICT sample dataset"
                className="px-2.5 py-1 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>USICT Data</span>
              </button>
              <button
                id="btn-simulate-clash"
                onClick={onSimulateClash}
                title="Simulate realistic faculty clash"
                className="px-2.5 py-1 rounded-lg font-medium text-amber-700 dark:text-amber-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                <span>Test Clash</span>
              </button>
            </div>

            {/* Login Portal & User Profile Button with Dropdown Menu */}
            <div className="relative flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
              {currentUser ? (
                <div className="relative">
                  <button
                    id="btn-open-user-menu"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 border border-indigo-200 dark:border-indigo-800/80 transition text-xs shadow-2xs group cursor-pointer"
                    title="Account Profile & Settings"
                  >
                    <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shadow-xs flex-shrink-0">
                      {currentUser?.avatar || (currentRole === 'admin' ? 'DA' : currentRole === 'faculty' ? 'FP' : 'ST')}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-bold text-indigo-950 dark:text-indigo-200 text-[11px] leading-tight flex items-center gap-1">
                        <span className="truncate max-w-[120px]">{currentUser?.name}</span>
                        <ChevronDown className="w-3 h-3 text-indigo-500 opacity-60 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-[9px] text-indigo-700 dark:text-indigo-300 uppercase font-semibold">
                        {currentUser?.role} Portal
                      </div>
                    </div>
                  </button>

                  {/* Desktop User Menu Dropdown */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs text-slate-800 dark:text-white">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-2 border border-slate-200 dark:border-slate-700/60">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                            {currentUser.avatar || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs truncate">{currentUser.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{currentUser.emailOrRoll}</div>
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[9px] uppercase">
                              {currentUser.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={() => {
                            setShowUserMenu(false);
                            onOpenLoginModal();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition cursor-pointer"
                        >
                          <LogIn className="w-4 h-4 text-indigo-500" />
                          <span>Switch Account / Identity</span>
                        </button>

                        {onLogout && (
                          <button
                            onClick={() => {
                              setShowUserMenu(false);
                              onLogout();
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center gap-2 transition cursor-pointer font-medium"
                          >
                            <LogOut className="w-4 h-4 text-rose-500" />
                            <span>Sign Out / Lock Workspace</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  id="btn-sign-in"
                  onClick={onOpenLoginModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              )}

              {/* Quick Role Switcher Pill - Desktop */}
              <div className="hidden lg:flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  id="role-admin-btn"
                  onClick={() => setCurrentRole('admin')}
                  className={`px-2 py-1 rounded-md font-medium transition ${
                    currentRole === 'admin'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  id="role-faculty-btn"
                  onClick={() => setCurrentRole('faculty')}
                  className={`px-2 py-1 rounded-md font-medium transition ${
                    currentRole === 'faculty'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Faculty
                </button>
                <button
                  id="role-student-btn"
                  onClick={() => setCurrentRole('student')}
                  className={`px-2 py-1 rounded-md font-medium transition ${
                    currentRole === 'student'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

            {/* Utility Action Buttons: Hackathon Tour, MongoDB Cloud, Export, Notifications, Light/Dark Toggle */}
            <div className="flex items-center gap-1 sm:gap-1.5 relative">
              {/* Hackathon Live Presentation & Demo Guide Button */}
              {onOpenTourModal && (
                <button
                  id="btn-hackathon-tour"
                  onClick={onOpenTourModal}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-xs hover:shadow-sm transition cursor-pointer"
                  title="Hackathon Demo & Pitch Guide"
                >
                  <Trophy className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Hackathon Demo</span>
                </button>
              )}

              {/* MongoDB Cloud Storage & Sync Modal Button */}
              {onOpenMongoModal && (
                <button
                  id="btn-mongo-cloud"
                  onClick={onOpenMongoModal}
                  className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60 font-semibold text-xs transition cursor-pointer"
                  title="MongoDB Cloud Database & Real-Time Sync"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden xl:inline">MongoDB Cloud</span>
                </button>
              )}

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  id="export-menu-toggle"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition text-xs flex items-center shadow-2xs"
                  title="Export Options (CSV, iCal, PDF)"
                >
                  <Download className="w-4 h-4" />
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 text-xs text-slate-800 dark:text-white">
                    <button
                      onClick={() => {
                        onExportCSV();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                      <span>Export as CSV Table</span>
                    </button>
                    <button
                      onClick={() => {
                        onExportICS();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition"
                    >
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>Sync iCal (.ics) Calendar</span>
                    </button>
                    <button
                      onClick={() => {
                        onPrint();
                        setShowExportMenu(false);
                      }}
                      className="w-full text-left px-3.5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200 transition"
                    >
                      <Printer className="w-4 h-4 text-purple-500" />
                      <span>Print Timetable Sheet</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                id="btn-notifications"
                onClick={onOpenNotifications}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition relative shadow-2xs"
                title="Campus Notifications & Alerts"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Light/Dark Theme Switcher */}
              <button
                id="btn-theme-toggle"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-1.5 sm:p-2 rounded-xl border transition flex items-center gap-1.5 shadow-2xs ${
                  darkMode
                    ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
                }`}
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-700" />
                )}
              </button>

              {/* Mobile All Features Menu Toggle Button */}
              <button
                id="btn-mobile-menu-toggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 border border-indigo-500 transition shadow-2xs flex items-center justify-center"
                title="Open All Features Mobile Menu"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Slide-Over Menu / Full Drawer rendered via Portal directly to body */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-[100] lg:hidden">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-[100]"
                />

                {/* Slide-over Drawer (Opens from Left matching Left Admin Sidebar) */}
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '-100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                  className="fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-[101] overflow-y-auto"
                >
                  {/* Drawer Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                        U
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">USICT Campus Engine</h3>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">All Academic Tools & Views</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                      aria-label="Close menu"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* User Profile & Role Switcher in Mobile Drawer */}
                  <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {currentUser?.avatar || (currentRole === 'admin' ? 'DA' : currentRole === 'faculty' ? 'FP' : 'ST')}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-white">
                            {currentUser?.name || (currentRole === 'admin' ? 'Prof. C.S. Rai' : currentRole === 'faculty' ? 'Prof. Pravin Chandra' : 'Arjun Sharma')}
                          </div>
                          <div className="text-xs text-indigo-600 dark:text-indigo-300 font-medium">
                            {currentUser?.designation || (currentRole === 'admin' ? 'Dean (Academics)' : currentRole === 'faculty' ? 'Professor, CSE' : 'Student (CSE 1st Sem)')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onOpenLoginModal();
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{currentUser ? 'Switch Account' : 'Sign In'}</span>
                      </button>

                      {currentUser && onLogout && (
                        <button
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            onLogout();
                          }}
                          className="py-2 px-3 rounded-xl bg-rose-100 hover:bg-rose-200 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                          title="Sign Out"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Exit</span>
                        </button>
                      )}
                    </div>

                    {/* Direct Role Switcher Pills */}
                    <div className="mt-3 grid grid-cols-3 gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                      <button
                        onClick={() => setCurrentRole('admin')}
                        className={`py-1.5 rounded-lg font-medium transition text-center ${
                          currentRole === 'admin'
                            ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Dean/Admin
                      </button>
                      <button
                        onClick={() => setCurrentRole('faculty')}
                        className={`py-1.5 rounded-lg font-medium transition text-center ${
                          currentRole === 'faculty'
                            ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Faculty
                      </button>
                      <button
                        onClick={() => setCurrentRole('student')}
                        className={`py-1.5 rounded-lg font-medium transition text-center ${
                          currentRole === 'student'
                            ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        Student
                      </button>
                    </div>
                  </div>

                  {/* All Academic Navigation Features */}
                  <div className="p-4 space-y-1 flex-1">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1 tracking-wider">
                      Academic Views & Features
                    </div>

                    <button
                      onClick={() => handleMobileNavClick('timetable')}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'timetable'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">📅</span>
                        <span>Weekly Timetable Grid</span>
                      </div>
                      {conflictCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                          {conflictCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('calendar')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'calendar'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">🗓️</span>
                      <span>Interactive Academic Calendar</span>
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('exams')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'exams'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">🪑</span>
                      <span>Anti-Cheating Seating Matrix</span>
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('faculty-workload')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'faculty-workload'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">👥</span>
                      <span>Faculty Duties & Workload</span>
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('rooms')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'rooms'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">🏢</span>
                      <span>Room Allocation & Smart Labs</span>
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('syllabus-ocr')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'syllabus-ocr'
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">📄</span>
                      <span>OCR Syllabus Parser</span>
                    </button>

                    <button
                      onClick={() => handleMobileNavClick('tinyfish')}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition ${
                        activeTab === 'tinyfish'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span className="text-base">🐟</span>
                      <span>TinyFish Web Agent & Crawler</span>
                    </button>

                    {/* Hackathon & Cloud Actions in Mobile Drawer */}
                    <div className="pt-2">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-2 tracking-wider">
                        Hackathon & Persistence Tools
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {onOpenTourModal && (
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              onOpenTourModal();
                            }}
                            className="p-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-300 text-left text-xs font-semibold flex flex-col gap-1"
                          >
                            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                              <Trophy className="w-3.5 h-3.5" />
                              <span className="font-bold">Pitch Guide</span>
                            </div>
                            <span className="text-[10px] opacity-80">6-Step Demo</span>
                          </button>
                        )}
                        {onOpenMongoModal && (
                          <button
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              onOpenMongoModal();
                            }}
                            className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300 text-left text-xs font-semibold flex flex-col gap-1"
                          >
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <Database className="w-3.5 h-3.5" />
                              <span className="font-bold">MongoDB Cloud</span>
                            </div>
                            <span className="text-[10px] opacity-80">Live Atlas Sync</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Simulation & Data Presets */}
                    <div className="pt-3">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-2 tracking-wider">
                        Simulation & Quick Presets
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            if (onLoad1stSemData) onLoad1stSemData();
                            setIsMobileMenuOpen(false);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
                        >
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">1st Sem CSE</div>
                          <div>Load Dataset</div>
                        </button>
                        <button
                          onClick={() => {
                            if (onLoad3rdSemData) onLoad3rdSemData();
                            setIsMobileMenuOpen(false);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition"
                        >
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">3rd Sem CSE</div>
                          <div>Load Dataset</div>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          onSimulateClash();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span>Simulate Faculty Clash</span>
                      </button>
                    </div>

                    {/* Export Options */}
                    <div className="pt-3">
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-2 tracking-wider">
                        Export & Distribution
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            onExportCSV();
                            setIsMobileMenuOpen(false);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                          <span>CSV Table</span>
                        </button>
                        <button
                          onClick={() => {
                            onExportICS();
                            setIsMobileMenuOpen(false);
                          }}
                          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 border border-slate-200 dark:border-slate-700"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          <span>Sync iCal</span>
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          onPrint();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mt-2 p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Formal Timetable Document</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Drawer Footer */}
                  <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between sticky bottom-0 z-10">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-2 text-xs font-semibold"
                      >
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
                        <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenNotifications();
                      }}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 relative"
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadNotifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
};

