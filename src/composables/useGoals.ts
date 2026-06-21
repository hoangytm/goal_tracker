import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { Goal } from '@/types'

export function useGoals() {
  const goals = ref<Goal[]>([])
  const loading = ref(false)

  async function fetchGoals(activeOnly = true) {
    loading.value = true
    try {
      let query = supabase.from('goals').select('*').order('sort_order')
      if (activeOnly) {
        query = query.eq('active', true)
      }
      const { data, error } = await query
      if (error) throw error
      goals.value = (data ?? []) as Goal[]
      return goals.value
    } finally {
      loading.value = false
    }
  }

  return {
    goals,
    loading,
    fetchGoals,
  }
}
