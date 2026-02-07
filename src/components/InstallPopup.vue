<template>
  <div v-if="visible" class="install-popup-overlay" @click.self="dismiss">
    <div class="install-popup">
      <button class="install-popup-close" @click="dismiss">
        <i class="bi bi-x-lg"></i>
      </button>

      <div class="install-popup-icon">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <h3 class="install-popup-title">Get the Unmarble App</h3>
      <p class="install-popup-subtitle">
        Install Unmarble for a faster, app-like experience on your device.
      </p>

      <!-- Standard install (Chrome, Edge, etc.) -->
      <button v-if="canInstall" class="install-popup-btn" @click="handleInstall">
        <i class="bi bi-download me-2"></i> Install App
      </button>

      <!-- Safari instructions (no beforeinstallprompt) -->
      <div v-else-if="isIos" class="install-popup-ios">
        <p>
          Tap <i class="bi bi-box-arrow-up"></i> then <strong>"Add to Home Screen"</strong>
        </p>
      </div>
      <div v-else-if="isSafari" class="install-popup-ios">
        <p>
          Go to <strong>File → Add to Dock</strong> to install
        </p>
      </div>

      <button class="install-popup-dismiss" @click="dismiss">Not now</button>
    </div>
  </div>
</template>

<script>
import { onInstallAvailable, triggerInstallPrompt } from '@/utils/pwa'
import { posthog } from '@/utils/posthog'

export default {
  name: 'InstallPopup',
  emits: ['close'],
  data() {
    return {
      visible: true,
      canInstall: false,
      unsubscribe: null,
    }
  },
  computed: {
    isIos() {
      return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    },
    isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    },
  },
  created() {
    this.unsubscribe = onInstallAvailable((available) => {
      this.canInstall = available
    })
  },
  beforeUnmount() {
    if (this.unsubscribe) this.unsubscribe()
  },
  methods: {
    async handleInstall() {
      posthog?.capture('install_button_clicked', { location: 'popup' })
      const outcome = await triggerInstallPrompt()
      if (outcome === 'accepted') {
        posthog?.capture('pwa_installed', { location: 'popup' })
      }
      this.dismiss()
    },
    dismiss() {
      this.visible = false
      this.$emit('close')
    },
  },
}
</script>
