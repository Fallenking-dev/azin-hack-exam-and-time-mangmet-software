import React, { useState } from 'react';
import { DayOfWeek, Faculty, FacultyOfficeHour, ScheduleEntry } from '../types';
import { 
  Users, 
  Clock, 
  Award, 
  Mail, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Video, 
  MapPin, 
  Plus, 
  ExternalLink,
  BookOpen,
  Filter,
  Download,
  CalendarCheck
} from 'lucide-react';
import { exportScheduleToICS } from '../utils/exportUtils';

interface FacultyWorkloadViewProps {
  facultyList: Faculty[];
  schedule: ScheduleEntry[];
  onUpdateFaculty?: (faculty: Faculty) => void;
}

export const FacultyWorkloadView: React.FC<FacultyWorkloadViewProps> = ({ 
  facultyList, 
  schedule,
  onUpdateFaculty 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState<'workload' | 'office-hours'>('workload');
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL');
  const [selectedFacultyForBooking, setSelectedFacultyForBooking] = useState<Faculty | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string>('');

  const filteredFaculty = facultyList.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || f.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  // Export faculty office hours to .ics
  const handleExportOfficeHoursICS = (faculty: Faculty) => {
    if (!faculty.officeHours || faculty.officeHours.length === 0) {
      alert('No office hours scheduled for this faculty member.');
      return;
    }

    const dummyEntries: ScheduleEntry[] = faculty.officeHours.map((oh, idx) => ({
      id: `oh-export-${faculty.id}-${idx}`,
      subjectId: 'oh-sub',
      subjectCode: 'OFFICE-HRS',
      subjectName: `Faculty Office Hours: ${faculty.name}`,
      facultyId: faculty.id,
      facultyName: faculty.name,
      roomId: 'room-office',
      roomName: oh.location,
      day: oh.day,
      slotIndex: parseInt(oh.startTime.split(':')[0]) - 9,
      durationHours: 2,
      branch: 'CSE',
      semester: 1,
      section: 'Sec-A',
      slotType: 'Tutorial',
    }));

    exportScheduleToICS(dummyEntries, `Office_Hours_${faculty.name.replace(/\s+/g, '_')}.ics`);
  };

  const handleBookSlot = (faculty: Faculty, oh: FacultyOfficeHour) => {
    setBookingSuccessMsg(`Consultation slot confirmed with ${faculty.name} for ${oh.day} at ${oh.startTime} - ${oh.endTime} (${oh.location})`);
    setTimeout(() => {
      setBookingSuccessMsg('');
      setSelectedFacultyForBooking(null);
    }, 3500);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              USICT Faculty Directory, Workload & Office Hours
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Teaching credit balance, maximum weekly hour limits, and student consultation schedules
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('workload')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === 'workload'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Teaching Workload
          </button>
          <button
            onClick={() => setActiveTab('office-hours')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              activeTab === 'office-hours'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            <span>Office Hours & Consultation</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search faculty name, domain, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'office-hours' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Day:</span>
              <select
                value={selectedDayFilter}
                onChange={(e) => setSelectedDayFilter(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="ALL">All Weekdays</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dept:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="ALL">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Comm.">Electronics & Comm.</option>
            </select>
          </div>
        </div>
      </div>

      {/* Confirmation Banner if slot booked */}
      {bookingSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{bookingSuccessMsg}</span>
        </div>
      )}

      {/* VIEW 1: Teaching Workload Cards */}
      {activeTab === 'workload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculty.map((faculty) => {
            const facultyClasses = schedule.filter((e) => e.facultyId === faculty.id);
            const currentHours = facultyClasses.reduce((acc, curr) => acc + curr.durationHours, 0);
            const percentLoad = Math.round((currentHours / faculty.maxHoursPerWeek) * 100);

            return (
              <div
                key={faculty.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${faculty.avatarColor || 'from-indigo-600 to-blue-600'} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                      {faculty.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                        {faculty.name}
                      </h3>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {faculty.designation}
                      </p>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px]">
                    {faculty.department}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{faculty.specialization}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="truncate">{faculty.email}</span>
                  </div>
                </div>

                {/* Workload Progress Bar */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500">Weekly Teaching Load:</span>
                    <span className={percentLoad > 90 ? 'text-amber-600 font-bold' : 'text-slate-900 dark:text-white'}>
                      {currentHours} / {faculty.maxHoursPerWeek} hrs ({percentLoad}%)
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentLoad > 90
                          ? 'bg-amber-500'
                          : percentLoad > 50
                          ? 'bg-indigo-600'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, percentLoad)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Office Hours Preview Footer */}
                {faculty.officeHours && faculty.officeHours.length > 0 && (
                  <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      {faculty.officeHours.length} Consultation Slot{faculty.officeHours.length > 1 ? 's' : ''}
                    </span>
                    <button
                      onClick={() => {
                        setSearchQuery(faculty.name);
                        setActiveTab('office-hours');
                      }}
                      className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                    >
                      View Hours →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: Office Hours & Consultation Schedules */}
      {activeTab === 'office-hours' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFaculty.map((faculty) => {
              const officeHoursList = (faculty.officeHours || []).filter(
                (oh) => selectedDayFilter === 'ALL' || oh.day === selectedDayFilter
              );

              return (
                <div
                  key={faculty.id}
                  className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Faculty Profile Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${faculty.avatarColor || 'from-indigo-600 to-blue-600'} flex items-center justify-center text-white font-bold text-xs shadow-md`}>
                          {faculty.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                            {faculty.name}
                          </h3>
                          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                            {faculty.designation} • {faculty.department}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleExportOfficeHoursICS(faculty)}
                        title="Download Office Hours to Apple / Google Calendar (.ics)"
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 transition"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Office Hours Slots */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CalendarCheck className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Weekly Office Hours:</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                          {faculty.officeHours?.length || 0} Slots
                        </span>
                      </div>

                      {officeHoursList.length === 0 ? (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400">
                          No consultation slots scheduled for the selected filter.
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {officeHoursList.map((oh) => (
                            <div
                              key={oh.id}
                              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                  {oh.day} ({oh.startTime} - {oh.endTime})
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  oh.mode === 'In-Person'
                                    ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                                    : 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300'
                                }`}>
                                  {oh.mode}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[11px]">
                                {oh.mode === 'In-Person' ? (
                                  <>
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                    <span>{oh.location}</span>
                                  </>
                                ) : (
                                  <>
                                    <Video className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                                    <a
                                      href={oh.meetLink || '#'}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-indigo-600 dark:text-indigo-400 underline font-medium flex items-center gap-1"
                                    >
                                      Join Video Room <ExternalLink className="w-2.5 h-2.5" />
                                    </a>
                                  </>
                                )}
                              </div>

                              {oh.availableFor && oh.availableFor.length > 0 && (
                                <div className="flex flex-wrap gap-1 pt-1">
                                  {oh.availableFor.map((topic, tidx) => (
                                    <span
                                      key={tidx}
                                      className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[10px] text-slate-600 dark:text-slate-300"
                                    >
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <button
                                onClick={() => handleBookSlot(faculty, oh)}
                                className="mt-1 w-full py-1.5 rounded-lg bg-indigo-600 text-white font-semibold text-[11px] hover:bg-indigo-700 transition shadow-xs flex items-center justify-center gap-1"
                              >
                                <span>Book 1-on-1 Consultation</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
