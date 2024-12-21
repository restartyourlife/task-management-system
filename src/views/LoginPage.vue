<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const error = ref<string | null>(null)

onMounted(() => {
  // Получаем ошибку из query параметров
  if (route.query.error) {
    error.value = route.query.error as string
  }
})

const handleSignIn = async () => {
  try {
    error.value = null
    await authStore.signInWithGitHub()
  } catch (e) {
    error.value = e instanceof Error
      ? e.message
      : 'Произошла ошибка при авторизации'
  }
}
</script>

<template>
  <div class="login-page">
    <h1>Welcome to Task Management</h1>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
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

.error-message {
  color: var(--danger-color);
  background: rgba(231, 76, 60, 0.1);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1rem;
  text-align: center;
}
</style>
