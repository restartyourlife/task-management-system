import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/config/supabase'
import type { User } from '@supabase/supabase-js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function signInWithGitHub() {
    try {
      loading.value = true
      const { error: err } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (err) throw err
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign in'
    } finally {
      loading.value = false
    }
  }

  async function signOut() {
    try {
      loading.value = true
      const { error: err } = await supabase.auth.signOut()
      if (err) throw err
      user.value = null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to sign out'
    } finally {
      loading.value = false
    }
  }

  // Инициализация по��ьзователя
  async function init() {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user.value = currentUser

    // Подписка на изменения авторизации
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  return {
    user,
    loading,
    error,
    signInWithGitHub,
    signOut,
    init,
  }
})
