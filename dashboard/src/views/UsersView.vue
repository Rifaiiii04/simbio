<script setup lang="ts">
import { ref, inject, onMounted, computed } from 'vue'
import { dashboardApiFetch } from '../services/api'
import { Search, Shield, UserCheck, RefreshCw } from 'lucide-vue-next'

const isDark = inject('isDark', ref(true))

interface DbUser {
  id: string
  name: string
  email: string
  role: 'USER' | 'ADMIN'
  country: string | null
  createdAt: string
}

const users = ref<DbUser[]>([])
const loading = ref(true)
const searchQuery = ref('')

const loadUsers = async () => {
  loading.value = true
  try {
    const res = await dashboardApiFetch<{ users: DbUser[] }>('/users/admin/list')
    users.value = res.users
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUsers()
})

const filteredUsers = computed(() => {
  return users.value.filter((u) => {
    const q = searchQuery.value.toLowerCase()
    return (
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.country && u.country.toLowerCase().includes(q))
    )
  })
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-2xl font-extrabold tracking-tight">User Management & Moderation</h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-1">Real database accounts, role assignments, and country locations.</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative w-64">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search database users..."
            :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-200 focus:border-[#FF7A30]' : 'bg-white border-gray-200 text-gray-800 focus:border-[#FF7A30]'"
            class="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-hidden"
          />
        </div>

        <button
          @click="loadUsers"
          :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'"
          class="p-2 border rounded-xl transition"
          title="Refresh User Data"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>
    </div>

    <!-- Real Database Users Table -->
    <div
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="rounded-2xl border overflow-hidden shadow-xs transition-colors"
    >
      <div v-if="loading" class="text-xs text-gray-400 text-center py-12">Loading database accounts...</div>

      <table v-else class="w-full text-left text-xs">
        <thead :class="isDark ? 'bg-[#121316] border-[#252830] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'" class="border-b uppercase font-semibold">
          <tr>
            <th class="p-4">User</th>
            <th class="p-4">Email</th>
            <th class="p-4">Country</th>
            <th class="p-4">Role</th>
            <th class="p-4">Joined Date</th>
          </tr>
        </thead>
        <tbody :class="isDark ? 'divide-[#252830]' : 'divide-gray-100'" class="divide-y">
          <tr v-for="u in filteredUsers" :key="u.id" :class="isDark ? 'hover:bg-[#22252C]' : 'hover:bg-gray-50'" class="transition">
            <td class="p-4 font-bold flex items-center gap-2.5" :class="isDark ? 'text-white' : 'text-gray-900'">
              <div class="w-8 h-8 rounded-xl bg-[#FF7A30]/10 border border-[#FF7A30]/20 text-[#FF7A30] font-bold flex items-center justify-center">
                {{ u.name.charAt(0) }}
              </div>
              <span>{{ u.name }}</span>
            </td>
            <td class="p-4 font-mono" :class="isDark ? 'text-gray-300' : 'text-gray-600'">{{ u.email }}</td>
            <td class="p-4 font-medium" :class="isDark ? 'text-gray-300' : 'text-gray-700'">{{ u.country || 'Global' }}</td>
            <td class="p-4">
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit"
                :class="u.role === 'ADMIN' ? 'bg-[#FF7A30]/15 text-[#FF7A30] border border-[#FF7A30]/30' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'"
              >
                <Shield v-if="u.role === 'ADMIN'" class="w-3 h-3" />
                <UserCheck v-else class="w-3 h-3" />
                <span>{{ u.role }}</span>
              </span>
            </td>
            <td class="p-4 font-mono text-gray-400">{{ new Date(u.createdAt).toLocaleDateString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
