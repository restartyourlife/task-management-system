import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import TaskCreate from '../TaskCreate.vue'
import { useTaskStore } from '@/stores/taskStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/tasks/create',
      name: 'task-create',
      component: TaskCreate,
    },
  ],
})

describe('TaskCreate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    // Очищаем историю навигации
    vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve())
  })

  it('creates a new task and redirects to task list', async () => {
    const wrapper = mount(TaskCreate, {
      global: {
        plugins: [router],
      },
    })

    const store = useTaskStore()
    const taskForm = wrapper.findComponent({ name: 'TaskForm' })

    await taskForm.vm.$emit('submit', {
      title: 'New Task',
      description: 'New Description',
      status: 'todo',
      priority: 'medium',
    })

    expect(store.tasks.length).toBe(1)
    expect(store.tasks[0]).toMatchObject({
      title: 'New Task',
      description: 'New Description',
    })
    expect(router.push).toHaveBeenCalledWith({ name: 'tasks' })
  })
})
