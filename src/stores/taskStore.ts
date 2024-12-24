import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task, TaskFilters, SortField, SortOrder, Workspace, WorkspaceRole } from '@/types/task'
import { supabase } from '@/config/supabase'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentWorkspace = ref<Workspace | null>(null)
  const workspaces = ref<Workspace[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loadingMessage = ref<string>('')
  const deletingTaskIds = ref<Set<string>>(new Set())

  // Фильтры и сортировка
  const filters = ref<TaskFilters>({
    search: '',
    tags: [],
    status: null,
    priority: null
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
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * modifier
        }

        return (a[field] > b[field] ? 1 : -1) * modifier
      })
  })

  async function fetchWorkspaces() {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      workspaces.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch workspaces'
    } finally {
      loading.value = false
    }
  }

  async function createWorkspace(name: string, description?: string) {
    try {
      loading.value = true
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('workspaces')
        .insert({
          name,
          description,
          owner_id: user.id
        })
        .select()
        .single()

      if (error) throw error

      // Добавляем новый workspace в список
      if (data) {
        workspaces.value = [data, ...workspaces.value]
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create workspace'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function inviteToWorkspace(workspaceId: string, email: string, role: WorkspaceRole) {
    try {
      // Находим пользователя по email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()

      if (userError || !userData) throw new Error('User not found')

      // Добавляем пользователя в workspace
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userData.id,
          role
        })

      if (error) throw error
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to invite user'
      throw err
    }
  }

  async function fetchTasks() {
    try {
      loading.value = true
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      // Базовый запрос
      const query = supabase
        .from('tasks')
        .select(`
          *,
          workspace:workspace_id (
            name,
            description
          )
        `)

      // Если выбран конкретный workspace
      if (currentWorkspace.value) {
        query.eq('workspace_id', currentWorkspace.value.id)
      } else {
        // Для "All Workspaces" получаем задачи без workspace и задачи из доступных workspace
        const workspaceIds = workspaces.value.map(w => w.id)

        if (workspaceIds.length > 0) {
          // Используем or для комбинации условий: workspace_id is null OR workspace_id in (...)
          query.or(`workspace_id.is.null,workspace_id.in.(${workspaceIds.join(',')})`)
        } else {
          // Если нет доступных workspace, получаем только задачи без workspace
          query.is('workspace_id', null)
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      tasks.value = data || []

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch tasks'
      tasks.value = []
    } finally {
      loading.value = false
    }
  }


  async function addTask(task: Omit<Task, 'id' | 'created_at' | 'updated_at'>) {
    try {
      if (!currentWorkspace.value) {
        throw new Error('Please select a workspace first')
      }

      loading.value = true
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('User not authenticated')

      const { data, error: err } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          user_id: user.id,
          workspace_id: currentWorkspace.value.id
        }])
        .select()
        .single()

      if (err) throw err
      if (data) tasks.value.unshift(data)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      throw err
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
      if (!id) {
        throw new Error('Task ID is required')
      }

      // Очищаем updates от пустых значений
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, value]) =>
          value !== null &&
          value !== undefined &&
          value !== ''
        )
      )

      if (Object.keys(cleanUpdates).length === 0) {
        return
      }

      loading.value = true
      const { data, error: err } = await supabase
        .from('tasks')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err

      if (data) {
        const index = tasks.value.findIndex(t => t.id === id)
        if (index !== -1) {
          tasks.value[index] = data
        }
      }

      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update task'
      throw err
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
    workspaces,
    currentWorkspace,
    fetchWorkspaces,
    createWorkspace,
    inviteToWorkspace,
  }
})
