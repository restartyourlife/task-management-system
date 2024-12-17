<script setup lang="ts">
import { RouterView } from 'vue-router'
import AuthButton from '@/components/AuthButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <header>
    <AuthButton />
  </header>
  <RouterView />
</template>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>
