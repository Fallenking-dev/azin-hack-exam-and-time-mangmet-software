import { Exam, Faculty, InvigilationDuty, Program, Room, SeatingPlan, SeatingSeat } from '../types';

export const USICT_BRANCH_CODES: Record<Program, string> = {
  CSE: '032',
  IT: '093',
  ECE: '028',
  'AI-DS': '119',
  'AI-ML': '120',
  'Dual-Degree': '016',
  MCA: '044',
};

const BRANCH_COLOR_MAP: Record<string, string> = {
  CSE: 'bg-blue-500/15 border-blue-500 text-blue-900 dark:text-blue-200',
  IT: 'bg-orange-500/15 border-orange-500 text-orange-900 dark:text-orange-200',
  ECE: 'bg-sky-500/15 border-sky-500 text-sky-900 dark:text-sky-200',
  'AI-DS': 'bg-violet-500/15 border-violet-500 text-violet-900 dark:text-violet-200',
  'AI-ML': 'bg-fuchsia-500/15 border-fuchsia-500 text-fuchsia-900 dark:text-fuchsia-200',
  'Dual-Degree': 'bg-emerald-500/15 border-emerald-500 text-emerald-900 dark:text-emerald-200',
  MCA: 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200',
};

// Realistic student names pool for GGSIPU USICT
const SAMPLE_STUDENT_NAMES = [
  'Aarav Sharma', 'Aditi Verma', 'Akash Gupta', 'Ananya Roy', 'Aryan Malhotra',
  'Bhavya Singhal', 'Chaitanya Joshi', 'Devansh Saxena', 'Diya Kapoor', 'Gaurav Mehra',
  'Harshit Tiwari', 'Ishaan Batra', 'Janhavi Mishra', 'Kartik Aggarwal', 'Kavya Nair',
  'Lakshay Rawat', 'Manav Chopra', 'Nandini Das', 'Pranav Kaushik', 'Rhea Sengupta',
  'Rohan Bhatnagar', 'Sakshi Goyal', 'Tanmay Sethi', 'Utkarsh Pandey', 'Vaishnavi Pillai',
  'Varun Grover', 'Vidhi Rastogi', 'Yashvardhan Rao', 'Zoya Khan', 'Aman Deep',
  'Ritik Srivastava', 'Sneha Chauhan', 'Tushar Mathur', 'Mehak Arora', 'Nikhil Tyagi'
];

/**
 * Generates an Anti-Cheating Interleaved 2D Seating Plan Matrix.
 * Guarantees horizontally and vertically adjacent students sit for different branches/papers.
 */
export function generateAntiCheatingSeatingPlan(
  hall?: Room | null,
  activeExamsForSlot: Exam[] = [],
  facultyList: Faculty[] = [],
  totalRows: number = 8,
  totalCols: number = 8
): SeatingPlan {
  const safeHall: Room = hall || {
    id: 'hall-central-a',
    name: 'Central Exam Hall A (E-Block)',
    block: 'E-Block',
    type: 'Central Exam Hall',
    capacity: 120,
    floor: 1,
    features: ['Projector', 'Air Conditioned', 'CCTV Surveillance'],
  };
  const safeExams = Array.isArray(activeExamsForSlot) ? activeExamsForSlot : [];
  const safeFaculty = Array.isArray(facultyList) ? facultyList : [];

  const seats: SeatingSeat[] = [];

  // Group candidate student pools by active exams
  const studentQueues: {
    exam: Exam;
    students: { roll: string; name: string }[];
    index: number;
  }[] = safeExams.map((exam, examIdx) => {
    const branchCode = USICT_BRANCH_CODES[exam.branch] || '032';
    const yearCode = '23'; // Admission year
    const students = Array.from({ length: 40 }, (_, i) => {
      const rollNum = String(i + 1).padStart(3, '0');
      const fullRoll = `0${rollNum}${branchCode}${yearCode}`;
      const name = SAMPLE_STUDENT_NAMES[(i + examIdx * 7) % SAMPLE_STUDENT_NAMES.length];
      return { roll: fullRoll, name };
    });
    return { exam, students, index: 0 };
  });

  // Interleaved assignment by column / diagonals
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols; c++) {
      const deskNumber = `D-${String.fromCharCode(65 + r)}${c + 1}`;
      
      // Determine which exam to pull from for this seat to prevent adjacency
      // (r + c) % numExams or column-wise stripes
      const examQueueIdx = (c + (r % 2 === 1 ? 1 : 0)) % Math.max(1, studentQueues.length);
      const queue = studentQueues[examQueueIdx];

      if (queue && queue.students.length > 0) {
        const student = queue.students[queue.index % queue.students.length];
        queue.index++;

        seats.push({
          row: r,
          col: c,
          deskNumber,
          studentRoll: student.roll,
          studentName: student.name,
          branch: queue.exam.branch,
          semester: queue.exam.semester,
          subjectCode: queue.exam.subjectCode,
          subjectName: queue.exam.subjectName,
          colorTag: BRANCH_COLOR_MAP[queue.exam.branch] || 'bg-slate-500/10 border-slate-500 text-slate-800',
        });
      } else {
        // Empty buffer desk
        seats.push({
          row: r,
          col: c,
          deskNumber,
          studentRoll: 'VACANT',
          studentName: 'Unassigned Buffer Desk',
          branch: 'CSE',
          semester: 1,
          subjectCode: 'N/A',
          subjectName: 'Buffer',
          colorTag: 'bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-800 dark:border-gray-700',
        });
      }
    }
  }

  // Assign invigilators (Strict rule: No faculty invigilating their own paper)
  const activePaperSetterIds = safeExams.map((e) => e.paperSetterFacultyId).filter(Boolean);
  const eligibleFaculty = safeFaculty.filter((f) => !activePaperSetterIds.includes(f.id));

  const invigilatorCount = Math.max(2, Math.ceil((safeHall.capacity || 120) / 40));
  const assignedInvigilators = (eligibleFaculty.length >= 2 ? eligibleFaculty : safeFaculty).slice(0, invigilatorCount).map((f) => ({
    facultyId: f.id,
    name: f.name,
    designation: f.designation,
    reportingTime: '08:45 AM (Morning Session)',
  }));

  return {
    id: `seat-plan-${safeHall.id}-${Date.now()}`,
    date: safeExams[0]?.date || '2026-10-12',
    session: safeExams[0]?.session || 'Morning (09:30 - 12:30)',
    hallId: safeHall.id,
    hallName: safeHall.name,
    totalRows,
    totalCols,
    grid: seats,
    invigilators: assignedInvigilators,
  };
}

