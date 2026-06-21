<template>
  <section class="space-y-4 page-enter">
    <header>
      <h2 class="font-display text-2xl font-bold text-slate-800">Stats</h2>
      <p class="font-body text-slate-500 text-sm">Clear, non-overlapping insights</p>
    </header>

    <p v-if="pageError" class="text-sm font-body text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ pageError }}</p>

    <div class="grid grid-cols-2 gap-3">
      <article class="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm card-hover">
        <p class="text-xs font-body text-slate-500">Current streak</p>
        <p class="font-display text-3xl font-bold text-slate-800">{{ currentStreak }}</p>
      </article>
      <article class="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm card-hover">
        <p class="text-xs font-body text-slate-500">Longest streak</p>
        <p class="font-display text-3xl font-bold text-slate-800">{{ longestStreak }}</p>
      </article>
      <article class="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm card-hover">
        <p class="text-xs font-body text-slate-500">7-day success</p>
        <p class="font-display text-3xl font-bold text-slate-800">{{ last7.percent }}%</p>
        <p class="text-xs font-body text-slate-500 mt-1">{{ last7.success }}/{{ last7.total }} days</p>
      </article>
      <article class="rounded-2xl border border-sky-100 bg-white p-3 shadow-sm card-hover">
        <p class="text-xs font-body text-slate-500">30-day success</p>
        <p class="font-display text-3xl font-bold text-slate-800">{{ last30.percent }}%</p>
        <p class="text-xs font-body text-slate-500 mt-1">{{ last30.success }}/{{ last30.total }} days</p>
      </article>
    </div>

    <article class="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-3 card-hover">
      <h3 class="font-body font-semibold text-base text-slate-700">Goal insights (last 30 days)</h3>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p class="text-xs font-body text-emerald-700">Top goal</p>
          <p class="font-body font-semibold text-slate-900 mt-1">{{ topGoal?.name ?? 'No data yet' }}</p>
          <p class="text-sm font-body text-emerald-700">{{ topGoal?.percent ?? 0 }}%</p>
        </div>
        <div class="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p class="text-xs font-body text-amber-700">Needs focus</p>
          <p class="font-body font-semibold text-slate-900 mt-1">{{ bottomGoal?.name ?? 'No data yet' }}</p>
          <p class="text-sm font-body text-amber-700">{{ bottomGoal?.percent ?? 0 }}%</p>
        </div>
      </div>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useGoals } from '@/composables/useGoals'
import { useHistory } from '@/composables/useHistory'
import { useStreak } from '@/composables/useStreak'
import { supabase } from '@/lib/supabase'
import type { DailySummary } from '@/types'

interface GoalRate {
  goalId: string
  name: string
  percent: number
}

const { user } = useAuth()
const { fetchGoals } = useGoals()
const { fetchSummariesRange, fetchAllSummaries, computeLongestStreak } = useHistory()
const { fetchCurrentStreak } = useStreak()

const pageError = ref('')
const threshold = ref(3)
const timezone = ref('Asia/Ho_Chi_Minh')
const currentStreak = ref(0)
const longestStreak = ref(0)
const last7 = ref({ success: 0, total: 7, percent: 0 })
const last30 = ref({ success: 0, total: 30, percent: 0 })
const goalRates = ref<GoalRate[]>([])

const sortedGoalRates = computed(() => {
  return [...goalRates.value].sort((a, b) => b.percent - a.percent)
})

const topGoal = computed(() => sortedGoalRates.value[0] ?? null)
const bottomGoal = computed(() => {
  const rates = sortedGoalRates.value
  return rates.length > 0 ? rates[rates.length - 1] : null
})

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getRange(days: number) {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))
  return { start: toDateString(start), end: toDateString(end) }
}

function countSuccess(summaries: DailySummary[]) {
  return summaries.filter((item) => item.goals_total > 0 && item.goals_completed >= threshold.value).length
}

async function fetchUserSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('daily_success_threshold, timezone')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  threshold.value = data?.daily_success_threshold ?? 3
  timezone.value = data?.timezone ?? 'Asia/Ho_Chi_Minh'
}

async function fetchGoalRates(userId: string) {
  const goals = await fetchGoals(true)
  if (goals.length === 0) {
    goalRates.value = []
    return
  }

  const range = getRange(30)
  const { data, error } = await supabase
    .from('daily_entries')
    .select('goal_id, done')
    .eq('user_id', userId)
    .gte('entry_date', range.start)
    .lte('entry_date', range.end)

  if (error) throw error

  const grouped = new Map<string, { done: number; total: number }>()
  for (const goal of goals) {
    grouped.set(goal.id, { done: 0, total: 0 })
  }

  for (const row of data ?? []) {
    const current = grouped.get(row.goal_id)
    if (!current) continue
    current.total += 1
    if (row.done) current.done += 1
  }

  goalRates.value = goals.map((goal) => {
    const value = grouped.get(goal.id) ?? { done: 0, total: 0 }
    const percent = value.total > 0 ? Math.round((value.done / value.total) * 100) : 0
    return {
      goalId: goal.id,
      name: goal.name,
      percent,
    }
  })
}

async function loadStats() {
  if (!user.value) return
  pageError.value = ''

  try {
    await fetchUserSettings(user.value.id)

    const sevenRange = getRange(7)
    const thirtyRange = getRange(30)

    const [sevenDays, thirtyDays, allSummaries] = await Promise.all([
      fetchSummariesRange(user.value.id, sevenRange.start, sevenRange.end),
      fetchSummariesRange(user.value.id, thirtyRange.start, thirtyRange.end),
      fetchAllSummaries(user.value.id),
    ])

    const sevenSuccess = countSuccess(sevenDays)
    const thirtySuccess = countSuccess(thirtyDays)

    last7.value = {
      success: sevenSuccess,
      total: 7,
      percent: Math.round((sevenSuccess / 7) * 100),
    }

    last30.value = {
      success: thirtySuccess,
      total: 30,
      percent: Math.round((thirtySuccess / 30) * 100),
    }

    longestStreak.value = computeLongestStreak(allSummaries, threshold.value)
    currentStreak.value = await fetchCurrentStreak(user.value.id, threshold.value, timezone.value)

    await fetchGoalRates(user.value.id)
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : 'Failed to load stats'
  }
}

watch(
  () => user.value?.id,
  () => {
    void loadStats()
  },
  { immediate: true },
)
</script>
