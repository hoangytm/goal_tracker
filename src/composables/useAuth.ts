import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

const user = ref<User | null>(null)

const AUTH_EMAIL_DOMAIN = 'goal-tracker.local'

function toAuthEmail(username: string) {
  return `${username.trim().toLowerCase()}@${AUTH_EMAIL_DOMAIN}`
}

function getUsername(currentUser: User | null) {
  if (!currentUser?.email) return ''
  return currentUser.email.split('@')[0] ?? ''
}

// Initialise session state on module load
supabase.auth.getSession().then(({ data }) => {
  user.value = data.session?.user ?? null
})

supabase.auth.onAuthStateChange((_event, session) => {
  user.value = session?.user ?? null
})

export function useAuth() {
  async function login(username: string, password: string) {
    const email = toAuthEmail(username)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signup(username: string, password: string) {
    const email = toAuthEmail(username)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    if (error) throw error
  }

  async function logout() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return { user, login, signup, logout, getUsername }
}
