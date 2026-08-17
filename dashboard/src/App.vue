<script setup lang="ts">
import { ref, computed, provide, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard,
  Users,
  Layers,
  Handshake,
  Cpu,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const isDark = ref(true)

onMounted(() => {
  const saved = localStorage.getItem('simbioly_admin_theme')
  if (saved) isDark.value = saved === 'dark'
})

const toggleTheme = () => {
  isDark.value = !isDark.value
  localStorage.setItem('simbioly_admin_theme', isDark.value ? 'dark' : 'light')
}

// Provide theme state to child components
provide('isDark', isDark)

const isLoginPage = computed(() => route.path === '/login')

const handleLogout = () => {
  localStorage.removeItem('simbioly_admin_token')
  router.push('/login')
}
</script>

<template>
  <div v-if="isLoginPage" :class="isDark ? 'bg-[#0F1012] text-gray-100' : 'bg-gray-50 text-gray-800'" class="min-h-screen">
    <RouterView />
  </div>

  <div
    v-else
    :class="isDark ? 'bg-[#0F1012] text-gray-100' : 'bg-[#F9FAFB] text-gray-800'"
    class="min-h-screen flex font-sans transition-colors duration-300"
  >
    <!-- Admin Sidebar Navigation -->
    <aside
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="w-64 border-r flex flex-col p-4 space-y-6 transition-colors duration-300"
    >
      <!-- Brand Logo & Theme Toggle -->
      <div class="flex items-center justify-between px-2 py-1">
        <div class="flex items-center gap-2.5 font-bold text-base">
          <div class="w-8 h-8 rounded-xl brand-gradient flex items-center justify-center text-white font-extrabold shadow-sm">
            <ShieldCheck class="w-5 h-5 text-white" />
          </div>
          <div class="flex flex-col">
            <span class="font-extrabold tracking-wide text-sm leading-tight text-[#FF7A30]">Simbioly</span>
            <span :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-[10px] font-semibold">Admin Control</span>
          </div>
        </div>

        <button
          @click="toggleTheme"
          :class="isDark ? 'bg-[#252830] text-amber-400 hover:bg-[#30343F]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          class="p-2 rounded-xl transition"
          title="Toggle Light/Dark Mode"
        >
          <Sun v-if="isDark" class="w-4 h-4" />
          <Moon v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 space-y-1.5 text-xs font-semibold">
        <RouterLink
          to="/"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <LayoutDashboard class="w-4 h-4" />
          <span>Overview</span>
        </RouterLink>

        <RouterLink
          to="/users"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <Users class="w-4 h-4" />
          <span>User Management</span>
        </RouterLink>

        <RouterLink
          to="/skills"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <Layers class="w-4 h-4" />
          <span>Skill Taxonomy & CRUD</span>
        </RouterLink>

        <RouterLink
          to="/partnerships"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <Handshake class="w-4 h-4" />
          <span>Partnerships</span>
        </RouterLink>

        <RouterLink
          to="/reports"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <ShieldAlert class="w-4 h-4 text-red-500" />
          <span>User Reports & Ban</span>
        </RouterLink>

        <RouterLink
          to="/ai-monitoring"
          :class="isDark ? 'text-gray-400 hover:text-white hover:bg-[#22252C]' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'"
          class="flex items-center gap-3 px-3.5 py-3 rounded-xl transition-all"
          active-class="bg-[#FF7A30]/15 !text-[#FF7A30] border border-[#FF7A30]/30 font-bold shadow-xs"
        >
          <Cpu class="w-4 h-4" />
          <span>AI Gateway Policy</span>
        </RouterLink>
      </nav>

      <!-- Admin Session Box -->
      <div
        :class="isDark ? 'bg-[#121316] border-[#252830]' : 'bg-gray-100 border-gray-200'"
        class="p-3.5 rounded-2xl border text-[10px] space-y-2.5 transition-colors"
      >
        <div class="flex items-center justify-between">
          <div>
            <p :class="isDark ? 'text-gray-200' : 'text-gray-800'" class="font-bold">Simbioly Admin</p>
            <p class="text-gray-500">Real DB Connection</p>
          </div>
          <div class="w-2.5 h-2.5 rounded-full bg-[#FF7A30] animate-pulse"></div>
        </div>
        <button
          @click="handleLogout"
          :class="isDark ? 'border-[#252830]' : 'border-gray-300'"
          class="w-full flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-600 pt-2 border-t transition"
        >
          <LogOut class="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>

    <!-- Main View Area -->
    <main class="flex-1 p-8 overflow-y-auto">
      <RouterView />
    </main>
  </div>
</template>

<style>
.brand-gradient {
  background: linear-gradient(135deg, #FF7A30 0%, #FFA366 100%);
}
</style>
