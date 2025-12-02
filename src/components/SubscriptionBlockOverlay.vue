<template>
  <div class="subscription-block-overlay">
    <div class="subscription-block-card">
      <div class="block-icon-wrapper">
        <i class="bi bi-exclamation-triangle-fill block-icon"></i>
      </div>

      <h2 class="block-title">{{ title }}</h2>
      <p class="block-message">{{ message }}</p>

      <button class="btn-resubscribe" @click="handleResubscribe">
        <i class="bi bi-arrow-repeat me-2"></i>Resubscribe Now
      </button>

      <p class="block-support">
        Need help? Contact us at
        <a href="mailto:support@unmarble.com">support@unmarble.com</a>
      </p>
    </div>
  </div>
</template>

<script>
import { getCheckoutUrl } from '@/api/api'
import useUserStore from '@/stores/user'

export default {
  name: 'SubscriptionBlockOverlay',
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => ['expired', 'refunded'].includes(value),
    },
    daysSinceExpiry: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    title() {
      if (this.status === 'refunded') {
        return 'Subscription Refunded'
      }
      return 'Subscription Expired'
    },
    message() {
      if (this.status === 'refunded') {
        return 'Your subscription was refunded. Resubscribe to regain access to your account and continue using Unmarble.'
      }
      return `Your subscription expired ${this.daysSinceExpiry} days ago. Your account may be deleted if not renewed. Resubscribe now to keep your images and continue using Unmarble.`
    },
  },
  methods: {
    handleResubscribe() {
      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.open(url, '_blank')
      }
    },
  },
}
</script>