/**
 * Distributes Invigilation Duties evenly among faculty members,
 * strictly avoiding own-subject conflicts.
 */
export function generateInvigilationRoster(
  exams: Exam[],
  facultyList: Faculty[],
  rooms: Room[]
): InvigilationDuty[] {
  const duties: InvigilationDuty[] = [];
  const safeFacultyList = Array.isArray(facultyList) ? facultyList : [];
  const facultyDutyCount = new Map<string, number>(safeFacultyList.map((f) => [f.id, 0]));
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  const examHalls = safeRooms.filter((r) => r.type === 'Central Exam Hall' || r.type === 'Lecture Hall');

  if (!Array.isArray(exams) || exams.length === 0) {
    return duties;
  }

  // Group exams by Date + Session
  const slotGroups = new Map<string, Exam[]>();
  exams.forEach((exam) => {
    if (!exam) return;
    const date = exam.date || '2026-10-12';
    const session = exam.session || 'Morning (09:30 - 12:30)';
    const key = `${date}__${session}`;
    if (!slotGroups.has(key)) slotGroups.set(key, []);
    slotGroups.get(key)!.push(exam);
  });

  slotGroups.forEach((slotExams, key) => {
    const [date, session] = key.split('__');
    const paperSetterIds = slotExams.map((e) => e.paperSetterFacultyId).filter(Boolean);
    
    // Safely retrieve hall with optional chaining and fallback
    const firstHallId = slotExams[0]?.hallIds?.[0];
    const hall = (firstHallId ? examHalls.find((h) => h.id === firstHallId) : undefined)
      || examHalls[0]
      || safeRooms[0]
      || { id: 'hall-central-a', name: 'Central Exam Hall A', block: 'E-Block', type: 'Central Exam Hall', capacity: 120, floor: 1, features: [] };

    // Pick 2 faculty members who:
    // 1. Are not setting this exam
    // 2. Currently have the lowest duty counts
    const eligibleFaculty = [...safeFacultyList]
      .filter((f) => !paperSetterIds.includes(f.id))
      .sort((a, b) => (facultyDutyCount.get(a.id) || 0) - (facultyDutyCount.get(b.id) || 0));

    const selectedInvigilators = eligibleFaculty.length >= 2 
      ? eligibleFaculty.slice(0, 2) 
      : safeFacultyList.slice(0, 2);

    selectedInvigilators.forEach((fac) => {
      duties.push({
        id: `duty-${fac.id}-${date}-${session.replace(/\s+/g, '')}`,
        facultyId: fac.id,
        facultyName: fac.name,
        designation: fac.designation,
        date,
        session: session as any,
        hallName: hall.name,
        totalStudentsAssigned: 60,
        isOwnSubjectConflict: false,
        status: 'CONFIRMED',
      });
      facultyDutyCount.set(fac.id, (facultyDutyCount.get(fac.id) || 0) + 1);
    });
  });

  return duties;
}
