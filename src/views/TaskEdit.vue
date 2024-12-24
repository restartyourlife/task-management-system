<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'
import type { Task } from '@/types/task'
import { supabase } from '@/config/supabase'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

const taskId = computed(() => route.params.id as string)
const task = ref<Task | null>(null)

// Загрузка задачи
async function loadTask() {
  try {
    if (!taskId.value) {
      throw new Error('Task ID is required')
    }

    isLoading.value = true
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId.value)
      .single()

    if (error) throw error
    if (!data) throw new Error('Task not found')

    task.value = data
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to load task'
    router.push({ name: 'tasks' })
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(taskData: Partial<Task>) {
  try {
    if (!taskId.value || !task.value) {
      throw new Error('Task ID is required')
    }

    isLoading.value = true
    error.value = null

    // Убираем поля, которые не нужно обновлять
    const updateData = {
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      tags: taskData.tags,
      workspace_id: taskData.workspace_id
    }

    await taskStore.updateTask(taskId.value, updateData)
    router.push({ name: 'tasks' })
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to update task'
  } finally {
    isLoading.value = false
  }
}

function handleCancel() {
  router.push({ name: 'tasks' })
}

// Добавим отслеживание скролла
const isScrolled = ref(false)

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString()
}

function handleScroll() {
  isScrolled.value = window.scrollY > 0
}

onMounted(async () => {
  await loadTask() // Загружаем задачу при монтировании
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div v-if="task" class="task-edit">
    <div class="edit-header" :class="{ 'is-scrolled': isScrolled }">
      <div class="header-content">
        <div class="breadcrumbs">
          <RouterLink to="/" class="breadcrumb-link">
            <i class="fas fa-tasks"></i>
            <span class="breadcrumb-text">Tasks</span>
          </RouterLink>
          <i class="fas fa-chevron-right separator"></i>
          <span class="current">Task #{{ taskId.slice(-4) }}</span>
        </div>
        <div class="header-actions">
          <button @click="handleCancel" class="cancel-button">
            <i class="fas fa-times"></i>
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div class="edit-container">
      <div class="edit-sidebar">
        <div class="sidebar-section">
          <h3>Task Information</h3>
          <div class="info-item">
            <span class="label">Created</span>
            <span class="value">{{ formatDate(task.created_at) }}</span>
          </div>
          <div class="info-item">
            <span class="label">Updated</span>
            <span class="value">{{ formatDate(task.updated_at) }}</span>
          </div>
        </div>

        <div class="sidebar-section">
          <h3>Quick Tips</h3>
          <ul class="tips-list">
            <li>Use clear and concise titles</li>
            <li>Add detailed descriptions</li>
            <li>Set appropriate priority</li>
            <li>Add relevant tags</li>
          </ul>
        </div>
      </div>

      <div class="edit-main">
        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <TaskForm
          :initial-task="task"
          @submit="handleSubmit"
          :disabled="isLoading"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-edit {
  min-height: calc(100vh - var(--header-height));
  background: var(--bg-color);
}

.edit-header {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 0.75rem 1.5rem;
  position: sticky;
  top: var(--header-height);
  z-index: 10;
  transition: all var(--transition-normal);
}

.edit-header.is-scrolled {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #94a3b8;
}

.breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius);
  transition: all var(--transition-normal);
}

.breadcrumb-link:hover {
  color: var(--primary-color);
  background: rgba(52, 152, 219, 0.05);
}

.separator {
  color: #cbd5e1;
  font-size: 0.7rem;
}

.current {
  color: #475569;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background: #f1f5f9;
  border-radius: var(--radius);
  font-size: 0.8rem;
}

.cancel-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: white;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.cancel-button:hover {
  background: var(--bg-color);
  color: var(--text-color);
}

.edit-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.edit-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 4rem);
  align-self: start;
}

.sidebar-section {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-bottom: 1rem;
}

.sidebar-section h3 {
  margin: 0 0 1rem;
  font-size: 1rem;
  color: var(--text-color);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  font-size: 0.85rem;
  color: #666;
}

.value {
  font-size: 0.9rem;
  color: var(--text-color);
}

.tips-list {
  margin: 0;
  padding-left: 1.5rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.tips-list li {
  margin-bottom: 0.5rem;
}

.error-message {
  padding: 1rem;
  margin-bottom: 1rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: var(--radius);
  color: var(--danger-color);
  font-size: 0.95rem;
}

@media (max-width: 1024px) {
  .edit-container {
    grid-template-columns: 1fr;
  }

  .edit-sidebar {
    position: static;
    order: 2;
  }

  .edit-main {
    order: 1;
  }
}

@media (max-width: 768px) {
  .edit-header {
    padding: 0.5rem 1rem;
  }

  .edit-container {
    padding: 1rem;
  }

  .breadcrumb-text {
    display: none;
  }

  .breadcrumbs {
    font-size: 0.8rem;
  }

  .current {
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

/* Стили для формы внутри edit-main */
:deep(.task-form) {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

/* Общий контейнер для всех элементов формы */
:deep(.form-group),
:deep(.form-row),
:deep(.form-actions) {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

/* Убираем двойные отступы у вложенных элементов */
:deep(.form-row .form-group) {
  padding: 0;
  border-bottom: none;
}

:deep(.form-group:last-child) {
  border-bottom: none;
}

:deep(.form-row) {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

:deep(.form-actions) {
  background: #f8fafc;
  border-top: 1px solid var(--border-color);
  border-bottom: none;
}

/* Внутренние отступы для элементов формы */
:deep(.form-group input),
:deep(.form-group textarea),
:deep(.form-group select),
:deep(.tags-input),
:deep(.description-wrapper) {
  margin-top: 0.75rem;
}

/* Стили для лейблов */
:deep(label) {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #475569;
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(label i) {
  color: #64748b;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  :deep(.form-group),
  :deep(.form-row),
  :deep(.form-actions) {
    padding: 1rem;
  }

  :deep(.form-row) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}

/* Стили для тегов */
:deep(.tags-input) {
  margin-top: 0.75rem;
}

:deep(.tags-list) {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem;
  min-height: 48px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  background: var(--bg-color);
}

:deep(.tag) {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  background: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
  border-radius: var(--radius-full);
  font-size: 0.85rem;
  font-weight: 500;
}

:deep(.remove-tag) {
  padding: 0;
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.6;
  cursor: pointer;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.remove-tag:hover) {
  opacity: 1;
}

:deep(.tag-input) {
  flex: 1;
  min-width: 120px;
  border: none;
  background: transparent;
  padding: 0.35rem 0.5rem;
  font-size: 0.9rem;
  margin: 0;
}

:deep(.tag-input:focus) {
  outline: none;
  box-shadow: none;
}

:deep(.tags-footer) {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

:deep(.tags-list.empty) {
  justify-content: center;
  align-items: center;
  color: #94a3b8;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  :deep(.tags-list) {
    padding: 0.5rem;
  }

  :deep(.tag) {
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
  }

  :deep(.tag-input) {
    font-size: 0.85rem;
    padding: 0.25rem 0.4rem;
  }
}

/* Стили для кнопки сохранения */
:deep(.submit-btn) {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
}

:deep(.submit-btn:hover:not(:disabled)) {
  transform: translateY(-1px);
  box-shadow: var(--shadow);
  background: #2980b9;
}

:deep(.submit-btn:disabled) {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

:deep(.submit-btn i) {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  :deep(.submit-btn) {
    width: 100%; /* На мобильных кнопка на всю ширину */
    justify-content: center;
    padding: 0.8rem;
  }
}
</style>
