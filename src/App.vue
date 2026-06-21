<template>
  <div class="min-h-screen">
    <!-- Top bar -->
    <header v-if="user" class="sticky top-3 z-50 px-4 page-enter">
      <div class="max-w-[560px] mx-auto bg-white/90 backdrop-blur rounded-2xl border border-sky-100 shadow-sm px-4 flex items-center justify-between min-h-14">
        <div class="min-w-0">
          <span class="block font-display font-bold text-base tracking-tight text-slate-800">Goal Tracker</span>
          <span class="block text-[11px] leading-4 font-body text-slate-500 truncate max-w-56">{{ user?.email }}</span>
        </div>
        <button
          class="text-sm font-body text-slate-500 hover:text-slate-900 transition-colors duration-200 cursor-pointer min-h-11 px-2"
          @click="handleLogout"
        >
          Logout
        </button>
      </div>
    </header>

    <!-- Page content -->
    <main class="max-w-[560px] mx-auto px-4 py-6 pb-28 pt-3 page-enter">
      <RouterView />
    </main>

    <!-- Bottom nav -->
    <nav v-if="user" class="fixed bottom-4 left-0 right-0 z-50 px-4">
      <div class="max-w-[560px] mx-auto flex bg-white/95 backdrop-blur rounded-2xl border border-sky-100 shadow-lg p-1.5 page-enter">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex-1 flex flex-col items-center gap-1 py-2.5 text-xs font-body font-semibold cursor-pointer rounded-xl transition-all duration-200 min-h-11"
          :class="route.path === item.to ? 'bg-sky-50 text-sky-600' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'"
        >
          <component :is="item.icon" :size="20" stroke-width="2" />
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute, RouterLink, RouterView } from 'vue-router'
import { CheckSquare, CalendarDays, BarChart3, Settings } from '@lucide/vue'
import { useAuth } from '@/composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()
const route = useRoute()

const navItems = [
  { to: '/today',    label: 'Today',    icon: CheckSquare },
  { to: '/history',  label: 'History',  icon: CalendarDays },
  { to: '/stats',    label: 'Stats',    icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
]

async function handleLogout() {
  await logout()
  router.push('/login')
}
</script>
