import { supabase } from '@/lib/supabase'
import type { DailyEntry } from '@/types'

export function getDateInTimezone(date: Date, timezone: string) {
  const formatted = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  return formatted
}

export function useEntries() {
  async function fetchEntriesForDate(userId: string, entryDate: string) {
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId)
      .eq('entry_date', entryDate)

    if (error) throw error
    return (data ?? []) as DailyEntry[]
  }

  async function upsertEntry(payload: {
    user_id: string
    goal_id: string
    entry_date: string
    done: boolean
    value: number
    note: string | null
  }) {
    const { data, error } = await supabase
      .from('daily_entries')
      .upsert(payload, { onConflict: 'user_id,goal_id,entry_date' })
      .select('*')
      .single()

    if (error) throw error
    return data as DailyEntry
  }

  return {
    fetchEntriesForDate,
    upsertEntry,
  }
}
