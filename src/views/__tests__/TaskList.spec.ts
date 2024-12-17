import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import TaskList from '../TaskList.vue'
import { useTaskStore } from '@/stores/taskStore'

// Создаем роутер для тестов
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'tasks',
      component: TaskList,
    },
  ],
})

describe('TaskList', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('displays tasks from store', async () => {
    const store = useTaskStore()
    // Добавляем тестовую задачу
    store.addTask({
      title: 'Test Task',
      description: 'Test Description',
      status: 'todo',
      priority: 'medium',
    })

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
      },
    })

    expect(wrapper.text()).toContain('Test Task')
    expect(wrapper.text()).toContain('Test Description')
  })

  it('deletes task when delete button is clicked', async () => {
    const store = useTaskStore()
    store.addTask({
      title: 'Task to Delete',
      description: 'Will be deleted',
      status: 'todo',
      priority: 'low',
    })

    const wrapper = mount(TaskList, {
      global: {
        plugins: [router],
      },
    })

    await wrapper.find('.delete-button').trigger('click')
    expect(store.tasks.length).toBe(0)
  })
})
