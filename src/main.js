import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import useUserStore from '@/stores/user'
import { initPostHog, identifyUser } from '@/utils/posthog'

// Initialize PostHog early
initPostHog()

function getAuthToken() {
  const cookieMatch = document.cookie.match(/authToken=([^;]+)/)
  return cookieMatch ? cookieMatch[1] : null
}

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.user_id
  } catch (error) {
    console.error('Invalid token')
    return null
  }
}

const token = getAuthToken()

if (!token) {
  window.location.href = import.meta.env.VITE_WEBSITE_URL
} else {
  const userId = getUserIdFromToken(token)

  if (!userId) {
    window.location.href = import.meta.env.VITE_WEBSITE_URL
  } else {
    // Identify user in PostHog
    identifyUser(userId)

    const app = createApp(App)
    app.use(createPinia())
    app.use(router)

    const userStore = useUserStore()
    await userStore.initialize(userId)

    app.mount('#app')
  }
}
