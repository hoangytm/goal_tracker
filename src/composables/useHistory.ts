import { supabase } from '@/lib/supabase'
import type { DailyEntry, DailySummary } from '@/types'

interface DailyEntryWithGoal extends DailyEntry {
  goals?: {
    id: string
    name: string
    unit: 'minutes' | 'times' | 'boolean'
    color: string
    sort_order: number
  } | null
}

const monthCache = new Map<string, DailySummary[]>()
const dayEntriesCache = new Map<string, DailyEntryWithGoal[]>()

function addDays(dateStr: string, diff: number) {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + diff)
  return date.toISOString().slice(0, 10)
}

export function useHistory() {
  async function fetchMonthlySummaries(userId: string, year: number, monthIndex: number) {
    const month = String(monthIndex + 1).padStart(2, '0')
    const first = `${year}-${month}-01`
    const lastDate = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
    const last = `${year}-${month}-${String(lastDate).padStart(2, '0')}`
    const cacheKey = `${userId}:${first}:${last}`

    if (monthCache.has(cacheKey)) {
      return monthCache.get(cacheKey) ?? []
    }

    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', first)
      .lte('entry_date', last)
      .order('entry_date', { ascending: true })

    if (error) throw error

    const summaries = (data ?? []) as DailySummary[]
    monthCache.set(cacheKey, summaries)
    return summaries
  }

  async function fetchDayEntries(userId: string, date: string) {
    const cacheKey = `${userId}:${date}`
    if (dayEntriesCache.has(cacheKey)) {
      return dayEntriesCache.get(cacheKey) ?? []
    }

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*, goals(id, name, unit, color, sort_order)')
      .eq('user_id', userId)
      .eq('entry_date', date)
      .order('goal_id', { ascending: true })

    if (error) throw error

    const entries = ((data ?? []) as DailyEntryWithGoal[]).sort((a, b) => {
      const aOrder = a.goals?.sort_order ?? 999
      const bOrder = b.goals?.sort_order ?? 999
      return aOrder - bOrder
    })

    dayEntriesCache.set(cacheKey, entries)
    return entries
  }

  async function fetchSummariesRange(userId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true })

    if (error) throw error
    return (data ?? []) as DailySummary[]
  }

  async function fetchAllSummaries(userId: string) {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('entry_date', { ascending: true })

    if (error) throw error
    return (data ?? []) as DailySummary[]
  }

  function computeLongestStreak(summaries: DailySummary[], threshold: number) {
    const successfulDates = summaries
      .filter((item) => item.goals_total > 0 && item.goals_completed >= threshold)
      .map((item) => item.entry_date)

    if (successfulDates.length === 0) return 0

    let longest = 1
    let current = 1

    for (let i = 1; i < successfulDates.length; i += 1) {
      const prev = successfulDates[i - 1]
      const cur = successfulDates[i]
      if (addDays(prev, 1) === cur) {
        current += 1
        if (current > longest) longest = current
      } else {
        current = 1
      }
    }

    return longest
  }

  return {
    fetchMonthlySummaries,
    fetchDayEntries,
    fetchSummariesRange,
    fetchAllSummaries,
    computeLongestStreak,
  }
}
