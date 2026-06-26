<template>
  <button
    type="button"
    class="relative h-11 w-full rounded-xl border text-sm font-body font-semibold cursor-pointer transition-all duration-200 min-h-11"
    :class="[
      selected ? 'ring-2 ring-offset-1' : '',
      selected && status === 'exceed'  ? 'ring-amber-400' : '',
      selected && status !== 'exceed'  ? 'ring-sky-500'  : '',
      status === 'exceed'  ? 'bg-amber-100  text-amber-800  border-amber-300'  : '',
      status === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : '',
      status === 'fail'    ? 'bg-rose-100   text-rose-700   border-rose-200'   : '',
      status === 'empty'   ? 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50' : '',
    ]"
    @click="$emit('select')"
  >
    {{ day }}
    <span
      v-if="status === 'exceed'"
      class="absolute bottom-0.5 right-1 text-[8px] text-amber-500 leading-none select-none"
      aria-hidden="true"
    >★</span>
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
  const s = props.summary
  if (!s || s.goals_total <= 0) return 'empty'
  if (s.goals_completed === s.goals_total) return 'exceed'
  if (s.goals_completed >= props.threshold) return 'success'
  return 'fail'
})
</script>
