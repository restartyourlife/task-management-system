<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push({ name: 'login' })
  } catch (error) {
    console.error('Error signing out:', error)
  }
}
</script>

<template>
  <div class="auth-button" v-if="authStore.user">
    <div class="user-info">
      <img
        :src="authStore.user.user_metadata.avatar_url"
        :alt="authStore.user.user_metadata.full_name"
      />
      <span class="user-name">{{ authStore.user.user_metadata.full_name }}</span>
      <button @click="handleSignOut" :disabled="authStore.loading" class="sign-out-button">
        <span v-if="authStore.loading" class="loading-spinner"></span>
        <span v-else>Sign Out</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-button {
  display: flex;
  align-items: center;
  height: 100%;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-radius: var(--radius);
  transition: var(--transition-normal);
}

.user-info:hover {
  background: var(--bg-color);
}

.user-info img {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  box-shadow: 0 0 0 2px var(--primary-color);
  transition: transform var(--transition-fast);
}

.user-info img:hover {
  transform: scale(1.1);
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
  white-space: nowrap;
}

.sign-out-button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  background: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.sign-out-button:hover:not(:disabled) {
  background: var(--danger-color);
  color: white;
  transform: translateY(-1px);
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .user-name {
    display: none; /* Скрываем имя на мобильных устройствах */
  }

  .user-info {
    padding: 0.25rem;
    gap: 0.5rem;
  }

  .sign-out-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.9rem;
  }
}
</style>
