import { createRouter, createWebHistory } from 'vue-router'
import Panel1 from '@/views/Panel1.vue'
import Panel2 from '@/views/Panel2.vue'
import Panel5 from '@/views/Panel5.vue'
import { trackPageView } from '@/utils/posthog'

const routes = [
  {
    path: '',
    redirect: '/gallery',
  },
  {
    name: 'Panel1',
    path: '/gallery',
    component: Panel1,
  },
  {
    name: 'Panel2',
    path: '/design',
    component: Panel2,
  },
  {
    name: 'Panel5',
    path: '/profile',
    component: Panel5,
  },
]

const router = createRouter({
  history: createWebHistory('/app/'),
  routes: routes,
})

router.beforeEach((to, from, next) => {
  const cookieMatch = document.cookie.match(/authToken=([^;]+)/)

  if (!cookieMatch) {
    window.location.href = '/'
    return
  }

  next()
})

// Track page views in PostHog after each navigation
router.afterEach((to) => {
  trackPageView(to.fullPath)
})

export default router
