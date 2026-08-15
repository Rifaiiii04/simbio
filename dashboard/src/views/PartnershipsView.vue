<script setup lang="ts">
import { ref, inject } from 'vue'
import { Handshake, CheckCircle2, Search } from 'lucide-vue-next'

const isDark = inject('isDark', ref(true))

const partnerships = ref([
  { id: '1', requester: 'Alex Morgan', recipient: 'Jordan Lee', status: 'ACCEPTED', createdAt: '2026-08-15' },
])
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 :class="isDark ? 'text-white' : 'text-gray-900'" class="text-2xl font-extrabold tracking-tight">Partnerships & Collaborations</h1>
        <p :class="isDark ? 'text-gray-400' : 'text-gray-500'" class="text-xs mt-1">Monitoring active skill exchange partnerships and project collaboration health.</p>
      </div>

      <div class="flex items-center gap-2">
        <div class="relative w-64">
          <Search class="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search partners..."
            :class="isDark ? 'bg-[#181A1F] border-[#252830] text-gray-200 focus:border-[#FF7A30]' : 'bg-white border-gray-200 text-gray-800 focus:border-[#FF7A30]'"
            class="w-full pl-9 pr-3 py-2 border rounded-xl text-xs focus:outline-hidden"
          />
        </div>
      </div>
    </div>

    <div
      :class="isDark ? 'bg-[#181A1F] border-[#252830]' : 'bg-white border-gray-200'"
      class="rounded-2xl border overflow-hidden shadow-xs transition-colors"
    >
      <table class="w-full text-left text-xs">
        <thead :class="isDark ? 'bg-[#121316] border-[#252830] text-gray-400' : 'bg-gray-50 border-gray-200 text-gray-500'" class="border-b uppercase font-semibold">
          <tr>
            <th class="p-4">Requester</th>
            <th class="p-4">Recipient</th>
            <th class="p-4">Status</th>
            <th class="p-4">Formed Date</th>
          </tr>
        </thead>
        <tbody :class="isDark ? 'divide-[#252830]' : 'divide-gray-100'" class="divide-y">
          <tr v-for="p in partnerships" :key="p.id" :class="isDark ? 'hover:bg-[#22252C]' : 'hover:bg-gray-50'" class="transition">
            <td class="p-4 font-bold flex items-center gap-2" :class="isDark ? 'text-white' : 'text-gray-900'">
              <div class="w-7 h-7 rounded-lg bg-[#FF7A30]/10 text-[#FF7A30] font-bold flex items-center justify-center border border-[#FF7A30]/20">
                {{ p.requester.charAt(0) }}
              </div>
              <span>{{ p.requester }}</span>
            </td>
            <td class="p-4 font-bold" :class="isDark ? 'text-white' : 'text-gray-900'">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-lg bg-[#FF7A30]/10 text-[#FF7A30] font-bold flex items-center justify-center border border-[#FF7A30]/20">
                  {{ p.recipient.charAt(0) }}
                </div>
                <span>{{ p.recipient }}</span>
              </div>
            </td>
            <td class="p-4">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7A30]/10 text-[#FF7A30] border border-[#FF7A30]/20 flex items-center gap-1 w-fit">
                <CheckCircle2 class="w-3 h-3" />
                <span>{{ p.status }}</span>
              </span>
            </td>
            <td class="p-4 text-gray-400 font-mono">{{ p.createdAt }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
