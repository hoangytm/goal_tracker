<template>
  <article
    class="rounded-2xl border border-slate-200 bg-white/95 backdrop-blur p-4 transition-all duration-200 card-hover"
    :class="entry?.done ? 'border-emerald-300 bg-emerald-50/80' : 'hover:border-sky-200 hover:bg-white'"
  >
    <header class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <p class="font-body text-xs text-slate-500">Target: {{ goal.target_value }} {{ unitLabel }}</p>
        <h3 class="font-body font-bold text-lg text-slate-900 truncate">{{ goal.name }}</h3>
      </div>
      <span class="h-4 w-4 rounded-full shrink-0 ring-2 ring-white shadow" :style="{ backgroundColor: goal.color }" />
    </header>

    <div class="mt-4 grid grid-cols-[auto_1fr] items-center gap-3">
      <label class="inline-flex items-center gap-2 text-sm font-body text-slate-700 cursor-pointer min-h-11">
        <input
          :checked="entry?.done ?? false"
          type="checkbox"
          class="h-5 w-5 accent-sky-500 border border-slate-300"
          @change="onDoneChange"
        />
        Done
      </label>

      <div class="flex items-center gap-2">
        <input
          v-model.number="valueDraft"
          type="number"
          min="0"
          class="h-11 w-full px-3 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
          @blur="emitValue"
        />
        <span class="text-sm font-body text-slate-500 whitespace-nowrap">{{ unitLabel }}</span>
      </div>
    </div>

    <div v-if="showQuickAdd" class="mt-3 flex items-center gap-2">
      <button
        v-for="step in quickSteps"
        :key="step"
        type="button"
        class="h-9 px-2.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 text-xs font-semibold btn-animated"
        @click="applyQuickStep(step)"
      >
        +{{ step }}
      </button>
    </div>

    <details class="mt-3 group">
      <summary class="text-xs font-body text-slate-500 cursor-pointer min-h-8 inline-flex items-center">Add note</summary>
      <div class="mt-2">
        <label class="block text-xs font-body text-slate-500 mb-1" :for="`note-${goal.id}`">Note</label>
        <input
          :id="`note-${goal.id}`"
          v-model.trim="noteDraft"
          type="text"
          maxlength="180"
          class="h-11 w-full px-3 rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:ring-2 focus:ring-sky-500"
          placeholder="What did you do today?"
          @blur="emitNote"
        />
      </div>
    </details>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DailyEntry, Goal } from '@/types'

const props = defineProps<{
  goal: Goal
  entry: DailyEntry | null
}>()

const emit = defineEmits<{
  toggleDone: [checked: boolean]
  saveValue: [value: number]
  saveNote: [note: string]
}>()

const valueDraft = ref(props.entry?.value ?? 0)
const noteDraft = ref(props.entry?.note ?? '')

watch(
  () => props.entry,
  (entry) => {
    valueDraft.value = entry?.value ?? 0
    noteDraft.value = entry?.note ?? ''
  },
  { deep: true },
)

const unitLabel = computed(() => {
  if (props.goal.unit === 'minutes') return 'min'
  if (props.goal.unit === 'times') return 'times'
  return 'done'
})

const showQuickAdd = computed(() => props.goal.unit !== 'boolean')

const quickSteps = computed(() => {
  if (props.goal.unit === 'minutes') return [10, 20, 30]
  if (props.goal.unit === 'times') return [1, 2, 3]
  return []
})

function onDoneChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('toggleDone', target.checked)
}

function emitValue() {
  const next = Number.isFinite(valueDraft.value) ? Math.max(0, Number(valueDraft.value)) : 0
  valueDraft.value = next
  emit('saveValue', next)
}

function applyQuickStep(step: number) {
  valueDraft.value = Math.max(0, Number(valueDraft.value || 0) + step)
  emitValue()
}

function emitNote() {
  emit('saveNote', noteDraft.value)
}
</script>
