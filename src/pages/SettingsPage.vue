<template>
  <section class="space-y-4 page-enter">
    <header>
      <h2 class="font-display text-4xl font-extrabold text-slate-900">Settings</h2>
      <p class="font-body text-slate-500 text-sm">Tune your daily goals</p>
    </header>

    <p
      v-if="message"
      class="text-sm font-body rounded-xl px-3 py-2 border"
      :class="messageType === 'error' ? 'text-red-600 bg-red-50 border-red-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'"
    >
      {{ message }}
    </p>

    <article class="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-3 card-hover">
      <div class="flex items-center justify-between gap-2">
        <h3 class="font-body font-bold text-lg text-slate-900">Goals</h3>
        <button
          type="button"
          class="h-11 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-body font-semibold cursor-pointer transition-colors duration-200 btn-animated"
          :disabled="savingGoals"
          @click="addGoalDraft"
        >
          + Add Goal
        </button>
      </div>

      <div v-for="(goal, index) in goalDrafts" :key="goal.id" class="rounded-xl border border-slate-200 p-3 space-y-2 bg-slate-50/60 card-hover">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-body text-slate-500">Goal {{ index + 1 }}</p>
          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-700 btn-animated disabled:opacity-40"
              :disabled="index === 0"
              @click="moveGoal(index, -1)"
              aria-label="Move goal up"
            >
              ↑
            </button>
            <button
              type="button"
              class="h-8 w-8 rounded-lg border border-slate-300 bg-white text-slate-700 btn-animated disabled:opacity-40"
              :disabled="index === goalDrafts.length - 1"
              @click="moveGoal(index, 1)"
              aria-label="Move goal down"
            >
              ↓
            </button>
            <button
              type="button"
              class="h-8 px-2 rounded-lg border border-rose-300 bg-rose-50 text-rose-600 text-xs font-semibold btn-animated"
              @click="archiveGoal(index)"
            >
              Delete
            </button>
          </div>
        </div>

        <div class="grid grid-cols-[1fr_auto] gap-2">
          <input
            v-model.trim="goal.name"
            type="text"
            class="h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Goal name"
          />
          <input v-model="goal.color" type="color" class="h-10 w-14 rounded-xl border border-slate-300 bg-white cursor-pointer" />
        </div>

        <div class="grid grid-cols-3 gap-2">
          <input
            v-model.number="goal.target_value"
            type="number"
            min="0"
            class="h-10 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
          />

          <select
            v-model="goal.unit"
            class="h-10 px-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="minutes">minutes</option>
            <option value="times">times</option>
            <option value="boolean">boolean</option>
          </select>

          <label class="h-10 rounded-xl border border-slate-300 px-2 inline-flex items-center justify-center gap-2 cursor-pointer bg-white">
            <input v-model="goal.active" type="checkbox" class="h-4 w-4 accent-blue-500" />
            <span class="text-xs font-body">Active</span>
          </label>
        </div>
      </div>

      <p v-if="goalDrafts.length === 0" class="text-sm font-body text-slate-500">No active drafts. Add a new goal to continue.</p>

      <button
        class="h-11 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-body font-semibold cursor-pointer disabled:opacity-60 transition-colors duration-200 btn-animated"
        :disabled="savingGoals"
        @click="saveGoals"
      >
        {{ savingGoals ? 'Saving goals...' : 'Save Goals' }}
      </button>
    </article>

    <article class="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm space-y-3 card-hover">
      <h3 class="font-body font-bold text-lg text-slate-900">App settings</h3>

      <label class="block space-y-1">
        <span class="text-sm font-body text-slate-600">Daily success threshold</span>
        <input
          v-model.number="settingsDraft.daily_success_threshold"
          type="number"
          min="1"
          max="4"
          class="h-10 w-full px-3 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
        />
      </label>

      <label class="block space-y-1">
        <span class="text-sm font-body text-slate-600">Timezone</span>
        <select
          v-model="settingsDraft.timezone"
          class="h-10 w-full px-2 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
        >
          <option v-for="tz in timezones" :key="tz" :value="tz">{{ tz }}</option>
        </select>
      </label>

      <button
        class="h-11 px-4 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-body font-semibold cursor-pointer disabled:opacity-60 transition-colors duration-200 btn-animated"
        :disabled="savingSettings"
        @click="saveSettings"
      >
        {{ savingSettings ? 'Saving settings...' : 'Save Settings' }}
      </button>
    </article>
  </section>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useGoals } from '@/composables/useGoals'
import { supabase } from '@/lib/supabase'
import type { Goal, UserSettings } from '@/types'

const { user } = useAuth()
const { fetchGoals } = useGoals()

