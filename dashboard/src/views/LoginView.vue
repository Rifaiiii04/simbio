<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-vue-next'

const router = useRouter()
const email = ref('admin@simbioly.com')
const password = ref('adminPassword123')
const error = ref<string | null>(null)
const loading = ref(false)

const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    const res = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value }),
    })

    const json = await res.json()

    if (!res.ok || !json.success) {
      throw new Error(json.error?.message || 'Login failed')
    }

    localStorage.setItem('simbioly_admin_token', json.data.token)
    router.push('/')
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0F1012] flex items-center justify-center p-4 font-sans text-gray-100">
    <div class="w-full max-w-md bg-[#181A1F] p-8 rounded-3xl border border-[#252830] shadow-2xl space-y-6">
      <div class="text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center text-white shadow-md mx-auto">
          <ShieldCheck class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-2xl font-extrabold text-white tracking-tight">Simbioly Admin Portal</h1>
        <p class="text-xs text-gray-400">Sign in to access dashboard operational controls</p>
      </div>

      <div v-if="error" class="p-3 text-xs text-red-400 bg-red-500/10 rounded-xl border border-red-500/30">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Admin Email</label>
          <div class="relative">
            <Mail class="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              v-model="email"
              type="email"
              required
              placeholder="admin@simbioly.com"
              class="w-full pl-10 pr-4 py-3 bg-[#121316] border border-[#252830] rounded-xl text-sm text-white focus:outline-hidden focus:border-[#FF7A30]"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-300 mb-1">Password</label>
          <div class="relative">
            <Lock class="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full pl-10 pr-4 py-3 bg-[#121316] border border-[#252830] rounded-xl text-sm text-white focus:outline-hidden focus:border-[#FF7A30]"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl brand-gradient text-white font-bold text-sm shadow-md transition hover:opacity-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <LogIn class="w-4 h-4" />
          <span>{{ loading ? 'Signing in...' : 'Sign In to Dashboard' }}</span>
        </button>
      </form>

      <div class="p-3 bg-[#121316] rounded-2xl border border-[#252830] text-[10px] text-gray-400 space-y-1">
        <p class="font-bold text-gray-200">Seeded Admin Credentials:</p>
        <p>Email: <code class="font-mono text-[#FF7A30]">admin@simbioly.com</code></p>
        <p>Password: <code class="font-mono text-[#FF7A30]">adminPassword123</code></p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.brand-gradient {
  background: linear-gradient(135deg, #FF7A30 0%, #FFA366 100%);
}
</style>
