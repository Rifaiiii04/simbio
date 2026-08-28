'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Star, MessageSquare, Users, Sparkles } from 'lucide-react';

interface Reputation {
  count: number;
  overall: number | null;
  averages: {
    consistency: number;
    communication: number;
    knowledgeSharing: number;
    collaboration: number;
  } | null;
}

interface Props {
  reputation: Reputation;
  candidateName: string;
}

const DIMENSION_COLORS = ['#FF6B30', '#f59e0b', '#10b981', '#6366f1'];

const DIMENSION_LABELS = [
  { key: 'consistency', label: 'Consistency' },
  { key: 'communication', label: 'Communication' },
  { key: 'knowledgeSharing', label: 'Teaching' },
  { key: 'collaboration', label: 'Collaboration' },
];

// Custom tooltip for the bar chart in dark mode
function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ value: number; name: string }> }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#18181B] border border-neutral-700 rounded-xl px-3 py-1.5 shadow-xl text-xs font-bold text-white">
      {payload[0].value} / 5
    </div>
  );
}

// Star rating display
function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= Math.round(value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-neutral-700 fill-neutral-800'
          }`}
        />
      ))}
    </div>
  );
}

export function CandidateStatsPanel({ reputation, candidateName }: Props) {
  // Empty state
  if (reputation.count === 0 || !reputation.averages) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-full py-4 text-center">
        <div className="w-10 h-10 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex items-center justify-center">
          <Star className="w-5 h-5 text-neutral-400" />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-300">{candidateName} has no reviews yet</p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Be their first study partner!</p>
        </div>
      </div>
    );
  }

  const chartData = DIMENSION_LABELS.map(({ key, label }) => ({
    name: label,
    value: reputation.averages![key as keyof typeof reputation.averages] as number,
  }));

  return (
    <div className="flex flex-col gap-3 h-full text-white">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          </div>
          <span className="text-xs font-bold text-white">Peer Review Reputation</span>
        </div>
        <span className="text-[10px] text-neutral-400 font-semibold flex items-center gap-1">
          <MessageSquare className="w-3 h-3" />
          {reputation.count} review{reputation.count === 1 ? '' : 's'}
        </span>
      </div>

      {/* Overall rating */}
      <div className="bg-[#18181B] rounded-xl p-3 border border-neutral-800 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">Overall Rating</p>
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-white">{reputation.overall}</span>
            <span className="text-xs text-neutral-500 font-bold">/5</span>
          </div>
          <StarRating value={reputation.overall!} />
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-amber-400" />
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="flex-1 min-h-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 28, bottom: 0, left: 0 }}
            barSize={9}
          >
            <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 9, fill: '#71717a', fontWeight: 600 }} tickCount={6} axisLine={false} tickLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={90}
              tick={{ fontSize: 9, fill: '#a1a1aa', fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.04)' }} />
            <Bar dataKey="value" radius={[0, 5, 5, 0]} label={{ position: 'right', fontSize: 9, fontWeight: 700, fill: '#a1a1aa', formatter: (v: unknown) => `${v as number}` }}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={DIMENSION_COLORS[index % DIMENSION_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Partner count badge */}
      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-medium shrink-0">
        <Users className="w-3.5 h-3.5 text-[#FF6B30]" />
        <span>Based on {reputation.count} collaboration partner{reputation.count === 1 ? '' : 's'}</span>
      </div>
    </div>
  );
}