interface GoalDraft extends Goal {
  isNew?: boolean
}

const goalDrafts = ref<GoalDraft[]>([])
const archivedGoalIds = ref<string[]>([])
const settingsDraft = ref<UserSettings>({
  user_id: '',
  daily_success_threshold: 3,
  timezone: 'Asia/Ho_Chi_Minh',
})
const savingGoals = ref(false)
const savingSettings = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

const timezones = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Asia/Kolkata',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'UTC',
]

function showMessage(type: 'success' | 'error', text: string) {
  messageType.value = type
  message.value = text
}

async function loadSettings() {
  if (!user.value) return

  archivedGoalIds.value = []
  const goals = await fetchGoals(false)
  goalDrafts.value = goals.map((goal) => ({ ...goal, isNew: false }))

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', user.value.id)
    .maybeSingle()

  if (error) throw error

  if (data) {
    settingsDraft.value = data as UserSettings
  }
}

function addGoalDraft() {
  if (!user.value) return

  const maxSort = goalDrafts.value.reduce((max, goal) => Math.max(max, goal.sort_order || 0), 0)
  const nextIndex = goalDrafts.value.length + 1

  goalDrafts.value.push({
    id: `new-${Date.now()}-${nextIndex}`,
    user_id: user.value.id,
    name: `New Goal ${nextIndex}`,
    unit: 'times',
    target_value: 1,
    color: '#0EA5E9',
    sort_order: maxSort + 1,
    active: true,
    isNew: true,
  })
}

function moveGoal(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= goalDrafts.value.length) return
  const current = goalDrafts.value[index]
  goalDrafts.value[index] = goalDrafts.value[target]
  goalDrafts.value[target] = current
}

function archiveGoal(index: number) {
  const removed = goalDrafts.value[index]
  if (!removed) return

  if (!removed.isNew) {
    archivedGoalIds.value.push(removed.id)
  }
  goalDrafts.value.splice(index, 1)
}

async function saveGoals() {
  if (!user.value) return
  savingGoals.value = true
  message.value = ''

  try {
    if (goalDrafts.value.length === 0) {
      throw new Error('You need at least one active goal')
    }

    const drafts = goalDrafts.value.map((goal, index) => ({
      ...goal,
      name: goal.name.trim(),
      sort_order: index + 1,
      target_value: Math.max(0, Number(goal.target_value) || 0),
    }))

    if (drafts.some((goal) => !goal.name)) {
      throw new Error('Goal name cannot be empty')
    }

    const existingGoals = drafts.filter((goal) => !goal.isNew)
    const newGoals = drafts.filter((goal) => goal.isNew)

    await Promise.all(
      existingGoals.map((goal) =>
        supabase
          .from('goals')
          .update({
            name: goal.name,
            unit: goal.unit,
            target_value: goal.target_value,
            color: goal.color,
            sort_order: goal.sort_order,
            active: goal.active,
          })
          .eq('id', goal.id),
      ),
    )

    if (newGoals.length > 0) {
      const { error } = await supabase.from('goals').insert(
        newGoals.map((goal) => ({
          user_id: user.value?.id,
          name: goal.name,
          unit: goal.unit,
          target_value: goal.target_value,
          color: goal.color,
          sort_order: goal.sort_order,
          active: goal.active,
        })),
      )

      if (error) throw error
    }

    if (archivedGoalIds.value.length > 0) {
      const { error } = await supabase
        .from('goals')
        .update({ active: false })
        .in('id', archivedGoalIds.value)

      if (error) throw error
    }

    await loadSettings()
    showMessage('success', 'Goals saved successfully')
  } catch (error) {
    showMessage('error', error instanceof Error ? error.message : 'Failed to save goals')
  } finally {
    savingGoals.value = false
  }
}

async function saveSettings() {
  if (!user.value) return
  savingSettings.value = true
  message.value = ''

  try {
    const { error } = await supabase
      .from('user_settings')
      .update({
        daily_success_threshold: Math.min(4, Math.max(1, settingsDraft.value.daily_success_threshold)),
        timezone: settingsDraft.value.timezone,
      })
      .eq('user_id', user.value.id)

    if (error) throw error
    showMessage('success', 'Settings saved successfully')
  } catch (error) {
    showMessage('error', error instanceof Error ? error.message : 'Failed to save settings')
  } finally {
    savingSettings.value = false
  }
}

watch(
  () => user.value?.id,
  () => {
    void loadSettings().catch((error: unknown) => {
      showMessage('error', error instanceof Error ? error.message : 'Failed to load settings')
    })
  },
  { immediate: true },
)
</script>
