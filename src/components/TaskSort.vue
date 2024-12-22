<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import type { SortField } from '@/types/task'

const taskStore = useTaskStore()

const sortOptions = [
  { field: 'title', label: 'Title' },
  { field: 'createdAt', label: 'Date' },
  { field: 'priority', label: 'Priority' },
  { field: 'status', label: 'Status' }
] as const

function toggleSort(field: SortField) {
  if (taskStore.sortConfig.field === field) {
    taskStore.setSorting(field, taskStore.sortConfig.order === 'asc' ? 'desc' : 'asc')
  } else {
    taskStore.setSorting(field, 'asc')
  }
}
</script>

<template>
  <div class="task-sort">
    <button
      v-for="option in sortOptions"
      :key="option.field"
      class="sort-button"
      :class="{
        active: taskStore.sortConfig.field === option.field
      }"
      @click="toggleSort(option.field)"
    >
      {{ option.label }}
      <span v-if="taskStore.sortConfig.field === option.field" class="sort-indicator">
        {{ taskStore.sortConfig.order === 'asc' ? '↑' : '↓' }}
      </span>
    </button>
  </div>
</template>

<style scoped>
.task-sort {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.sort-button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sort-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.sort-indicator {
  font-weight: bold;
}

@media (max-width: 768px) {
  .task-sort {
    flex-wrap: wrap;
  }
}
</style>
