import React, { useState } from 'react';
import { UserRole, Program, Semester, Section, Faculty, AuthUser } from '../types';
import { 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Lock, 
  Mail, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  X, 
  KeyRound, 
  Building2,
  BookOpen,
  Calendar,
  LogOut,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { authenticateUserApi } from '../utils/tinyfishApi';

interface LoginPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  facultyList: Faculty[];
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onLogout?: () => void;
}

export const LoginPortalModal: React.FC<LoginPortalModalProps> = ({
  isOpen,
  onClose,
  facultyList,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole | 'register'>(currentUser?.role || 'admin');

  // Admin Form State
  const [adminEmail, setAdminEmail] = useState('dean.academic@usict.ac.in');
  const [adminPassword, setAdminPassword] = useState('admin@usict2026');

  // Faculty Form State
  const [selectedFacultyId, setSelectedFacultyId] = useState(facultyList[0]?.id || 'fac-pravin');
  const [facultyPin, setFacultyPin] = useState('1234');

  // Student Form State
  const [studentRoll, setStudentRoll] = useState('02116403222');
  const [studentName, setStudentName] = useState('Arjun Sharma');
  const [studentBranch, setStudentBranch] = useState<Program>('CSE');
  const [studentSemester, setStudentSemester] = useState<Semester>(1);
  const [studentSection, setStudentSection] = useState<Section>('Sec-A');
  const [studentPassword, setStudentPassword] = useState('student2026');

  // Registration Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('student');
  const [regBranch, setRegBranch] = useState<Program>('CSE');
  const [regSemester, setRegSemester] = useState<Semester>(1);
  const [regSection, setRegSection] = useState<Section>('Sec-A');

  // Feedback State
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const triggerLoginSuccess = (user: AuthUser) => {
    setSuccessMessage(`Authenticated successfully as ${user.name} (${user.role.toUpperCase()})`);
    confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
    setTimeout(() => {
      onLogin(user);
      onClose();
      setSuccessMessage(null);
    }, 400);
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authenticateUserApi({
        role: 'admin',
        emailOrRoll: adminEmail,
        password: adminPassword,
      });
      triggerLoginSuccess(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const faculty = facultyList.find((f) => f.id === selectedFacultyId) || facultyList[0];
      const res = await authenticateUserApi({
        role: 'faculty',
        facultyId: faculty.id,
        emailOrRoll: faculty.email,
        password: facultyPin,
      });
      triggerLoginSuccess({
        ...res.user,
        name: faculty.name,
        designation: faculty.designation,
        departmentOrBranch: faculty.department,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authenticateUserApi({
        role: 'student',
        emailOrRoll: studentRoll,
        password: studentPassword,
        studentName,
        studentBranch,
        studentSemester,
        studentSection,
      });
      triggerLoginSuccess(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: AuthUser = {
      id: `usr-reg-${Date.now()}`,
      name: regName || 'Registered User',
      emailOrRoll: regEmail || 'user@ipu.ac.in',
      role: regRole,
      departmentOrBranch: regBranch,
      semester: regRole === 'student' ? regSemester : undefined,
      section: regRole === 'student' ? regSection : undefined,
      designation: regRole === 'faculty' ? 'Assistant Professor' : undefined,
      avatar: (regName || 'RU').split(' ').map((n) => n[0]).slice(0, 2).join(''),
    };
    triggerLoginSuccess(newUser);
  };

  // Quick 1-Click Demo Profiles
  const quickLoginAsAdmin = () => {
    const adminUser: AuthUser = {
      id: 'usr-admin-dean',
      name: 'Prof. C.S. Rai',
      emailOrRoll: 'dean.academic@usict.ac.in',
      role: 'admin',
      designation: 'Dean (Academics)',
      departmentOrBranch: 'Dean Office, USICT',
      avatar: 'DA',
    };
    triggerLoginSuccess(adminUser);
  };

  const quickLoginFaculty = (facultyId: string) => {
    const faculty = facultyList.find((f) => f.id === facultyId) || facultyList[0];
    const facultyUser: AuthUser = {
      id: `usr-${faculty.id}`,
      name: faculty.name,
      emailOrRoll: faculty.email,
      role: 'faculty',
      facultyId: faculty.id,
      designation: faculty.designation,
      departmentOrBranch: faculty.department,
      avatar: faculty.name.split(' ').map((n) => n[0]).slice(-2).join(''),
    };
    triggerLoginSuccess(facultyUser);
  };

  const quickLoginStudent = (
    roll: string,
    name: string,
    branch: Program,
    semester: Semester,
    section: Section
  ) => {
    const studentUser: AuthUser = {
      id: `usr-stud-${roll}`,
      name,
      emailOrRoll: roll,
      role: 'student',
      departmentOrBranch: branch,
      semester,
      section,
      avatar: name.split(' ').map((n) => n[0]).slice(0, 2).join(''),
    };
    triggerLoginSuccess(studentUser);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="flex items-start justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 border border-indigo-400/40 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                      USICT Dwarka
                    </span>
                    <span className="text-[10px] text-slate-400">GGSIPU Campus 2026</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-0.5">
                    Unified Academic Portal Login
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Access role-authorized timetable, exam roster & scheduling modules
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Currently Active Session Indicator */}
            {currentUser && (
              <div className="mt-4 p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 font-bold text-[10px] flex items-center justify-center text-white">
                    {currentUser.avatar || 'U'}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-200">Active Session: </span>
                    <span className="text-white font-bold">{currentUser.name}</span>
                    <span className="ml-1.5 px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 text-[10px] uppercase font-bold">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      onClose();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-[11px] transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </div>
            )}

            {/* Role Navigation Tabs */}
            <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
              <button
                type="button"
                id="tab-login-admin"
                onClick={() => setActiveTab('admin')}
                className={`py-2 px-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                id="tab-login-faculty"
                onClick={() => setActiveTab('faculty')}
                className={`py-2 px-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'faculty'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Faculty</span>
              </button>

              <button
                type="button"
                id="tab-login-student"
                onClick={() => setActiveTab('student')}
                className={`py-2 px-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'student'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>

              <button
                type="button"
                id="tab-login-register"
                onClick={() => setActiveTab('register')}
                className={`py-2 px-2 rounded-xl font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-emerald-500 text-white px-6 py-3 text-xs font-semibold flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Tab 1: Dean / Admin Login */}
          {activeTab === 'admin' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-indigo-50/80 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <div>
                    <div className="font-bold text-indigo-950 dark:text-indigo-200">
                      Dean & Academic Controller Privileges
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                      Full authority to generate schedules, resolve hard clashes, and manage exam rosters.
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="dean.academic@usict.ac.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Security Passkey / Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={quickLoginAsAdmin}
                    className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>1-Click Dean Demo Login</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span>Sign In to Dean Console</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 2: Faculty Member Login */}
          {activeTab === 'faculty' && (
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                Sign in to view your customized weekly lecture timetable, manage office hours, submit lecture swap requests, and review exam duties.
              </div>

              <form onSubmit={handleFacultySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Select USICT Faculty Instructor
                  </label>
                  <select
                    value={selectedFacultyId}
                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation} — {f.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Faculty Security PIN
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={facultyPin}
                      onChange={(e) => setFacultyPin(e.target.value)}
                      placeholder="••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Presets for Key Faculty */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                    Quick 1-Click Faculty Demo Profiles
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => quickLoginFaculty('fac-pravin')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                    >
                      <div className="font-bold text-slate-900 dark:text-white truncate">Prof. Pravin Chandra</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">CS Dept • Prof.</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => quickLoginFaculty('fac-rahul')}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                    >
                      <div className="font-bold text-slate-900 dark:text-white truncate">Dr. Rahul Johari</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">IT Dept • Assoc. Prof.</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span>Sign In to Faculty Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 3: Student Portal Login */}
          {activeTab === 'student' && (
            <div className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                Log in to access your semester schedule, today's lecture schedule with live countdown, attendance goals, and exam seating hall.
              </div>

              <form onSubmit={handleStudentSubmit} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Arjun Sharma"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enrollment / Roll No
                    </label>
                    <input
                      type="text"
                      required
                      value={studentRoll}
                      onChange={(e) => setStudentRoll(e.target.value)}
                      placeholder="02116403222"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Branch / Program
                    </label>
                    <select
                      value={studentBranch}
                      onChange={(e) => setStudentBranch(e.target.value as Program)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="CSE">B.Tech CSE</option>
                      <option value="IT">B.Tech IT</option>
                      <option value="ECE">B.Tech ECE</option>
                      <option value="AI-DS">B.Tech AI-DS</option>
                      <option value="AI-ML">B.Tech AI-ML</option>
                      <option value="MCA">MCA (SE)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={studentSemester}
                      onChange={(e) => setStudentSemester(Number(e.target.value) as Semester)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Section
                    </label>
                    <select
                      value={studentSection}
                      onChange={(e) => setStudentSection(e.target.value as Section)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="Sec-A">Section A</option>
                      <option value="Sec-B">Section B</option>
                      <option value="Sec-C">Section C</option>
                    </select>
                  </div>
                </div>

                {/* Quick 1-Click Student Presets */}
                <div>
                  <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                    Quick 1-Click Student Presets
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() =>
                        quickLoginStudent('02116403222', 'Arjun Sharma', 'CSE', 2, 'Sec-A')
                      }
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">Arjun Sharma</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">CSE • 2nd Sem (2026)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        quickLoginStudent('04516403222', 'Priya Verma', 'CSE', 4, 'Sec-A')
                      }
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">Priya Verma</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">CSE • 4th Sem (2026)</div>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                  >
                    <span>Sign In to Student Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab 4: Register New User */}
          {activeTab === 'register' && (
            <div className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/50 text-xs text-emerald-900 dark:text-emerald-200 flex items-center gap-2.5">
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <span className="font-bold">Instant Campus Registration</span>: Register a new student or faculty account.
                </div>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Sneha Roy"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email or Roll No
                    </label>
                    <input
                      type="text"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="sneha@ipu.ac.in"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Role
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Department
                    </label>
                    <select
                      value={regBranch}
                      onChange={(e) => setRegBranch(e.target.value as Program)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      <option value="CSE">CSE</option>
                      <option value="IT">IT</option>
                      <option value="AI-DS">AI-DS</option>
                      <option value="AI-ML">AI-ML</option>
                      <option value="ECE">ECE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Semester
                    </label>
                    <select
                      value={regSemester}
                      onChange={(e) => setRegSemester(Number(e.target.value) as Semester)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Sem {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>USICT Single Sign-On (SSO) Simulation</span>
            </span>
            <button
              onClick={onClose}
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium"
            >
              Continue without signing in
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
