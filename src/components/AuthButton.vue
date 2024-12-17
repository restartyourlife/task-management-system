<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="auth-button" v-if="authStore.user">
    <div class="user-info">
      <img
        :src="authStore.user.user_metadata.avatar_url"
        :alt="authStore.user.user_metadata.full_name"
      />
      <span class="user-name">{{ authStore.user.user_metadata.full_name }}</span>
      <button @click="authStore.signOut" :disabled="authStore.loading" class="sign-out-button">
        <span v-if="authStore.loading" class="loading-spinner"></span>
        <span v-else>Sign Out</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-button {
  padding: 0.5rem 1rem;
  background: var(--card-bg);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--primary-color);
  transition: transform var(--transition-fast);
}

.user-info img:hover {
  transform: scale(1.1);
}

.user-name {
  font-weight: 500;
  color: var(--text-color);
}

.sign-out-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  background: var(--danger-color);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sign-out-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.sign-out-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
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
</style>
