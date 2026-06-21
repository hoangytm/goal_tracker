export interface Goal {
  id: string
  user_id: string
  name: string
  unit: 'minutes' | 'times' | 'boolean'
  target_value: number
  color: string
  sort_order: number
  active: boolean
}

export interface DailyEntry {
  id: string
  user_id: string
  goal_id: string
  entry_date: string // YYYY-MM-DD
  done: boolean
  value: number
  note: string | null
}

export interface UserSettings {
  user_id: string
  daily_success_threshold: number
  timezone: string
}

export interface DailySummary {
  user_id: string
  entry_date: string
  goals_completed: number
  goals_total: number
}
