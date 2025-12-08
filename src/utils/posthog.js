import posthog from 'posthog-js'

export function initPostHog() {
  posthog.init('phc_J3QPecCLfUvcvgXsyOqAkaUMQcjOYAi7Bw8AZ27oVFj', {
    api_host: 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false,
  })
}

export function identifyUser(userId, userProperties = {}) {
  posthog.identify(userId, userProperties)
}

export function trackPageView(path) {
  posthog.capture('$pageview', { path })
}

export { posthog }
