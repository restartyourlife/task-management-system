import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task } from '@/types/task'
import { supabase } from '@/config/supabase'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTasks() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      tasks.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      loading.value = true
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const { data, error: err } = await supabase
        .from('tasks')
        .insert([
          {
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            user_id: user.id,
          },
        ])
        .select()
        .single()

      if (err) throw err
      if (data) tasks.value.unshift(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function updateTask(id: string, updates: Partial<Task>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      if (data) {
        const index = tasks.value.findIndex((t) => t.id === id)
        if (index !== -1) tasks.value[index] = data
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  async function deleteTask(id: string) {
    try {
      loading.value = true
      const { error: err } = await supabase.from('tasks').delete().eq('id', id)

      if (err) throw err
      tasks.value = tasks.value.filter((task) => task.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      loading.value = false
    }
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
  }
})
