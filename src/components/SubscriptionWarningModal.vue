<template>
  <div class="subscription-warning-overlay" @click.self="close">
    <div class="subscription-warning-modal">
      <div class="modal-header">
        <h2 class="modal-title">Subscription Expired</h2>
        <button class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <div class="warning-info">
        <i class="bi bi-exclamation-circle warning-icon"></i>
        <p class="warning-message">{{ expiryMessage }}</p>
      </div>

      <div class="warning-notice">
        <i class="bi bi-clock-history notice-icon"></i>
        <p class="notice-text">
          You have <strong>{{ daysRemaining }}</strong> to resubscribe before your account access is
          blocked. Your images are safe, but you won't be able to use the app afterwards.
        </p>
      </div>

      <div class="modal-actions">
        <button class="btn-resubscribe" @click="handleResubscribe">
          <i class="bi bi-arrow-repeat me-2"></i>Resubscribe Now
        </button>
        <button class="btn-continue" @click="close">Continue for now</button>
      </div>
    </div>
  </div>
</template>

<script>
import { getCheckoutUrl } from '@/api/api'
import useUserStore from '@/stores/user'

export default {
  name: 'SubscriptionWarningModal',
  props: {
    daysSinceExpiry: {
      type: Number,
      required: true,
    },
  },
  emits: ['close'],
  computed: {
    userStore() {
      return useUserStore()
    },
    expiryMessage() {
      if (this.daysSinceExpiry === 0) {
        return 'Your subscription expired today.'
      } else if (this.daysSinceExpiry === 1) {
        return 'Your subscription expired 1 day ago.'
      }
      return `Your subscription expired ${this.daysSinceExpiry} days ago.`
    },
    daysRemaining() {
      const days = Math.max(0, 7 - this.daysSinceExpiry)
      return days === 1 ? '1 day' : `${days} days`
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleResubscribe() {
      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.open(url, '_blank')
      }
    },
  },
}
</script>
