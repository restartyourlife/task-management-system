import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters, SortField, SortOrder } from '@/types/task'
import { supabase } from '@/config/supabase'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadingMessage = ref<string>('')
  const deletingTaskIds = ref<Set<string>>(new Set())

  // Фильтры и сортировка
  const filters = ref<TaskFilters>({
    search: '',
    tags: [],
    status: undefined,
    priority: undefined
  })

  const sortConfig = ref<{
    field: SortField
    order: SortOrder
  }>({
    field: 'createdAt',
    order: 'desc'
  })

  // Получаем все уникальные теги
  const availableTags = computed(() => {
    const tagsSet = new Set<string>()
    tasks.value.forEach(task => {
      task.tags?.forEach(tag => tagsSet.add(tag))
    })
    return Array.from(tagsSet).sort()
  })

  // Фильтрованные и отсортированные задачи
  const filteredTasks = computed(() => {
    return tasks.value
      .filter(task => {
        // Поиск по заголовку и описанию
        const searchMatch = !filters.value.search ||
          task.title.toLowerCase().includes(filters.value.search.toLowerCase()) ||
          task.description.toLowerCase().includes(filters.value.search.toLowerCase())

        // Фильтр по тегам
        const tagsMatch = filters.value.tags.length === 0 ||
          (task.tags && filters.value.tags.some(tag => task.tags.includes(tag)))

        // Фильтр по статусу
        const statusMatch = !filters.value.status ||
          task.status === filters.value.status

        // Фильтр по приоритету
        const priorityMatch = !filters.value.priority ||
          task.priority === filters.value.priority

        return searchMatch && tagsMatch && statusMatch && priorityMatch
      })
      .sort((a, b) => {
        const { field, order } = sortConfig.value
        const modifier = order === 'asc' ? 1 : -1

        if (field === 'createdAt') {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * modifier
        }

        return (a[field] > b[field] ? 1 : -1) * modifier
      })
  })

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
        .insert([{
          title: task.title,
          description: task.description,
          status: task.status,
          priority: task.priority,
          tags: task.tags,
          user_id: user.id,
        }])
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

  function setFilters(newFilters: Partial<TaskFilters>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function setSorting(field: SortField, order: SortOrder) {
    sortConfig.value = { field, order }
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
      deletingTaskIds.value.add(id)
      loadingMessage.value = 'Deleting task...'
      loading.value = true

      const { error: err } = await supabase.from('tasks').delete().eq('id', id)

      if (err) throw err
      tasks.value = tasks.value.filter((task) => task.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
    } finally {
      deletingTaskIds.value.delete(id)
      loading.value = false
      loadingMessage.value = ''
    }
  }

  return {
    tasks,
    filteredTasks,
    availableTags,
    loading,
    error,
    filters,
    sortConfig,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    setFilters,
    setSorting,
    loadingMessage,
    deletingTaskIds,
  }
})
