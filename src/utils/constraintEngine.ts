import { ConflictAlert, DayOfWeek, DAYS_OF_WEEK, Faculty, Room, ScheduleEntry, Subject, TIME_SLOTS } from '../types';

/**
 * Validates the entire schedule against Hard and Soft constraints.
 * Returns a list of conflicts with detailed diagnostics.
 */
export function evaluateScheduleConflicts(
  schedule: ScheduleEntry[],
  rooms: Room[],
  facultyList: Faculty[],
  subjects: Subject[] = []
): {
  conflicts: ConflictAlert[];
  entriesWithConflicts: Map<string, string>; // entryId -> conflict summary
} {
  const conflicts: ConflictAlert[] = [];
  const entriesWithConflicts = new Map<string, string>();

  // Map to speed up lookups
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));
  const facultyMap = new Map(facultyList.map((f) => [f.id, f]));


  // Helper to expand an entry into occupied slot indices
  const getOccupiedSlots = (entry: ScheduleEntry) => {
    const slots: number[] = [];
    for (let i = 0; i < entry.durationHours; i++) {
      slots.push(entry.slotIndex + i);
    }
    return slots;
  };

  // Check 1: Lunch Hour Occupancy (Slot 4: 01:00 PM - 02:00 PM)
  schedule.forEach((entry) => {
    const occupied = getOccupiedSlots(entry);
    if (occupied.includes(4)) {
      const conflictId = `conflict-lunch-${entry.id}`;
      conflicts.push({
        id: conflictId,
        type: 'LUNCH_OCCUPIED',
        severity: 'HARD',
        title: 'Lunch Recess Violation',
        message: `${entry.subjectCode} (${entry.subjectName}) is scheduled during the designated USICT Lunch/Recess hour (01:00 - 02:00 PM).`,
        involvedEntries: [entry.id],
      });
      entriesWithConflicts.set(entry.id, 'Violates lunch break');
    }
  });

  // Check 2: Lab Duration Violation (must be 2 hours, within day bounds)
  schedule.forEach((entry) => {
    if (entry.slotType === 'Lab') {
      if (entry.durationHours !== 2) {
        conflicts.push({
          id: `conflict-labdur-${entry.id}`,
          type: 'LAB_DURATION_INVALID',
          severity: 'HARD',
          title: 'Invalid Practical Lab Duration',
          message: `${entry.subjectCode} Lab session is scheduled for ${entry.durationHours} hr. Institutional rule requires 2 contiguous hours.`,
          involvedEntries: [entry.id],
        });
        entriesWithConflicts.set(entry.id, 'Lab must be 2 contiguous hours');
      }
      if (entry.slotIndex + entry.durationHours > 8) {
        conflicts.push({
          id: `conflict-labbound-${entry.id}`,
          type: 'LAB_DURATION_INVALID',
          severity: 'HARD',
          title: 'Lab Out of Campus Hours',
          message: `${entry.subjectCode} Lab exceeds the 5:00 PM campus timing limit.`,
          involvedEntries: [entry.id],
        });
        entriesWithConflicts.set(entry.id, 'Exceeds campus hours');
      }
    }
  });

  // Check 3: Pairwise overlaps (Faculty double-booking, Room double-booking, Section double-booking)
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const e1 = schedule[i];
      const e2 = schedule[j];

      // Must be on the same day to conflict
      if (e1.day !== e2.day) continue;

      const slots1 = getOccupiedSlots(e1);
      const slots2 = getOccupiedSlots(e2);
      const hasSlotOverlap = slots1.some((s) => slots2.includes(s));

      if (!hasSlotOverlap) continue;

      // Hard Conflict A: Faculty Double Booking
      if (e1.facultyId === e2.facultyId) {
        const facName = facultyMap.get(e1.facultyId)?.name || e1.facultyName;
        const msg = `${facName} is simultaneously scheduled for ${e1.subjectCode} (${e1.branch} ${e1.semester}th Sem ${e1.section} in ${e1.roomName}) and ${e2.subjectCode} (${e2.branch} ${e2.semester}th Sem ${e2.section} in ${e2.roomName}) on ${e1.day}.`;
        
        conflicts.push({
          id: `conflict-fac-${e1.id}-${e2.id}`,
          type: 'FACULTY_DOUBLE_BOOKED',
          severity: 'HARD',
          title: 'Faculty Double-Booking Clash',
          message: msg,
          involvedEntries: [e1.id, e2.id],
        });
        entriesWithConflicts.set(e1.id, `Faculty clash with ${e2.subjectCode}`);
        entriesWithConflicts.set(e2.id, `Faculty clash with ${e1.subjectCode}`);
      }

      // Hard Conflict B: Room Overlap
      if (e1.roomId === e2.roomId) {
        const rName = roomMap.get(e1.roomId)?.name || e1.roomName;
        const msg = `Room ${rName} is double-booked on ${e1.day} between ${e1.subjectCode} (${e1.branch}) and ${e2.subjectCode} (${e2.branch}).`;
        
        conflicts.push({
          id: `conflict-room-${e1.id}-${e2.id}`,
          type: 'ROOM_OVERLAP',
          severity: 'HARD',
          title: 'Classroom / Lab Collision',
          message: msg,
          involvedEntries: [e1.id, e2.id],
        });
        entriesWithConflicts.set(e1.id, `Room clash with ${e2.subjectCode}`);
        entriesWithConflicts.set(e2.id, `Room clash with ${e1.subjectCode}`);
      }

      // Hard Conflict C: Section Overlap (Same batch cannot have 2 classes at once)
      if (e1.branch === e2.branch && e1.semester === e2.semester && e1.section === e2.section) {
        const msg = `Batch ${e1.branch} ${e1.semester}th Sem (${e1.section}) has two simultaneous classes (${e1.subjectCode} & ${e2.subjectCode}) on ${e1.day}.`;
        
        conflicts.push({
          id: `conflict-sec-${e1.id}-${e2.id}`,
          type: 'SECTION_OVERLAP',
          severity: 'HARD',
          title: 'Student Batch Schedule Clash',
          message: msg,
          involvedEntries: [e1.id, e2.id],
        });
        entriesWithConflicts.set(e1.id, `Batch clash with ${e2.subjectCode}`);
        entriesWithConflicts.set(e2.id, `Batch clash with ${e1.subjectCode}`);
      }
    }
  }

  // Soft Constraint 1: High difficulty subject on Friday last slot (Slot 7)
  schedule.forEach((entry) => {
    if (entry.day === 'Friday' && (entry.slotIndex === 7 || (entry.slotIndex === 6 && entry.durationHours === 2))) {
      const sub = subjectMap.get(entry.subjectId);
      if (sub?.difficulty === 'High') {
        conflicts.push({
          id: `conflict-fri-heavy-${entry.id}`,
          type: 'FRIDAY_LATE_HEAVY',
          severity: 'SOFT',
          title: 'Pedagogical Notice: Heavy Subject on Friday End Slot',
          message: `${entry.subjectCode} (${entry.subjectName}) is a high-cognitive load subject scheduled on Friday 04:00-05:00 PM. Better scheduled in morning hours.`,
          involvedEntries: [entry.id],
        });
      }
    }
  });

  return { conflicts, entriesWithConflicts };
}
export const detectScheduleConflicts = evaluateScheduleConflicts;

