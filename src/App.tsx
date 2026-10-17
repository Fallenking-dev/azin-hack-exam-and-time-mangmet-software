import React, { useState, useEffect, useMemo } from 'react';
import { 
  Program, 
  Semester, 
  Section, 
  UserRole, 
  ScheduleEntry, 
  Subject, 
  Faculty, 
  Room, 
  Exam, 
  ConflictAlert, 
  CampusNotification, 
  LeaveSwapRequest, 
  DayOfWeek,
  AuthUser 
} from './types';
import { 
  INITIAL_FACULTY, 
  INITIAL_ROOMS, 
  INITIAL_SUBJECTS, 
  INITIAL_SCHEDULE, 
  INITIAL_EXAMS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';
import { detectScheduleConflicts } from './utils/constraintEngine';
import { exportTimetableToCSV, exportTimetableToICS, exportTimetableToPDF, exportExamConflictReportPDF } from './utils/exportUtils';

import { Navbar } from './components/Navbar';
import { TimetableGrid } from './components/TimetableGrid';
import { ConflictResolverModal } from './components/ConflictResolverModal';
import { SmartGenerateModal } from './components/SmartGenerateModal';
import { ExamSchedulerView } from './components/ExamSchedulerView';
import { SyllabusParserView } from './components/SyllabusParserView';
import { RoomAllocationView } from './components/RoomAllocationView';
import { FacultyWorkloadView } from './components/FacultyWorkloadView';
import { CalendarView } from './components/CalendarView';
import { FacultyView } from './components/FacultyView';
import { StudentView } from './components/StudentView';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginPortalModal } from './components/LoginPortalModal';
import { LoginPortalView } from './components/LoginPortalView';
import { MongoCloudModal } from './components/MongoCloudModal';
import { HackathonTourModal } from './components/HackathonTourModal';
import { TinyFishHubView } from './components/TinyFishHubView';
import confetti from 'canvas-confetti';
import { 
  Calendar, 
  ShieldCheck, 
  Users, 
  Building2, 
  FileCode, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2,
  FileSpreadsheet,
  Layers,
  GraduationCap,
  Trophy,
  Database
} from 'lucide-react';

