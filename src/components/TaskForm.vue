<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '@/types/task'

const props = defineProps<{
  initialTask?: Partial<Task>
}>()

const emit = defineEmits<{
  submit: [task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>]
}>()

const title = ref(props.initialTask?.title ?? '')
const description = ref(props.initialTask?.description ?? '')
const status = ref(props.initialTask?.status ?? 'todo')
const priority = ref(props.initialTask?.priority ?? 'medium')

function handleSubmit() {
  emit('submit', {
    title: title.value,
    description: description.value,
    status: status.value as Task['status'],
    priority: priority.value as Task['priority'],
  })
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="task-form">
    <div class="form-group">
      <label for="title">Title</label>
      <input id="title" v-model="title" type="text" required placeholder="Enter task title" />
    </div>

    <div class="form-group">
      <label for="description">Description</label>
      <textarea
        id="description"
        v-model="description"
        required
        placeholder="Enter task description"
      ></textarea>
    </div>

    <div class="form-group">
      <label for="status">Status</label>
      <select id="status" v-model="status">
        <option value="todo">To Do</option>
        <option value="in-progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>

    <div class="form-group">
      <label for="priority">Priority</label>
      <select id="priority" v-model="priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
    </div>

    <button type="submit">Save Task</button>
  </form>
</template>

<style scoped>
.task-form {
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  max-width: 600px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.form-group {
  margin-bottom: 1.5rem;
  animation: slideIn 0.3s ease;
  animation-fill-mode: both;
}

.form-group:nth-child(1) {
  animation-delay: 0.1s;
}
.form-group:nth-child(2) {
  animation-delay: 0.2s;
}
.form-group:nth-child(3) {
  animation-delay: 0.3s;
}
.form-group:nth-child(4) {
  animation-delay: 0.4s;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

input,
textarea,
select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 1rem;
  transition: all var(--transition-normal);
  background: var(--card-bg);
  position: relative;
  overflow: hidden;
}

input:focus,
textarea:focus,
select:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
  transform: translateY(-2px);
}

textarea {
  height: 120px;
  resize: vertical;
}

button {
  background-color: var(--primary-color);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
  width: 100%;
}

button::after {
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

button:hover::after {
  width: 300px;
  height: 300px;
}

button:active {
  transform: scale(0.98);
}

@media (min-width: 768px) {
  button {
    width: auto;
  }
}

@media (max-width: 768px) {
  .task-form {
    padding: 1rem;
  }

  button {
    width: 100%;
  }
}
</style>