/**
 * Finds the top zero-conflict alternate slots for a given entry.
 */
export function findZeroConflictSlots(
  entry: ScheduleEntry,
  currentSchedule: ScheduleEntry[],
  rooms: Room[],
  facultyList: Faculty[]
): { day: DayOfWeek; slotIndex: number; timeSlot: string; roomId: string; roomName: string; score: number; reason: string }[] {
  const suggestions: { day: DayOfWeek; slotIndex: number; timeSlot: string; roomId: string; roomName: string; score: number; reason: string }[] = [];
  const otherEntries = currentSchedule.filter((e) => e.id !== entry.id);

  // Candidate rooms matching required room type
  const targetRoomType = entry.slotType === 'Lab' ? 'Lab' : 'Lecture Hall';
  const suitableRooms = rooms.filter((r) => r.type === targetRoomType || (targetRoomType === 'Lecture Hall' && r.type !== 'Lab'));

  DAYS_OF_WEEK.forEach((day) => {
    // Valid slot indices for the duration
    const maxSlot = entry.durationHours === 2 ? 6 : 7;
    for (let slot = 0; slot <= maxSlot; slot++) {
      // Cannot span lunch (Slot 4)
      if (slot === 4) continue;
      if (entry.durationHours === 2 && slot === 3) continue; // slot 3 to 5 spans slot 4

      const neededSlots = Array.from({ length: entry.durationHours }, (_, i) => slot + i);

      // 1. Check Faculty availability
      const facultyBusy = otherEntries.some((e) => {
        if (e.day !== day || e.facultyId !== entry.facultyId) return false;
        const eSlots = Array.from({ length: e.durationHours }, (_, i) => e.slotIndex + i);
        return neededSlots.some((s) => eSlots.includes(s));
      });
      if (facultyBusy) continue;

      // 2. Check Student Batch availability
      const batchBusy = otherEntries.some((e) => {
        if (e.day !== day || e.branch !== entry.branch || e.semester !== entry.semester || e.section !== entry.section) return false;
        const eSlots = Array.from({ length: e.durationHours }, (_, i) => e.slotIndex + i);
        return neededSlots.some((s) => eSlots.includes(s));
      });
      if (batchBusy) continue;

      // 3. Find an available suitable room
      for (const room of suitableRooms) {
        const roomBusy = otherEntries.some((e) => {
          if (e.day !== day || e.roomId !== room.id) return false;
          const eSlots = Array.from({ length: e.durationHours }, (_, i) => e.slotIndex + i);
          return neededSlots.some((s) => eSlots.includes(s));
        });

        if (!roomBusy) {
          // Calculate quality score
          let score = 100;
          if (day === 'Friday' && slot >= 6) score -= 30; // prefer earlier in week
          if (slot <= 2) score += 15; // morning slots preferred
          if (room.id === entry.roomId) score += 20; // preserve preferred room

          const timeLabel = `${TIME_SLOTS[slot]?.startTime} - ${TIME_SLOTS[slot + entry.durationHours - 1]?.endTime}`;

          suggestions.push({
            day,
            slotIndex: slot,
            timeSlot: timeLabel,
            roomId: room.id,
            roomName: room.name,
            score,
            reason: `Zero clashes detected for ${entry.facultyName}, Batch ${entry.branch} Sem ${entry.semester}, and Room ${room.name}.`,
          });
        }
      }
    }
  });

  // Sort by score descending and return top 5 unique slots
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 5);
}

