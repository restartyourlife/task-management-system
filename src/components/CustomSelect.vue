<script setup lang="ts">
import { ref } from 'vue'

const { modelValue, options } = defineProps<{
  modelValue: string | undefined
  options: { value: string; label: string }[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)

function selectOption(value: string) {
  emit('update:modelValue', value)
  isOpen.value = false
}
</script>

<template>
  <div class="custom-select" :class="{ open: isOpen }">
    <div class="select-header" @click="isOpen = !isOpen">
      <span>{{ options.find(opt => opt.value === modelValue)?.label || 'Select...' }}</span>
      <i class="fas fa-chevron-down"></i>
    </div>
    <Transition name="select">
      <div v-if="isOpen" class="options-list">
        <div
          v-for="option in options"
          :key="option.value"
          class="option"
          :class="{ active: option.value === modelValue }"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-select {
  position: relative;
  width: 100%;
}

.select-header {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all var(--transition-normal);
}

.select-header:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.options-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 0.5rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  z-index: 50;
}

.option {
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.option:hover {
  background: var(--bg-color);
}

.option.active {
  background: var(--primary-color);
  color: white;
}

/* Анимации */
.select-enter-active,
.select-leave-active {
  transition: all 0.2s ease;
}

.select-enter-from,
.select-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
