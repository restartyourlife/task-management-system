import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import TaskList from '@/views/TaskList.vue'
import TaskCreate from '@/views/TaskCreate.vue'
import TaskEdit from '@/views/TaskEdit.vue'
import { supabase } from '@/config/supabase'
import LoginPage from '@/views/LoginPage.vue'

const getInitialPath = () => {
  const query = new URLSearchParams(window.location.search)
  const path = query.get('path')
  return path ? path.replace('/task-management-system', '') : '/'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
  ],
})

// Защита роутов
router.beforeEach(async (to: RouteLocationNormalized) => {
  if (to.path === '/auth/callback') {
    return true
  }

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (to.meta.requiresAuth && !session) {
    return { name: 'login' }
  }
})

if (window.location.search.includes('path=')) {
  router.push(getInitialPath())
}

export default router