export function App() {
  // Global Application State
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
    const saved = localStorage.getItem('usict_schedule');
    if (saved) {
      try {
        const parsed: ScheduleEntry[] = JSON.parse(saved);
        const has1stSem = parsed.some((e) => e.semester === 1);
        if (!has1stSem) {
          const firstSemEntries = INITIAL_SCHEDULE.filter((e) => e.semester === 1);
          return [...parsed, ...firstSemEntries];
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse saved schedule', err);
      }
    }
    return INITIAL_SCHEDULE;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('usict_subjects');
    if (saved) {
      try {
        const parsed: Subject[] = JSON.parse(saved);
        const has1stSem = parsed.some((s) => s.semester === 1);
        if (!has1stSem) {
          const firstSemSubjects = INITIAL_SUBJECTS.filter((s) => s.semester === 1);
          return [...parsed, ...firstSemSubjects];
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse saved subjects', err);
      }
    }
    return INITIAL_SUBJECTS;
  });

  const [facultyList, setFacultyList] = useState<Faculty[]>(() => {
    const saved = localStorage.getItem('usict_faculty');
    return saved ? JSON.parse(saved) : INITIAL_FACULTY;
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('usict_rooms');
    return saved ? JSON.parse(saved) : INITIAL_ROOMS;
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('usict_exams');
    if (saved) {
      try {
        const parsed: Exam[] = JSON.parse(saved);
        const has1stSemExams = parsed.some((ex) => ex.semester === 1);
        if (!has1stSemExams) {
          const firstSemExams = INITIAL_EXAMS.filter((ex) => ex.semester === 1);
          return [...parsed, ...firstSemExams];
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse saved exams', err);
      }
    }
    return INITIAL_EXAMS;
  });

  const [notifications, setNotifications] = useState<CampusNotification[]>(INITIAL_NOTIFICATIONS);
  const [swapRequests, setSwapRequests] = useState<LeaveSwapRequest[]>([]);

  // Authenticated User State & Role Management
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('usict_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return {
      id: 'usr-admin-dean',
      name: 'Prof. C.S. Rai',
      emailOrRoll: 'dean.academic@usict.ac.in',
      role: 'admin',
      designation: 'Dean (Academics)',
      departmentOrBranch: 'Dean Office, USICT',
      avatar: 'DA',
    };
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('usict_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return u.role || 'admin';
      } catch {
        return 'admin';
      }
    }
    return 'admin';
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('timetable');
  const [selectedBranch, setSelectedBranch] = useState<Program>('CSE');
  const [selectedSemester, setSelectedSemester] = useState<Semester>(1);
  const [selectedSection, setSelectedSection] = useState<Section>('Sec-A');

  // UI Modals & Drawers
  const [activeConflictForModal, setActiveConflictForModal] = useState<ConflictAlert | null>(null);
  const [showSmartGenerateModal, setShowSmartGenerateModal] = useState<boolean>(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState<boolean>(false);
  const [showTourModal, setShowTourModal] = useState<boolean>(false);
  const [showMongoModal, setShowMongoModal] = useState<boolean>(false);
  
  // Dark/Light Theme with persistence & system preference support
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('usict_theme');
    if (saved) return saved === 'dark';
    return typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Handler for User Login from Modal
  const handleLogin = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
    localStorage.setItem('usict_user', JSON.stringify(user));
    if (user.role === 'student') {
      if (user.departmentOrBranch) setSelectedBranch(user.departmentOrBranch as Program);
      if (user.semester) setSelectedSemester(user.semester);
      if (user.section) setSelectedSection(user.section);
    }
  };

  // Handler for direct role switch
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin') {
      setCurrentUser({
        id: 'usr-admin-dean',
        name: 'Prof. C.S. Rai',
        emailOrRoll: 'dean.academic@usict.ac.in',
        role: 'admin',
        designation: 'Dean (Academics)',
        departmentOrBranch: 'Dean Office, USICT',
        avatar: 'DA',
      });
    } else if (role === 'faculty') {
      setCurrentUser({
        id: 'usr-fac-pravin',
        name: 'Prof. Pravin Chandra',
        emailOrRoll: 'pravin.chandra@ipu.ac.in',
        role: 'faculty',
        facultyId: 'fac-pravin',
        designation: 'Professor',
        departmentOrBranch: 'Computer Science & Engg',
        avatar: 'PC',
      });
    } else if (role === 'student') {
      setSelectedSemester(1);
      setCurrentUser({
        id: 'usr-stud-02116403222',
        name: 'Arjun Sharma',
        emailOrRoll: '02116403222',
        role: 'student',
        departmentOrBranch: selectedBranch,
        semester: 1,
        section: selectedSection,
        avatar: 'AS',
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('usict_user');
  };

  const handleContinueAsGuest = () => {
    const guestUser: AuthUser = {
      id: 'usr-guest-evaluator',
      name: 'Guest Reviewer',
      emailOrRoll: 'guest.reviewer@usict.ac.in',
      role: 'admin',
      designation: 'Guest Evaluator',
      departmentOrBranch: 'Dean Office, USICT',
      avatar: 'GR',
    };
    handleLogin(guestUser);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('usict_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('usict_subjects', JSON.stringify(subjects));
  }, [subjects]);

  // Dark Mode HTML class handling & persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('usict_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('usict_theme', 'light');
    }
  }, [darkMode]);

  // Real-time Constraint Checking
  const { conflicts, entriesWithConflicts } = useMemo(() => {
    return detectScheduleConflicts(schedule, rooms, facultyList);
  }, [schedule, rooms, facultyList]);

  // Handler: Load 1st Semester Sample Dataset
  const handleLoad1stSemData = () => {
    setSchedule(INITIAL_SCHEDULE);
    setSubjects(INITIAL_SUBJECTS);
    setFacultyList(INITIAL_FACULTY);
    setRooms(INITIAL_ROOMS);
    setExams(INITIAL_EXAMS);
    setSelectedBranch('CSE');
    setSelectedSemester(1);
    setSelectedSection('Sec-A');
    setActiveTab('timetable');
    confetti({ particleCount: 50, spread: 60 });
  };

  // Handler: Load 3rd Semester Sample Dataset
  const handleLoad3rdSemData = () => {
    setSchedule(INITIAL_SCHEDULE);
    setSubjects(INITIAL_SUBJECTS);
    setFacultyList(INITIAL_FACULTY);
    setRooms(INITIAL_ROOMS);
    setExams(INITIAL_EXAMS);
    setSelectedBranch('CSE');
    setSelectedSemester(3);
    setSelectedSection('Sec-A');
    setActiveTab('timetable');
    confetti({ particleCount: 40, spread: 50 });
  };

  // Handler: Load Fresh USICT Sample Dataset (General)
  const handleLoadSampleData = () => {
    handleLoad1stSemData();
  };

  // Handler: Simulate Realistic Faculty Clash
  const handleSimulateClash = () => {
    // Inject duplicate booking for Prof. Pravin Chandra at Monday 10:00 AM (Slot 1) in E-315 for IT 3rd Sem
    const clashEntry: ScheduleEntry = {
      id: `clash-${Date.now()}`,
      subjectId: 'sub-cs-203',
      subjectCode: 'CS-203',
      subjectName: 'Computer Architecture & Org',
      facultyId: 'fac-pravin',
      facultyName: 'Prof. Pravin Chandra',
      roomId: 'room-e315',
      roomName: 'E-315',
      day: 'Monday',
      slotIndex: 1, // 10:00 AM (overlaps with CS-201 lecture)
      durationHours: 1,
      branch: 'IT',
      semester: 3,
      section: 'Sec-A',
      slotType: 'Lecture',
      colorTag: 'amber',
    };

    setSchedule((prev) => [clashEntry, ...prev]);

    // Add alert notification
    const newNotice: CampusNotification = {
      id: `notif-${Date.now()}`,
      title: '⚠️ Hard Constraint Violation Detected',
      message: 'Prof. Pravin Chandra has been double-booked on Monday 10:00 AM across CSE and IT batches.',
      type: 'CLASH_ALERT',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotice, ...prev]);
  };

  // Handler: Auto-generate Exams
  const handleAutoGenerateExams = () => {
    setActiveTab('exams');
    confetti({ particleCount: 50, spread: 60 });
  };

  // Handler: Update Schedule Entry
  const handleUpdateEntry = (updated: ScheduleEntry) => {
    setSchedule((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  // Handler: Delete Schedule Entry
  const handleDeleteEntry = (entryId: string) => {
    setSchedule((prev) => prev.filter((item) => item.id !== entryId));
  };

  // Handler: Add Single Schedule Entry
  const handleAddEntry = (entry: Omit<ScheduleEntry, 'id'>) => {
    const newEntry: ScheduleEntry = {
      ...entry,
      id: `sch-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    setSchedule((prev) => [...prev, newEntry]);
  };

  // Handler: Apply AI-Generated Batch Schedule
  const handleApplyBatchSchedule = (newEntries: ScheduleEntry[]) => {
    // Remove existing entries for this specific branch, semester, and section
    setSchedule((prev) => {
      const filtered = prev.filter(
        (e) =>
          !(
            e.branch === selectedBranch &&
            e.semester === selectedSemester &&
            e.section === selectedSection
          )
      );
      return [...filtered, ...newEntries];
    });
  };

  // Handler: Apply Conflict Shift Solution
  const handleApplyConflictShift = (
    entryId: string,
    newDay: DayOfWeek,
    newSlotIndex: number,
    newRoomId: string,
    newRoomName: string
  ) => {
    setSchedule((prev) =>
      prev.map((e) => {
        if (e.id === entryId) {
          return {
            ...e,
            day: newDay,
            slotIndex: newSlotIndex,
            roomId: newRoomId,
            roomName: newRoomName,
          };
        }
        return e;
      })
    );
    confetti({ particleCount: 30, spread: 45 });
  };

  // Handler: Import OCR Parsed Subjects
  const handleImportSubjects = (newSubjects: Subject[]) => {
    setSubjects((prev) => [...prev, ...newSubjects]);
  };

  // Handler: Add Leave / Swap Request
  const handleAddSwapRequest = (req: LeaveSwapRequest) => {
    setSwapRequests((prev) => [req, ...prev]);
    const notif: CampusNotification = {
      id: `notif-${Date.now()}`,
      title: `🔄 Lecture Swap Request: ${req.facultyName}`,
      message: `Requested substitute for ${req.originalSubject} on ${req.dateOrDay} (${req.slotTime}).`,
      type: 'SWAP_REQUEST',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Handler: Approve Swap Request
  const handleApproveSwap = (requestId: string) => {
    setSwapRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'APPROVED' } : r))
    );
    const notif: CampusNotification = {
      id: `notif-appr-${Date.now()}`,
      title: '✅ Lecture Swap Approved by Dean',
      message: 'The substitute faculty assignment has been approved and published to the campus master schedule.',
      type: 'ROOM_CHANGE',
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Export handlers
  const handleExportCSV = () => {
    exportTimetableToCSV(schedule, selectedBranch, selectedSemester, selectedSection);
  };

  const handleExportICS = () => {
    exportTimetableToICS(schedule, selectedBranch, selectedSemester, selectedSection);
  };

  const handlePrint = () => {
    exportTimetableToPDF(schedule, selectedBranch, selectedSemester, selectedSection, facultyList, rooms);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Universal Academic Header & Navigation */}
      <Navbar
        currentRole={currentRole}
        setCurrentRole={handleRoleChange}
        currentUser={currentUser}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        conflictCount={conflicts.length}
        unreadNotifications={unreadNotificationsCount}
        onOpenNotifications={() => setShowNotificationDrawer(true)}
        onLoadSampleData={handleLoadSampleData}
        onLoad1stSemData={handleLoad1stSemData}
        onLoad3rdSemData={handleLoad3rdSemData}
        onSimulateClash={handleSimulateClash}
        onAutoGenerateExams={handleAutoGenerateExams}
        onPrint={handlePrint}
        onExportCSV={handleExportCSV}
        onExportICS={handleExportICS}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenTourModal={() => setShowTourModal(true)}
        onOpenMongoModal={() => setShowMongoModal(true)}
      />

      {/* Main Content Area: Show Dedicated Login Portal View if Logged Out */}
      {!currentUser ? (
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
          <LoginPortalView
            facultyList={facultyList}
            currentUser={currentUser}
            onLogin={handleLogin}
            onContinueAsGuest={handleContinueAsGuest}
          />
        </main>
      ) : (
        /* Main Split Layout: Sidebar + Canvas Content */
        <div className="flex flex-1 overflow-hidden">
          {/* Academic Controls Sidebar (for Admin/Dean & General Navigation) */}
          {currentRole === 'admin' && (
            <aside className="hidden lg:flex w-60 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col flex-shrink-0 select-none">
              <div className="p-4 space-y-1.5 flex-1 overflow-y-auto">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 px-2 tracking-wider">
                Academic Controls
              </div>
              <button
                onClick={() => setActiveTab('timetable')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'timetable'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">📅</span>
                <span>Timetable Grid</span>
                {conflicts.length > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px]">
                    {conflicts.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'calendar'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">🗓️</span>
                <span>Academic Calendar</span>
              </button>

              <button
                onClick={() => setActiveTab('exams')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'exams'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">🪑</span>
                <span>Seating Matrix</span>
              </button>

              <button
                onClick={() => setActiveTab('faculty-workload')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'faculty-workload'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">👥</span>
                <span>Faculty Duties</span>
              </button>

              <button
                onClick={() => setActiveTab('rooms')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'rooms'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">🏢</span>
                <span>Room Allocation</span>
              </button>

              <div className="pt-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 px-2 tracking-wider">
                Data Processing
              </div>
              <button
                onClick={() => setActiveTab('syllabus-ocr')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'syllabus-ocr'
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">📄</span>
                <span>OCR Syllabus Parser</span>
              </button>

              <button
                onClick={() => setActiveTab('tinyfish')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition text-left ${
                  activeTab === 'tinyfish'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="text-base">🐟</span>
                <span>TinyFish Web Agent</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg text-sm font-medium transition text-left"
              >
                <span className="text-base">📤</span>
                <span>Export Center</span>
              </button>
            </div>

            {/* Sidebar Simulation Presets Footer */}
            <div className="mt-auto p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-wider">
                Simulation Presets
              </div>
              <div className="space-y-1.5 mb-2">
                <button
                  onClick={handleLoad1stSemData}
                  className="w-full text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:shadow-xs hover:border-indigo-400 transition font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Load 1st Sem Data</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold">CSE</span>
                </button>
                <button
                  onClick={handleLoad3rdSemData}
                  className="w-full text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:shadow-xs hover:border-indigo-400 transition font-medium text-slate-700 dark:text-slate-200 flex items-center justify-between"
                >
                  <span>Load 3rd Sem Data</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold">CSE</span>
                </button>
              </div>
              <button
                onClick={handleSimulateClash}
                className="w-full text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 rounded-lg hover:shadow-xs hover:border-amber-300 transition font-medium text-amber-700 dark:text-amber-400"
              >
                Simulate Faculty Clash
              </button>
            </div>
          </aside>
        )}

        {/* Main Dynamic Canvas Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 lg:pb-6">
          <div className="max-w-7xl w-full mx-auto">
            {/* Mobile Top Admin Navigation Strip (Visible on mobile & tablets for Admin role) */}
            {currentRole === 'admin' && (
              <div className="lg:hidden mb-4 p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between gap-2 px-1 mb-2">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                    Admin Quick Actions
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleLoad1stSemData}
                      className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-semibold border border-indigo-200 dark:border-indigo-800/60"
                    >
                      1st Sem
                    </button>
                    <button
                      onClick={handleLoad3rdSemData}
                      className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200 dark:border-slate-700"
                    >
                      3rd Sem
                    </button>
                    <button
                      onClick={handleSimulateClash}
                      className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-semibold border border-amber-200 dark:border-amber-800/60"
                    >
                      Clash Sim
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => setActiveTab('timetable')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'timetable'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>📅</span>
                    <span>Timetable</span>
                    {conflicts.length > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[9px] font-bold">
                        {conflicts.length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'calendar'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🗓️</span>
                    <span>Calendar</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('exams')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'exams'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🪑</span>
                    <span>Seating</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('faculty-workload')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'faculty-workload'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>👥</span>
                    <span>Faculty</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'rooms'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🏢</span>
                    <span>Rooms</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('syllabus-ocr')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'syllabus-ocr'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>📄</span>
                    <span>OCR Parser</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tinyfish')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                      activeTab === 'tinyfish'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🐟</span>
                    <span>TinyFish Agent</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    <span>📤</span>
                    <span>Export</span>
                  </button>
                </div>
              </div>
            )}

            {/* Role: Student Portal Override */}
            {currentRole === 'student' && activeTab !== 'calendar' ? (
              <StudentView
                schedule={schedule}
                exams={exams}
                rooms={rooms}
                onExportICS={handleExportICS}
                initialBranch={selectedBranch}
                initialSemester={selectedSemester}
                initialSection={selectedSection}
                initialRoll={currentUser?.role === 'student' ? currentUser.emailOrRoll : '02116403222'}
                studentName={currentUser?.role === 'student' ? currentUser.name : 'Arjun Sharma'}
              />
            ) : currentRole === 'faculty' && activeTab !== 'calendar' ? (
              /* Role: Faculty Portal Override */
              <FacultyView
                facultyList={facultyList}
                schedule={schedule}
                invigilationDuties={[]}
                onAddSwapRequest={handleAddSwapRequest}
                activeFacultyId={currentUser?.role === 'faculty' ? currentUser.facultyId : undefined}
              />
            ) : (
              /* Role: Admin / Dean Master Views & Shared Views */
              <>
                {activeTab === 'timetable' && (
                  <TimetableGrid
                    schedule={schedule}
                    subjects={subjects}
                    facultyList={facultyList}
                    rooms={rooms}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={setSelectedBranch}
                    selectedSemester={selectedSemester}
                    setSelectedSemester={setSelectedSemester}
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                    conflicts={conflicts}
                    entriesWithConflicts={entriesWithConflicts}
                    onSelectConflict={(c) => setActiveConflictForModal(c)}
                    onOpenSmartGenerate={() => setShowSmartGenerateModal(true)}
                    onUpdateEntry={handleUpdateEntry}
                    onDeleteEntry={handleDeleteEntry}
                    onAddEntry={handleAddEntry}
                    isAdmin={currentRole === 'admin'}
                  />
                )}

                {activeTab === 'calendar' && (
                  <CalendarView
                    schedule={schedule}
                    exams={exams}
                    facultyList={facultyList}
                    rooms={rooms}
                    selectedBranch={selectedBranch}
                    setSelectedBranch={setSelectedBranch}
                    selectedSemester={selectedSemester}
                    setSelectedSemester={setSelectedSemester}
                    selectedSection={selectedSection}
                    setSelectedSection={setSelectedSection}
                  />
                )}

                {activeTab === 'exams' && (
                  <ExamSchedulerView
                    exams={exams}
                    rooms={rooms}
                    facultyList={facultyList}
                    onAddExam={(newExam) => setExams((prev) => [...prev, newExam])}
                    isAdmin={currentRole === 'admin'}
                  />
                )}

                {activeTab === 'syllabus-ocr' && (
                  <SyllabusParserView onImportSubjects={handleImportSubjects} />
                )}

                {activeTab === 'tinyfish' && (
                  <TinyFishHubView
                    onSyncExams={(newExams) => {
                      setExams((prev) => [...prev, ...newExams]);
                      confetti({ particleCount: 50, spread: 60 });
                      setNotifications((prev) => [
                        {
                          id: `notif-tinyfish-2026-${Date.now()}`,
                          title: '2026 USICT Exam Dates Synced',
                          message: `Successfully extracted and synced ${newExams.length} verified 2026 USICT exam schedules to the master matrix.`,
                          timestamp: 'Just now',
                          type: 'EXAM_NOTICE',
                          read: false,
                          targetRole: 'ALL',
                        },
                        ...prev,
                      ]);
                    }}
                    onSyncSubjects={(newSubjects) => {
                      setSubjects((prev) => [...prev, ...newSubjects]);
                      confetti({ particleCount: 40, spread: 50 });
                      setNotifications((prev) => [
                        {
                          id: `notif-tf-sub-2026-${Date.now()}`,
                          title: 'NEP-2026 Curriculum Updated',
                          message: `Imported ${newSubjects.length} NEP-2026 course schemes with continuous lab hours into the course catalog.`,
                          timestamp: 'Just now',
                          type: 'ROOM_CHANGE',
                          read: false,
                          targetRole: 'ALL',
                        },
                        ...prev,
                      ]);
                    }}
                    onNavigateToTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'rooms' && (
                  <RoomAllocationView rooms={rooms} schedule={schedule} />
                )}

                {activeTab === 'faculty-workload' && (
                  <FacultyWorkloadView facultyList={facultyList} schedule={schedule} />
                )}
              </>
            )}
          </div>
        </main>
      </div>
      )}

      {/* Role-Based Login Portal Modal */}
      <LoginPortalModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        facultyList={facultyList}
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Conflict Diagnostic & AI Resolution Modal */}
      {activeConflictForModal && (
        <ConflictResolverModal
          conflict={activeConflictForModal}
          onClose={() => setActiveConflictForModal(null)}
          schedule={schedule}
          rooms={rooms}
          facultyList={facultyList}
          onApplySlot={handleApplyConflictShift}
        />
      )}

      {/* AI Smart Timetable Generator Modal */}
      <SmartGenerateModal
        isOpen={showSmartGenerateModal}
        onClose={() => setShowSmartGenerateModal(false)}
        selectedBranch={selectedBranch}
        selectedSemester={selectedSemester}
        selectedSection={selectedSection}
        subjects={subjects}
        facultyList={facultyList}
        rooms={rooms}
        existingSchedule={schedule}
        onApplySchedule={handleApplyBatchSchedule}
      />

      {/* Campus Notifications Drawer */}
      <NotificationDrawer
        isOpen={showNotificationDrawer}
        onClose={() => setShowNotificationDrawer(false)}
        notifications={notifications}
        swapRequests={swapRequests}
        onMarkAllRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        }}
        onApproveSwap={handleApproveSwap}
      />

      {/* MongoDB Cloud Database & Persistence Modal */}
      <MongoCloudModal
        isOpen={showMongoModal}
        onClose={() => setShowMongoModal(false)}
        schedule={schedule}
        subjects={subjects}
        facultyList={facultyList}
        rooms={rooms}
        exams={exams}
        onDataRestored={(restored) => {
          if (restored.schedule) setSchedule(restored.schedule);
          if (restored.subjects) setSubjects(restored.subjects);
          if (restored.facultyList) setFacultyList(restored.facultyList);
          if (restored.rooms) setRooms(restored.rooms);
          if (restored.exams) setExams(restored.exams);
        }}
      />

      {/* Hackathon Pitch & Interactive Demo Tour Modal */}
      <HackathonTourModal
        isOpen={showTourModal}
        onClose={() => setShowTourModal(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onTriggerSimulateClash={handleSimulateClash}
        onTriggerSmartGenerate={() => setShowSmartGenerateModal(true)}
        onOpenMongoModal={() => setShowMongoModal(true)}
        onOpenSyllabusOCR={() => setActiveTab('syllabus-ocr')}
      />

      {/* Mobile Bottom Quick Navigation Dock (For easy thumb access on mobile) */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-md px-2 py-1.5 flex items-center justify-around shadow-lg no-print">
        <button
          onClick={() => setActiveTab('timetable')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition relative min-w-[56px] ${
            activeTab === 'timetable'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <span className="text-lg leading-none">📅</span>
          <span className="text-[10px] mt-0.5">Timetable</span>
          {conflicts.length > 0 && (
            <span className="absolute top-0.5 right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse">
              {conflicts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] ${
            activeTab === 'calendar'
              ? 'text-indigo-600 dark:text-indigo-400 font-bold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
          }`}
        >
          <span className="text-lg leading-none">🗓️</span>
          <span className="text-[10px] mt-0.5">Calendar</span>
        </button>

        {currentRole === 'admin' ? (
          <>
            <button
              onClick={() => setActiveTab('exams')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] ${
                activeTab === 'exams'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="text-lg leading-none">🪑</span>
              <span className="text-[10px] mt-0.5">Seating</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty-workload')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] ${
                activeTab === 'faculty-workload'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="text-lg leading-none">👥</span>
              <span className="text-[10px] mt-0.5">Faculty</span>
            </button>

            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] ${
                activeTab === 'rooms'
                  ? 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="text-lg leading-none">🏢</span>
              <span className="text-[10px] mt-0.5">Rooms</span>
            </button>

            <button
              onClick={() => setActiveTab('tinyfish')}
              className={`flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] ${
                activeTab === 'tinyfish'
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium'
              }`}
            >
              <span className="text-lg leading-none">🐟</span>
              <span className="text-[10px] mt-0.5">TinyFish</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            className="flex flex-col items-center justify-center p-1.5 rounded-xl transition min-w-[56px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
          >
            <span className="text-lg leading-none">🔑</span>
            <span className="text-[10px] mt-0.5">Switch Role</span>
          </button>
        )}
      </nav>

      {/* Institutional Polish Footer */}
      <footer className="h-9 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 text-xs text-slate-500 dark:text-slate-400 no-print select-none">
        <div className="flex items-center gap-4">
          <span className="text-[10px] text-slate-400">Version 2.4.0 (Stable)</span>
          <span className="text-[10px] text-slate-300 dark:text-slate-700">|</span>
          <span className="text-[10px] text-slate-400 italic font-serif">Powered by USICT IT Services Cell</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">● SYSTEM OPERATIONAL</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">DWARKA CAMPUS SECTOR 16-C</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
