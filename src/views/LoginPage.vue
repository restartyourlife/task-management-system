<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleSignIn = async () => {
  try {
    await authStore.signInWithGitHub()
    // Переходим на страницу задач после успешной авторизации
    await router.push({ name: 'tasks' })
  } catch (error) {
    console.error('Ошибка авторизации:', error)
  }
}
</script>

<template>
  <div class="login-page">
    <h1>Welcome to Task Management</h1>
    <button @click="handleSignIn" :disabled="authStore.loading">
      <span v-if="authStore.loading">Loading...</span>
      <span v-else>
        <i class="fab fa-github"></i>
        Continue with GitHub
      </span>
    </button>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 2rem;
}

button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: var(--radius);
  background: #24292e;
  color: white;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:hover {
  background: #2f363d;
  transform: translateY(-2px);
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
