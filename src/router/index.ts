import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import TaskList from '@/views/TaskList.vue'
import TaskCreate from '@/views/TaskCreate.vue'
import TaskEdit from '@/views/TaskEdit.vue'
import { supabase } from '@/config/supabase'
import LoginPage from '@/views/LoginPage.vue'

const router = createRouter({
  history: createWebHistory('/task-management-system/'),
  routes: [
    {
      path: '/',
      name: 'tasks',
      component: TaskList,
      meta: { requiresAuth: true },
    },
    {
      path: '/tasks/create',
      name: 'task-create',
      component: TaskCreate,
    },
    {
      path: '/tasks/:id/edit',
      name: 'task-edit',
      component: TaskEdit,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: TaskList,
      meta: { requiresAuth: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: () => {
        return { name: 'login' }
      }
    }
  ],
})

// Защита роутов
router.beforeEach(async (to: RouteLocationNormalized) => {
  try {
    // Проверяем hash на наличие access_token
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      // Обрабатываем callback от GitHub
      const {
        data: { session },
        error: authError
      } = await supabase.auth.getSession()

      if (authError) {
        throw new Error('Authentication failed: ' + authError.message)
      }

      if (session) {
        return { name: 'tasks' }
      }
    }

    // Проверяем callback
    if (to.path === '/auth/callback') {
      const {
        data: { session },
        error: authError
      } = await supabase.auth.getSession()

      if (authError) {
        throw new Error('Authentication failed: ' + authError.message)
      }

      if (session) {
        return { name: 'tasks' }
      }
      throw new Error('No session after authentication')
    }

    // Проверяем авторизацию для защищенных маршрутов
    const {
      data: { session },
      error: authError
    } = await supabase.auth.getSession()

    if (authError) {
      throw new Error('Session check failed: ' + authError.message)
    }

    if (to.meta.requiresAuth && !session) {
      return { name: 'login', query: { error: 'Authentication required' } }
    }
  } catch (error) {
    console.error('Navigation error:', error)
    return {
      name: 'login',
      query: {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }
})

export default router
