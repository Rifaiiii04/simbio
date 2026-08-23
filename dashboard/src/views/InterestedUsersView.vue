<script setup lang="ts">
import { ref, computed, onMounted, inject } from 'vue'
import { Search, Mail, Briefcase, Calendar, CheckCircle2, Clock } from 'lucide-vue-next'

const isDark = inject('isDark')

interface WaitlistEntry {
  id: string
  email: string
  name: string
  profession: string
  status: 'PENDING' | 'NOTIFIED'
  createdAt: string
}

const entries = ref<WaitlistEntry[]>([])
const loading = ref(true)
const searchQuery = ref('')

const filteredEntries = computed(() => {
  if (!searchQuery.value) return entries.value
  const q = searchQuery.value.toLowerCase()
  return entries.value.filter(e => 
    e.name.toLowerCase().includes(q) || 
    e.email.toLowerCase().includes(q) || 
    e.profession.toLowerCase().includes(q)
  )
})

onMounted(async () => {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/v1/waitlist')
    if (res.ok) {
      entries.value = await res.json()
    }
  } catch (e) {
    console.error('Failed to fetch waitlist:', e)
  } finally {
    loading.value = false
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<template>
  <main class="flex-1 p-8">
    <div class="max-w-6xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Interested Users</h1>
          <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-sm mt-1">
            Manage users who have signed up for early access.
          </p>
        </div>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'" class="p-4 rounded-2xl border shadow-sm flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#FF7A30]/10 flex items-center justify-center text-[#FF7A30]">
            <Mail class="w-6 h-6" />
          </div>
          <div>
            <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs font-semibold uppercase tracking-wider">Total Subscribers</p>
            <p class="text-2xl font-bold mt-0.5">{{ entries.length }}</p>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'" class="rounded-2xl border shadow-sm overflow-hidden">
        <div class="p-4 border-b" :class="isDark ? 'border-[#252830]' : 'border-gray-200'">
          <div class="relative max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              :class="isDark ? 'bg-[#0F1012] border-[#252830] text-gray-100 placeholder-gray-500 focus:border-[#FF7A30]' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-[#FF7A30]'"
              class="w-full pl-9 pr-4 py-2 text-sm rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#FF7A30]"
            />
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead :class="isDark ? 'bg-[#22252C] text-gray-400' : 'bg-gray-50 text-gray-500'" class="text-xs uppercase font-semibold">
              <tr>
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Email</th>
                <th class="px-6 py-4">Profession</th>
                <th class="px-6 py-4">Date Joined</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">Loading...</td>
              </tr>
              <tr v-else-if="filteredEntries.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-gray-500">No users found.</td>
              </tr>
              <tr
                v-else
                v-for="entry in filteredEntries"
                :key="entry.id"
                :class="isDark ? 'border-[#252830] hover:bg-[#22252C]' : 'border-gray-100 hover:bg-gray-50'"
                class="border-b transition-colors"
              >
                <td class="px-6 py-4 font-medium">{{ entry.name }}</td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <Mail class="w-3.5 h-3.5 text-gray-400" />
                    {{ entry.email }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <Briefcase class="w-3.5 h-3.5 text-gray-400" />
                    {{ entry.profession }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2 text-gray-500">
                    <Calendar class="w-3.5 h-3.5" />
                    {{ formatDate(entry.createdAt) }}
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span
                    v-if="entry.status === 'NOTIFIED'"
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600"
                  >
                    <CheckCircle2 class="w-3 h-3" />
                    NOTIFIED
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600"
                  >
                    <Clock class="w-3 h-3" />
                    PENDING
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>
