<script setup lang="ts">
import { ref, inject, onMounted, computed, type Ref } from 'vue'
import { dashboardApiFetch } from '../services/api'
import {
  ShieldAlert,
  AlertTriangle,
  UserX,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  RefreshCw,
  UserCheck,
} from 'lucide-vue-next'

const isDark = inject<Ref<boolean>>('isDark', ref(true))

interface UserSummary {
  id: string
  name: string
  email: string
  username: string | null
  isBanned?: boolean
}

interface UserReport {
  id: string
  reporterId: string
  reportedId: string
  partnershipId: string | null
  reason: 'INAPPROPRIATE_BEHAVIOR' | 'SPAM' | 'HARASSMENT' | 'SCAM' | 'OTHER'
  description: string | null
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED'
  actionTaken: 'NONE' | 'WARNED' | 'BANNED' | 'DELETED'
  createdAt: string
  resolvedAt: string | null
  reporter: UserSummary
  reported: UserSummary
}

const reports = ref<UserReport[]>([])
const loading = ref(true)
const activeTab = ref<'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED'>('ALL')
const actionLoadingId = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const errorMsg = ref<string | null>(null)

const fetchReports = async () => {
  loading.value = true
  errorMsg.value = null
  try {
    const endpoint = activeTab.value === 'ALL' ? '/reports/admin/list' : `/reports/admin/list?status=${activeTab.value}`
    const res = await dashboardApiFetch<{ reports: UserReport[] }>(endpoint)
    reports.value = res.reports
  } catch (err: any) {
    console.error('Failed to load reports:', err)
    errorMsg.value = err.message || 'Failed to fetch user reports'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchReports()
})

const handleTabChange = (tab: 'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED') => {
  activeTab.value = tab
  fetchReports()
}

const handleBanUser = async (report: UserReport) => {
  if (!confirm(`Are you sure you want to BAN ${report.reported.name} (${report.reported.email})?`)) return
  actionLoadingId.value = report.id
  successMsg.value = null
  try {
    await dashboardApiFetch(`/reports/admin/users/${report.reported.id}/ban`, { method: 'POST' })
    await dashboardApiFetch(`/reports/admin/${report.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'RESOLVED', actionTaken: 'BANNED' }),
    })
    successMsg.value = `Successfully banned ${report.reported.name} and resolved the report.`
    await fetchReports()
  } catch (err: any) {
    alert(err.message || 'Failed to ban user')
  } finally {
    actionLoadingId.value = null
  }
}

const handleDeleteUser = async (report: UserReport) => {
  if (!confirm(`CAUTION: Delete account for ${report.reported.name}? This action is irreversible.`)) return
  actionLoadingId.value = report.id
  successMsg.value = null
  try {
    await dashboardApiFetch(`/reports/admin/users/${report.reported.id}`, { method: 'DELETE' })
    await dashboardApiFetch(`/reports/admin/${report.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'RESOLVED', actionTaken: 'DELETED' }),
    })
    successMsg.value = `Successfully deleted user ${report.reported.name}.`
    await fetchReports()
  } catch (err: any) {
    alert(err.message || 'Failed to delete user account')
  } finally {
    actionLoadingId.value = null
  }
}

const handleResolve = async (report: UserReport, action: 'NONE' | 'WARNED') => {
  actionLoadingId.value = report.id
  try {
    await dashboardApiFetch(`/reports/admin/${report.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'RESOLVED', actionTaken: action }),
    })
    successMsg.value = `Report for ${report.reported.name} marked as RESOLVED.`
    await fetchReports()
  } catch (err: any) {
    alert(err.message || 'Failed to resolve report')
  } finally {
    actionLoadingId.value = null
  }
}

const handleDismiss = async (report: UserReport) => {
  actionLoadingId.value = report.id
  try {
    await dashboardApiFetch(`/reports/admin/${report.id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status: 'DISMISSED', actionTaken: 'NONE' }),
    })
    successMsg.value = `Report for ${report.reported.name} marked as DISMISSED.`
    await fetchReports()
  } catch (err: any) {
    alert(err.message || 'Failed to dismiss report')
  } finally {
    actionLoadingId.value = null
  }
}

