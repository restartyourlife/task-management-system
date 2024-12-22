<template>
  <div class="filters-sidebar">
    <div class="filters-header">
      <h3>Filters</h3>
      <button
        v-if="hasActiveFilters"
        @click="clearFilters"
        class="clear-filters"
      >
        <i class="fas fa-times"></i>
        Clear
      </button>
    </div>

    <!-- Поиск -->
    <div class="filter-section">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input
          type="text"
          v-model="taskStore.filters.search"
          placeholder="Search tasks..."
          class="search-input"
        />
      </div>
    </div>

    <!-- Статус -->
    <div class="filter-section">
      <h4>Status</h4>
      <CustomSelect
        v-model="taskStore.filters.status"
        :options="statusOptions"
      />
    </div>

    <!-- Приоритет -->
    <div class="filter-section">
      <h4>Priority</h4>
      <CustomSelect
        v-model="taskStore.filters.priority"
        :options="priorityOptions"
      />
    </div>

    <!-- Теги -->
    <div class="filter-section">
      <h4>Tags</h4>
      <div class="tags-grid">
        <button
          v-for="tag in taskStore.availableTags"
          :key="tag"
          class="tag-chip"
          :class="{ active: taskStore.filters.tags.includes(tag) }"
          @click="toggleTag(tag)"
        >
          <span class="tag-text">{{ tag }}</span>
          <span v-if="taskStore.filters.tags.includes(tag)" class="tag-remove">
            <i class="fas fa-times"></i>
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import CustomSelect from './CustomSelect.vue'

const taskStore = useTaskStore()

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
]

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }
]

const hasActiveFilters = computed(() => {
  return taskStore.filters.search ||
    taskStore.filters.status ||
    taskStore.filters.priority ||
    taskStore.filters.tags.length > 0
})

function clearFilters() {
  taskStore.filters.search = ''
  taskStore.filters.status = undefined
  taskStore.filters.priority = undefined
  taskStore.filters.tags = []
}

function toggleTag(tag: string) {
  if (taskStore.filters.tags.includes(tag)) {
    taskStore.filters.tags = taskStore.filters.tags.filter(t => t !== tag)
  } else {
    taskStore.filters.tags.push(tag)
  }
}
</script>

<style scoped>
.filters-sidebar {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  padding: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.filters-header h3 {
  font-size: 1.1rem;
  color: var(--text-color);
  margin: 0;
}

.clear-filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  color: #666;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.clear-filters:hover {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-section h4 {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
  font-weight: 500;
}

.search-box {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.95rem;
  transition: all var(--transition-normal);
  background: var(--bg-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  color: #666;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.tag-chip:hover {
  background: rgba(52, 152, 219, 0.1);
  border-color: var(--primary-color);
}

.tag-chip.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
}

@media (max-width: 768px) {
  .filters-sidebar {
    padding: 1rem;
    gap: 1rem;
  }

  .search-input {
    font-size: 0.9rem;
    padding: 0.6rem 1rem 0.6rem 2.25rem;
  }

  .tag-chip {
    font-size: 0.8rem;
    padding: 0.35rem 0.7rem;
  }
}
</style>
