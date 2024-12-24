<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import { RouterLink } from 'vue-router'
import { onMounted, ref, onUnmounted, reactive, nextTick } from 'vue'
import LoadingOverlay from '@/components/LoadingOverlay.vue'
import TaskFilters from '@/components/TaskFilters.vue'
import TaskSort from '@/components/TaskSort.vue'
import TaskComments from '@/components/TaskComments.vue'
import WorkspaceSelector from '@/components/WorkspaceSelector.vue'
import CreateWorkspace from '@/components/CreateWorkspace.vue'

const taskStore = useTaskStore()
const activeCommentTaskId = ref<string | null>(null)
const expandedDescriptions = reactive<Record<string, boolean>>({})
const showCreateWorkspace = ref(false)

onMounted(() => {
  taskStore.fetchWorkspaces()
  taskStore.fetchTasks()
  document.addEventListener('click', handleClickOutside)
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

function closeAllPopups() {
  Object.keys(expandedDescriptions).forEach(key => {
    expandedDescriptions[key] = false
  })
}

function toggleDescription(taskId: string, event: MouseEvent) {
  event.stopPropagation()

  const wasOpen = expandedDescriptions[taskId]
  closeAllPopups()
  expandedDescriptions[taskId] = !wasOpen

  if (expandedDescriptions[taskId]) {
    nextTick(() => {
      const button = event.currentTarget as HTMLElement
      const rect = button.getBoundingClientRect()
      const popup = document.querySelector('.description-popup') as HTMLElement

      if (popup) {
        const viewportHeight = window.innerHeight
        const viewportWidth = window.innerWidth

        let top = rect.bottom + 10
        let left = rect.left

        if (top + popup.offsetHeight > viewportHeight) {
          top = rect.top - popup.offsetHeight - 10
        }

        if (left + popup.offsetWidth > viewportWidth) {
          left = viewportWidth - popup.offsetWidth - 20
        }

        popup.style.top = `${top}px`
        popup.style.left = `${left}px`
      }
    })
  }
}

// Изменяем обработчик клика вне popup
function handleClickOutside(event: MouseEvent) {
  const popup = document.querySelector('.description-popup')
  const buttons = document.querySelectorAll('.show-description-btn')
  const table = document.querySelector('.tasks-table')

  // Если клик был внутри таблицы, не закрываем popup
  if (table?.contains(event.target as Node)) {
    return
  }

  if (popup && !popup.contains(event.target as Node)) {
    let clickedOnButton = false
    buttons.forEach(button => {
      if (button.contains(event.target as Node)) {
        clickedOnButton = true
      }
    })

    if (!clickedOnButton) {
      Object.keys(expandedDescriptions).forEach(key => {
        expandedDescriptions[key] = false
      })
    }
  }
}

onUnmounted(() => {
  document.body.classList.remove('modal-open')
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="task-list">
    <div class="workspace-header">
      <WorkspaceSelector />
      <button class="create-workspace-btn" @click="showCreateWorkspace = true">
        <i class="fas fa-plus"></i>
        New Workspace
      </button>
    </div>
    <LoadingOverlay :show="taskStore.loading">
      <template v-if="taskStore.loading">
        {{ taskStore.loadingMessage || 'Loading tasks...' }}
      </template>
    </LoadingOverlay>

    <div v-if="taskStore.error" class="error-message">
      {{ taskStore.error }}
    </div>

    <div class="list-container">
      <TaskFilters class="filters-panel" />
      <div class="tasks-content">
        <TaskSort />
        <div class="tasks-table">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Tags</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="task in taskStore.filteredTasks"
                :key="task.id"
                :class="{ deleting: taskStore.deletingTaskIds.has(task.id) }"
              >
                <td class="title-cell">
                  <h3>{{ task.title }}</h3>
                  <button
                    v-if="task.description"
                    class="show-description-btn"
                    @click="toggleDescription(task.id, $event)"
                  >
                    <i class="fas fa-align-left"></i>
                    Description
                  </button>
                  <div
                    v-if="Object.values(expandedDescriptions).some(Boolean)"
                    class="popup-overlay"
                    @click="closeAllPopups"
                  ></div>
                  <div class="description-popup" v-if="expandedDescriptions[task.id]">
                    <div class="popup-content">
                      <p>{{ task.description }}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="status" :class="task.status">{{ task.status }}</span>
                </td>
                <td>
                  <span class="priority" :class="task.priority">{{ task.priority }}</span>
                </td>
                <td>
                  <div class="tags-list" v-if="task.tags?.length">
                    <span v-for="tag in task.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                </td>
                <td class="actions-cell">
                  <RouterLink :to="`/tasks/${task.id}/edit`" class="edit-button">
                    <i class="fas fa-edit"></i>
                  </RouterLink>
                  <button
                    @click="taskStore.deleteTask(task.id)"
                    class="delete-button"
                    :disabled="taskStore.deletingTaskIds.has(task.id)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                  <button
                    @click.stop="toggleComments(task.id)"
                    class="comments-button"
                    :class="{ active: activeCommentTaskId === task.id }"
                  >
                    <i class="fas fa-comments"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="activeCommentTaskId" class="modal-wrapper">
          <div class="modal-overlay" @click="activeCommentTaskId = null"></div>
          <div class="modal-container">
            <div class="modal-header">
              <h3>Comments</h3>
              <button class="close-button" @click="activeCommentTaskId = null">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-content">
              <TaskComments :task-id="activeCommentTaskId" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showCreateWorkspace" class="modal-wrapper">
          <div class="modal-overlay" @click="showCreateWorkspace = false"></div>
          <div class="modal-container">
            <div class="modal-header">
              <h3>Create Workspace</h3>
              <button class="close-button" @click="showCreateWorkspace = false">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div class="modal-content">
              <CreateWorkspace @created="showCreateWorkspace = false" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <RouterLink to="/tasks/create" class="create-button">
      <i class="fas fa-plus"></i>
      <span class="tooltip">Create Task</span>
    </RouterLink>
  </div>
</template>

<style scoped>
.task-list {
  height: calc(100vh - var(--header-height));
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fixed-content {
  position: sticky;
  top: 0;
  background: var(--bg-color);
  z-index: 40;
  padding: 2rem 2rem 0;
}

.header {
  margin-bottom: 1rem;
  z-index: 30;
  backdrop-filter: blur(8px);
}

:deep(.task-filters) {
  margin-bottom: 1rem;
  z-index: 20;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

:deep(.task-sort) {
  margin-bottom: 1rem;
  padding: 1rem;
  z-index: 15;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 2rem 2rem;
}

.tasks-container {
  width: 100%;
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  position: relative;
  z-index: 1;
}

.tasks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  transition: all var(--transition-normal);
  position: relative;
  height: fit-content; /* Важно для одинаковой высоты */
}

.task-content {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  height: auto; /* Изменено с 100% */
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
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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
  z-index: 50;
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

@media (max-width: 768px) {
  .fixed-content {
    padding: 1rem 1rem 0;
  }

  .scrollable-content {
    padding: 0 1rem 1rem;
  }
}

.create-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--success-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-normal);
  z-index: 50;
}

.create-button i {
  font-size: 1.5rem;
}

.create-button:hover {
  transform: translateY(-2px);
  background-color: #27ae60;
}

.create-button .tooltip {
  position: absolute;
  right: calc(100% + 1rem);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all var(--transition-normal);
}

.create-button:hover .tooltip {
  opacity: 1;
}

@media (max-width: 768px) {
  .create-button {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 48px;
    height: 48px;
  }

  .create-button i {
    font-size: 1.25rem;
  }
}

/* Стили для модального окна */
.modal-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100; /* Выше всего */
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal-container {
  position: relative;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  z-index: 101; /* Выше оверлея */
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: var(--text-color);
}

.close-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: #666;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.1);
  color: var(--danger-color);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

/* Анимации для модального окна */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-container {
  transform: translateY(20px);
}

.modal-leave-to .modal-container {
  transform: translateY(-20px);
}

/* Обновленные z-index'ы */
.fixed-content {
  z-index: 40;
}

.create-button {
  z-index: 45;
}

/* Медиа-запросы */
@media (max-width: 768px) {
  .modal-container {
    width: 95%;
    max-height: 95vh;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-content {
    padding: 1rem;
  }
}

.list-container {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  padding: 2rem;
}

.filters-panel {
  position: sticky;
  top: calc(var(--header-height) + 2rem);
  height: calc(100vh - var(--header-height) - 4rem);
}

.tasks-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (max-width: 1024px) {
  .list-container {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .filters-panel {
    position: static;
    height: auto;
  }
}

.description-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  position: relative; /* Для позиционирования кнопки */
}

.description {
  margin: 0;
  color: #4a5568;
  line-height: 1.7;
  font-size: 0.95rem;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  overflow: hidden;
  word-wrap: break-word;
  white-space: pre-line;
  max-width: 100%;
  transition: all 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.show-more-btn {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--primary-color);
  background: transparent;
  border: 1px solid currentColor;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.25rem;
}

.show-more-btn:hover {
  background: var(--primary-color);
  color: white;
}

.show-more-btn i {
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .description {
    font-size: 0.9rem;
    line-height: 1.6;
  }

  .show-more-btn {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }
}

.tasks-table {
  position: relative; /* Добавляем для правильного позиционирования */
  background: white;
  border-radius: var(--radius);
  border: 1px solid var(--border-color);
  overflow: visible; /* Меняем с hidden на visible */
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
}

/* Горизонтальные линии */
tr {
  border-bottom: 1px solid var(--border-color);
}

tr:last-child {
  border-bottom: none;
}

/* Вертикальные линии */
td, th {
  border-right: 1px solid var(--border-color);
}

td:last-child, th:last-child {
  border-right: none;
}

th {
  background: #f8fafc;
  font-weight: 500;
  color: #64748b;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.title-cell {
  position: relative;
  min-width: 250px;
  z-index: 5;
}

.title-cell:hover {
  z-index: 15;
}

.title-cell h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-color);
}

.show-description-btn {
  margin-top: 0.5rem;
  padding: 0.35rem 0.75rem;
  font-size: 0.85rem;
  color: #64748b;
  background: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.show-description-btn:hover {
  background: var(--bg-color);
  color: var(--primary-color);
}

.description-popup {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: 300px;
  height: 200px;
  pointer-events: auto;
}

.popup-content {
  height: calc(100% - 2rem);
  overflow-y: auto;
  padding: 1rem;
}

.popup-content p {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: #4a5568;
  white-space: pre-line;
  word-wrap: break-word;
}

/* Удаляем стрелку, так как она может создавать проблемы с позиционированием */

.actions-cell {
  display: flex;
  gap: 0.5rem;
  white-space: nowrap;
  justify-content: flex-end;
  min-width: 120px;
}

.actions-cell button,
.actions-cell a {
  padding: 0.5rem;
  border-radius: var(--radius);
  color: #64748b;
  transition: all var(--transition-normal);
}

.actions-cell button:hover,
.actions-cell a:hover {
  background: var(--bg-color);
  color: var(--primary-color);
}

tr.deleting {
  opacity: 0.5;
  pointer-events: none;
}

/* ... адаптивные стили ... */

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 999;
}

.description-popup {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  width: 300px;
  height: 200px;
}

.popup-content {
  height: calc(100% - 2rem);
  overflow-y: auto;
  padding: 1rem;
}

.workspace-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
}

.create-workspace-btn {
  padding: 0.75rem 1.5rem;
  height: 51.59px; /* Добавлена фиксированная высота */
  background: var(--primary-color);
  color: white;
  border-radius: var(--radius);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all var(--transition-normal);
  white-space: nowrap; /* Предотвращает перенос текста */
}

.create-workspace-btn:hover {
  background: #2980b9;
  transform: translateY(-1px);
}
</style>
