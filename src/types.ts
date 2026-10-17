export type Program = 'CSE' | 'IT' | 'ECE' | 'AI-DS' | 'AI-ML' | 'Dual-Degree' | 'MCA';

export type Semester = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Section = 'Sec-A' | 'Sec-B' | 'Sec-C';

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export interface TimeSlotDef {
  index: number;
  label: string;
  startTime: string;
  endTime: string;
  isLunch?: boolean;
}

export const TIME_SLOTS: TimeSlotDef[] = [
  { index: 0, label: '09:00 - 10:00 AM', startTime: '09:00', endTime: '10:00' },
  { index: 1, label: '10:00 - 11:00 AM', startTime: '10:00', endTime: '11:00' },
  { index: 2, label: '11:00 - 12:00 PM', startTime: '11:00', endTime: '12:00' },
  { index: 3, label: '12:00 - 01:00 PM', startTime: '12:00', endTime: '13:00' },
  { index: 4, label: '01:00 - 02:00 PM', startTime: '13:00', endTime: '14:00', isLunch: true },
  { index: 5, label: '02:00 - 03:00 PM', startTime: '14:00', endTime: '15:00' },
  { index: 6, label: '03:00 - 04:00 PM', startTime: '15:00', endTime: '16:00' },
  { index: 7, label: '04:00 - 05:00 PM', startTime: '16:00', endTime: '17:00' },
];

export type RoomType = 'Lecture Hall' | 'Lab' | 'Seminar Hall' | 'Central Exam Hall';
export type AcademicBlock = 'E-Block' | 'C-Block' | 'Central';

export interface Room {
  id: string;
  name: string;
  block: AcademicBlock;
  type: RoomType;
  capacity: number;
  floor: number;
  features?: string[];
}

export interface FacultyOfficeHour {
  id: string;
  day: DayOfWeek;
  startTime: string; // e.g. "14:00"
  endTime: string;   // e.g. "16:00"
  location: string;  // e.g. "Room E-312, USICT" or "Google Meet / Virtual"
  mode: 'In-Person' | 'Virtual (Meet)' | 'Hybrid';
  meetLink?: string;
  maxStudents?: number;
  availableFor: string[]; // e.g. ["Research Guidance", "Syllabus Doubt Clearing", "Project Mentorship"]
  status: 'Open' | 'Busy' | 'Rescheduled';
}

export interface Faculty {
  id: string;
  name: string;
  designation: 'Professor' | 'Associate Professor' | 'Assistant Professor' | 'Dean / HOD' | 'Visiting Faculty';
  department: string;
  email: string;
  maxHoursPerWeek: number;
  assignedHours: number;
  specialization: string;
  avatarColor?: string;
  officeHours?: FacultyOfficeHour[];
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  credits: number;
  ltp: string; // e.g. "3-1-0" or "0-0-2"
  type: 'Theory' | 'Practical' | 'Core' | 'Elective';
  branch: Program;
  semester: Semester;
  defaultFacultyId: string;
  defaultRoomType: RoomType;
  difficulty?: 'High' | 'Medium' | 'Foundational';
  colorTag?: string;
}

export interface ScheduleEntry {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomName: string;
  day: DayOfWeek;
  slotIndex: number; // 0 to 7
  durationHours: number; // 1 or 2
  branch: Program;
  semester: Semester;
  section: Section;
  slotType: 'Lecture' | 'Lab' | 'Tutorial';
  colorTag?: string;
  isConflict?: boolean;
  conflictReason?: string;
}

export type ConflictType =
  | 'FACULTY_DOUBLE_BOOKED'
  | 'ROOM_OVERLAP'
  | 'SECTION_OVERLAP'
  | 'LAB_DURATION_INVALID'
  | 'LUNCH_OCCUPIED'
  | 'CONSECUTIVE_OVERLOAD'
  | 'FRIDAY_LATE_HEAVY';

export interface ConflictAlert {
  id: string;
  type: ConflictType;
  severity: 'HARD' | 'SOFT';
  title: string;
  message: string;
  involvedEntries: string[];
  suggestedSlot?: {
    day: DayOfWeek;
    slotIndex: number;
    roomId: string;
    roomName: string;
    reason: string;
  };
}

export type ExamCycle = 'Minor 1' | 'Minor 2' | 'End Sem';

