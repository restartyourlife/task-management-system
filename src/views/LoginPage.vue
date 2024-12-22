<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const authStore = useAuthStore()
const route = useRoute()
const error = ref<string | null>(null)

onMounted(() => {
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
    <div class="login-container card">
      <div class="logo-container">
        <div class="logo">
          <i class="fas fa-tasks"></i>
        </div>
      </div>

      <h1>Welcome to Task Manager</h1>
      <p class="subtitle">Organize your tasks efficiently and boost your productivity</p>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button @click="handleSignIn" :disabled="authStore.loading" class="github-button">
        <span v-if="authStore.loading" class="loading-spinner"></span>
        <span v-else>
          <i class="fab fa-github"></i>
          Continue with GitHub
        </span>
      </button>

      <div class="features">
        <div class="feature">
          <i class="fas fa-check-circle"></i>
          <span>Track your tasks</span>
        </div>
        <div class="feature">
          <i class="fas fa-clock"></i>
          <span>Manage deadlines</span>
        </div>
        <div class="feature">
          <i class="fas fa-users"></i>
          <span>Collaborate with team</span>
        </div>
      </div>
    </div>

    <div class="background-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--bg-color) 0%, #e8f0fe 100%);
}

.login-container {
  width: 100%;
  max-width: 480px;
  padding: 2.5rem;
  text-align: center;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  animation: slideUp 0.5s ease-out;
}

.logo-container {
  margin-bottom: 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  animation: pulse 2s infinite;
}

h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin-bottom: 1rem;
}

.subtitle {
  color: #666;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.6;
}

.github-button {
  width: 100%;
  padding: 1rem;
  border-radius: var(--radius);
  background: #24292e;
  color: white;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  border: none;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.github-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  background: #2f363d;
}

.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border-color);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  transition: transform var(--transition-normal);
}

.feature:hover {
  transform: translateY(-5px);
}

.feature i {
  font-size: 1.5rem;
  color: var(--primary-color);
}

.error-message {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: var(--radius);
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
  animation: shake 0.5s ease-in-out;
}

.background-shapes .shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.15;
  z-index: 0;
}

.shape-1 {
  background: var(--primary-color);
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation: float 6s ease-in-out infinite;
}

.shape-2 {
  background: var(--success-color);
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: -50px;
  animation: float 8s ease-in-out infinite;
}

.shape-3 {
  background: var(--warning-color);
  width: 150px;
  height: 150px;
  top: 50%;
  left: 50%;
  animation: float 7s ease-in-out infinite;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0.4);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(52, 152, 219, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(52, 152, 219, 0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

@media (max-width: 768px) {
  .login-container {
    padding: 2rem;
  }

  .features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .feature {
    flex-direction: row;
    justify-content: center;
  }

  h1 {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .logo {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
}
</style>
