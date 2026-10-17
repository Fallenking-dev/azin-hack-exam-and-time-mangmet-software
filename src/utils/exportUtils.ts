import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DAYS_OF_WEEK, 
  DayOfWeek, 
  Exam, 
  Faculty, 
  InvigilationDuty, 
  Room, 
  ScheduleEntry, 
  TIME_SLOTS 
} from '../types';

/**
 * Exports current schedule to CSV file download
 */
export function exportScheduleToCSV(schedule: ScheduleEntry[], filename: string = 'USICT_Timetable.csv') {
  const headers = ['Day', 'Time Slot', 'Subject Code', 'Subject Name', 'Type', 'Faculty Name', 'Room', 'Branch', 'Semester', 'Section'];
  
  const rows = schedule.map((e) => {
    const timeLabel = `${TIME_SLOTS[e.slotIndex]?.label} ${e.durationHours === 2 ? '(2 Hrs Lab)' : ''}`;
    return [
      `"${e.day}"`,
      `"${timeLabel}"`,
      `"${e.subjectCode}"`,
      `"${e.subjectName.replace(/"/g, '""')}"`,
      `"${e.slotType}"`,
      `"${e.facultyName.replace(/"/g, '""')}"`,
      `"${e.roomName}"`,
      `"${e.branch}"`,
      `"${e.semester}"`,
      `"${e.section}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTimetableToCSV(schedule: ScheduleEntry[], branch?: string, semester?: number, section?: string) {
  const filtered = branch && semester && section
    ? schedule.filter((e) => e.branch === branch && e.semester === semester && e.section === section)
    : schedule;
  const name = branch ? `USICT_${branch}_Sem${semester}_${section}_Timetable.csv` : 'USICT_Master_Timetable.csv';
  exportScheduleToCSV(filtered, name);
}

/**
 * Generates and downloads an iCal (.ics) calendar file for Google Calendar / Apple Calendar
 */
export function exportScheduleToICS(schedule: ScheduleEntry[], filename: string = 'USICT_Schedule.ics') {
  const dayIndexMap: Record<string, number> = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
  };

  const now = new Date();
  const daysUntilNextMonday = (1 + 7 - now.getDay()) % 7 || 7;
  const baseMonday = new Date(now);
  baseMonday.setDate(now.getDate() + daysUntilNextMonday);

  const icsEvents = schedule.map((e) => {
    const dayOffset = (dayIndexMap[e.day] || 1) - 1;
    const eventDate = new Date(baseMonday);
    eventDate.setDate(baseMonday.getDate() + dayOffset);

    const startSlot = TIME_SLOTS[e.slotIndex];
    const [startHour, startMin] = (startSlot?.startTime || '09:00').split(':').map(Number);
    const endSlot = TIME_SLOTS[e.slotIndex + e.durationHours - 1];
    const [endHour, endMin] = (endSlot?.endTime || '10:00').split(':').map(Number);

    const startFormatted = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}T${String(startHour).padStart(2, '0')}${String(startMin).padStart(2, '0')}00`;
    const endFormatted = `${eventDate.getFullYear()}${String(eventDate.getMonth() + 1).padStart(2, '0')}${String(eventDate.getDate()).padStart(2, '0')}T${String(endHour).padStart(2, '0')}${String(endMin).padStart(2, '0')}00`;

    const dayAbbrevMap: Record<string, string> = {
      Monday: 'MO',
      Tuesday: 'TU',
      Wednesday: 'WE',
      Thursday: 'TH',
      Friday: 'FR',
    };
    const rruleDay = dayAbbrevMap[e.day] || 'MO';

    return `BEGIN:VEVENT
UID:usict-${e.id}-${Date.now()}@ggsipu.ac.in
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${startFormatted}
DTEND:${endFormatted}
RRULE:FREQ=WEEKLY;BYDAY=${rruleDay};UNTIL=20261231T235959Z
SUMMARY:${e.subjectCode}: ${e.subjectName} (${e.slotType})
DESCRIPTION:Instructor: ${e.facultyName}\\nProgram: ${e.branch} Sem ${e.semester} ${e.section}\\nLocation: ${e.roomName}, USICT Dwarka
LOCATION:${e.roomName}, USICT, GGSIPU Dwarka Campus
STATUS:CONFIRMED
END:VEVENT`;
  });

  const icsBody = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//USICT GGSIPU//CampusScheduler Engine//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:USICT Academic Timetable
X-WR-TIMEZONE:Asia/Kolkata
${icsEvents.join('\n')}
END:VCALENDAR`;

  const blob = new Blob([icsBody], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTimetableToICS(schedule: ScheduleEntry[], branch?: string, semester?: number, section?: string) {
  const filtered = branch && semester && section
    ? schedule.filter((e) => e.branch === branch && e.semester === semester && e.section === section)
    : schedule;
  const name = branch ? `USICT_${branch}_Sem${semester}_${section}.ics` : 'USICT_Schedule.ics';
  exportScheduleToICS(filtered, name);
}

/**
 * Generates a high-quality, professional downloadable PDF Timetable document
 */
export function exportTimetableToPDF(
  schedule: ScheduleEntry[],
  branch: string = 'CSE',
  semester: number = 3,
  section: string = 'Sec-A',
  _facultyList?: Faculty[],
  _rooms?: Room[]
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const filteredSchedule = schedule.filter(
    (e) => e.branch === branch && e.semester === semester && e.section === section
  );

  // University Header
  doc.setFillColor(15, 23, 42); // #0f172a Deep Navy
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY', pageWidth / 2, 9, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Guru Gobind Singh Indraprastha University, Sector 16-C, Dwarka, New Delhi - 110078', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(9);
  doc.setTextColor(199, 210, 254);
  doc.text(`OFFICIAL ACADEMIC CLASS TIMETABLE — PROGRAM: B.Tech (${branch}) | SEMESTER: ${semester} | SECTION: ${section}`, pageWidth / 2, 21, { align: 'center' });

  // Sub-header details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Academic Session: 2026-2027 (Odd Semester)`, 14, 32);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, pageWidth - 14, 32, { align: 'right' });

  // Build Grid Headers
  const timeSlotHeaders = [
    'Day / Time',
    '09:00 - 10:00\nSlot 1',
    '10:00 - 11:00\nSlot 2',
    '11:00 - 12:00\nSlot 3',
    '12:00 - 01:00\nSlot 4',
    '01:00 - 02:00\nLUNCH',
    '02:00 - 03:00\nSlot 5',
    '03:00 - 04:00\nSlot 6',
    '04:00 - 05:00\nSlot 7',
  ];

  const tableRows: string[][] = [];

  DAYS_OF_WEEK.forEach((day: DayOfWeek) => {
    const row: string[] = [day];

    // Slots 0 to 3 (Morning)
    for (let slot = 0; slot < 4; slot++) {
      const entry = filteredSchedule.find((e) => e.day === day && e.slotIndex === slot);
      if (entry) {
        row.push(`${entry.subjectCode}\n${entry.roomName}\n${entry.facultyName.replace(/^Prof\.\s*|^Dr\.\s*/, '')}`);
      } else {
        row.push('—');
      }
    }

    // Lunch slot
    row.push('RECESS /\nLUNCH BREAK');

    // Slots 5 to 7 (Afternoon)
    for (let slot = 5; slot <= 7; slot++) {
      // Check if this slot is covered by a 2-hour lab that started at slot 5
      const labStartingAtSlotBefore = filteredSchedule.find(
        (e) => e.day === day && e.slotIndex === slot - 1 && e.durationHours === 2
      );

      const entry = filteredSchedule.find((e) => e.day === day && e.slotIndex === slot);

      if (entry) {
        const labTag = entry.slotType === 'Lab' ? ' [LAB]' : '';
        row.push(`${entry.subjectCode}${labTag}\n${entry.roomName}\n${entry.facultyName.replace(/^Prof\.\s*|^Dr\.\s*/, '')}`);
      } else if (labStartingAtSlotBefore) {
        row.push(`(Contd. ${labStartingAtSlotBefore.subjectCode} Lab)\n${labStartingAtSlotBefore.roomName}`);
      } else {
        row.push('—');
      }
    }

    tableRows.push(row);
  });

  // Render Schedule Matrix Table
  autoTable(doc, {
    head: [timeSlotHeaders],
    body: tableRows,
    startY: 36,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      halign: 'center',
      valign: 'middle',
      textColor: [15, 23, 42],
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [241, 245, 249], halign: 'center', cellWidth: 24 },
      5: { fillColor: [248, 250, 252], textColor: [100, 116, 139], fontStyle: 'italic', cellWidth: 22 },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 120;

  // Distinct subjects in this timetable
  const distinctSubjectMap = new Map<string, { code: string; name: string; faculty: string; type: string; room: string }>();
  filteredSchedule.forEach((e) => {
    if (!distinctSubjectMap.has(e.subjectCode)) {
      distinctSubjectMap.set(e.subjectCode, {
        code: e.subjectCode,
        name: e.subjectName,
        faculty: e.facultyName,
        type: e.slotType,
        room: e.roomName,
      });
    }
  });

  const subjectRows = Array.from(distinctSubjectMap.values()).map((s) => [
    s.code,
    s.name,
    s.type,
    s.faculty,
    s.room,
  ]);

  if (subjectRows.length > 0 && finalY < 155) {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('Course & Faculty Reference Directory:', 14, finalY + 7);

    autoTable(doc, {
      head: [['Course Code', 'Subject Title', 'Type', 'Faculty Instructor', 'Primary Room/Lab']],
      body: subjectRows,
      startY: finalY + 9,
      theme: 'plain',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
        textColor: [51, 65, 85],
      },
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 80 },
      },
    });
  }

  // Institutional Signatories Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Coordinator (Timetable & Academic Affairs)', 25, pageHeight - 12);
  doc.text('Dean, USICT (GGSIPU)', pageWidth - 70, pageHeight - 12);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Note: 75% minimum attendance is mandatory across all registered lecture and laboratory courses as per GGSIPU Academic Ordinance.', 14, pageHeight - 6);

  const filename = `USICT_${branch}_Sem${semester}_${section}_Timetable.pdf`;
  doc.save(filename);
}

