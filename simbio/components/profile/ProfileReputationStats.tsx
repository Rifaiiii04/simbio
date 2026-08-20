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
import { Star, Users, TrendingUp, Award } from 'lucide-react';

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
  reputation: Reputation | null;
  loading?: boolean;
}

const DIMENSION_COLORS = ['#FF6B30', '#f59e0b', '#10b981', '#6366f1'];

const DIMENSION_LABELS = [
  { key: 'consistency', label: 'Konsistensi', description: 'Ketepatan waktu & komitmen sesi belajar' },
  { key: 'communication', label: 'Komunikasi', description: 'Kejelasan penyampaian dan responsif' },
  { key: 'knowledgeSharing', label: 'Berbagi Ilmu', description: 'Kualitas materi dan cara pengajaran' },
  { key: 'collaboration', label: 'Kolaborasi', description: 'Kemampuan kerja sama dalam sesi barter' },
];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg text-xs font-bold text-slate-800">
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p className="text-slate-900">{payload[0].value} / 5</p>
    </div>
  );
}

function StarRating({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i <= Math.round(value)
              ? 'text-amber-400 fill-amber-400'
              : 'text-slate-200 fill-slate-100'
          }`}
        />
      ))}
    </div>
  );
}

export function ProfileReputationStats({ reputation, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 animate-pulse">
        <div className="h-4 w-40 bg-slate-200 rounded-lg mb-4" />
        <div className="h-40 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!reputation || reputation.count === 0 || !reputation.averages) {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-sm font-black text-slate-900">Statistik Reputasi Saya</h2>
        </div>
        <div className="flex flex-col items-center gap-3 py-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-slate-400" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">Belum ada review</p>
            <p className="text-[10px] text-slate-400 mt-0.5 max-w-xs">
              Mulai berkolaborasi dengan partner untuk mendapatkan peer review dan membangun reputasi kamu.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = DIMENSION_LABELS.map(({ key, label }) => ({
    name: label,
    value: reputation.averages![key as keyof typeof reputation.averages] as number,
  }));

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-2xl bg-amber-50 flex items-center justify-center">
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-sm font-black text-slate-900">Statistik Reputasi Saya</h2>
        </div>
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Users className="w-3.5 h-3.5" />
          {reputation.count} peer review
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {DIMENSION_LABELS.map(({ key, label, description }, idx) => {
          const val = reputation.averages![key as keyof typeof reputation.averages] as number;
          return (
            <div key={key} className="bg-slate-50 rounded-2xl p-3 border border-slate-200/60 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: DIMENSION_COLORS[idx] }} />
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-xl font-black text-slate-900">{val}<span className="text-xs font-bold text-slate-400 ml-0.5">/5</span></p>
              <StarRating value={val} size="sm" />
              <p className="text-[9px] text-slate-400 leading-relaxed">{description}</p>
            </div>
          );
        })}
      </div>

      {/* Overall + Chart */}
      <div className="grid lg:grid-cols-[auto_1fr] gap-5">
        {/* Overall rating hero */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100 flex flex-col items-center justify-center gap-2 min-w-[160px]">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Overall Rating</p>
          <p className="text-4xl font-black text-slate-900">{reputation.overall}</p>
          <p className="text-xs text-slate-400 font-bold">/ 5.0</p>
          <StarRating value={reputation.overall!} size="lg" />
        </div>

        {/* Horizontal Bar Chart */}
        <div className="min-h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 0 }}
              barSize={14}
            >
              <XAxis
                type="number"
                domain={[0, 5]}
                tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
                tickCount={6}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={88}
                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar
                dataKey="value"
                radius={[0, 8, 8, 0]}
                label={{ position: 'right', fontSize: 10, fontWeight: 800, fill: '#475569', formatter: (v: unknown) => `${v as number}` }}
              >
                {chartData.map((_entry, index) => (
                  <Cell key={index} fill={DIMENSION_COLORS[index % DIMENSION_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