const formatReason = (reason: string) => {
  switch (reason) {
    case 'INAPPROPRIATE_BEHAVIOR':
      return 'Perilaku Toksik / Tidak Layak'
    case 'SPAM':
      return 'Spam & Promosi Iklan'
    case 'HARASSMENT':
      return 'Pelecehan / Harassment'
    case 'SCAM':
      return 'Indikasi Fraud / Scam'
    default:
      return 'Lainnya'
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header Title -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-black tracking-tight flex items-center gap-2.5">
          <ShieldAlert class="w-6 h-6 text-red-500" />
          <span>Partner User Reports & Moderation</span>
        </h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs font-medium mt-1">
          Review user policy violation reports, issue account bans, or remove offending accounts.
        </p>
      </div>

      <button
        @click="fetchReports"
        :class="isDark ? 'bg-[#181A1F] border-[#252830] hover:bg-[#22252C]' : 'bg-white border-gray-200 hover:bg-gray-50'"
        class="px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition shadow-xs"
      >
        <RefreshCw :class="{ 'animate-spin': loading }" class="w-4 h-4 text-[#FF7A30]" />
        <span>Refresh Reports</span>
      </button>
    </div>

    <!-- Alert Banners -->
    <div v-if="successMsg" class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
      <CheckCircle2 class="w-4 h-4 flex-shrink-0" />
      <span>{{ successMsg }}</span>
    </div>

    <div v-if="errorMsg" class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
      <AlertTriangle class="w-4 h-4 flex-shrink-0" />
      <span>{{ errorMsg }}</span>
    </div>

    <!-- Status Filter Tabs -->
    <div class="flex items-center gap-2 border-b border-[#252830] pb-3 text-xs font-bold">
      <button
        v-for="tab in (['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'] as const)"
        :key="tab"
        @click="handleTabChange(tab)"
        :class="activeTab === tab ? 'bg-[#FF7A30] text-white' : isDark ? 'bg-[#181A1F] text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'"
        class="px-4 py-2 rounded-xl border border-transparent transition"
      >
        {{ tab }} Reports
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="py-16 text-center text-gray-500 text-xs font-bold animate-pulse">
      Loading moderation reports from database...
    </div>

    <!-- Empty Reports State -->
    <div
      v-else-if="reports.length === 0"
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="p-12 text-center rounded-2xl border space-y-3"
    >
      <ShieldAlert class="w-10 h-10 text-emerald-500 mx-auto" />
      <h3 class="font-bold text-sm">No {{ activeTab }} reports found</h3>
      <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs max-w-sm mx-auto">
        Great news! There are currently no user violation reports in this category.
      </p>
    </div>

    <!-- Reports Table List -->
    <div v-else class="space-y-4">
      <div
        v-for="report in reports"
        :key="report.id"
        :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
        class="p-5 rounded-2xl border space-y-4 transition shadow-xs"
      >
        <!-- Card Top Bar: Status + Reason + Timestamp -->
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[#252830]/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span
              :class="{
                'bg-amber-500/15 text-amber-400 border-amber-500/30': report.status === 'PENDING',
                'bg-emerald-500/15 text-emerald-400 border-emerald-500/30': report.status === 'RESOLVED',
                'bg-gray-500/15 text-gray-400 border-gray-500/30': report.status === 'DISMISSED',
              }"
              class="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase border"
            >
              {{ report.status }}
            </span>

            <span class="text-xs font-bold text-[#FF7A30]">
              {{ formatReason(report.reason) }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 text-[11px] text-gray-500">
            <Clock class="w-3.5 h-3.5" />
            <span>{{ formatDate(report.createdAt) }}</span>
          </div>
        </div>

        {/* Reporter vs Reported User Info Grid */}
        <div class="grid sm:grid-cols-2 gap-4 text-xs">
          <!-- Reporter (Pelapor) -->
          <div :class="isDark ? 'bg-[#121316]' : 'bg-gray-50'" class="p-3.5 rounded-xl border border-[#252830]/30 space-y-1">
            <span class="text-[10px] uppercase font-bold text-gray-500">Pelapor (Reporter):</span>
            <div class="font-bold text-sm text-emerald-400">{{ report.reporter.name }}</div>
            <div class="text-[11px] text-gray-400">{{ report.reporter.email }}</div>
          </div>

          <!-- Reported User (Terlapor) -->
          <div :class="isDark ? 'bg-[#121316]' : 'bg-gray-50'" class="p-3.5 rounded-xl border border-[#252830]/30 space-y-1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold text-gray-500">Terlapor (Reported User):</span>
              <span v-if="report.reported.isBanned" class="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 text-[9px] font-extrabold border border-red-500/30">
                BANNED
              </span>
            </div>
            <div class="font-bold text-sm text-red-400">{{ report.reported.name }}</div>
            <div class="text-[11px] text-gray-400">{{ report.reported.email }}</div>
          </div>
        </div>

        {/* Description Text */}
        <div v-if="report.description" :class="isDark ? 'bg-[#121316]' : 'bg-gray-50'" class="p-3.5 rounded-xl border border-[#252830]/30 text-xs space-y-1">
          <span class="text-[10px] uppercase font-bold text-gray-500">Detail Laporan:</span>
          <p :class="isDark ? 'text-gray-300' : 'text-gray-700'" class="font-medium italic">
            "{{ report.description }}"
          </p>
        </div>

        {/* Moderation Actions Footer */}
        <div class="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#252830]/50">
          <div class="text-xs text-gray-400 font-medium">
            Action Taken: <span class="font-bold text-white">{{ report.actionTaken }}</span>
          </div>

          <div class="flex items-center gap-2">
            <button
              v-if="report.status === 'PENDING'"
              @click="handleDismiss(report)"
              :disabled="actionLoadingId === report.id"
              class="px-3 py-1.5 rounded-xl bg-gray-600/20 text-gray-300 hover:bg-gray-600/40 text-xs font-bold border border-gray-600/40 transition"
            >
              Dismiss
            </button>

            <button
              v-if="report.status === 'PENDING'"
              @click="handleResolve(report, 'NONE')"
              :disabled="actionLoadingId === report.id"
              class="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-xs font-bold border border-emerald-500/40 transition"
            >
              Mark Resolved
            </button>

            <button
              v-if="!report.reported.isBanned"
              @click="handleBanUser(report)"
              :disabled="actionLoadingId === report.id"
              class="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-xs font-bold border border-amber-500/40 transition flex items-center gap-1.5"
            >
              <UserX class="w-3.5 h-3.5" />
              <span>Ban Account</span>
            </button>

            <button
              @click="handleDeleteUser(report)"
              :disabled="actionLoadingId === report.id"
              class="px-3 py-1.5 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold border border-red-500 transition flex items-center gap-1.5"
            >
              <Trash2 class="w-3.5 h-3.5" />
              <span>Delete User</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
