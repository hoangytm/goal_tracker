<template>
  <div class="min-h-[80vh] flex items-center justify-center page-enter">
    <section class="w-full max-w-md bg-white/95 backdrop-blur border border-sky-100 shadow-xl shadow-sky-100/60 p-6 rounded-3xl card-hover">
      <p class="inline-flex items-center rounded-full bg-sky-50 text-sky-600 px-3 py-1 text-xs font-semibold tracking-wide">DAILY CONSISTENCY</p>
      <h1 class="font-display text-2xl sm:text-3xl font-bold text-slate-800 mt-3">Goal Tracker</h1>
      <p class="font-body text-slate-500 text-sm mt-2">Track your goals every day with a clean and focused routine.</p>

      <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-body font-semibold text-slate-800 mb-1" for="email">Email</label>
          <input
            id="email"
            v-model.trim="email"
            type="email"
            autocomplete="email"
            required
            class="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-base outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label class="block text-sm font-body font-semibold text-slate-800 mb-1" for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            minlength="6"
            class="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-slate-900 text-base outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="At least 6 characters"
          />
        </div>

        <p v-if="errorMessage" class="text-sm font-body text-red-600" role="alert">
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          class="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-body font-semibold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 btn-animated btn-pulse"
          :disabled="loading"
        >
          {{ loading ? 'Please wait...' : (isSignup ? 'Create account' : 'Log in') }}
        </button>
      </form>

      <button
        class="mt-4 text-sm font-body text-slate-600 hover:text-slate-900 underline cursor-pointer min-h-11"
        type="button"
        @click="toggleMode"
      >
        {{ isSignup ? 'Already have an account? Log in' : 'Need an account? Create one' }}
      </button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const { login, signup } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const isSignup = ref(false)
const errorMessage = ref('')

function toggleMode() {
  isSignup.value = !isSignup.value
  errorMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  try {
    if (isSignup.value) {
      await signup(email.value, password.value)
    } else {
      await login(email.value, password.value)
    }
    await router.push('/today')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Authentication failed. Please retry.'
  } finally {
    loading.value = false
  }
}
</script>
