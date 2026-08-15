<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { dashboardApiFetch } from '../services/api'
import WorldMap from '../components/WorldMap.vue'
import {
  Users,
  Layers,
  Handshake,
  Cpu,
  Globe,
  TrendingUp,
  Activity,
  Zap,
} from 'lucide-vue-next'

const isDark = inject('isDark', ref(true))

interface AnalyticsData {
  totalUsers: number
  totalSkills: number
  activePartnerships: number
  aiRequests: number
  countryStats: Array<{ country: string; users: number; percent: number }>
}

const stats = ref<AnalyticsData>({
  totalUsers: 0,
  totalSkills: 0,
  activePartnerships: 0,
  aiRequests: 0,
  countryStats: [],
})

const loading = ref(true)

// SVG Chart Points for monthly exchange trend
const chartPoints = '10,120 50,90 90,110 130,40 170,80 210,30 250,70 290,20 330,60 370,30 410,50'
const fillPoints = '10,120 50,90 90,110 130,40 170,80 210,30 250,70 290,20 330,60 370,30 410,50 410,150 10,150'

onMounted(async () => {
  try {
    const res = await dashboardApiFetch<{ analytics: AnalyticsData }>('/users/admin/analytics')
    stats.value = res.analytics
  } catch (err) {
    console.error('Failed to load DB analytics:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-2xl font-extrabold tracking-tight">System Overview</h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-1">Real-time database metrics, country map statistics, and activity analytics.</p>
      </div>

      <div class="flex items-center gap-3">
        <div
          :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
          class="flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold text-[#FF7A30] shadow-xs"
        >
          <Activity class="w-3.5 h-3.5 text-[#FF7A30] animate-pulse" />
          <span>Real Database Connected</span>
        </div>
      </div>
    </div>

    <!-- Metric Cards Grid (Brand Orange & Real Database Values) -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-5 rounded-2xl border shadow-xs space-y-3 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Total Users</span>
          <Users class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-3xl font-extrabold">
          {{ loading ? '...' : stats.totalUsers }}
        </div>
        <div class="flex items-center gap-1.5 text-[10px] text-[#FF7A30] font-semibold">
          <TrendingUp class="w-3 h-3" />
          <span>Real database count</span>
        </div>
      </div>

      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-5 rounded-2xl border shadow-xs space-y-3 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Global Skill Catalog</span>
          <Layers class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-3xl font-extrabold">
          {{ loading ? '...' : stats.totalSkills }}
        </div>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-[10px] font-medium">All major disciplines</p>
      </div>

      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-5 rounded-2xl border shadow-xs space-y-3 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Active Partnerships</span>
          <Handshake class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-3xl font-extrabold">
          {{ loading ? '...' : stats.activePartnerships }}
        </div>
        <p class="text-[10px] text-[#FF7A30] font-semibold">Accepted exchange pairs</p>
      </div>

      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-5 rounded-2xl border shadow-xs space-y-3 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">AI Roadmaps Generated</span>
          <Cpu class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-3xl font-extrabold">
          {{ loading ? '...' : stats.aiRequests }}
        </div>
        <div class="flex items-center gap-1 text-[10px] text-[#FF7A30] font-semibold">
          <Zap class="w-3 h-3" />
          <span>OpenRouter Free Tier</span>
        </div>
      </div>
    </div>

    <!-- Main Analytics Section: World Map Statistics & Line Chart -->
    <div class="grid lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Interactive World Map for Country User Statistics -->
      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="lg:col-span-2 p-6 rounded-2xl border shadow-xs space-y-5 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <Globe class="w-5 h-5 text-[#FF7A30]" />
            <div>
              <h2 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-base font-bold">Global User Map Statistics</h2>
              <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs">Dynamic country distribution calculated from database user records.</p>
            </div>
          </div>
          <span class="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF7A30]/10 text-[#FF7A30] border border-[#FF7A30]/20">
            Live Vector Map
          </span>
        </div>

        <!-- World Map SVG Component with Dynamic Pins -->
        <WorldMap :stats="stats.countryStats" :is-dark="isDark" />

        <!-- Dynamic Country Table Summary below Map -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            v-for="item in stats.countryStats.slice(0, 4)"
            :key="item.country"
            :class="isDark ? 'bg-[#121316] border-[#252830]' : 'bg-gray-50 border-gray-200'"
            class="p-3 rounded-xl border text-xs space-y-1"
          >
            <span :class="isDark ? 'text-gray-400' : 'text-gray-600'" class="font-medium block truncate">{{ item.country }}</span>
            <span class="text-sm font-extrabold text-[#FF7A30]">{{ item.users }} users ({{ item.percent }}%)</span>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Monthly Activity Wave Chart -->
      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-6 rounded-2xl border shadow-xs space-y-5 transition-colors flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-base font-bold">Activity Volume</h2>
            <span class="text-xs font-mono text-[#FF7A30]">2026 Trend</span>
          </div>

          <!-- SVG Orange Wave Chart Container -->
          <div class="relative h-44 w-full pt-2">
            <svg class="w-full h-full overflow-visible" viewBox="0 0 420 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#FF7A30" stop-opacity="0.4" />
                  <stop offset="100%" stop-color="#FF7A30" stop-opacity="0.0" />
                </linearGradient>
              </defs>

              <line x1="0" y1="30" x2="420" y2="30" :stroke="isDark ? '#252830' : '#E5E7EB'" stroke-dasharray="4" />
              <line x1="0" y1="70" x2="420" y2="70" :stroke="isDark ? '#252830' : '#E5E7EB'" stroke-dasharray="4" />
              <line x1="0" y1="110" x2="420" y2="110" :stroke="isDark ? '#252830' : '#E5E7EB'" stroke-dasharray="4" />

              <polygon :points="fillPoints" fill="url(#orangeGrad)" />
              <polyline :points="chartPoints" fill="none" stroke="#FF7A30" stroke-width="3" stroke-linecap="round" />
            </svg>
          </div>
        </div>

        <div :class="isDark ? 'border-[#252830] text-gray-400' : 'border-gray-200 text-gray-500'" class="flex justify-between text-[10px] font-semibold pt-2 border-t">
          <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
        </div>
      </div>
    </div>
  </div>
</template>