/**
 * Deterministic Master Timetable Generator (Zero-Clash Solver)
 */
export function generateDeterministicTimetable(
  branch: string,
  semester: number,
  section: string,
  subjects: Subject[],
  facultyList: Faculty[],
  rooms: Room[],
  existingSchedule: ScheduleEntry[] = []
): { schedule: ScheduleEntry[]; notes: string } {
  const newEntries: ScheduleEntry[] = [];
  const occupiedCheck = [...existingSchedule.filter((e) => !(e.branch === branch && e.semester === semester && e.section === section))];

  const targetSubjects = subjects.filter((s) => s.branch === branch && s.semester === semester);
  const facultyMap = new Map(facultyList.map((f) => [f.id, f]));
  const roomMap = new Map(rooms.map((r) => [r.id, r]));

  // Separate Labs and Lectures
  const labSubjects = targetSubjects.filter((s) => s.type === 'Practical');
  const theorySubjects = targetSubjects.filter((s) => s.type !== 'Practical');

  const isSlotFree = (
    day: DayOfWeek,
    startSlot: number,
    duration: number,
    facultyId: string,
    roomId: string
  ) => {
    const needed = Array.from({ length: duration }, (_, i) => startSlot + i);
    // Check lunch
    if (needed.includes(4)) return false;
    if (startSlot + duration > 8) return false;

    // Check against all active entries
    const all = [...occupiedCheck, ...newEntries];
    for (const e of all) {
      if (e.day !== day) continue;
      const eSlots = Array.from({ length: e.durationHours }, (_, i) => e.slotIndex + i);
      const overlap = needed.some((s) => eSlots.includes(s));
      if (!overlap) continue;

      if (e.facultyId === facultyId) return false;
      if (e.roomId === roomId) return false;
      if (e.branch === branch && e.semester === semester && e.section === section) return false;
    }
    return true;
  };

  // 1. Place Practical Labs first (2 hour blocks: e.g. Mon 2-4 PM [slots 5,6], Tue 2-4 PM, Thu 11-1 [slots 2,3])
  const labSlotsCandidates: { day: DayOfWeek; slot: number }[] = [
    { day: 'Monday', slot: 5 },
    { day: 'Tuesday', slot: 5 },
    { day: 'Thursday', slot: 2 },
    { day: 'Wednesday', slot: 5 },
    { day: 'Friday', slot: 1 },
  ];

  let labSlotIdx = 0;
  for (const labSub of labSubjects) {
    const suitableLabs = rooms.filter((r) => r.type === 'Lab');
    const faculty = facultyMap.get(labSub.defaultFacultyId) || facultyList[0];
    let placed = false;

    for (let attempt = 0; attempt < labSlotsCandidates.length; attempt++) {
      const candidate = labSlotsCandidates[(labSlotIdx + attempt) % labSlotsCandidates.length];
      for (const labRoom of suitableLabs) {
        if (isSlotFree(candidate.day, candidate.slot, 2, faculty.id, labRoom.id)) {
          newEntries.push({
            id: `sch-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            subjectId: labSub.id,
            subjectCode: labSub.code,
            subjectName: `${labSub.name} (Lab)`,
            facultyId: faculty.id,
            facultyName: faculty.name,
            roomId: labRoom.id,
            roomName: labRoom.name.split(' ')[0],
            day: candidate.day,
            slotIndex: candidate.slot,
            durationHours: 2,
            branch: branch as any,
            semester: semester as any,
            section: section as any,
            slotType: 'Lab',
            colorTag: labSub.colorTag?.split(' ')[0]?.replace('border-', '') || 'emerald',
          });
          placed = true;
          labSlotIdx++;
          break;
        }
      }
      if (placed) break;
    }
  }

  // 2. Place Theory Lectures across 5 days (Morning slots 0, 1, 2, 3, Afternoon 5, 6)
  const lectureRooms = rooms.filter((r) => r.type === 'Lecture Hall');
  const preferredLectureRoom = lectureRooms.find((r) => r.block === 'E-Block') || lectureRooms[0];

  for (const theorySub of theorySubjects) {
    const faculty = facultyMap.get(theorySub.defaultFacultyId) || facultyList[0];
    // Need 3 or 4 lectures per week based on credits
    const lecturesNeeded = theorySub.credits >= 4 ? 3 : 2;

    let placedCount = 0;
    for (const day of DAYS_OF_WEEK) {
      if (placedCount >= lecturesNeeded) break;

      // Try morning slots first, then afternoon
      const slotOrder = [0, 1, 2, 3, 5, 6];
      for (const slot of slotOrder) {
        if (isSlotFree(day, slot, 1, faculty.id, preferredLectureRoom.id)) {
          newEntries.push({
            id: `sch-gen-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            subjectId: theorySub.id,
            subjectCode: theorySub.code,
            subjectName: theorySub.name,
            facultyId: faculty.id,
            facultyName: faculty.name,
            roomId: preferredLectureRoom.id,
            roomName: preferredLectureRoom.name.split(' ')[0],
            day,
            slotIndex: slot,
            durationHours: 1,
            branch: branch as any,
            semester: semester as any,
            section: section as any,
            slotType: placedCount === lecturesNeeded - 1 && theorySub.ltp.includes('-1-') ? 'Tutorial' : 'Lecture',
            colorTag: theorySub.colorTag?.split(' ')[0]?.replace('border-', '') || 'blue',
          });
          placedCount++;
          break;
        }
      }
    }
  }

  return {
    schedule: newEntries,
    notes: `Engine generated ${newEntries.length} conflict-free slots conforming to USICT credit structures (L-T-P) and 2-hour practical lab constraints.`,
  };
}
