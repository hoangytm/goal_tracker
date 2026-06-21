<template>
  <section class="space-y-4 page-enter">
    <header class="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm flex items-center justify-between card-hover">
      <button class="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer btn-animated" @click="goPrevMonth" aria-label="Previous month">←</button>
      <h2 class="font-display text-3xl font-extrabold text-slate-900">{{ monthLabel }}</h2>
      <button class="h-11 w-11 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer btn-animated" @click="goNextMonth" aria-label="Next month">→</button>
    </header>

    <p v-if="pageError" class="text-sm font-body text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{{ pageError }}</p>

    <div class="grid grid-cols-7 gap-2 text-center text-xs font-body font-semibold text-slate-500">
      <span v-for="label in weekdayLabels" :key="label">{{ label }}</span>
    </div>

    <div class="grid grid-cols-7 gap-2">
      <template v-for="(cell, index) in monthGrid" :key="index">
        <div v-if="!cell" class="h-11" />
        <DayBadge
          v-else
          :day="cell"
          :summary="summaryMap[buildDateKey(cell)] ?? null"
          :threshold="threshold"
          :selected="selectedDate === buildDateKey(cell)"
          @select="selectDay(cell)"
        />
      </template>
    </div>

    <article v-if="selectedDate" class="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-2 card-hover">
      <header class="flex items-center justify-between">
        <h3 class="font-body font-bold text-lg text-slate-900">{{ selectedDate }}</h3>
        <span class="text-sm font-body" :class="selectedStatusClass">{{ selectedStatusLabel }}</span>
      </header>

      <ul v-if="selectedEntries.length > 0" class="space-y-2">
        <li v-for="entry in selectedEntries" :key="entry.id" class="rounded-xl border border-slate-200 p-3 flex items-center justify-between gap-3 bg-slate-50/60">
          <div class="min-w-0">
            <p class="font-body font-semibold truncate text-slate-900">{{ entry.goals?.name ?? 'Goal' }}</p>
            <p class="text-xs font-body text-slate-500">{{ entry.value }} {{ entry.goals?.unit === 'minutes' ? 'min' : entry.goals?.unit }}</p>
            <p v-if="entry.note" class="text-xs font-body text-slate-500 truncate">{{ entry.note }}</p>
          </div>
          <span class="text-sm font-body font-semibold" :class="entry.done ? 'text-emerald-600' : 'text-rose-600'">{{ entry.done ? 'Done' : 'Missed' }}</span>
        </li>
      </ul>
      <p v-else class="text-sm font-body text-slate-500">No entries for this day.</p>
    </article>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import DayBadge from '@/components/DayBadge.vue'
import { useAuth } from '@/composables/useAuth'
import { useHistory } from '@/composables/useHistory'
import { supabase } from '@/lib/supabase'
import type { DailySummary } from '@/types'

interface DayEntryWithGoal {
  id: string
  done: boolean
  note: string | null
  value: number
  goals?: {
    name: string
    unit: 'minutes' | 'times' | 'boolean'
  } | null
}

const { user } = useAuth()
const { fetchMonthlySummaries, fetchDayEntries } = useHistory()

const weekdayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const currentMonth = ref(new Date())
const threshold = ref(3)
const pageError = ref('')
const summaryMap = ref<Record<string, DailySummary>>({})
const selectedDate = ref<string>('')
const selectedEntries = ref<DayEntryWithGoal[]>([])

const monthLabel = computed(() => {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth.value)
})

const monthGrid = computed(() => {
  const year = currentMonth.value.getFullYear()
  const month = currentMonth.value.getMonth()

  const first = new Date(Date.UTC(year, month, 1))
  const firstDow = (first.getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()

  const cells: Array<number | null> = []
  for (let i = 0; i < firstDow; i += 1) cells.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) cells.push(day)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
})

const selectedSummary = computed(() => {
  if (!selectedDate.value) return null
  return summaryMap.value[selectedDate.value] ?? null
})

const selectedStatusLabel = computed(() => {
  const summary = selectedSummary.value
  if (!summary || summary.goals_total <= 0) return 'No data'
  if (summary.goals_completed >= threshold.value) return 'Success'
  return 'Failed'
})

const selectedStatusClass = computed(() => {
  if (selectedStatusLabel.value === 'Success') return 'text-emerald-600'
  if (selectedStatusLabel.value === 'Failed') return 'text-rose-600'
  return 'text-slate-500'
})

function buildDateKey(day: number) {
  const year = currentMonth.value.getFullYear()
  const month = String(currentMonth.value.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-${String(day).padStart(2, '0')}`
}

async function fetchThreshold(userId: string) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('daily_success_threshold')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  threshold.value = data?.daily_success_threshold ?? 3
}

async function loadMonth() {
  if (!user.value) return
  pageError.value = ''

  try {
    await fetchThreshold(user.value.id)
    const year = currentMonth.value.getFullYear()
    const month = currentMonth.value.getMonth()
    const summaries = await fetchMonthlySummaries(user.value.id, year, month)
    const mapped: Record<string, DailySummary> = {}
    for (const item of summaries) {
      mapped[item.entry_date] = item
    }
    summaryMap.value = mapped
    selectedDate.value = ''
    selectedEntries.value = []
  } catch (error) {
    pageError.value = error instanceof Error ? error.message : 'Failed to load history'
  }
}

async function selectDay(day: number) {
  if (!user.value) return
  selectedDate.value = buildDateKey(day)
  selectedEntries.value = (await fetchDayEntries(user.value.id, selectedDate.value)) as DayEntryWithGoal[]
}

function goPrevMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() - 1, 1)
}

function goNextMonth() {
  currentMonth.value = new Date(currentMonth.value.getFullYear(), currentMonth.value.getMonth() + 1, 1)
}

watch(
  () => [user.value?.id, currentMonth.value.getFullYear(), currentMonth.value.getMonth()],
  () => {
    void loadMonth()
  },
  { immediate: true },
)
</script>
