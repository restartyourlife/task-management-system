import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import TaskEdit from '../TaskEdit.vue'
import { useTaskStore } from '@/stores/taskStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/tasks/:id/edit',
      name: 'task-edit',
      component: TaskEdit,
    },
  ],
})

describe('TaskEdit', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
  })

  it('updates existing task and redirects to task list', async () => {
    const store = useTaskStore()
    store.addTask({
      title: 'Original Task',
      description: 'Original Description',
      status: 'todo',
      priority: 'low',
    })

    const taskId = store.tasks[0].id

    // Устанавливаем параметры маршрута
    router.currentRoute.value.params.id = taskId

    const wrapper = mount(TaskEdit, {
      global: {
        plugins: [router],
      },
    })

    const taskForm = wrapper.findComponent({ name: 'TaskForm' })
    await taskForm.vm.$emit('submit', {
      title: 'Updated Task',
      description: 'Updated Description',
      status: 'in-progress',
      priority: 'high',
    })

    const updatedTask = store.tasks[0]
    expect(updatedTask.title).toBe('Updated Task')
    expect(updatedTask.description).toBe('Updated Description')
    expect(router.push).toHaveBeenCalledWith({ name: 'tasks' })
  })

  it('redirects to task list if task not found', async () => {
    router.currentRoute.value.params.id = 'non-existent-id'

    mount(TaskEdit, {
      global: {
        plugins: [router],
      },
    })

    expect(router.push).toHaveBeenCalledWith({ name: 'tasks' })
  })
})
