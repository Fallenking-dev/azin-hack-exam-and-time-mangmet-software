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
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  Calendar, 
  Clock, 
  Zap, 
  Wrench, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Leaf, 
  Building2, 
  Sliders, 
  Sparkles, 
  PowerOff,
  ThermometerSnowflake,
  Timer,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoomAvailabilityHeatmapProps {
  rooms: Room[];
  schedule: ScheduleEntry[];
  onSelectRoom?: (roomId: string, day?: DayOfWeek) => void;
}

interface IdleCluster {
  id: string;
  title: string;
  day: DayOfWeek;
  startSlot: number;
  endSlot: number;
  timeRange: string;
  block: string;
  idleRoomCount: number;
  totalRoomCount: number;
  idlePercentage: number;
  type: 'energy' | 'maintenance' | 'both';
  kwhSavingEstimate: number;
  co2SavingEstimate: number;
  recommendedAction: string;
  affectedRooms: string[];
}

export const RoomAvailabilityHeatmap: React.FC<RoomAvailabilityHeatmapProps> = ({
  rooms,
  schedule,
  onSelectRoom
}) => {
  // Filter and mode states
  const [selectedBlock, setSelectedBlock] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [activeMode, setActiveMode] = useState<'energy' | 'maintenance' | 'all'>('energy');
  const [selectedCluster, setSelectedCluster] = useState<IdleCluster | null>(null);
  const [appliedLockdowns, setAppliedLockdowns] = useState<string[]>([]);
  const [viewType, setViewType] = useState<'campus-matrix' | 'room-distribution'>('campus-matrix');

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter(r => {
      const matchBlock = selectedBlock === 'ALL' || r.block === selectedBlock;
      const matchType = selectedType === 'ALL' || r.type === selectedType;
      return matchBlock && matchType;
    });
  }, [rooms, selectedBlock, selectedType]);

  // Non-lunch active teaching slots
  const teachingSlots = useMemo(() => TIME_SLOTS.filter(s => !s.isLunch), []);

  // Compute Heatmap Matrix Data (Day vs Time Slot)
  // X: Time Slot Index (0 to 7)
  // Y: Day Index (0 to 4: Mon to Fri)
  const heatmapData = useMemo(() => {
    const totalRooms = filteredRooms.length || 1;
    const items: Array<{
      x: number; // Slot Index
      y: number; // Day Index
      slotLabel: string;
      dayLabel: DayOfWeek;
      dayIndex: number;
      slotIndex: number;
      timeRange: string;
      isLunch: boolean;
      bookedRooms: number;
      availableRooms: number;
      availabilityPct: number;
      occupancyPct: number;
      activeSubjects: string[];
      idleClusterStatus: 'high-idle' | 'moderate' | 'peak' | 'lunch';
    }> = [];

    DAYS_OF_WEEK.forEach((day, dayIdx) => {
      TIME_SLOTS.forEach((slot) => {
        if (slot.isLunch) {
          items.push({
            x: slot.index,
            y: dayIdx,
            slotLabel: slot.startTime,
            dayLabel: day,
            dayIndex: dayIdx,
            slotIndex: slot.index,
            timeRange: `${slot.startTime} - ${slot.endTime} (Recess)`,
            isLunch: true,
            bookedRooms: 0,
            availableRooms: totalRooms,
            availabilityPct: 100,
            occupancyPct: 0,
            activeSubjects: [],
            idleClusterStatus: 'lunch'
          });
          return;
        }

        // Count how many filtered rooms are booked in this slot on this day
        let booked = 0;
        const activeSubjs: string[] = [];

        filteredRooms.forEach(room => {
          const entry = schedule.find(e => {
            const matchesRoom = e.roomId === room.id || 
                                e.roomName === room.name || 
                                room.name.toLowerCase().includes(e.roomName.toLowerCase()) ||
                                e.roomName.toLowerCase().includes(room.name.toLowerCase());
            return matchesRoom && e.day === day && e.slotIndex <= slot.index && (e.slotIndex + e.durationHours) > slot.index;
          });

          if (entry) {
            booked++;
            if (!activeSubjs.includes(entry.subjectCode)) {
              activeSubjs.push(entry.subjectCode);
            }
          }
        });

        const available = Math.max(0, totalRooms - booked);
        const availPct = Math.round((available / totalRooms) * 100);
        const occPct = 100 - availPct;

        let status: 'high-idle' | 'moderate' | 'peak' | 'lunch' = 'moderate';
        if (availPct >= 70) status = 'high-idle';
        else if (availPct <= 25) status = 'peak';

        items.push({
          x: slot.index,
          y: dayIdx,
          slotLabel: slot.startTime,
          dayLabel: day,
          dayIndex: dayIdx,
          slotIndex: slot.index,
          timeRange: `${slot.startTime} - ${slot.endTime}`,
          isLunch: false,
          bookedRooms: booked,
          availableRooms: available,
          availabilityPct: availPct,
          occupancyPct: occPct,
          activeSubjects: activeSubjs,
          idleClusterStatus: status
        });
      });
    });

    return items;
  }, [filteredRooms, schedule]);

  // Algorithmic Detection of Idle Clusters
  const detectedIdleClusters: IdleCluster[] = useMemo(() => {
    const clusters: IdleCluster[] = [];
    const totalRooms = filteredRooms.length;
    if (totalRooms === 0) return clusters;

    // Scan each day for consecutive slots with >= 65% availability
    DAYS_OF_WEEK.forEach(day => {
      let currentRun: number[] = [];

      TIME_SLOTS.forEach(slot => {
        if (slot.isLunch) return;

        // Find availability for this day & slot
        const cell = heatmapData.find(d => d.dayLabel === day && d.slotIndex === slot.index);
        const availPct = cell ? cell.availabilityPct : 0;

        if (availPct >= 65) {
          currentRun.push(slot.index);
        } else {
          if (currentRun.length >= 2) {
            // Found a cluster of 2 or more consecutive idle hours
            addCluster(day, currentRun);
          }
          currentRun = [];
        }
      });

      if (currentRun.length >= 2) {
        addCluster(day, currentRun);
      }
    });

    function addCluster(day: DayOfWeek, slots: number[]) {
      const startSlot = slots[0];
      const endSlot = slots[slots.length - 1];
      const startTime = TIME_SLOTS[startSlot]?.startTime || '09:00';
      const endTime = TIME_SLOTS[endSlot]?.endTime || '17:00';

      // Calculate average idle rooms
      let avgAvail = 0;
      slots.forEach(s => {
        const c = heatmapData.find(d => d.dayLabel === day && d.slotIndex === s);
        if (c) avgAvail += c.availableRooms;
      });
      avgAvail = Math.round(avgAvail / slots.length);
      const idlePct = Math.round((avgAvail / totalRooms) * 100);

      // Identify affected rooms that are free across ALL these slots
      const freeRoomsList: string[] = [];
      filteredRooms.forEach(room => {
        const hasBooking = schedule.some(e => {
          const matches = e.roomId === room.id || room.name.toLowerCase().includes(e.roomName.toLowerCase());
          return matches && e.day === day && slots.some(s => e.slotIndex <= s && (e.slotIndex + e.durationHours) > s);
        });
        if (!hasBooking) {
          freeRoomsList.push(room.name);
        }
      });

      // Compute estimates: ~3.5 kWh saved per vacant classroom-hour (HVAC + lighting)
      const hoursCount = slots.length;
      const kwhEstimate = Math.round(avgAvail * hoursCount * 3.5);
      const co2Estimate = Math.round(kwhEstimate * 0.82); // ~0.82 kg CO2 per kWh grid factor

      let clusterType: 'energy' | 'maintenance' | 'both' = 'both';
      let title = `${day} ${startTime}–${endTime} Idle Window`;
      let rec = '';

      if (day === 'Friday' && startSlot >= 5) {
        clusterType = 'energy';
        title = `Friday Afternoon Deep Eco-Lockdown (${startTime}–${endTime})`;
        rec = `Shut down primary chiller loop & HVAC for E-Block & C-Block corridors. Potential savings: ${kwhEstimate} kWh.`;
      } else if (slots.includes(0) && slots.includes(1)) {
        clusterType = 'maintenance';
        title = `${day} Early Morning Infrastructure Servicing (${startTime}–${endTime})`;
        rec = `Ideal window for Computer Lab software updates, optical projector cleaning, and network firmware upgrades.`;
      } else {
        clusterType = 'both';
        title = `${day} Mid-day Low-Density Block (${startTime}–${endTime})`;
        rec = `Apply temperature setback (25°C) and consolidate unscheduled student study sessions into Central Library.`;
      }

      clusters.push({
        id: `cluster-${day}-${startSlot}-${endSlot}`,
        title,
        day,
        startSlot,
        endSlot,
        timeRange: `${startTime} - ${endTime}`,
        block: selectedBlock === 'ALL' ? 'Campus-Wide' : selectedBlock,
        idleRoomCount: avgAvail,
        totalRoomCount: totalRooms,
        idlePercentage: idlePct,
        type: clusterType,
        kwhSavingEstimate: kwhEstimate,
        co2SavingEstimate: co2Estimate,
        recommendedAction: rec,
        affectedRooms: freeRoomsList
      });
    }

    return clusters;
  }, [heatmapData, filteredRooms, schedule, selectedBlock]);

  // Filtered clusters based on activeMode
  const displayedClusters = useMemo(() => {
    if (activeMode === 'all') return detectedIdleClusters;
    return detectedIdleClusters.filter(c => c.type === activeMode || c.type === 'both');
  }, [detectedIdleClusters, activeMode]);

  // Aggregate estimated savings from all clusters
  const totalSavings = useMemo(() => {
    const kwh = detectedIdleClusters.reduce((acc, c) => acc + c.kwhSavingEstimate, 0);
    const co2 = detectedIdleClusters.reduce((acc, c) => acc + c.co2SavingEstimate, 0);
    const costSaved = Math.round(kwh * 9.5); // ₹9.5 / $0.12 per commercial institutional unit
    return { kwh, co2, costSaved };
  }, [detectedIdleClusters]);

  // Handle scheduling or applying an automated lockdown
  const handleApplyLockdown = (clusterId: string) => {
    if (appliedLockdowns.includes(clusterId)) {
      setAppliedLockdowns(prev => prev.filter(id => id !== clusterId));
    } else {
      setAppliedLockdowns(prev => [...prev, clusterId]);
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  };

  // Helper function to pick color for Heatmap cell
  const getCellColor = (item: any) => {
    if (item.isLunch) return '#f59e0b20'; // Amber tint for lunch recess
    // High availability (Idle) = Vibrant Emerald/Teal
    if (item.availabilityPct >= 80) return '#10b981'; // High idle - optimal for lockdown
    if (item.availabilityPct >= 60) return '#34d399'; // Moderate idle
    if (item.availabilityPct >= 40) return '#6366f1'; // Balanced
    if (item.availabilityPct >= 20) return '#f59e0b'; // Low idle / High occupancy
    return '#ef4444'; // Extremely crowded (<20% free)
  };

  // Custom Tooltip for the Recharts Heatmap ScatterChart
  const CustomHeatmapTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-2xl border border-slate-700 text-xs max-w-xs space-y-1.5 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="font-bold text-slate-100 flex items-center gap-1.5">
              <span>{data.dayLabel}</span>
              <span className="text-slate-400">·</span>
              <span>{data.timeRange}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              data.isLunch
                ? 'bg-amber-500/20 text-amber-300'
                : data.availabilityPct >= 70
                ? 'bg-emerald-500/20 text-emerald-300'
                : data.availabilityPct <= 30
                ? 'bg-rose-500/20 text-rose-300'
                : 'bg-indigo-500/20 text-indigo-300'
            }`}>
              {data.isLunch ? 'Recess' : `${data.availabilityPct}% Free`}
            </span>
          </div>

          {!data.isLunch ? (
            <>
              <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Idle Classrooms</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    {data.availableRooms} <span className="text-[10px] font-normal text-slate-400">/ {filteredRooms.length}</span>
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-[10px] text-slate-400 block">Occupied</span>
                  <span className="text-indigo-300 font-bold text-sm">
                    {data.bookedRooms} <span className="text-[10px] font-normal text-slate-400">rooms</span>
                  </span>
                </div>
              </div>

              {data.availabilityPct >= 70 && (
                <div className="bg-emerald-950/40 border border-emerald-800/50 p-2 rounded-lg text-[10px] text-emerald-300 flex items-center gap-1.5 mt-1">
                  <Leaf className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />
                  <span>Optimal cluster for HVAC eco-setback or hardware maintenance.</span>
                </div>
              )}

              {data.activeSubjects.length > 0 && (
                <div className="text-[10px] text-slate-400 pt-1">
                  <span className="text-slate-300 font-medium">In Session: </span>
                  {data.activeSubjects.slice(0, 3).join(', ')}
                  {data.activeSubjects.length > 3 && ` +${data.activeSubjects.length - 3} more`}
                </div>
              )}
            </>
          ) : (
            <p className="text-[11px] text-amber-300/90 py-1">
              Designated 13:00–14:00 institutional dining & faculty recess hour.
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ThermometerSnowflake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Weekly Room Availability & Idle Cluster Heatmap
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Recharts Heatmap Matrix
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Visualizes weekly availability density patterns to schedule energy lockdowns and maintenance windows
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Objective Mode Filter */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setActiveMode('energy')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeMode === 'energy'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span>Energy Lockdown</span>
            </button>
            <button
              onClick={() => setActiveMode('maintenance')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                activeMode === 'maintenance'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Maintenance Windows</span>
            </button>
            <button
              onClick={() => setActiveMode('all')}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition ${
                activeMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Clusters
            </button>
          </div>

          {/* Block Selector */}
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="ALL">All Campus Blocks ({rooms.length} venues)</option>
            <option value="E-Block">E-Block (Lecture & Core)</option>
            <option value="C-Block">C-Block (Labs & Multipurpose)</option>
            <option value="Central">Central Exam Halls</option>
          </select>

          {/* Room Type Selector */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="Lecture Hall">Lecture Halls Only</option>
            <option value="Lab">Computer Labs Only</option>
            <option value="Central Exam Hall">Central Exam Halls</option>
          </select>
        </div>
      </div>

      {/* KPI Cards: Sustainability & Energy Optimization Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
              Identified Idle Clusters
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                {detectedIdleClusters.length} Windows
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400">
                across {filteredRooms.length} rooms
              </span>
            </div>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              Consecutive hours with &gt;65% free classrooms
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wider block">
              Energy Saving Potential
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-sky-800 dark:text-sky-200">
                ~{totalSavings.kwh} kWh
              </span>
              <span className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                / week
              </span>
            </div>
            <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80 mt-0.5">
              HVAC temperature setback & automated lighting cut
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Leaf className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider block">
              Carbon Footprint Reduction
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-800 dark:text-indigo-200">
                ~{totalSavings.co2} kg CO₂
              </span>
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                (Est. ₹{totalSavings.costSaved}/wk)
              </span>
            </div>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-400/80 mt-0.5">
              AICTE Green Campus & National Clean Energy aligned
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Heatmap Matrix Visualization */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Campus Heatmap: Available Capacity by Day & Hour
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">
              Hover over any slot tile to inspect idle room metrics
            </span>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-500" />
              <span>High Idle (&gt;80%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-emerald-300" />
              <span>Moderate (60–79%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-indigo-500" />
              <span>Balanced (40–59%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-rose-500" />
              <span>Peak (&lt;20%)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="w-3 h-3 rounded bg-amber-400/50" />
              <span>Recess</span>
            </div>
          </div>
        </div>

        {/* Recharts ScatterChart Custom Heatmap Container */}
        <div className="h-[280px] w-full bg-slate-50/50 dark:bg-slate-800/30 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 15, right: 25, bottom: 10, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.12} />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Time Slot"
                domain={[-0.5, 7.5]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7]}
                tickFormatter={(val) => TIME_SLOTS[val]?.startTime || ''}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Day"
                domain={[-0.5, 4.5]}
                ticks={[0, 1, 2, 3, 4]}
                tickFormatter={(val) => DAYS_OF_WEEK[val]?.slice(0, 3) || ''}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <ZAxis type="number" dataKey="availabilityPct" range={[350, 350]} />
              <Tooltip content={<CustomHeatmapTooltip />} />
              <Scatter
                data={heatmapData}
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  const isHovered = false;
                  const isLunch = payload.isLunch;
                  const fill = getCellColor(payload);
                  const isHighIdle = payload.availabilityPct >= 70 && !isLunch;

                  // Render rounded rectangular tile
                  const tileWidth = 62;
                  const tileHeight = 32;

                  return (
                    <g className="cursor-pointer transition-all duration-200">
                      <rect
                        x={cx - tileWidth / 2}
                        y={cy - tileHeight / 2}
                        width={tileWidth}
                        height={tileHeight}
                        rx={8}
                        fill={fill}
                        opacity={isLunch ? 0.4 : 0.88}
                        stroke={isHighIdle ? '#10b981' : isLunch ? '#f59e0b' : '#ffffff20'}
                        strokeWidth={isHighIdle ? 1.5 : 1}
                        strokeDasharray={isLunch ? '2 2' : 'none'}
                      />
                      <text
                        x={cx}
                        y={cy + 4}
                        textAnchor="middle"
                        fill={isLunch ? '#b45309' : '#ffffff'}
                        fontSize={10}
                        fontWeight="700"
                        className="pointer-events-none select-none"
                      >
                        {isLunch ? 'LUNCH' : `${payload.availabilityPct}%`}
                      </text>
                    </g>
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Idle Clusters Action Hub: Energy-Saving Lockdowns & Maintenance Windows */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Detected Idle Clusters & Tactical Lockdown Windows</span>
              <span className="text-[11px] font-normal text-slate-500">
                ({displayedClusters.length} Active Opportunities)
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Automated clusters of 2+ consecutive low-density hours ideal for facilities intervention
            </p>
          </div>

          <span className="text-xs text-slate-500">
            {appliedLockdowns.length} Lockdown{appliedLockdowns.length !== 1 ? 's' : ''} Activated
          </span>
        </div>

        {displayedClusters.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              No Multi-Hour Idle Clusters in Current Selection
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Classrooms have continuous scheduled rotation without sustained gaps of &gt;65% free venues.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedClusters.map(cluster => {
              const isApplied = appliedLockdowns.includes(cluster.id);

              return (
                <div
                  key={cluster.id}
                  className={`p-4 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                    isApplied
                      ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/50'
                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Top Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`p-1.5 rounded-lg text-xs font-bold ${
                          cluster.type === 'energy' 
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : cluster.type === 'maintenance'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                        }`}>
                          {cluster.type === 'energy' ? '🌿 Eco-Lockdown' : cluster.type === 'maintenance' ? '🔧 Maintenance Window' : '⚡ Combined Opportunity'}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {cluster.block}
                        </span>
                      </div>

                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/50">
                        {cluster.idlePercentage}% Idle
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        {cluster.title}
                      </h5>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {cluster.day}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {cluster.timeRange}
                        </span>
                        <span>·</span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {cluster.idleRoomCount} of {cluster.totalRoomCount} Rooms Free
                        </span>
                      </div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{cluster.recommendedAction}</span>
                    </div>

                    {/* Affected Rooms Snapshot */}
                    {cluster.affectedRooms.length > 0 && (
                      <div className="text-[11px] text-slate-500 truncate">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Idle Venues: </span>
                        {cluster.affectedRooms.slice(0, 4).join(', ')}
                        {cluster.affectedRooms.length > 4 && ` +${cluster.affectedRooms.length - 4} more`}
                      </div>
                    )}
                  </div>

                  {/* Bottom Row / Action Buttons */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <div className="text-xs">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        Save ~{cluster.kwhSavingEstimate} kWh
                      </span>
                      <span className="text-slate-400 text-[10px] ml-1.5">
                        (~{cluster.co2SavingEstimate} kg CO₂)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCluster(cluster)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition"
                      >
                        Inspect Rooms
                      </button>

                      <button
                        onClick={() => handleApplyLockdown(cluster.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                          isApplied
                            ? 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                            : 'bg-slate-900 text-white dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600'
                        }`}
                      >
                        {isApplied ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Lockdown Scheduled</span>
                          </>
                        ) : (
                          <>
                            <PowerOff className="w-3.5 h-3.5" />
                            <span>Schedule Lockdown</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Cluster Detail Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {selectedCluster.title}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {selectedCluster.day} · {selectedCluster.timeRange} · {selectedCluster.block}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCluster(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-emerald-50/60 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/50">
                <p className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                  Facilities Lockdown Action Plan:
                </p>
                <p className="text-emerald-700 dark:text-emerald-300">
                  {selectedCluster.recommendedAction}
                </p>
              </div>

              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1.5">
                  Completely Idle Venues During This Window ({selectedCluster.affectedRooms.length} rooms):
                </p>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {selectedCluster.affectedRooms.map((roomName, idx) => (
                    <div 
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                    >
                      <span className="font-medium text-slate-900 dark:text-white">{roomName}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                        100% Free
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedCluster(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleApplyLockdown(selectedCluster.id);
                  setSelectedCluster(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5"
              >
                <PowerOff className="w-3.5 h-3.5" />
                <span>Confirm Lockdown Protocol</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