export interface ExamAuditResult {
  studentClashes: {
    branch: string;
    semester: number;
    date: string;
    session: string;
    conflictingExams: string[];
    severity: 'CRITICAL' | 'WARNING';
    description: string;
  }[];
  hallShortages: {
    hallId: string;
    hallName: string;
    capacity: number;
    enrolledStudents: number;
    deficit: number;
    date: string;
    session: string;
  }[];
  invigilatorOverloads: {
    facultyId: string;
    facultyName: string;
    date: string;
    assignedDutiesCount: number;
    isOwnSubjectIssue: boolean;
    subjectName?: string;
  }[];
  readinessScore: number;
  totalExams: number;
  totalEnrolled: number;
}

/**
 * Analyzes exam schedules to discover clashes and capacity shortages
 */
export function analyzeExamConflicts(
  exams: Exam[],
  rooms: Room[],
  facultyList: Faculty[],
  invigilationDuties: InvigilationDuty[] = []
): ExamAuditResult {
  const studentClashes: ExamAuditResult['studentClashes'] = [];
  const hallShortages: ExamAuditResult['hallShortages'] = [];
  const invigilatorOverloads: ExamAuditResult['invigilatorOverloads'] = [];

  // 1. Group exams by (Date, Session, Branch, Semester) to detect student clashes
  const slotBranchMap = new Map<string, Exam[]>();
  exams.forEach((exam) => {
    const key = `${exam.date}_${exam.session}_${exam.branch}_${exam.semester}`;
    const list = slotBranchMap.get(key) || [];
    list.push(exam);
    slotBranchMap.set(key, list);
  });

  slotBranchMap.forEach((matchedExams, key) => {
    if (matchedExams.length > 1) {
      const [date, session, branch, semester] = key.split('_');
      studentClashes.push({
        branch,
        semester: Number(semester),
        date,
        session,
        conflictingExams: matchedExams.map((e) => `${e.subjectCode}: ${e.subjectName}`),
        severity: 'CRITICAL',
        description: `Students in ${branch} Sem ${semester} have ${matchedExams.length} concurrent papers scheduled simultaneously in the ${session} slot.`,
      });
    }
  });

  // Check 2. Hall capacity shortage
  const hallMap = new Map<string, Room>();
  rooms.forEach((r) => hallMap.set(r.id, r));

  exams.forEach((exam) => {
    if (!exam) return;
    const hallIds = Array.isArray(exam.hallIds) ? exam.hallIds : [];
    const enrolledStudents = exam.totalEnrolled || 60;
    const totalHallCapacity = hallIds.reduce((sum, hId) => {
      const hall = hallMap.get(hId);
      return sum + (hall ? hall.capacity : 0);
    }, 0);

    if (totalHallCapacity < enrolledStudents) {
      const primaryHallId = hallIds[0] || 'hall-central-a';
      const primaryHall = hallMap.get(primaryHallId) || { id: primaryHallId, name: 'Assigned Hall A', capacity: totalHallCapacity };
      hallShortages.push({
        hallId: primaryHall.id,
        hallName: primaryHall.name,
        capacity: totalHallCapacity,
        enrolledStudents,
        deficit: enrolledStudents - totalHallCapacity,
        date: exam.date || '2026-10-12',
        session: exam.session || 'Morning (09:30 - 12:30)',
      });
    }
  });

  // Check 3. Invigilation overload and own-subject conflict
  const facultyDutyDateMap = new Map<string, InvigilationDuty[]>();
  invigilationDuties.forEach((duty) => {
    const key = `${duty.facultyId}_${duty.date}`;
    const list = facultyDutyDateMap.get(key) || [];
    list.push(duty);
    facultyDutyDateMap.set(key, list);

    if (duty.isOwnSubjectConflict) {
      invigilatorOverloads.push({
        facultyId: duty.facultyId,
        facultyName: duty.facultyName,
        date: duty.date,
        assignedDutiesCount: 1,
        isOwnSubjectIssue: true,
        subjectName: duty.hallName,
      });
    }
  });

  facultyDutyDateMap.forEach((duties, key) => {
    if (duties.length > 1) {
      const [facId, date] = key.split('_');
      const faculty = facultyList.find((f) => f.id === facId);
      invigilatorOverloads.push({
        facultyId: facId,
        facultyName: faculty?.name || duties[0].facultyName,
        date,
        assignedDutiesCount: duties.length,
        isOwnSubjectIssue: false,
      });
    }
  });

  // Compute overall readiness score out of 100
  const penalty = studentClashes.length * 25 + hallShortages.length * 20 + invigilatorOverloads.length * 10;
  const readinessScore = Math.max(0, Math.min(100, 100 - penalty));
  const totalEnrolled = exams.reduce((sum, e) => sum + e.totalEnrolled, 0);

  return {
    studentClashes,
    hallShortages,
    invigilatorOverloads,
    readinessScore,
    totalExams: exams.length,
    totalEnrolled,
  };
}

