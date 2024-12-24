<script setup lang="ts">
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const emit = defineEmits<{
  created: []
}>()

const taskStore = useTaskStore()
const name = ref('')
const description = ref('')
const error = ref('')
const loading = ref(false)

async function createWorkspace() {
  try {
    if (!name.value.trim()) {
      error.value = 'Workspace name is required'
      return
    }

    loading.value = true
    const workspace = await taskStore.createWorkspace(name.value, description.value)

    // Устанавливаем созданный workspace как текущий
    taskStore.currentWorkspace = workspace

    // Перезагружаем задачи
    await taskStore.fetchTasks()

    // Закрываем модальное окно
    emit('created')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create workspace'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="create-workspace">
    <h3>Create New Workspace</h3>
    <div v-if="error" class="error-message">{{ error }}</div>
    <form @submit.prevent="createWorkspace">
      <div class="form-group">
        <input v-model="name" placeholder="Workspace name" required />
      </div>
      <div class="form-group">
        <textarea v-model="description" placeholder="Description (optional)" />
      </div>
      <button type="submit" :disabled="loading">
        <i class="fas fa-plus"></i>
        {{ loading ? 'Creating...' : 'Create Workspace' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.create-workspace {
  padding: 1.5rem;
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
}

h3 {
  margin: 0 0 1.5rem;
  color: var(--text-color);
  font-size: 1.25rem;
}

.error-message {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background: #fee2e2;
  border: 1px solid #ef4444;
  border-radius: var(--radius);
  color: #dc2626;
}

.form-group {
  margin-bottom: 1rem;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 0.95rem;
}

textarea {
  min-height: 100px;
  resize: vertical;
}

button {
  width: 100%;
  padding: 0.75rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
}

button:hover:not(:disabled) {
  background: #2980b9;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
