import { test, expect } from '@playwright/test'

test.describe('Task Management System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('creates a new task', async ({ page }) => {
    // Переход на страницу создания
    await page.click('text=Create Task')

    // Заполнение формы
    await page.fill('#title', 'New E2E Task')
    await page.fill('#description', 'Task created during E2E test')
    await page.selectOption('#status', 'in-progress')
    await page.selectOption('#priority', 'high')

    // Отправка формы
    await page.click('button[type="submit"]')

    // Проверка, что мы вернулись на список задач
    await expect(page).toHaveURL('/')

    // Проверка, что задача отображается
    await expect(page.locator('.task-card')).toContainText('New E2E Task')
    await expect(page.locator('.task-card')).toContainText('Task created during E2E test')
  })

  test('edits an existing task', async ({ page }) => {
    // Сначала создаем задачу
    await test.step('Create task', async () => {
      await page.click('text=Create Task')
      await page.fill('#title', 'Task to Edit')
      await page.fill('#description', 'This will be edited')
      await page.click('button[type="submit"]')
      // Ждем возврата на главную страницу
      await page.waitForURL('/')
    })

    // Редактируем созданную задачу
    await test.step('Edit task', async () => {
      await page.waitForSelector('text=Edit')
      await page.click('text=Edit')
      await page.waitForSelector('#title')
      await page.fill('#title', 'Edited Task Title')
      await page.fill('#description', 'This task was edited')
      await page.selectOption('#status', 'done')
      await page.click('button[type="submit"]')
    })

    // Проверяем изменения
    await expect(page.locator('.task-card')).toContainText('Edited Task Title')
    await expect(page.locator('.task-card')).toContainText('This task was edited')
    await expect(page.locator('.status')).toContainText('done')
  })

  test('deletes a task', async ({ page }) => {
    // Сначала создаем задачу
    await test.step('Create task', async () => {
      await page.click('text=Create Task')
      await page.fill('#title', 'Task to Delete')
      await page.fill('#description', 'This will be deleted')
      await page.click('button[type="submit"]')
      // Ждем возврата на главную страницу
      await page.waitForURL('/')
    })

    // Ждем появления задачи и проверяем её наличие
    await expect(page.locator('.task-card:has-text("Task to Delete")')).toBeVisible()

    // Удаляем задачу
    await page.click('text=Delete')

    // Ждем исчезновения задачи
    await expect(page.locator('.task-card:has-text("Task to Delete")')).not.toBeVisible({
      timeout: 5000,
    })
  })

  test('filters tasks by status', async ({ page }) => {
    // Создаем несколько задач с разными статусами
    const tasks = [
      { title: 'Todo Task', status: 'todo' },
      { title: 'In Progress Task', status: 'in-progress' },
      { title: 'Done Task', status: 'done' },
    ]

    // Создаем задачи
    for (const task of tasks) {
      await test.step(`Create ${task.status} task`, async () => {
        await page.click('text=Create Task')
        await page.fill('#title', task.title)
        await page.fill('#description', `This is a ${task.status} task`)
        await page.selectOption('#status', task.status)
        await page.click('button[type="submit"]')
        // Ждем возврата на главную страницу
        await page.waitForURL('/')
      })
    }

    // Проверяем, что все задачи отображаются
    for (const task of tasks) {
      await expect(page.locator(`.task-card:has-text("${task.title}")`)).toBeVisible()
    }
  })

  test('validates required fields', async ({ page }) => {
    await page.click('text=Create Task')

    // Пытаемся отправить пустую форму
    await page.click('button[type="submit"]')

    // Проверяем, что форма не отправлена и мы все еще на странице создания
    await expect(page).toHaveURL(/.*create/)

    // Проверяем наличие сообщений об ошибках
    const titleInput = page.locator('#title')
    const descriptionTextarea = page.locator('#description')

    await expect(titleInput).toHaveAttribute('required', '')
    await expect(descriptionTextarea).toHaveAttribute('required', '')
  })
})