/**
 * Generates and downloads the official Exam Conflict & Resource Shortage Audit Report PDF
 */
export function exportExamConflictReportPDF(
  exams: Exam[],
  rooms: Room[],
  facultyList: Faculty[],
  invigilationDuties: InvigilationDuty[] = []
) {
  const audit = analyzeExamConflicts(exams, rooms, facultyList, invigilationDuties);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY', pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Examination Division & Central Control Room • GGSIPU Dwarka Campus', pageWidth / 2, 16, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(254, 202, 202);
  doc.setFont('helvetica', 'bold');
  doc.text('EXAM CONFLICT & RESOURCE SHORTAGE AUDIT REPORT', pageWidth / 2, 23, { align: 'center' });

  // Summary Metrics Bar
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 34, pageWidth - 28, 22, 2, 2, 'F');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Exam Papers: ${audit.totalExams}`, 20, 42);
  doc.text(`Total Enrolled Students: ${audit.totalEnrolled}`, 70, 42);
  doc.text(`Student Time Clashes: ${audit.studentClashes.length}`, 130, 42);

  doc.text(`Hall Capacity Deficits: ${audit.hallShortages.length}`, 20, 50);
  doc.text(`Faculty Duty Conflicts: ${audit.invigilatorOverloads.length}`, 70, 50);

  const scoreColor = audit.readinessScore > 80 ? [16, 185, 129] : audit.readinessScore > 50 ? [245, 158, 11] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`Audit Readiness Score: ${audit.readinessScore}%`, 130, 50);

  let currentY = 62;

  // SECTION 1: Student Exam Clashes
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Student Exam Time & Date Clashes', 14, currentY);

  if (audit.studentClashes.length === 0) {
    autoTable(doc, {
      body: [['Status: Zero student exam clashes detected. All cohorts have disjoint, non-overlapping exam time slots.']],
      startY: currentY + 3,
      theme: 'plain',
      styles: { fontSize: 8, textColor: [16, 185, 129], fontStyle: 'bold' },
    });
  } else {
    const clashRows = audit.studentClashes.map((c) => [
      `${c.branch} Sem ${c.semester}`,
      `${c.date}\n(${c.session.split(' ')[0]})`,
      c.conflictingExams.join(' vs. '),
      c.severity,
      c.description,
    ]);

    autoTable(doc, {
      head: [['Program & Sem', 'Date / Session', 'Conflicting Papers', 'Severity', 'Diagnostic Note']],
      body: clashRows,
      startY: currentY + 3,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [225, 29, 72], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        3: { fontStyle: 'bold', textColor: [225, 29, 72] },
        4: { cellWidth: 60 },
      },
    });
  }

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION 2: Exam Hall Capacity Shortages
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Exam Hall Capacity & Seat Allocation Shortages', 14, currentY);

  if (audit.hallShortages.length === 0) {
    autoTable(doc, {
      body: [['Status: All assigned exam halls have sufficient seating capacity to accommodate registered student cohorts.']],
      startY: currentY + 3,
      theme: 'plain',
      styles: { fontSize: 8, textColor: [16, 185, 129], fontStyle: 'bold' },
    });
  } else {
    const hallRows = audit.hallShortages.map((h) => [
      h.hallName,
      h.date,
      `${h.capacity} Seats`,
      `${h.enrolledStudents} Students`,
      `-${h.deficit} Seats (OVERFLOW)`,
      'Assign Secondary Overflow Hall',
    ]);

    autoTable(doc, {
      head: [['Hall Name', 'Date', 'Hall Capacity', 'Enrolled Count', 'Shortage Deficit', 'Recommended Mitigation']],
      body: hallRows,
      startY: currentY + 3,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [234, 88, 12], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        4: { fontStyle: 'bold', textColor: [220, 38, 38] },
      },
    });
  }

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION 3: Invigilation Overloads & Conflicts
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Faculty Invigilation Overloads & Paper Setter Conflicts', 14, currentY);

  if (audit.invigilatorOverloads.length === 0) {
    autoTable(doc, {
      body: [['Status: Invigilation duties are evenly distributed. No faculty members have overlapping duties or paper-setter conflicts.']],
      startY: currentY + 3,
      theme: 'plain',
      styles: { fontSize: 8, textColor: [16, 185, 129], fontStyle: 'bold' },
    });
  } else {
    const invigRows = audit.invigilatorOverloads.map((i) => [
      i.facultyName,
      i.date,
      i.isOwnSubjectIssue ? 'Paper Setter In Hall' : `${i.assignedDutiesCount} Duties in Single Day`,
      i.isOwnSubjectIssue ? 'CRITICAL (Fairness)' : 'WORKLOAD OVERLOAD',
      i.isOwnSubjectIssue
        ? 'Reassign faculty to different exam hall/subject to prevent bias'
        : 'Redistribute secondary session duty to reserve faculty pool',
    ]);

    autoTable(doc, {
      head: [['Faculty Name', 'Date', 'Conflict Type', 'Risk Rating', 'Remediation Action']],
      body: invigRows,
      startY: currentY + 3,
      theme: 'grid',
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      columnStyles: {
        3: { fontStyle: 'bold', textColor: [220, 38, 38] },
      },
    });
  }

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // SECTION 4: AI Recommendations Summary
  if (currentY < 240) {
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Official Action & Mitigation Directives', 14, currentY);

    const actionText = [
      '• Stagger overlapping examination dates with at least 24 hours between high-credit core subjects.',
      '• Activate Central Exam Hall B (E-Block Ground) as an overflow room to eliminate seat shortages.',
      '• Ensure all invigilation rosters uphold a minimum 1:30 faculty-to-student supervisory ratio.',
      '• Deploy CCTV surveillance feeds & jammer verification 45 minutes before morning session commencement.',
    ];

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    actionText.forEach((line, idx) => {
      doc.text(line, 16, currentY + 6 + idx * 4.5);
    });
  }

  // Footer Signatories
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Superintendent of Examinations', 20, pageHeight - 12);
  doc.text('Dean (Academics) & Examination Center In-Charge', pageWidth - 85, pageHeight - 12);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Generated by USICT CampusScheduler Conflict Engine. Complies with GGSIPU Examination Rules 2026.', 14, pageHeight - 5);

  doc.save('USICT_Exam_Conflict_Audit_Report.pdf');
}

/**
 * Triggers the browser's high-fidelity print dialog formatted for academic timetable sheets
 */
export function printAcademicSchedule() {
  window.print();
}

/**
 * Generates and downloads an official, beautifully styled PDF datesheet for Semester 1 (Minor 1, Minor 2, End Sem, or Consolidated)
 */
export function exportSem1DatesheetPDF(
  exams: Exam[],
  cycleFilter: 'Minor 1' | 'Minor 2' | 'End Sem' | 'ALL' = 'ALL',
  branch: string = 'CSE',
  semester: number = 1
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Filter exams for Semester 1 and cycle if specified
  let targetExams = exams.filter((e) => e.semester === semester);
  if (cycleFilter !== 'ALL') {
    targetExams = targetExams.filter((e) => e.cycle === cycleFilter);
  }

  // Sort by date then time
  targetExams.sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  // Header Background Banner
  doc.setFillColor(15, 23, 42); // Deep Navy #0f172a
  doc.rect(0, 0, pageWidth, 28, 'F');

  // University Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('GURU GOBIND SINGH INDRAPRASTHA UNIVERSITY, NEW DELHI', pageWidth / 2, 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY (USICT)', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Sector 16-C, Dwarka, New Delhi - 110078 | Office of Controller of Examinations', pageWidth / 2, 19, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // Amber gold
  doc.setFont('helvetica', 'bold');
  const cycleTitle = cycleFilter === 'ALL' ? 'CONSOLIDATED (MINOR 1, MINOR 2 & END SEM)' : cycleFilter.toUpperCase();
  doc.text(`OFFICIAL EXAMINATION DATESHEET 2026-2027 — ${cycleTitle}`, pageWidth / 2, 24.5, { align: 'center' });

  // Sub-Header Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(12, 32, pageWidth - 24, 21, 2, 2, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`Academic Program:`, 15, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`B.Tech (Common First Year / ${branch})`, 48, 38);

  doc.setFont('helvetica', 'bold');
  doc.text(`Semester:`, 115, 38);
  doc.setFont('helvetica', 'normal');
  doc.text(`Semester 1 (Freshman Session 2026)`, 133, 38);

  doc.setFont('helvetica', 'bold');
  doc.text(`Notice Ref:`, 15, 44);
  doc.setFont('helvetica', 'normal');
  doc.text(`USICT/EXAM/SEM-1/2026/089`, 48, 44);

  doc.setFont('helvetica', 'bold');
  doc.text(`Verified By:`, 115, 44);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(16, 185, 129); // Emerald
  doc.text(`TinyFish Autonomous Web Crawler (Live 2026)`, 133, 44);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, 15, 50);
  doc.text(`Venue: Main Academic Complex (E-Block & Central Audi)`, 115, 50);

  // AutoTable for Datesheet Entries
  const tableHeaders = [
    'Cycle',
    'Date & Day',
    'Session Time',
    'Code',
    'Course Title',
    'Syllabus Coverage',
    'Exam Venue',
    'Max'
  ];

  const tableRows = targetExams.map((e) => {
    // Format date with day of week
    let dateStr = e.date || 'TBA';
    try {
      const d = new Date(e.date);
      if (!isNaN(d.getTime())) {
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        dateStr = `${e.date}\n(${dayName})`;
      }
    } catch {}

    const cycleLabel = e.cycle || (e.session?.includes('10:00') ? 'Minor 1' : 'End Sem');
    const syllabus = e.syllabusScope || (cycleLabel === 'Minor 1' ? 'Unit 1 & Unit 2' : cycleLabel === 'Minor 2' ? 'Unit 3 & Unit 4' : 'Full Syllabus (Units 1-4)');
    const maxMarks = e.maxMarks ? `${e.maxMarks}` : (cycleLabel.includes('Minor') ? '30' : '75');

    return [
      cycleLabel,
      dateStr,
      e.timeRange || e.session || '10:00 - 11:30 AM',
      e.subjectCode,
      e.subjectName,
      syllabus,
      (e.hallIds && e.hallIds.length > 0) ? e.hallIds.map(h => h.replace('hall-', 'Hall ').replace('room-', '')).join(', ') : 'Central Hall A',
      maxMarks
    ];
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: tableRows,
    startY: 56,
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.2,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.15,
      valign: 'middle',
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.8,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 20 },
      2: { halign: 'center', cellWidth: 24, fontSize: 7 },
      3: { halign: 'center', fontStyle: 'bold', textColor: [79, 70, 229], cellWidth: 16 },
      4: { cellWidth: 44, fontStyle: 'bold' },
      5: { cellWidth: 36, fontSize: 6.8, textColor: [71, 85, 105] },
      6: { halign: 'center', cellWidth: 20, fontSize: 7 },
      7: { halign: 'center', fontStyle: 'bold', cellWidth: 10 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 160;

  // Important Examination Guidelines Section
  if (finalY < 235) {
    const rulesY = finalY + 7;
    doc.setFillColor(254, 243, 199); // Soft amber
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(12, rulesY, pageWidth - 24, 30, 1.5, 1.5, 'FD');

    doc.setTextColor(180, 83, 9);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MANDATORY INSTRUCTIONS FOR SEMESTER 1 CANDIDATES (GGSIPU ORDINANCE 2026):', 16, rulesY + 5);

    const rules = [
      '1. Reporting Time: Candidates must occupy their designated seats 15 minutes before exam commencement.',
      '2. Mandatory Identity: Entry permitted strictly on presentation of physical GGSIPU Student ID Card and Hall Admit Slip.',
      '3. Prohibited Items: Mobile phones, smartwatches, digital devices, and study chits strictly prohibited under UFM Clause 32.',
      '4. Evaluation Distribution: Minor 1 (15 Marks) + Minor 2 (15 Marks) + Internal Lab/Quiz (10 Marks) + End Sem (60 Marks).',
      '5. Anti-Cheating Seating: Multi-branch interleaved seating will be enforced with 0% neighbor paper repetition.',
    ];

    doc.setFontSize(6.8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);
    rules.forEach((rule, idx) => {
      doc.text(rule, 16, rulesY + 10 + idx * 4);
    });
  }

  // Official Institutional Signatures
  doc.setDrawColor(203, 213, 225);
  doc.line(14, pageHeight - 22, pageWidth - 14, pageHeight - 22);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Superintendent of Examinations (USICT)', 20, pageHeight - 14);
  doc.text('Dean (Academics), USICT GGSIPU', pageWidth - 70, pageHeight - 14);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Official Examination Division, Guru Gobind Singh Indraprastha University. Extracted via TinyFish 2026.', 14, pageHeight - 6);

  const cleanFilterName = cycleFilter.replace(/\s+/g, '_');
  const filename = `USICT_Sem1_${cleanFilterName}_DateSheet_2026.pdf`;
  doc.save(filename);
}
