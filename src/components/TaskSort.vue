<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import type { SortField } from '@/types/task'
import { ref } from 'vue'

const taskStore = useTaskStore()
const isExpanded = ref(true)

const sortOptions = [
  { field: 'title', label: 'Title', icon: 'fa-font' },
  { field: 'createdAt', label: 'Date', icon: 'fa-calendar' },
  { field: 'priority', label: 'Priority', icon: 'fa-flag' },
  { field: 'status', label: 'Status', icon: 'fa-tasks' }
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
  <div class="sort-container">
    <div class="sort-header" @click="isExpanded = !isExpanded">
      <div class="header-content">
        <i class="fas fa-sort-amount-down"></i>
        <span>Sort by</span>
        <div class="active-sort" v-if="taskStore.sortConfig.field">
          {{ sortOptions.find(opt => opt.field === taskStore.sortConfig.field)?.label }}
          <i
            class="fas"
            :class="taskStore.sortConfig.order === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'"
          ></i>
        </div>
      </div>
      <i
        class="fas toggle-icon"
        :class="isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'"
      ></i>
    </div>

    <div class="sort-options" v-if="isExpanded">
      <button
        v-for="option in sortOptions"
        :key="option.field"
        class="sort-button"
        :class="{
          active: taskStore.sortConfig.field === option.field
        }"
        @click="toggleSort(option.field)"
      >
        <div class="button-content">
          <i class="fas" :class="option.icon"></i>
          <span>{{ option.label }}</span>
        </div>
        <i
          v-if="taskStore.sortConfig.field === option.field"
          class="fas"
          :class="taskStore.sortConfig.order === 'asc' ? 'fa-arrow-up' : 'fa-arrow-down'"
        ></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.sort-container {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  overflow: hidden;
  transition: all var(--transition-normal);
}

.sort-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  transition: background var(--transition-normal);
}

.sort-header:hover {
  background: var(--bg-color);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #64748b;
}

.active-sort {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: var(--bg-color);
  border-radius: var(--radius-full);
  color: var(--primary-color);
  font-weight: 500;
}

.toggle-icon {
  color: #64748b;
  transition: transform var(--transition-normal);
}

.sort-options {
  padding: 0.5rem;
  border-top: 1px solid var(--border-color);
  display: grid;
  gap: 0.5rem;
  animation: slideDown 0.2s ease;
}

.sort-button {
  width: 100%;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: none;
  background: transparent;
  border-radius: var(--radius);
  color: #64748b;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sort-button:hover {
  background: var(--bg-color);
  color: var(--text-color);
}

.sort-button.active {
  background: var(--primary-color);
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .sort-header {
    padding: 0.75rem;
  }

  .sort-button {
    padding: 0.6rem 0.75rem;
  }

  .active-sort {
    font-size: 0.9rem;
  }
}
</style>
