<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'

const authStore = useAuthStore()
</script>

<template>
  <div class="auth-button">
    <button
      v-if="!authStore.user"
      @click="authStore.signInWithGitHub"
      :disabled="authStore.loading"
    >
      <span v-if="authStore.loading">Loading...</span>
      <span v-else>
        <i class="fab fa-github"></i>
        Sign in with GitHub
      </span>
    </button>
    <div v-else class="user-info">
      <img
        :src="authStore.user.user_metadata.avatar_url"
        :alt="authStore.user.user_metadata.full_name"
      />
      <span>{{ authStore.user.user_metadata.full_name }}</span>
      <button @click="authStore.signOut">Sign Out</button>
    </div>
  </div>
</template>

<style scoped>
.auth-button {
  display: flex;
  align-items: center;
  gap: 1rem;
}

button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  background: #24292e;
  color: white;
  cursor: pointer;
  transition: all var(--transition-fast);
}

button:hover {
  background: #2f363d;
}

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-info img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}
</style>
