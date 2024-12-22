<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import { RouterLink } from 'vue-router'
import { onMounted, ref, onUnmounted } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import TaskFilters from '@/components/TaskFilters.vue'
import TaskSort from '@/components/TaskSort.vue'
import TaskComments from '@/components/TaskComments.vue'

const taskStore = useTaskStore()
const activeCommentTaskId = ref<string | null>(null)

onMounted(() => {
  taskStore.fetchTasks()
})

function toggleComments(taskId: string) {
  if (activeCommentTaskId.value === taskId) {
    activeCommentTaskId.value = null
    document.body.classList.remove('modal-open')
  } else {
    activeCommentTaskId.value = taskId
    document.body.classList.add('modal-open')
  }
}

onUnmounted(() => {
  document.body.classList.remove('modal-open')
})
</script>

<template>
  <div class="task-list">
    <LoadingOverlay :show="taskStore.loading">
      <template v-if="taskStore.loading">
        {{ taskStore.loadingMessage || 'Loading tasks...' }}
      </template>
    </LoadingOverlay>

    <div v-if="taskStore.error" class="error-message">
      {{ taskStore.error }}
    </div>

    <div class="header">
      <h1>Tasks</h1>
      <RouterLink to="/tasks/create" class="create-button">
        <span class="button-content">
          <span class="plus-icon">+</span>
          Create Task
        </span>
      </RouterLink>
    </div>

    <TaskFilters />
    <TaskSort />

    <div class="tasks-container">
      <TransitionGroup name="task-list" tag="div" class="tasks-grid">
        <div
          v-for="task in taskStore.filteredTasks"
          :key="task.id"
          class="task-card"
          :class="[task.status, { deleting: taskStore.deletingTaskIds.has(task.id) }]"
        >
          <div class="task-content">
            <div class="task-header">
              <h3>{{ task.title }}</h3>
              <div class="task-meta">
                <span class="status" :class="task.status">{{ task.status }}</span>
                <span class="priority" :class="task.priority">{{ task.priority }}</span>
              </div>
              <div class="tags" v-if="task.tags?.length">
                <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <p>{{ task.description }}</p>
            <div class="actions">
              <RouterLink :to="`/tasks/${task.id}/edit`" class="edit-button">
                <span class="button-content">Edit</span>
              </RouterLink>
              <button
                @click="taskStore.deleteTask(task.id)"
                class="delete-button"
                :disabled="taskStore.deletingTaskIds.has(task.id)"
              >
                <span class="button-content">
                  <span v-if="taskStore.deletingTaskIds.has(task.id)" class="loading-spinner"></span>
                  <span v-else>Delete</span>
                </span>
              </button>
              <button
                @click.stop="toggleComments(task.id)"
                class="comments-button"
                :class="{ active: activeCommentTaskId === task.id }"
              >
                <i class="fas fa-comments"></i>
                Comments
              </button>
            </div>
          </div>

          <div
            v-if="activeCommentTaskId === task.id"
            class="comments-overlay"
            @click.self="activeCommentTaskId = null"
          >
            <div class="comments-modal">
              <div class="modal-header">
                <button class="close-button" @click="activeCommentTaskId = null">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <TaskComments :task-id="task.id" />
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<style scoped>
.task-list {
  padding: 2rem;
  animation: fadeIn 0.5s ease;
  height: calc(100vh - var(--header-height));
  overflow-y: auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  position: sticky;
  top: 0;
  background: var(--bg-color);
  z-index: 2;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

h1 {
  font-size: 2rem;
  color: var(--text-color);
  margin: 0;
}

.create-button {
  background-color: var(--success-color);
  color: white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  border-radius: var(--radius);
  font-weight: 500;
  transition: background-color 0.2s;
  position: relative;
  overflow: hidden;
}

.create-button:hover {
  background-color: #27ae60;
}

.create-button::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.create-button:hover::after {
  width: 300px;
  height: 300px;
}

.tasks-container {
  width: 100%;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 1rem;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.task-card {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
}

.task-content {
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.task-comments-wrapper {
  position: fixed;
  top: auto;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%) translateY(100%);
  width: 90%;
  max-width: 600px;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius) var(--radius) 0 0;
  z-index: 100;
  box-shadow: var(--shadow-lg);
  opacity: 0;
  transition: all var(--transition-normal);
  pointer-events: none;
  max-height: 80vh;
  overflow-y: auto;
}

.task-card:hover .task-comments-wrapper {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
  pointer-events: auto;
}

.task-card:hover::after {
  display: none;
}

.task-card:hover {
  transform: none;
  box-shadow: none;
}

.task-card h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
}

