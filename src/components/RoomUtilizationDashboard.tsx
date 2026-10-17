import React, { useState, useMemo } from 'react';
import { 
  Room, 
  ScheduleEntry, 
  TIME_SLOTS, 
  DAYS_OF_WEEK, 
  DayOfWeek, 
  AcademicBlock, 
  RoomType 
} from '../types';
import { 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Filter, 
  Download, 
  Info, 
  ChevronRight, 
  Calendar, 
  Zap, 
  Layers, 
  Search, 
  ArrowUpRight,
  ShieldAlert,
  SlidersHorizontal,
  Compass,
  ThermometerSnowflake,
  BarChart3
} from 'lucide-react';
import { RoomAvailabilityHeatmap } from './RoomAvailabilityHeatmap';
import { RoomDemandProjectionChart } from './RoomDemandProjectionChart';

interface RoomUtilizationDashboardProps {
  rooms: Room[];
  schedule: ScheduleEntry[];
  onSelectRoomForHeatmap?: (roomId: string, day?: DayOfWeek) => void;
}

// Color palette constants with high-contrast accessibility
const COLORS = {
  primary: '#6366f1',     // Indigo
  secondary: '#38bdf8',   // Sky
  accent: '#10b981',      // Emerald
  warning: '#f59e0b',     // Amber
  danger: '#ef4444',      // Rose / Red
  purple: '#a855f7',      // Violet
  slate: '#64748b',       // Slate
  pie: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']
};

