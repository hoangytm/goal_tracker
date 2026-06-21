<template>
  <section class="space-y-4 page-enter">
    <FireworksCanvas :active="fireworksActive" />

    <header class="space-y-2">
      <p class="font-display text-xl font-bold text-slate-700">{{ formattedToday }}</p>
      <StreakBadge :streak="streak" />
    </header>

    <p v-if="pageError" class="text-sm font-body text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ pageError }}</p>

    <div v-if="loading" class="space-y-3">
      <div v-for="index in 4" :key="index" class="h-40 rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
    </div>

    <div v-else class="space-y-3">
      <GoalCard
        v-for="goal in goals"
        :key="goal.id"
        :goal="goal"
        :entry="entriesByGoalId[goal.id] ?? null"
        @toggle-done="(checked) => saveGoalEntry(goal.id, { done: checked })"
        @save-value="(value) => saveGoalEntry(goal.id, { value })"
        @save-note="(note) => saveGoalEntry(goal.id, { note })"
      />

      <div class="mt-4 rounded-2xl border border-sky-100 bg-white/95 backdrop-blur p-4 shadow-sm card-hover sticky bottom-24 z-10">
        <p class="font-body text-sm text-slate-500">Daily progress</p>
        <p class="font-display text-3xl font-bold text-slate-800">{{ completedGoals }} / {{ threshold }}</p>
        <p class="font-body font-medium mt-1 text-sm" :class="dayStatusClass">{{ dayStatusText }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import GoalCard from '@/components/GoalCard.vue'
import FireworksCanvas from '@/components/FireworksCanvas.vue'
import StreakBadge from '@/components/StreakBadge.vue'
import { useAuth } from '@/composables/useAuth'
import { useEntries, getDateInTimezone } from '@/composables/useEntries'
import { useGoals } from '@/composables/useGoals'
import { useStreak } from '@/composables/useStreak'
import { supabase } from '@/lib/supabase'
import type { DailyEntry, UserSettings } from '@/types'

const { user } = useAuth()
const { goals, fetchGoals } = useGoals()
const { fetchEntriesForDate, upsertEntry } = useEntries()
const { fetchCurrentStreak } = useStreak()

const loading = ref(true)
const pageError = ref('')
const streak = ref(0)
const fireworksActive = ref(false)
const fireworksShownForDate = ref('')
const settings = ref<UserSettings>({
  user_id: '',
  daily_success_threshold: 3,
  timezone: 'Asia/Ho_Chi_Minh',
})
const entriesByGoalId = ref<Record<string, DailyEntry>>({})

const entryDate = computed(() => getDateInTimezone(new Date(), settings.value.timezone))

const formattedToday = computed(() => {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: settings.value.timezone,
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
})

const threshold = computed(() => Math.max(1, settings.value.daily_success_threshold || 3))

const completedGoals = computed(() => {
  return goals.value.filter((goal) => entriesByGoalId.value[goal.id]?.done).length
})

const dayStatusText = computed(() => {
  if (completedGoals.value >= threshold.value) return 'Successful day'
  if (completedGoals.value === 0) return 'Not started yet'
  return 'In progress'
})

const dayStatusClass = computed(() => {
  if (completedGoals.value >= threshold.value) return 'text-emerald-600'
  if (completedGoals.value === 0) return 'text-slate-500'
  return 'text-amber-600'
})

watch(
  () => completedGoals.value >= threshold.value,
  (justCompleted) => {
    if (justCompleted && fireworksShownForDate.value !== entryDate.value && !loading.value) {
      fireworksShownForDate.value = entryDate.value
      fireworksActive.value = true
      setTimeout(() => { fireworksActive.value = false }, 5200)
    }
  },
)

async function fetchSettings(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  if (data) {
    settings.value = data as UserSettings
  }
}

function mapEntries(entries: DailyEntry[]) {
  const mapped: Record<string, DailyEntry> = {}
  for (const entry of entries) {
    mapped[entry.goal_id] = entry
  }
  entriesByGoalId.value = mapped
}

async function loadTodayData() {
  if (!user.value) return
  loading.value = true
  pageError.value = ''

  try {
    await fetchSettings(user.value.id)
    await fetchGoals(true)
    const entries = await fetchEntriesForDate(user.value.id, entryDate.value)
    mapEntries(entries)
    streak.value = await fetchCurrentStreak(user.value.id, threshold.value, settings.value.timezone)
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : 'Failed to load today data'
  } finally {
    loading.value = false
  }
}

async function saveGoalEntry(goalId: string, changes: Partial<Pick<DailyEntry, 'done' | 'value' | 'note'>>) {
  if (!user.value) return

  const current = entriesByGoalId.value[goalId]
  const nextDone = changes.done ?? current?.done ?? false
  const nextValue = Number.isFinite(changes.value) ? Number(changes.value) : current?.value ?? 0
  const nextNote = changes.note ?? current?.note ?? ''

  const saved = await upsertEntry({
    user_id: user.value.id,
    goal_id: goalId,
    entry_date: entryDate.value,
    done: nextDone,
    value: Math.max(0, nextValue),
    note: nextNote || null,
  })

  entriesByGoalId.value = {
    ...entriesByGoalId.value,
    [goalId]: saved,
  }
}

watch(
  () => user.value?.id,
  () => {
    void loadTodayData()
  },
  { immediate: true },
)

onMounted(() => {
  if (!user.value) {
    loading.value = false
  }
})
</script>
