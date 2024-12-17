<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'
import type { Task } from '@/types/task'

const router = useRouter()
const taskStore = useTaskStore()

function handleSubmit(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  taskStore.addTask(taskData)
  router.push({ name: 'tasks' })
}
</script>

<template>
  <div class="task-create">
    <div class="header">
      <h1>Create New Task</h1>
      <RouterLink to="/" class="back-button">Back to List</RouterLink>
    </div>
    <TaskForm @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.task-create {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.back-button {
  background-color: #666;
  color: white;
  padding: 10px 15px;
  text-decoration: none;
  border-radius: 4px;
}

.back-button:hover {
  background-color: #555;
}
</style>
