// PWA detection and install prompt management

let deferredPrompt = null
let isStandalone = false
let listeners = []

/**
 * Check if the app is running as an installed PWA (standalone mode)
 */
export function isPwaStandalone() {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if (window.navigator.standalone === true) return true
  return false
}

/**
 * Initialize PWA install prompt capture.
 * Call once in main.js before app.mount().
 */
export function initPwaInstall() {
  isStandalone = isPwaStandalone()

  if (isStandalone) return

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    listeners.forEach((fn) => fn(true))
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    isStandalone = true
    listeners.forEach((fn) => fn(false))
  })
}

/**
 * Register a callback for install availability changes.
 * Callback receives boolean: true = can install, false = cannot.
 * Returns an unsubscribe function.
 */
export function onInstallAvailable(callback) {
  listeners.push(callback)
  if (deferredPrompt) callback(true)
  return () => {
    listeners = listeners.filter((fn) => fn !== callback)
  }
}

/**
 * Trigger the native install prompt. Returns the user's choice outcome.
 */
export async function triggerInstallPrompt() {
  if (!deferredPrompt) return null
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
  listeners.forEach((fn) => fn(false))
  return outcome
}

/**
 * Check if the deferred prompt is currently available.
 */
export function canInstallPwa() {
  return deferredPrompt !== null
}

export function getIsStandalone() {
  return isStandalone
}