export interface Exam {
  id: string;
  subjectCode: string;
  subjectName: string;
  branch: Program;
  semester: Semester;
  date: string; // YYYY-MM-DD
  timeRange: string;
  session: 'Morning (09:30 - 12:30)' | 'Evening (02:00 - 05:00)' | 'Morning (10:00 - 11:30)' | 'Mid-Day (12:00 - 01:30)' | string;
  totalEnrolled: number;
  hallIds: string[];
  paperSetterFacultyId?: string;
  cycle?: ExamCycle;
  maxMarks?: number;
  syllabusScope?: string;
}

export interface SeatingSeat {
  row: number; // 0-indexed
  col: number; // 0-indexed
  deskNumber: string; // e.g. "D-101"
  studentRoll: string;
  studentName: string;
  branch: Program;
  semester: Semester;
  subjectCode: string;
  subjectName: string;
  colorTag: string;
}

export interface SeatingPlan {
  id: string;
  examId?: string;
  date: string;
  session: string;
  hallId: string;
  hallName: string;
  totalRows: number;
  totalCols: number;
  grid: SeatingSeat[];
  invigilators: {
    facultyId: string;
    name: string;
    designation: string;
    reportingTime: string;
  }[];
}

export interface InvigilationDuty {
  id: string;
  facultyId: string;
  facultyName: string;
  designation: string;
  date: string;
  session: 'Morning (09:30 - 12:30)' | 'Evening (02:00 - 05:00)';
  hallName: string;
  totalStudentsAssigned: number;
  isOwnSubjectConflict: boolean;
  status: 'CONFIRMED' | 'SUBSTITUTE_REQUESTED' | 'SWAPPED';
}

export interface LeaveSwapRequest {
  id: string;
  facultyId: string;
  facultyName: string;
  dateOrDay: string;
  slotTime: string;
  originalSubject: string;
  originalRoom: string;
  targetFacultyId?: string;
  targetFacultyName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  createdAt: string;
}

export interface CampusNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'SWAP_REQUEST' | 'SWAP_ALERT' | 'CLASH_ALERT' | 'CLASH_DETECTED' | 'EXAM_NOTICE' | 'ROOM_CHANGE';
  read: boolean;
  targetRole?: 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMIN';
}

export type NotificationItem = CampusNotification;

export type UserRole = 'admin' | 'faculty' | 'student';

export interface AuthUser {
  id: string;
  name: string;
  emailOrRoll: string;
  role: UserRole;
  avatar?: string;
  departmentOrBranch: string;
  designation?: string;
  semester?: Semester;
  section?: Section;
  facultyId?: string;
}

// --- TinyFish AI Web Agent & Web Infrastructure Types ---
export interface TinyFishSearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  sourceDomain: string;
  date?: string;
  category: 'Datesheet' | 'Circular' | 'Syllabus' | 'Faculty' | 'Regulation';
  relevanceScore?: number;
}

export interface TinyFishFetchResult {
  url: string;
  title: string;
  markdown: string;
  rawHtmlTokens: number;
  cleanMarkdownTokens: number;
  tokenSavingsPercent: number;
  fetchedAt: string;
  structuredData?: {
    courses?: { code: string; name: string; ltp: string; credits: number }[];
    examDates?: { subjectCode: string; date: string; session: string }[];
    holidays?: { name: string; date: string; type: string }[];
    regulations?: { key: string; limit: string; compliance: string }[];
  };
}

export interface TinyFishAgentStep {
  stepNumber: number;
  action: 'init_session' | 'stealth_proxy' | 'navigate' | 'evaluate_dom' | 'handle_filters' | 'extract_matrix' | 'synthesize';
  title: string;
  detail: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs?: number;
}

export interface TinyFishAgentRun {
  id: string;
  goal: string;
  targetUrl: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  steps: TinyFishAgentStep[];
  summary: string;
  extractedData?: any;
  syncAvailable: boolean;
  syncType?: 'EXAMS' | 'TIMETABLE' | 'CALENDAR' | 'FACULTY';
  executionTimeMs: number;
  tokensProcessed: number;
}

export interface TinyFishEngineStatus {
  connected: boolean;
  version: string;
  stealthMode: boolean;
  activeSessions: number;
  freeTierSearchAndFetch: boolean;
  totalTokensSaved: number;
  lastPingMs: number;
}

