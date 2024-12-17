<script setup lang="ts">
import { useTaskStore } from '@/stores/taskStore'
import { RouterLink } from 'vue-router'

const taskStore = useTaskStore()
</script>

<template>
  <div class="task-list">
    <div class="header">
      <h1>Tasks</h1>
      <RouterLink to="/tasks/create" class="create-button">
        <span class="button-content">
          <span class="plus-icon">+</span>
          Create Task
        </span>
      </RouterLink>
    </div>

    <div class="tasks">
      <TransitionGroup name="task-list">
        <div v-for="task in taskStore.tasks" :key="task.id" class="task-card" :class="task.status">
          <h3>{{ task.title }}</h3>
          <p>{{ task.description }}</p>
          <div class="task-meta">
            <span class="status" :class="task.status">{{ task.status }}</span>
            <span class="priority" :class="task.priority">{{ task.priority }}</span>
          </div>
          <div class="actions">
            <RouterLink :to="`/tasks/${task.id}/edit`" class="edit-button">
              <span class="button-content">Edit</span>
            </RouterLink>
            <button @click="taskStore.deleteTask(task.id)" class="delete-button">
              <span class="button-content">Delete</span>
            </button>
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
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
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

.tasks {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.task-card {
  background-color: var(--card-bg);
  border-radius: var(--radius);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  animation: scaleIn 0.3s ease;
  position: relative;
  overflow: hidden;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-card h3 {
  margin: 0 0 1rem;
  color: var(--text-color);
}

.task-card p {
  color: #666;
  margin: 0 0 1rem;
}

.task-meta {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.edit-button,
.delete-button {
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
  overflow: hidden;
}

.edit-button {
  background-color: var(--primary-color);
  color: white;
  text-decoration: none;
}

.edit-button:hover {
  background-color: #2980b9;
}

.delete-button {
  background-color: var(--danger-color);
  color: white;
  border: none;
}

.delete-button:hover {
  background-color: #c0392b;
}

.edit-button::after,
.delete-button::after {
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

.edit-button:hover::after,
.delete-button:hover::after {
  width: 200px;
  height: 200px;
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.5s ease;
}

.task-list-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.task-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: var(--primary-color);
  transition: var(--transition-normal);
}

.task-card.todo::before {
  background-color: var(--warning-color);
}

.task-card.in-progress::before {
  background-color: var(--primary-color);
}

.task-card.done::before {
  background-color: var(--success-color);
}

.button-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plus-icon {
  font-size: 1.2em;
  font-weight: bold;
}

.status,
.priority {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status:hover,
.priority:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Улучшенные стили для мобильных устройств */
@media (max-width: 768px) {
  .tasks {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .actions {
    flex-direction: column;
  }

  .task-meta {
    flex-wrap: wrap;
  }
}
</style>
