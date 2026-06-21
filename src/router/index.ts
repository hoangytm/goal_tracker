import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/today' },
    {
      path: '/login',
      component: () => import('../pages/LoginPage.vue'),
    },
    {
      path: '/today',
      component: () => import('../pages/TodayPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/history',
      component: () => import('../pages/HistoryPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/stats',
      component: () => import('../pages/StatsPage.vue'),
      meta: { auth: true },
    },
    {
      path: '/settings',
      component: () => import('../pages/SettingsPage.vue'),
      meta: { auth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  if (to.meta.auth) {
    const { data } = await supabase.auth.getSession()
    if (!data.session) return '/login'
  }
  if (to.path === '/login') {
    const { data } = await supabase.auth.getSession()
    if (data.session) return '/today'
  }
})

export default router
