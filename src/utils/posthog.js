import posthog from 'posthog-js'

export function initPostHog() {
  posthog.init('phc_J3QPecCLfUvcvgXsyOqAkaUMQcjOYAi7Bw8AZ27oVFj', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'always',
    capture_pageview: false,
  })

  // Register PWA detection as a super property — attached to every event
  const isPwa =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  posthog.register({ is_pwa: isPwa })
}

export function identifyUser(userId, userProperties = {}) {
  posthog.identify(userId, userProperties)
}

export function trackPageView(path) {
  posthog.capture('$pageview', { path })
}

export { posthog }
