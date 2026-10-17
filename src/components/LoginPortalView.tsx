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
  KeyRound, 
  Building2,
  BookOpen,
  Calendar,
  Eye,
  EyeOff,
  UserPlus,
  HelpCircle,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { authenticateUserApi } from '../utils/tinyfishApi';

interface LoginPortalViewProps {
  facultyList: Faculty[];
  currentUser: AuthUser | null;
  onLogin: (user: AuthUser) => void;
  onContinueAsGuest: () => void;
}

export const LoginPortalView: React.FC<LoginPortalViewProps> = ({
  facultyList,
  currentUser,
  onLogin,
  onContinueAsGuest,
}) => {
  const [activeTab, setActiveTab] = useState<UserRole | 'register'>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const triggerLoginSuccess = (user: AuthUser) => {
    setSuccessMessage(`Authenticated successfully as ${user.name} (${user.role.toUpperCase()})`);
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => {
      onLogin(user);
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

  // 1-Click Quick Demo Profiles
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
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Campus Branding & Identity */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span>USICT Academic Portal 2026</span>
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Single Sign-On <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">
                USICT Campus Portal
              </span>
            </h1>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              University School of Information, Communication & Technology (USICT), GGSIPU Dwarka Sector 16-C. Unified role-authorized access for Dean, Faculty, and Students.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-white">Role-Based Access Control (RBAC)</div>
                <div className="text-slate-500">Autonomous timetable generator, room allocation, & exam seating</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <span className="text-sm">🐟</span>
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-white">TinyFish Live 2026 Engine</div>
                <div className="text-slate-500">Extracts latest 2026 USICT datesheets, NEP syllabus & UGC regulations</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <div className="font-bold text-slate-800 dark:text-white">Real-Time Synchronization</div>
                <div className="text-slate-500">Live lecture countdown, conflict engine, & MongoDB Atlas persistence</div>
              </div>
            </div>
          </div>

          {/* Guest Pass Shortcut */}
          <div className="pt-2">
            <button
              onClick={onContinueAsGuest}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold flex items-center gap-1.5 transition"
            >
              <span>Explore as Guest / Evaluator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Login Portal Card */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            {/* Top Role Selector Header */}
            <div className="p-6 bg-slate-900 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-600/40">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-white">USICT Authentication Portal</h2>
                    <p className="text-xs text-slate-300">Select user role or register a new identity</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  2026 Secure SSO
                </span>
              </div>

              {/* Navigation Tabs */}
              <div className="grid grid-cols-4 gap-1.5 mt-5 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs">
                <button
                  type="button"
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

            {/* Success Feedback Alert */}
            {successMessage && (
              <div className="bg-emerald-500 text-white px-6 py-2.5 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Tab 1: Dean / Admin Login */}
            {activeTab === 'admin' && (
              <div className="p-6 space-y-4">
                <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Dean & Head of Academics Console</span>: Master timetable generation, conflict arbitration, room optimization, and TinyFish web crawler execution.
                  </div>
                </div>

                <form onSubmit={handleAdminSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Dean / Administrator Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="dean.academic@usict.ac.in"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Security Passphrase
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-indigo-500 transition font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    <button
                      type="button"
                      onClick={quickLoginAsAdmin}
                      className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>1-Click Dean Demo Login</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      <span>Sign In as Dean</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 2: Faculty Member Login */}
            {activeTab === 'faculty' && (
              <div className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  Access weekly teaching timetable, AICTE workload monitoring, office hour scheduling, and lecture swap approvals.
                </div>

                <form onSubmit={handleFacultySubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Select Faculty Member
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
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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

                  {/* 1-Click Quick Presets */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      1-Click Verified Faculty Accounts
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => quickLoginFaculty('fac-pravin')}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">Prof. Pravin Chandra</div>
                        <div className="text-[10px] text-slate-500">CS Dept • Professor</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => quickLoginFaculty('fac-rahul')}
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">Dr. Rahul Johari</div>
                        <div className="text-[10px] text-slate-500">IT Dept • Assoc. Prof</div>
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

            {/* Tab 3: Student Login */}
            {activeTab === 'student' && (
              <div className="p-6 space-y-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                  Log in to access your customized semester timetable, live class status with countdown, attendance tracker, and exam seating hall.
                </div>

                <form onSubmit={handleStudentSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Student Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Arjun Sharma"
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
                        Branch
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
                            Sem {s} (2026)
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

                  {/* 1-Click Quick Student Presets */}
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                      1-Click Student Demo Profiles
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() =>
                          quickLoginStudent('02116403222', 'Arjun Sharma', 'CSE', 2, 'Sec-A')
                        }
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">Arjun Sharma</div>
                        <div className="text-[10px] text-slate-500">CSE • 2nd Sem (2026)</div>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          quickLoginStudent('04516403222', 'Priya Verma', 'CSE', 4, 'Sec-A')
                        }
                        className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:border-indigo-400 border border-slate-200 dark:border-slate-700 text-left transition"
                      >
                        <div className="font-bold text-slate-900 dark:text-white truncate">Priya Verma</div>
                        <div className="text-[10px] text-slate-500">CSE • 4th Sem (2026)</div>
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
                    <span className="font-bold">Instant Campus Registration</span>: Register a new student or faculty account. Credentials are instantaneously verified and synced with USICT CampusScheduler.
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
                        placeholder="Dr. Ankit Verma or Rohit Roy"
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
                        placeholder="ankit@ipu.ac.in or 05216403224"
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Account Role
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value as UserRole)}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty Member</option>
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

            {/* Card Footer */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>USICT Secure SSO & RBAC Session Active</span>
              </span>
              <button
                onClick={onContinueAsGuest}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Skip Login & Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