export const RoomUtilizationDashboard: React.FC<RoomUtilizationDashboardProps> = ({
  rooms,
  schedule,
  onSelectRoomForHeatmap
}) => {
  // Filter States
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('ALL'); // 'ALL' or DayOfWeek
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('ALL'); // 'ALL' | 'E-Block' | 'C-Block' | 'Central'
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL'); // 'ALL' | RoomType
  const [underutilizedThreshold, setUnderutilizedThreshold] = useState<number>(40); // % threshold
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'utilization-asc' | 'utilization-desc' | 'capacity' | 'name'>('utilization-asc');
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<Room | null>(null);
  const [dashboardSection, setDashboardSection] = useState<'all' | 'heatmap' | 'projection' | 'rankings' | 'underutilized'>('all');

  // Active days to consider
  const activeDays: DayOfWeek[] = useMemo(() => {
    if (selectedDayFilter === 'ALL') {
      return DAYS_OF_WEEK;
    }
    return [selectedDayFilter as DayOfWeek];
  }, [selectedDayFilter]);

  // Active non-lunch teaching slots
  const teachingSlots = useMemo(() => TIME_SLOTS.filter(s => !s.isLunch), []);
  const totalWeeklySlotCapacityPerRoom = teachingSlots.length * activeDays.length;

  // Filtered rooms based on Block and Type
  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      const matchBlock = selectedBlockFilter === 'ALL' || room.block === selectedBlockFilter;
      const matchType = selectedTypeFilter === 'ALL' || room.type === selectedTypeFilter;
      const matchSearch = searchQuery.trim() === '' || 
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.block.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase());
      return matchBlock && matchType && matchSearch;
    });
  }, [rooms, selectedBlockFilter, selectedTypeFilter, searchQuery]);

  // Calculate detailed room-by-room utilization metrics
  const roomMetrics = useMemo(() => {
    return filteredRooms.map(room => {
      // Find all schedule entries for this room across active days
      let bookedSlotsCount = 0;
      const dayBreakdown: Record<DayOfWeek, number> = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0
      };

      const bookedSlotsSet = new Set<string>();

      schedule.forEach(entry => {
        const matchesRoom = entry.roomId === room.id || 
                            entry.roomName === room.name || 
                            room.name.toLowerCase().includes(entry.roomName.toLowerCase()) ||
                            entry.roomName.toLowerCase().includes(room.name.toLowerCase());
        
        if (matchesRoom && activeDays.includes(entry.day)) {
          for (let i = 0; i < entry.durationHours; i++) {
            const slotIdx = entry.slotIndex + i;
            // Check if it's a valid teaching slot
            const slotDef = TIME_SLOTS[slotIdx];
            if (slotDef && !slotDef.isLunch) {
              const key = `${entry.day}-${slotIdx}`;
              if (!bookedSlotsSet.has(key)) {
                bookedSlotsSet.add(key);
                bookedSlotsCount++;
                dayBreakdown[entry.day] = (dayBreakdown[entry.day] || 0) + 1;
              }
            }
          }
        }
      });

      const maxSlots = totalWeeklySlotCapacityPerRoom || 1;
      const utilizationRate = Math.min(100, Math.round((bookedSlotsCount / maxSlots) * 100));
      const idleSlotsCount = Math.max(0, maxSlots - bookedSlotsCount);

      // Status tier
      let statusTier: 'under' | 'optimal' | 'heavy';
      if (utilizationRate < underutilizedThreshold) {
        statusTier = 'under';
      } else if (utilizationRate > 75) {
        statusTier = 'heavy';
      } else {
        statusTier = 'optimal';
      }

      // Energy / Reallocation recommendation
      let recommendation = '';
      if (statusTier === 'under') {
        if (room.type === 'Lecture Hall') {
          recommendation = 'Prime candidate for elective splitting or seminar sessions. Off-peak HVAC eco-mode recommended.';
        } else if (room.type === 'Lab') {
          recommendation = 'Available for open coding lab hours, hackathons, or project work.';
        } else {
          recommendation = 'Under-utilized central space; can host multi-department joint guest lectures.';
        }
      } else if (statusTier === 'heavy') {
        recommendation = 'Nearing capacity bottleneck. Consider shifting 1–2 lecture sections to lower-utilized rooms.';
      } else {
        recommendation = 'Optimal scheduling balance aligned with AICTE space efficiency guidelines.';
      }

      return {
        room,
        bookedSlotsCount,
        idleSlotsCount,
        utilizationRate,
        statusTier,
        dayBreakdown,
        recommendation
      };
    });
  }, [filteredRooms, schedule, activeDays, totalWeeklySlotCapacityPerRoom, underutilizedThreshold]);

  // Sort room metrics
  const sortedRoomMetrics = useMemo(() => {
    return [...roomMetrics].sort((a, b) => {
      if (sortBy === 'utilization-asc') return a.utilizationRate - b.utilizationRate;
      if (sortBy === 'utilization-desc') return b.utilizationRate - a.utilizationRate;
      if (sortBy === 'capacity') return b.room.capacity - a.room.capacity;
      return a.room.name.localeCompare(b.room.name);
    });
  }, [roomMetrics, sortBy]);

  // Under-utilized classrooms list (filtered by threshold)
  const underutilizedRooms = useMemo(() => {
    return sortedRoomMetrics.filter(m => m.utilizationRate < underutilizedThreshold);
  }, [sortedRoomMetrics, underutilizedThreshold]);

  // Campus High-Level Summary Statistics
  const summaryStats = useMemo(() => {
    if (roomMetrics.length === 0) {
      return {
        overallUtilization: 0,
        totalBookedHours: 0,
        totalIdleHours: 0,
        underutilizedCount: 0,
        peakOccupancySlot: '11:00 AM',
        peakOccupancyPct: 0,
        mostUnderutilizedRoom: null as (typeof roomMetrics[0] | null),
        mostHeavilyUtilizedRoom: null as (typeof roomMetrics[0] | null)
      };
    }

    const totalBooked = roomMetrics.reduce((acc, m) => acc + m.bookedSlotsCount, 0);
    const totalPossible = roomMetrics.length * (totalWeeklySlotCapacityPerRoom || 1);
    const overallUtil = totalPossible > 0 ? Math.round((totalBooked / totalPossible) * 100) : 0;
    const totalIdle = totalPossible - totalBooked;

    const underCount = roomMetrics.filter(m => m.utilizationRate < underutilizedThreshold).length;

    // Sort to get extremes
    const sortedByUtil = [...roomMetrics].sort((a, b) => a.utilizationRate - b.utilizationRate);
    const lowestRoom = sortedByUtil[0] || null;
    const highestRoom = sortedByUtil[sortedByUtil.length - 1] || null;

    return {
      overallUtilization: overallUtil,
      totalBookedHours: totalBooked,
      totalIdleHours: totalIdle,
      underutilizedCount: underCount,
      mostUnderutilizedRoom: lowestRoom,
      mostHeavilyUtilizedRoom: highestRoom
    };
  }, [roomMetrics, totalWeeklySlotCapacityPerRoom, underutilizedThreshold]);

  // Hourly Peak Occupancy Distribution Data for Recharts Area/Bar Chart
  const hourlyOccupancyData = useMemo(() => {
    const totalRoomsCount = filteredRooms.length || 1;

    return TIME_SLOTS.map(slot => {
      if (slot.isLunch) {
        return {
          slotLabel: slot.startTime,
          fullLabel: `${slot.startTime} - ${slot.endTime} (Recess)`,
          occupancyCount: 0,
          occupancyPct: 0,
          lectureHalls: 0,
          labs: 0,
          centralHalls: 0,
          isLunch: true,
          activeClasses: [] as string[]
        };
      }

      let occupiedRoomsCount = 0;
      let lectureCount = 0;
      let labCount = 0;
      let centralCount = 0;
      const activeClassesList: string[] = [];

      filteredRooms.forEach(room => {
        // Check if occupied in any of the active days at this slot
        let isOccupiedAtThisSlot = false;
        let occupiedDayCount = 0;

        activeDays.forEach(day => {
          const entry = schedule.find(e => {
            const matchesRoom = e.roomId === room.id || 
                                e.roomName === room.name || 
                                room.name.toLowerCase().includes(e.roomName.toLowerCase()) ||
                                e.roomName.toLowerCase().includes(room.name.toLowerCase());
            return matchesRoom && e.day === day && e.slotIndex <= slot.index && (e.slotIndex + e.durationHours) > slot.index;
          });

          if (entry) {
            isOccupiedAtThisSlot = true;
            occupiedDayCount++;
            if (!activeClassesList.includes(`${entry.subjectCode} (${room.name})`)) {
              activeClassesList.push(`${entry.subjectCode} (${room.name})`);
            }
          }
        });

        if (isOccupiedAtThisSlot) {
          occupiedRoomsCount += (occupiedDayCount / activeDays.length);
          if (room.type === 'Lecture Hall') lectureCount += (occupiedDayCount / activeDays.length);
          else if (room.type === 'Lab') labCount += (occupiedDayCount / activeDays.length);
          else centralCount += (occupiedDayCount / activeDays.length);
        }
      });

      const avgOccupiedRooms = Math.round(occupiedRoomsCount * 10) / 10;
      const pct = Math.min(100, Math.round((avgOccupiedRooms / totalRoomsCount) * 100));

      return {
        slotLabel: slot.startTime,
        fullLabel: `${slot.startTime} - ${slot.endTime}`,
        occupancyCount: avgOccupiedRooms,
        occupancyPct: pct,
        lectureHalls: Math.round(lectureCount * 10) / 10,
        labs: Math.round(labCount * 10) / 10,
        centralHalls: Math.round(centralCount * 10) / 10,
        isLunch: false,
        activeClasses: activeClassesList
      };
    });
  }, [filteredRooms, activeDays, schedule]);

  // Identify peak hour
  const peakHourInfo = useMemo(() => {
    const valid = hourlyOccupancyData.filter(d => !d.isLunch);
    if (valid.length === 0) return { time: '11:00 AM', pct: 0, count: 0 };
    const peak = [...valid].sort((a, b) => b.occupancyPct - a.occupancyPct)[0];
    return {
      time: peak.fullLabel,
      pct: peak.occupancyPct,
      count: peak.occupancyCount
    };
  }, [hourlyOccupancyData]);

  // Block & Space Type Distribution Data for Recharts Pie Chart
  const blockDistributionData = useMemo(() => {
    const blocks: Record<string, { booked: number; capacity: number; count: number }> = {
      'E-Block': { booked: 0, capacity: 0, count: 0 },
      'C-Block': { booked: 0, capacity: 0, count: 0 },
      'Central': { booked: 0, capacity: 0, count: 0 }
    };

    roomMetrics.forEach(m => {
      const b = m.room.block;
      if (!blocks[b]) {
        blocks[b] = { booked: 0, capacity: 0, count: 0 };
      }
      blocks[b].booked += m.bookedSlotsCount;
      blocks[b].capacity += (totalWeeklySlotCapacityPerRoom || 1);
      blocks[b].count += 1;
    });

    return Object.entries(blocks)
      .filter(([_, data]) => data.count > 0)
      .map(([name, data]) => ({
        name,
        booked: data.booked,
        utilizationRate: data.capacity > 0 ? Math.round((data.booked / data.capacity) * 100) : 0,
        roomCount: data.count
      }));
  }, [roomMetrics, totalWeeklySlotCapacityPerRoom]);

  // Day-of-Week Occupancy Comparison
  const dayComparisonData = useMemo(() => {
    const totalRooms = filteredRooms.length || 1;
    const slotsPerDay = teachingSlots.length;

    return DAYS_OF_WEEK.map(day => {
      let dayBookings = 0;
      filteredRooms.forEach(room => {
        schedule.forEach(e => {
          const matchesRoom = e.roomId === room.id || 
                              e.roomName === room.name || 
                              room.name.toLowerCase().includes(e.roomName.toLowerCase());
          if (matchesRoom && e.day === day) {
            dayBookings += e.durationHours;
          }
        });
      });

      const maxDayCapacity = totalRooms * slotsPerDay;
      const rate = maxDayCapacity > 0 ? Math.min(100, Math.round((dayBookings / maxDayCapacity) * 100)) : 0;

      return {
        day: day.slice(0, 3),
        fullDay: day,
        bookedHours: dayBookings,
        utilizationRate: rate
      };
    });
  }, [filteredRooms, teachingSlots, schedule]);

  // Custom Tooltip for Peak Occupancy Area Chart
  const CustomHourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.isLunch) {
        return (
          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
            <p className="font-bold text-amber-400">13:00 - 14:00 (Campus Recess / Lunch)</p>
            <p className="text-slate-400 mt-1">Designated institutional dining & break period.</p>
          </div>
        );
      }

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs space-y-1.5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-bold text-slate-100">{data.fullLabel}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
              data.occupancyPct >= 75 ? 'bg-rose-500/20 text-rose-300' : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {data.occupancyPct}% Peak
            </span>
          </div>
          <div className="text-slate-300 flex justify-between">
            <span>Avg Active Classrooms:</span>
            <span className="font-semibold text-white">{data.occupancyCount} / {filteredRooms.length} rooms</span>
          </div>
          <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-slate-400 border-t border-slate-800">
            <div>Lecture: <span className="text-white font-medium">{data.lectureHalls}</span></div>
            <div>Labs: <span className="text-white font-medium">{data.labs}</span></div>
            <div>Central: <span className="text-white font-medium">{data.centralHalls}</span></div>
          </div>
          {data.activeClasses.length > 0 && (
            <div className="pt-1 text-[10px] text-slate-400">
              <span className="text-indigo-300">Active: </span>
              {data.activeClasses.slice(0, 3).join(', ')}
              {data.activeClasses.length > 3 && ` +${data.activeClasses.length - 3} more`}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Room Utilization Ranking Chart
  const CustomRoomRankingTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs max-w-xs space-y-1">
          <div className="font-bold text-slate-100 border-b border-slate-800 pb-1 flex justify-between items-center">
            <span>{data.name}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              data.utilizationRate < underutilizedThreshold 
                ? 'bg-sky-500/20 text-sky-300' 
                : data.utilizationRate > 75 
                ? 'bg-rose-500/20 text-rose-300' 
                : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {data.utilizationRate}%
            </span>
          </div>
          <div className="text-slate-300 text-[11px] space-y-0.5 pt-1">
            <div className="flex justify-between">
              <span>Block & Type:</span>
              <span className="font-medium text-slate-200">{data.block} · {data.type}</span>
            </div>
            <div className="flex justify-between">
              <span>Seating Capacity:</span>
              <span className="font-medium text-slate-200">{data.capacity} seats</span>
            </div>
            <div className="flex justify-between">
              <span>Weekly Booked Hours:</span>
              <span className="font-medium text-emerald-400">{data.bookedHours} hrs / {totalWeeklySlotCapacityPerRoom} hrs</span>
            </div>
            <div className="flex justify-between">
              <span>Idle Capacity:</span>
              <span className="font-medium text-slate-400">{data.idleHours} hrs free</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // CSV Export Functionality for space audit report
  const handleExportSpaceAuditCSV = () => {
    const headers = ['Room Name', 'Block', 'Type', 'Capacity', 'Floor', 'Utilization %', 'Booked Hours', 'Idle Hours', 'Status', 'Recommendation'];
    const rows = sortedRoomMetrics.map(m => [
      `"${m.room.name}"`,
      `"${m.room.block}"`,
      `"${m.room.type}"`,
      m.room.capacity,
      m.room.floor,
      `${m.utilizationRate}%`,
      m.bookedSlotsCount,
      m.idleSlotsCount,
      `"${m.statusTier.toUpperCase()}"`,
      `"${m.recommendation.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `USICT_Room_Utilization_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Global Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                  Campus Room Utilization & Peak Occupancy Dashboard
                </h2>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Recharts Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time space efficiency metrics, peak rush analytics, and under-utilized room identification
              </p>
            </div>
          </div>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setSelectedDayFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                selectedDayFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full Week
            </button>
            {DAYS_OF_WEEK.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDayFilter(d)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedDayFilter === d
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Academic Block Filter */}
          <select
            value={selectedBlockFilter}
            onChange={(e) => setSelectedBlockFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="ALL">All Blocks</option>
            <option value="E-Block">E-Block</option>
            <option value="C-Block">C-Block</option>
            <option value="Central">Central Wing</option>
          </select>

          {/* Room Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="ALL">All Facility Types</option>
            <option value="Lecture Hall">Lecture Halls</option>
            <option value="Lab">Computer Labs</option>
            <option value="Central Exam Hall">Central Exam Halls</option>
          </select>

          {/* CSV Export Button */}
          <button
            onClick={handleExportSpaceAuditCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl text-xs font-semibold border border-indigo-200 dark:border-indigo-800 transition"
            title="Export Room Utilization Report to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Audit CSV</span>
          </button>
        </div>
      </div>

      {/* In-Dashboard Section Quick Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setDashboardSection('all')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            dashboardSection === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Comprehensive Dashboard</span>
        </button>

        <button
          onClick={() => setDashboardSection('heatmap')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            dashboardSection === 'heatmap'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <ThermometerSnowflake className="w-3.5 h-3.5 text-emerald-400" />
          <span>Weekly Availability Heatmap & Idle Clusters</span>
        </button>

        <button
          onClick={() => setDashboardSection('projection')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            dashboardSection === 'projection'
              ? 'bg-cyan-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
          <span>Future Demand Projection (Trend Line)</span>
        </button>

        <button
          onClick={() => setDashboardSection('rankings')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            dashboardSection === 'rankings'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Peak Occupancy & Rankings</span>
        </button>

        <button
          onClick={() => setDashboardSection('underutilized')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
            dashboardSection === 'underutilized'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Under-Utilized Classrooms ({underutilizedRooms.length})</span>
        </button>
      </div>

      {/* 2. Key Utilization Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Utilization */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Campus Space Utilization
            </span>
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {summaryStats.overallUtilization}%
            </span>
            <span className="text-xs text-slate-500">
              of weekly capacity
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${summaryStats.overallUtilization}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex justify-between">
            <span>Booked: {summaryStats.totalBookedHours} hrs</span>
            <span>Idle: {summaryStats.totalIdleHours} hrs</span>
          </div>
        </div>

        {/* Card 2: Peak Occupancy Hour */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Peak Rush Hour
            </span>
            <span className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-600 dark:text-amber-400 truncate">
              {peakHourInfo.time.split(' ')[0]}
            </span>
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">
              {peakHourInfo.pct}% load
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {peakHourInfo.count} of {filteredRooms.length} rooms active simultaneously
          </p>
          <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 flex-shrink-0" />
            <span>Highest student transit & hallway density</span>
          </div>
        </div>

        {/* Card 3: Under-Utilized Classrooms Count */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Under-Utilized Classrooms
            </span>
            <span className="p-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-sky-600 dark:text-sky-400">
              {summaryStats.underutilizedCount}
            </span>
            <span className="text-xs text-slate-500">
              rooms &lt; {underutilizedThreshold}% load
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {summaryStats.mostUnderutilizedRoom ? (
              <>Lowest: <span className="font-semibold text-slate-700 dark:text-slate-300">{summaryStats.mostUnderutilizedRoom.room.name.split(' ')[0]}</span> ({summaryStats.mostUnderutilizedRoom.utilizationRate}%)</>
            ) : 'All rooms well utilized'}
          </p>
          <div className="mt-2 text-[10px] text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/30 p-1.5 rounded-lg border border-sky-200 dark:border-sky-900/50 flex items-center gap-1">
            <Zap className="w-3 h-3 flex-shrink-0" />
            <span>Prime candidates for rescheduling</span>
          </div>
        </div>

        {/* Card 4: Most In-Demand Room */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Highest Occupancy Venue
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-black text-slate-900 dark:text-white truncate">
              {summaryStats.mostHeavilyUtilizedRoom ? summaryStats.mostHeavilyUtilizedRoom.room.name.split(' ')[0] : 'N/A'}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {summaryStats.mostHeavilyUtilizedRoom ? `${summaryStats.mostHeavilyUtilizedRoom.utilizationRate}%` : ''}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {summaryStats.mostHeavilyUtilizedRoom ? (
              <>{summaryStats.mostHeavilyUtilizedRoom.room.block} · {summaryStats.mostHeavilyUtilizedRoom.bookedSlotsCount} weekly teaching hrs</>
            ) : ''}
          </p>
          <div className="mt-2 text-[10px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
            <Sparkles className="w-3 h-3 flex-shrink-0" />
            <span>Heavy academic & lab scheduling</span>
          </div>
        </div>
      </div>

      {/* 3. Recharts Section: Peak Occupancy Hours Distribution & Day Comparison */}
      {(dashboardSection === 'all' || dashboardSection === 'rankings') && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Peak Occupancy Hours Area/Bar Chart (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Hourly Campus Occupancy Curve</span>
                <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                  (09:00 AM – 05:00 PM)
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Displays real-time classrooms in active session by hour across {selectedDayFilter === 'ALL' ? 'all 5 academic days' : selectedDayFilter}
              </p>
            </div>
            
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Lecture Halls</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span>Labs</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Central Halls</span>
              </div>
            </div>
          </div>

          {/* Recharts Area / Stacked Bar Chart */}
          <div className="mt-4 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={hourlyOccupancyData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorLecture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorLab" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorCentral" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis 
                  dataKey="slotLabel" 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 'auto']}
                />
                <Tooltip content={<CustomHourlyTooltip />} />
                <ReferenceLine 
                  y={filteredRooms.length * 0.75} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: '75% High Density Line', fill: '#ef4444', fontSize: 10, position: 'top' }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="lectureHalls" 
                  name="Lecture Halls"
                  stackId="1" 
                  stroke="#6366f1" 
                  fill="url(#colorLecture)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="labs" 
                  name="Computer Labs"
                  stackId="1" 
                  stroke="#38bdf8" 
                  fill="url(#colorLab)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="centralHalls" 
                  name="Central Exam Halls"
                  stackId="1" 
                  stroke="#f59e0b" 
                  fill="url(#colorCentral)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500" />
              Peak traffic concentrated between 11:00 AM – 01:00 PM and 02:00 PM – 03:00 PM.
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Recess at 13:00 designated zero-lecture period.
            </span>
          </div>
        </div>

        {/* Right: Academic Block & Space Efficiency (Pie + Day Comparison) */}
        <div className="space-y-4">
          {/* Day Comparison Bar Chart */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Weekly Day-by-Day Load
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Distribution of occupied classroom hours Mon–Fri
            </p>

            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayComparisonData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} />
                  <Tooltip 
                    formatter={(val: any) => [`${val} hrs (${dayComparisonData.find(d => d.bookedHours === val)?.utilizationRate || 0}%)`, 'Occupied Hours']}
                    labelFormatter={(label: any) => `${dayComparisonData.find(d => d.day === label)?.fullDay || label}`}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '0.75rem', fontSize: '11px', color: '#fff' }}
                  />
                  <Bar dataKey="bookedHours" fill="#6366f1" radius={[4, 4, 0, 0]}>
                    {dayComparisonData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.utilizationRate > 65 ? '#6366f1' : entry.utilizationRate < 40 ? '#38bdf8' : '#818cf8'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Block Efficiency Distribution */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Block Space Efficiency
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Comparison of E-Block vs C-Block vs Central
            </p>

            <div className="space-y-2.5 mt-2">
              {blockDistributionData.map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{b.name}</span>
                    <span className="text-slate-500 font-medium">
                      {b.booked} hrs booked · <span className="font-bold text-slate-900 dark:text-white">{b.utilizationRate}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        b.name === 'E-Block' ? 'bg-indigo-600' : b.name === 'C-Block' ? 'bg-sky-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${b.utilizationRate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Classroom Utilization Ranking Bar Chart (Over-utilized vs Under-utilized) */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>All Classrooms Utilization Ranking</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                (Comparison across {filteredRooms.length} campus facilities)
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Identifies which rooms carry excessive schedules and which have surplus open time
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Toggle */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            >
              <option value="utilization-asc">Sort: Lowest Utilization First (Under-utilized)</option>
              <option value="utilization-desc">Sort: Highest Utilization First (Heavy Load)</option>
              <option value="capacity">Sort: By Room Capacity</option>
              <option value="name">Sort: By Room Name</option>
            </select>

            {/* Threshold Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
              <span>Threshold:</span>
              <select
                value={underutilizedThreshold}
                onChange={(e) => setUnderutilizedThreshold(Number(e.target.value))}
                className="bg-transparent font-bold text-slate-900 dark:text-white outline-none cursor-pointer"
              >
                <option value={30}>&lt; 30%</option>
                <option value={40}>&lt; 40%</option>
                <option value={50}>&lt; 50%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recharts Horizontal Bar Chart for Room Ranking */}
        <div className="mt-4 h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={sortedRoomMetrics.map(m => ({
                name: m.room.name.length > 22 ? m.room.name.slice(0, 20) + '...' : m.room.name,
                fullName: m.room.name,
                utilizationRate: m.utilizationRate,
                bookedHours: m.bookedSlotsCount,
                idleHours: m.idleSlotsCount,
                block: m.room.block,
                type: m.room.type,
                capacity: m.room.capacity
              }))}
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.15} />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                unit="%" 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                width={85} 
                tickLine={false} 
              />
              <Tooltip content={<CustomRoomRankingTooltip />} />
              <ReferenceLine 
                x={underutilizedThreshold} 
                stroke="#38bdf8" 
                strokeDasharray="4 4" 
                label={{ value: `Under-Utilized Threshold (<${underutilizedThreshold}%)`, fill: '#38bdf8', fontSize: 10, position: 'insideTopLeft' }} 
              />
              <ReferenceLine 
                x={75} 
                stroke="#ef4444" 
                strokeDasharray="4 4" 
                label={{ value: 'Capacity Warning (>75%)', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} 
              />
              <Bar dataKey="utilizationRate" radius={[0, 6, 6, 0]}>
                {sortedRoomMetrics.map((entry, index) => {
                  let fillColor = '#6366f1';
                  if (entry.utilizationRate < underutilizedThreshold) fillColor = '#38bdf8'; // Sky/Cyan for underutilized
                  else if (entry.utilizationRate > 75) fillColor = '#ef4444'; // Red for heavy load
                  else if (entry.utilizationRate >= 50) fillColor = '#818cf8'; // Indigo
                  return <Cell key={`cell-${index}`} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Indicator */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded bg-sky-400" />
              <span>Under-Utilized (&lt;{underutilizedThreshold}%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span>Balanced / Optimal ({underutilizedThreshold}% – 75%)</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Heavy Load (&gt;75%)</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Click on any room in the table below to inspect its detailed schedule
          </span>
        </div>
      </div>
    </>
  )}

      {/* 5. Spotlight: Under-Utilized Classrooms & Reallocation Recommendations */}
      {(dashboardSection === 'all' || dashboardSection === 'underutilized') && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-sky-50/40 dark:bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-sky-500 text-white">
                <Compass className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Under-Utilized Classroom Opportunities ({underutilizedRooms.length} Facilities Identified)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Rooms with less than {underutilizedThreshold}% weekly schedule load that can absorb rescheduled lectures or elective sections
            </p>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search under-utilized rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 w-56"
            />
          </div>
        </div>

        {underutilizedRooms.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              No Rooms Fall Below {underutilizedThreshold}% Threshold
            </p>
            <p className="text-xs text-slate-500 mt-1">
              All classrooms in the current selection have balanced or high utilization schedules.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                  <th className="p-3.5 pl-5">Classroom / Venue</th>
                  <th className="p-3.5">Block & Type</th>
                  <th className="p-3.5">Capacity</th>
                  <th className="p-3.5">Utilization Rate</th>
                  <th className="p-3.5">Booked vs Free Hours</th>
                  <th className="p-3.5">Strategic Recommendation</th>
                  <th className="p-3.5 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {underutilizedRooms.map((m) => (
                  <tr 
                    key={m.room.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition group"
                  >
                    <td className="p-3.5 pl-5">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{m.room.name}</span>
                        {m.room.floor !== undefined && (
                          <span className="text-[10px] text-slate-400 font-normal">Floor {m.room.floor}</span>
                        )}
                      </div>
                      {m.room.features && m.room.features.length > 0 && (
                        <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-xs">
                          {m.room.features.join(' · ')}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      <span className="font-medium text-slate-900 dark:text-slate-100">{m.room.block}</span>
                      <span className="text-slate-400"> · {m.room.type}</span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">
                      {m.room.capacity} seats
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sky-600 dark:text-sky-400 min-w-[34px]">
                          {m.utilizationRate}%
                        </span>
                        <div className="w-16 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-sky-500 h-1.5 rounded-full" 
                            style={{ width: `${m.utilizationRate}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      <div>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{m.bookedSlotsCount} hrs</span> booked
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.idleSlotsCount} hrs open / week
                      </div>
                    </td>

                    <td className="p-3.5 max-w-sm">
                      <div className="text-[11px] text-slate-700 dark:text-slate-300 flex items-start gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span>{m.recommendation}</span>
                      </div>
                    </td>

                    <td className="p-3.5 pr-5 text-right">
                      <button
                        onClick={() => {
                          if (onSelectRoomForHeatmap) {
                            onSelectRoomForHeatmap(m.room.id);
                          }
                          setSelectedRoomDetail(m.room);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition"
                      >
                        <span>View Schedule</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {/* 6. Weekly Room Availability & Idle Cluster Heatmap */}
      {(dashboardSection === 'all' || dashboardSection === 'heatmap') && (
        <RoomAvailabilityHeatmap 
          rooms={rooms} 
          schedule={schedule} 
          onSelectRoom={onSelectRoomForHeatmap} 
        />
      )}

      {/* 7. Future Room Demand Projection Trend Line Chart */}
      {(dashboardSection === 'all' || dashboardSection === 'projection') && (
        <RoomDemandProjectionChart 
          rooms={rooms} 
          schedule={schedule} 
        />
      )}

      {/* 6. Modal / Detail Drawer for Selected Room */}
      {selectedRoomDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedRoomDetail.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRoomDetail.block} · {selectedRoomDetail.type} · Capacity: {selectedRoomDetail.capacity}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRoomDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Room Features */}
            {selectedRoomDetail.features && (
              <div>
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Facility Equipment:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedRoomDetail.features.map(f => (
                    <span 
                      key={f}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Weekly Schedule Breakdown for this room */}
            <div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Weekly Booked Schedule:
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {schedule
                  .filter(e => e.roomId === selectedRoomDetail.id || 
                               e.roomName === selectedRoomDetail.name || 
                               selectedRoomDetail.name.toLowerCase().includes(e.roomName.toLowerCase()))
                  .map(entry => (
                    <div 
                      key={entry.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {entry.subjectName} ({entry.subjectCode})
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {entry.day} · Slot {entry.slotIndex + 1} ({TIME_SLOTS[entry.slotIndex]?.startTime || '09:00'}) · {entry.durationHours} hr{entry.durationHours > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {entry.facultyName}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {entry.branch} S{entry.semester} {entry.section}
                        </div>
                      </div>
                    </div>
                  ))}
                {schedule.filter(e => e.roomId === selectedRoomDetail.id || 
                                      e.roomName === selectedRoomDetail.name || 
                                      selectedRoomDetail.name.toLowerCase().includes(e.roomName.toLowerCase())).length === 0 && (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    No active sessions currently scheduled for this venue. Entirely open!
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedRoomDetail(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
