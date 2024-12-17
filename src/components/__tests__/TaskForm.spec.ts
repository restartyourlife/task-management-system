import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../TaskForm.vue'
import type { Task } from '@/types/task'

describe('TaskForm', () => {
  it('emits submit event with form data', async () => {
    const wrapper = mount(TaskForm)

    // Заполняем форму с правильной типизацией
    await wrapper.find<HTMLInputElement>('#title').setValue('Test Task')
    await wrapper.find<HTMLTextAreaElement>('#description').setValue('Test Description')
    await wrapper.find<HTMLSelectElement>('#status').setValue('in-progress')
    await wrapper.find<HTMLSelectElement>('#priority').setValue('high')

    // Отправляем форму
    await wrapper.find('form').trigger('submit')

    // Проверяем emit события
    const emitted = wrapper.emitted('submit')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({
      title: 'Test Task',
      description: 'Test Description',
      status: 'in-progress',
      priority: 'high',
    })
  })

  it('initializes with provided task data', () => {
    const initialTask: Partial<Task> = {
      title: 'Initial Task',
      description: 'Initial Description',
      status: 'todo',
      priority: 'medium',
    }

    const wrapper = mount(TaskForm, {
      props: {
        initialTask,
      },
    })

    // Проверяем значения с правильной типизацией
    expect(wrapper.find<HTMLInputElement>('#title').element.value).toBe('Initial Task')
    expect(wrapper.find<HTMLTextAreaElement>('#description').element.value).toBe(
      'Initial Description',
    )
    expect(wrapper.find<HTMLSelectElement>('#status').element.value).toBe('todo')
    expect(wrapper.find<HTMLSelectElement>('#priority').element.value).toBe('medium')
  })
})
