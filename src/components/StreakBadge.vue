<template>
  <div class="inline-flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border border-sky-100 bg-white shadow-sm card-hover">
    <span class="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-rose-100 text-rose-500">
      <Flame :size="18" stroke-width="2.25" />
    </span>
    <div class="leading-tight">
      <p class="font-body text-xs text-slate-500">Current streak</p>
      <p class="font-display text-xl font-bold text-slate-800">{{ streak }} day{{ streak === 1 ? '' : 's' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Flame } from '@lucide/vue'

defineProps<{ streak: number }>()
</script>
