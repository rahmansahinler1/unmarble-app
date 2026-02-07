<template>
  <!-- Onboarding Modal (first-time users) -->
  <OnboardingModal :isOpen="showOnboarding" @completed="handleOnboardingCompleted" />

  <!-- PWA Install Popup (returning users, once per session) -->
  <InstallPopup
    v-if="showInstallPopup"
    @close="handleInstallPopupClose"
  />

  <!-- Subscription Block Overlay (expired 7+ days or refunded) -->
  <SubscriptionBlockOverlay
    v-if="isBlocked && !showOnboarding"
    :status="subscriptionStatus"
    :days-since-expiry="daysSinceExpiry"
  />

  <!-- Past Due Banner (payment failed) -->
  <PastDueBanner v-if="showPastDueBanner && !showOnboarding" @close="pastDueBannerDismissed = true" />

  <!-- Subscription Warning Modal (expired 0-7 days) -->
  <SubscriptionWarningModal
    v-if="showExpiredWarning && !showOnboarding"
    :days-since-expiry="daysSinceExpiry"
    @close="expiredWarningDismissed = true"
  />

  <!-- Main App Content -->
  <div :class="{ 'app-with-banner': showPastDueBanner && !showOnboarding }">
    <RouterView />
  </div>
</template>

<script>
import SubscriptionBlockOverlay from '@/components/SubscriptionBlockOverlay.vue'
import SubscriptionWarningModal from '@/components/SubscriptionWarningModal.vue'
import PastDueBanner from '@/components/PastDueBanner.vue'
import OnboardingModal from '@/components/OnboardingModal.vue'
import InstallPopup from '@/components/InstallPopup.vue'
import useUserStore from '@/stores/user'
import { getIsStandalone, onInstallAvailable } from '@/utils/pwa'

export default {
  name: 'app',
  components: {
    SubscriptionBlockOverlay,
    SubscriptionWarningModal,
    PastDueBanner,
    OnboardingModal,
    InstallPopup,
  },
  data() {
    return {
      cookieCheckInterval: null,
      expiredWarningDismissed: false,
      pastDueBannerDismissed: false,
      onboardingModalOpen: false,
      installPopupDismissed: false,
      pwaCanInstall: false,
      pwaUnsubscribe: null,
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    subscriptionStatus() {
      return this.userStore.userCred.subscriptionStatus
    },
    daysSinceExpiry() {
      return this.userStore.userCred.daysSinceExpiry || 0
    },
    isBlocked() {
      if (this.subscriptionStatus === 'refunded') return true
      if (this.subscriptionStatus === 'expired' && this.daysSinceExpiry >= 7) return true
      return false
    },
    showExpiredWarning() {
      return (
        this.subscriptionStatus === 'expired' &&
        this.daysSinceExpiry < 7 &&
        !this.expiredWarningDismissed
      )
    },
    showPastDueBanner() {
      return this.subscriptionStatus === 'past_due' && !this.pastDueBannerDismissed
    },
    showOnboarding() {
      return this.userStore.userCred.user_status === 'first_time' || this.onboardingModalOpen
    },
    showInstallPopup() {
      if (getIsStandalone()) return false
      if (this.userStore.userCred.user_status === 'first_time') return false
      if (this.showOnboarding) return false
      if (this.isBlocked) return false
      if (this.installPopupDismissed) return false
      if (sessionStorage.getItem('unmarble_installPopupDismissed')) return false
      const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
      return this.pwaCanInstall || isIos || isSafari
    },
  },
  mounted() {
    if (this.userStore.userCred.user_status === 'first_time') {
      this.onboardingModalOpen = true
    }
    window.addEventListener('storage', this.handleStorageChange)
    this.startCookieValidation()
    this.pwaUnsubscribe = onInstallAvailable((canInstall) => {
      this.pwaCanInstall = canInstall
    })
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    if (this.cookieCheckInterval) {
      clearInterval(this.cookieCheckInterval)
    }
    if (this.pwaUnsubscribe) this.pwaUnsubscribe()
  },
  methods: {
    handleOnboardingCompleted() {
      this.onboardingModalOpen = false
    },
    handleInstallPopupClose() {
      this.installPopupDismissed = true
      sessionStorage.setItem('unmarble_installPopupDismissed', 'true')
    },
    handleStorageChange(event) {
      if (event.key === 'logout-event') {
        const domain = import.meta.env.VITE_COOKIE_DOMAIN
        document.cookie = `authToken=; domain=${domain}; path=/; max-age=0`
        window.location.href = import.meta.env.VITE_WEBSITE_URL
      }
    },
    startCookieValidation() {
      this.cookieCheckInterval = setInterval(() => {
        const cookieMatch = document.cookie.match(/authToken=([^;]+)/)
        if (!cookieMatch) {
          window.location.href = import.meta.env.VITE_WEBSITE_URL
        }
      }, 60000)
    },
  },
}
</script>
