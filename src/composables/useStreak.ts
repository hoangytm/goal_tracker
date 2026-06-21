import { supabase } from '@/lib/supabase'

interface SummaryRow {
  entry_date: string
  goals_completed: number
  goals_total: number
}

function addDays(dateStr: string, diff: number) {
  const date = new Date(`${dateStr}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + diff)
  return date.toISOString().slice(0, 10)
}

export function useStreak() {
  async function fetchCurrentStreak(userId: string, threshold: number, timezone: string) {
    const { data, error } = await supabase
      .from('daily_summaries')
      .select('entry_date, goals_completed, goals_total')
      .eq('user_id', userId)
      .order('entry_date', { ascending: false })
      .limit(400)

    if (error) throw error

    const summaries = (data ?? []) as SummaryRow[]
    const map = new Map(summaries.map((item) => [item.entry_date, item]))

    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())

    let cursor = addDays(today, -1)
    let streak = 0

    for (let i = 0; i < 366; i += 1) {
      const day = map.get(cursor)
      if (!day) break
      if (day.goals_total <= 0 || day.goals_completed < threshold) break
      streak += 1
      cursor = addDays(cursor, -1)
    }

    return streak
  }

  return {
    fetchCurrentStreak,
  }
}
