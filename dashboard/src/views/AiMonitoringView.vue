<script setup lang="ts">
import { ref, inject, onMounted } from 'vue'
import { dashboardApiFetch } from '../services/api'
import { Cpu, ShieldCheck, Zap, Activity, CheckCircle2, Sparkles, RefreshCw } from 'lucide-vue-next'

const isDark = inject('isDark', ref(true))

interface AiEvent {
  id: string
  type: string
  userName: string
  skillName: string
  model: string
  latencyMs: number
  tokens: number
  status: string
  createdAt: string
}

interface AiAnalyticsData {
  configuredModel: string
  creditLimit: string
  totalRequests: number
  successfulRequests: number
  totalMilestones: number
  errorRate: string
  averageLatencyMs: number
  recentEvents: AiEvent[]
}

const aiMetrics = ref<AiAnalyticsData>({
  configuredModel: 'openrouter/free',
  creditLimit: '$0.00 (Free Tier Only)',
  totalRequests: 0,
  successfulRequests: 0,
  totalMilestones: 0,
  errorRate: '0.0%',
  averageLatencyMs: 720,
  recentEvents: [],
})

const loading = ref(true)

const loadAiAnalytics = async () => {
  loading.value = true
  try {
    const res = await dashboardApiFetch<{ aiAnalytics: AiAnalyticsData }>('/users/admin/ai-analytics')
    aiMetrics.value = res.aiAnalytics
  } catch (err) {
    console.error('Failed to load dynamic AI analytics:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadAiAnalytics()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-2xl font-extrabold tracking-tight">AI Gateway & OpenRouter Policy</h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-1">Real-time stats for AI roadmap generation, rate limits, and model safety verification.</p>
      </div>
      <button
        @click="loadAiAnalytics"
        :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-300 hover:text-white' : 'bg-white border-gray-200 text-gray-700 hover:text-black'"
        class="px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': loading }" />
        <span>Refresh Stats</span>
      </button>
    </div>

    <!-- AI Policy Status Cards -->
    <div class="grid sm:grid-cols-3 gap-6">
      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-6 rounded-2xl border shadow-xs space-y-2 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Model Policy</span>
          <ShieldCheck class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div class="text-xl font-extrabold text-[#FF7A30] font-mono">{{ aiMetrics.configuredModel }}</div>
        <p class="text-[10px] text-[#FF7A30] font-semibold">Strict free-tier router enforced</p>
      </div>

      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-6 rounded-2xl border shadow-xs space-y-2 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Credit Safety Limit</span>
          <Zap class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div :class="isDark ? 'text-white' : 'text-gray-900'" class="text-xl font-extrabold font-mono">{{ aiMetrics.creditLimit }}</div>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-[10px] font-medium">Zero-cost development guarantee</p>
      </div>

      <div
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-6 rounded-2xl border shadow-xs space-y-2 transition-colors"
      >
        <div class="flex items-center justify-between" :class="isDark ? 'text-gray-400' : 'text-gray-500'">
          <span class="text-xs font-bold uppercase tracking-wider">Avg Response Latency</span>
          <Activity class="w-4 h-4 text-[#FF7A30]" />
        </div>
        <div class="text-xl font-extrabold text-[#FF7A30] font-mono">{{ aiMetrics.averageLatencyMs }} ms</div>
        <p class="text-[10px] text-[#FF7A30] font-semibold">Within 30,000ms timeout boundary</p>
      </div>
    </div>

    <!-- AI Requests Event Log -->
    <div
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="p-6 rounded-2xl border shadow-xs space-y-4 transition-colors"
    >
      <div class="flex items-center justify-between">
        <h2 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-sm font-bold">Recent Real AI Gateway Events</h2>
        <span class="text-[10px] font-mono text-gray-400">Total Dynamic AI Requests: {{ aiMetrics.totalRequests }}</span>
      </div>

      <div v-if="loading" class="py-8 text-center text-xs text-gray-400 font-semibold animate-pulse flex items-center justify-center gap-2">
        <Sparkles class="w-4 h-4 text-[#FF7A30] animate-spin" />
        <span>Fetching live AI gateway events from MySQL...</span>
      </div>

      <div v-else-if="aiMetrics.recentEvents.length === 0" class="py-8 text-center text-xs text-gray-400 font-medium">
        No AI roadmap requests logged yet.
      </div>

      <div v-else class="text-xs space-y-2">
        <div
          v-for="event in aiMetrics.recentEvents"
          :key="event.id"
          :class="isDark ? 'bg-[#121316] border-[#252830]' : 'bg-gray-50 border-gray-200'"
          class="p-4 rounded-xl border flex items-center justify-between transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-[#FF7A30]/10 border border-[#FF7A30]/20 text-[#FF7A30] flex items-center justify-center font-bold">
              <Cpu class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span :class="isDark ? 'text-gray-200' : 'text-gray-800'" class="font-bold">{{ event.type }}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-[#FF7A30]/10 text-[#FF7A30] font-mono font-bold border border-[#FF7A30]/20">
                  {{ event.userName }} ({{ event.skillName }})
                </span>
              </div>
              <p class="text-[10px] text-gray-400 font-mono mt-0.5">
                Model: {{ event.model }} • Latency: {{ event.latencyMs }}ms • Tokens: {{ event.tokens }} • {{ new Date(event.createdAt).toLocaleTimeString() }}
              </p>
            </div>
          </div>

          <span
            :class="event.status === 'SUCCESS' ? 'bg-[#84CC16]/10 text-[#84CC16] border-[#84CC16]/20' : 'bg-red-500/10 text-red-500 border-red-500/20'"
            class="px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1"
          >
            <CheckCircle2 class="w-3 h-3" />
            <span>{{ event.status }}</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