.task-card p {
  color: #666;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
  padding: 0.5rem 0;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.status, .priority {
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.edit-button, .delete-button {
  flex: 1;
  padding: 0.6rem 1rem;
  border-radius: var(--radius);
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.edit-button {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
  border: none;
}

.edit-button:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.delete-button {
  background-color: transparent;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
}

.delete-button:hover {
  background-color: var(--danger-color);
  color: white;
  transform: translateY(-1px);
}

.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Улучшенные стили статусов */
.status.todo {
  background-color: #f1c40f20;
  color: #f1c40f;
}

.status.in-progress {
  background-color: #3498db20;
  color: #3498db;
}

.status.done {
  background-color: #2ecc7120;
  color: #2ecc71;
}

/* Улучшенные стили приоритетов */
.priority.low {
  background-color: #95a5a620;
  color: #95a5a6;
}

.priority.medium {
  background-color: #f39c1220;
  color: #f39c12;
}

.priority.high {
  background-color: #e74c3c20;
  color: #e74c3c;
}

/* Индикатор слева */
.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  opacity: 0.8;
}

.task-card.todo::before {
  background: linear-gradient(to bottom, #f1c40f, #f39c12);
}

.task-card.in-progress::before {
  background: linear-gradient(to bottom, #3498db, #2980b9);
}

.task-card.done::before {
  background: linear-gradient(to bottom, #2ecc71, #27ae60);
}

/* Анимация при удалении */
.task-card.deleting {
  opacity: 0.5;
  transform: scale(0.95);
  pointer-events: none;
}

@media (max-width: 768px) {
  .tasks-grid {
    grid-template-columns: 1fr;
  }

  .task-card {
    padding: 1.25rem;
  }

  .actions {
    flex-direction: row;
  }

  .tags {
    margin-top: 0.25rem;
  }

  .tag {
    padding: 0.2rem 0.6rem;
    font-size: 0.75rem;
  }

  .task-comments-wrapper {
    width: 100%;
    max-width: none;
    border-radius: var(--radius) var(--radius) 0 0;
  }

  .task-content {
    padding: 1.5rem;
    gap: 1rem;
  }

  .actions {
    margin-top: 1rem;
    padding-top: 1rem;
    gap: 0.75rem;
  }
}

.error-message {
  padding: 1rem;
  margin: 1rem 0;
  background: var(--danger-color);
  color: white;
  border-radius: var(--radius);
  animation: shake 0.5s ease-in-out;
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

/* Стили для тегов */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.3px;
  background: rgba(52, 152, 219, 0.1);
  color: var(--primary-color);
  border: 1px solid rgba(52, 152, 219, 0.2);
  transition: all var(--transition-normal);
}

.tag:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
  background: rgba(52, 152, 219, 0.15);
  border-color: rgba(52, 152, 219, 0.3);
}

.comments-button {
  padding: 0.6rem 1rem;
  border: 1px solid var(--border-color);
  background: transparent;
  color: #666;
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
}

.comments-button:hover,
.comments-button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.comments-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 2rem;
  overflow: hidden;
}

.comments-modal {
  background: white;
  border-radius: var(--radius);
  width: 100%;
  max-width: 600px;
  height: auto;
  max-height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  position: relative;
  animation: modalSlideIn 0.3s ease;
  margin: auto;
}

.comments-modal > :deep(.comments-section) {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.modal-header {
  padding: 1rem;
  text-align: right;
  border-bottom: 1px solid var(--border-color);
}

.close-button {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--danger-color);
}

.close-button i {
  font-size: 1rem;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .comments-overlay {
    padding: 1rem;
  }
}

:global(body.modal-open) {
  overflow: hidden;
  padding-right: 15px;
}

:deep(.task-filters),
:deep(.task-sort) {
  position: sticky;
  background: var(--bg-color);
  z-index: 10;
}

.header,
:deep(.task-filters),
:deep(.task-sort) {
  position: sticky;
  background: var(--bg-color);
  z-index: 10;
}

.header {
  top: 0;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  z-index: 30;
}

:deep(.task-filters) {
  top: calc(var(--header-height) + 1rem);
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm);
  z-index: 20;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
}

:deep(.task-sort) {
  top: calc(var(--header-height) + 180px);
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  z-index: 10;
}

@media (max-width: 768px) {
  .task-list {
    padding: 1rem;
  }

  .tasks-container {
    padding-top: 1rem;
  }

  :deep(.task-filters) {
    top: calc(var(--header-height) + 0.5rem);
  }

  :deep(.task-sort) {
    top: calc(var(--header-height) + 150px);
  }
}
</style>
