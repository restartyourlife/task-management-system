<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'

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
</script>

<template>
  <div class="task-filters card">
    <div class="search-box">
      <input
        type="text"
        v-model="taskStore.filters.search"
        placeholder="Search tasks..."
        class="search-input"
      />
    </div>

    <div class="filters-grid">
      <div class="filter-group">
        <label>Status</label>
        <select
          v-model="taskStore.filters.status"
        >
          <option
            v-for="option in statusOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Priority</label>
        <select
          v-model="taskStore.filters.priority"
        >
          <option
            v-for="option in priorityOptions"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <div class="filter-group">
        <label>Tags</label>
        <div class="tags-container">
          <button
            v-for="tag in taskStore.availableTags"
            :key="tag"
            class="tag-button"
            :class="{ active: taskStore.filters.tags.includes(tag) }"
            @click="
              taskStore.filters.tags.includes(tag)
                ? taskStore.filters.tags = taskStore.filters.tags.filter(t => t !== tag)
                : taskStore.filters.tags.push(tag)
            "
          >
            {{ tag }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-filters {
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

.search-box {
  padding: 0 1rem;
  margin-bottom: 1.5rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all var(--transition-normal);
  background: var(--bg-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  padding: 0 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: var(--text-color);
}

.filter-group select {
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-button {
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.tag-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

@media (max-width: 768px) {
  .task-filters {
    margin: 0 1rem 1.5rem;
  }

  .search-box,
  .filters-grid {
    padding: 0 0.5rem;
  }
}
</style>
