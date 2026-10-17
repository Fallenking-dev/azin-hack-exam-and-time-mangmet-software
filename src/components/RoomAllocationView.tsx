import React, { useState } from 'react';
import { Room, ScheduleEntry, TIME_SLOTS, DAYS_OF_WEEK, DayOfWeek } from '../types';
import { 
  Building2, 
  Layers, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  BarChart3, 
  Table2,
  TrendingUp,
  Sparkles,
  ThermometerSnowflake
} from 'lucide-react';
import { RoomUtilizationDashboard } from './RoomUtilizationDashboard';
import { RoomAvailabilityHeatmap } from './RoomAvailabilityHeatmap';
import { RoomDemandProjectionChart } from './RoomDemandProjectionChart';

interface RoomAllocationViewProps {
  rooms: Room[];
  schedule: ScheduleEntry[];
}

export type RoomAllocationSubTab = 'dashboard' | 'heatmap' | 'projection' | 'matrix' | 'combined';

export const RoomAllocationView: React.FC<RoomAllocationViewProps> = ({ rooms, schedule }) => {
  const [activeSubTab, setActiveSubTab] = useState<RoomAllocationSubTab>('dashboard');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');
  const [highlightedRoomId, setHighlightedRoomId] = useState<string | null>(null);

  const filteredRooms = selectedRoomType === 'ALL'
    ? rooms
    : rooms.filter((r) => r.type === selectedRoomType);

  // When user clicks "View Schedule" on a room in the Utilization Dashboard
  const handleSelectRoomFromDashboard = (roomId: string, day?: DayOfWeek) => {
    setHighlightedRoomId(roomId);
    if (day) setSelectedDay(day);
    setActiveSubTab('matrix');
    // Scroll smoothly to table if present
    setTimeout(() => {
      const el = document.getElementById(`room-row-${roomId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3.5 px-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Campus Infrastructure & Room Allocation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Analyze peak loads, detect idle clusters for eco-lockdowns, forecast semester demand, and manage venues
            </p>
          </div>
        </div>

        {/* View Segmented Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeSubTab === 'dashboard'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveSubTab('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeSubTab === 'heatmap'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-500" />
            <span>Availability Heatmap</span>
          </button>

          <button
            onClick={() => setActiveSubTab('projection')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeSubTab === 'projection'
                ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
            <span>Demand Projection</span>
          </button>

          <button
            onClick={() => setActiveSubTab('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap ${
              activeSubTab === 'matrix'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Hourly Matrix</span>
          </button>

          <button
            onClick={() => setActiveSubTab('combined')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap hidden md:flex ${
              activeSubTab === 'combined'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Views</span>
          </button>
        </div>
      </div>

      {/* 1. Room Utilization Dashboard (Rendered if 'dashboard' or 'combined') */}
      {(activeSubTab === 'dashboard' || activeSubTab === 'combined') && (
        <RoomUtilizationDashboard 
          rooms={rooms} 
          schedule={schedule}
          onSelectRoomForHeatmap={handleSelectRoomFromDashboard}
        />
      )}

      {/* 2. Direct Availability Heatmap View */}
      {activeSubTab === 'heatmap' && (
        <RoomAvailabilityHeatmap 
          rooms={rooms} 
          schedule={schedule}
          onSelectRoom={handleSelectRoomFromDashboard}
        />
      )}

      {/* 3. Direct Room Demand Projection View */}
      {activeSubTab === 'projection' && (
        <RoomDemandProjectionChart 
          rooms={rooms} 
          schedule={schedule}
        />
      )}

      {/* Divider if combined view */}
      {activeSubTab === 'combined' && (
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-50 dark:bg-slate-950 px-3 text-slate-500 font-semibold">
              Live Hourly Room Booking Matrix
            </span>
          </div>
        </div>
      )}

      {/* 4. Hourly Schedule Matrix (Rendered if 'matrix' or 'combined') */}
      {(activeSubTab === 'matrix' || activeSubTab === 'combined') && (
        <div className="space-y-4">
          {/* Matrix Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Table2 className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Room Occupancy Matrix ({selectedDay})
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed hourly venue allocations across E-Block Lecture Halls, C-Block Labs & Central Exam Venues
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Day Selector */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                {DAYS_OF_WEEK.map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDay(d)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      selectedDay === d
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>

              {/* Type Filter */}
              <select
                value={selectedRoomType}
                onChange={(e) => setSelectedRoomType(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
              >
                <option value="ALL">All Rooms & Labs ({rooms.length})</option>
                <option value="Lecture Hall">Lecture Halls</option>
                <option value="Lab">Computer Labs</option>
                <option value="Central Exam Hall">Central Exam Halls</option>
              </select>

              {highlightedRoomId && (
                <button
                  onClick={() => setHighlightedRoomId(null)}
                  className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline ml-1"
                >
                  Clear Highlight
                </button>
              )}
            </div>
          </div>

          {/* Heatmap Matrix Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px] text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                    <th className="p-3.5 w-48 border-r border-slate-200 dark:border-slate-800">
                      Venue / Facility
                    </th>
                    {TIME_SLOTS.map((slot) => (
                      <th
                        key={slot.index}
                        className={`p-3 text-center border-r border-slate-200 dark:border-slate-800 last:border-r-0 ${
                          slot.isLunch ? 'bg-amber-500/10 text-amber-700' : ''
                        }`}
                      >
                        <div>{slot.startTime}</div>
                        <div className="text-[10px] font-normal text-slate-400">
                          {slot.isLunch ? 'LUNCH' : `Slot ${slot.index + 1}`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => {
                    // Find all bookings for this room on selected day
                    const roomDayEntries = schedule.filter(
                      (e) => (e.roomId === room.id || room.name.toLowerCase().includes(e.roomName.toLowerCase()) || e.roomName.toLowerCase().includes(room.name.toLowerCase())) && e.day === selectedDay
                    );

                    const isHighlighted = highlightedRoomId === room.id;

                    return (
                      <tr
                        key={room.id}
                        id={`room-row-${room.id}`}
                        className={`border-b border-slate-100 dark:border-slate-800 transition ${
                          isHighlighted 
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500 inset-0' 
                            : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        }`}
                      >
                        {/* Room Info Cell */}
                        <td className="p-3 bg-slate-50/50 dark:bg-slate-800/40 border-r border-slate-200 dark:border-slate-800">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {room.name}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                            <span className="font-medium text-slate-700 dark:text-slate-300">{room.block}</span>
                            <span>•</span>
                            <span>Cap: {room.capacity}</span>
                            <span>•</span>
                            <span>{room.type}</span>
                          </div>
                        </td>

                        {/* Time Slots */}
                        {TIME_SLOTS.map((slot) => {
                          const entry = roomDayEntries.find(
                            (e) => e.slotIndex <= slot.index && (e.slotIndex + e.durationHours) > slot.index
                          );

                          if (slot.isLunch && !entry) {
                            return (
                              <td
                                key={slot.index}
                                className="p-2 border-r border-slate-200 dark:border-slate-800 bg-amber-500/5 text-center text-[10px] text-amber-600/70"
                              >
                                Recess
                              </td>
                            );
                          }

                          return (
                            <td
                              key={slot.index}
                              className="p-1.5 border-r border-slate-200 dark:border-slate-800 last:border-r-0 align-top"
                            >
                              {entry ? (
                                <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-950 dark:text-indigo-100 space-y-0.5 shadow-xs">
                                  <div className="flex items-center justify-between text-[10px] font-bold">
                                    <span>{entry.subjectCode}</span>
                                    <span className="text-[9px] px-1 rounded bg-indigo-200 dark:bg-indigo-900 font-semibold">
                                      {entry.branch} S{entry.semester}
                                    </span>
                                  </div>
                                  <p className="text-[10px] truncate text-slate-600 dark:text-slate-400">
                                    {entry.facultyName}
                                  </p>
                                </div>
                              ) : (
                                <div className="h-12 rounded-xl bg-emerald-500/5 border border-dashed border-emerald-500/20 flex items-center justify-center text-[10px] text-emerald-600 font-medium">
                                  Free
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
