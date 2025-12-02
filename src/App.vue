<template>
  <!-- Onboarding Modal (first-time users) -->
  <OnboardingModal :isOpen="showOnboarding" @completed="handleOnboardingCompleted" />

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
import useUserStore from '@/stores/user'

export default {
  name: 'app',
  components: {
    SubscriptionBlockOverlay,
    SubscriptionWarningModal,
    PastDueBanner,
    OnboardingModal,
  },
  data() {
    return {
      cookieCheckInterval: null,
      expiredWarningDismissed: false,
      pastDueBannerDismissed: false,
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
      return this.userStore.userCred.firstTime === true
    },
  },
  mounted() {
    window.addEventListener('storage', this.handleStorageChange)
    this.startCookieValidation()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.handleStorageChange)
    if (this.cookieCheckInterval) {
      clearInterval(this.cookieCheckInterval)
    }
  },
  methods: {
    handleOnboardingCompleted() {
      // The store is already updated by the modal
      // Modal will close automatically since firstTime is now false
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
