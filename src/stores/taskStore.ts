import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types/task'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])

  function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...task,
    }
    tasks.value.push(newTask)
  }

  function updateTask(id: string, updates: Partial<Task>) {
    const taskIndex = tasks.value.findIndex((task) => task.id === id)
    if (taskIndex !== -1) {
      tasks.value[taskIndex] = {
        ...tasks.value[taskIndex],
        ...updates,
        updatedAt: new Date(),
      }
    }
  }

  function deleteTask(id: string) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
  }

  return { tasks, addTask, updateTask, deleteTask }
})
