<template>
  <button
    type="button"
    class="h-11 w-full rounded-xl border text-sm font-body font-semibold cursor-pointer transition-all duration-200 min-h-11"
    :class="[
      selected ? 'ring-2 ring-sky-500 ring-offset-1' : '',
      status === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : '',
      status === 'fail' ? 'bg-rose-100 text-rose-700 border-rose-200' : '',
      status === 'empty' ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50' : '',
    ]"
    @click="$emit('select')"
  >
    {{ day }}
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DailySummary } from '@/types'

const props = defineProps<{
  day: number
  summary: DailySummary | null
  threshold: number
  selected: boolean
}>()

defineEmits<{
  select: []
}>()

const status = computed(() => {
  const summary = props.summary
  if (!summary || summary.goals_total <= 0) return 'empty'
  if (summary.goals_completed >= props.threshold) return 'success'
  return 'fail'
})
</script>
