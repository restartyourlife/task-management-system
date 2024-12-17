<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'
import type { Task } from '@/types/task'

const router = useRouter()
const route = useRoute()
const taskStore = useTaskStore()

const taskId = route.params.id as string
const task = computed(() => taskStore.tasks.find((t) => t.id === taskId))

function handleSubmit(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
  if (!task.value) {
    router.push({ name: 'tasks' })
    return
  }

  taskStore.updateTask(taskId, taskData)
  router.push({ name: 'tasks' })
}

// Если задача не найдена, перенаправляем на список задач
if (!task.value) {
  router.push({ name: 'tasks' })
}
</script>

<template>
  <div v-if="task" class="task-edit">
    <div class="header">
      <h1>Edit Task</h1>
      <RouterLink to="/" class="back-button">Back to List</RouterLink>
    </div>
    <TaskForm :initial-task="task" @submit="handleSubmit" />
  </div>
</template>

<style scoped>
.task-edit {
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
