<template>
  <div class="past-due-banner">
    <div class="banner-content">
      <i class="bi bi-exclamation-triangle-fill banner-icon"></i>
      <span class="banner-message">
        Payment failed. Please update your payment method to continue your subscription.
      </span>
      <button class="banner-link" @click="handleUpdatePayment">Update Payment</button>
    </div>
    <button class="banner-close" @click="close">
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>

<script>
import { getCheckoutUrl } from '@/api/api'
import useUserStore from '@/stores/user'

export default {
  name: 'PastDueBanner',
  emits: ['close'],
  computed: {
    userStore() {
      return useUserStore()
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleUpdatePayment() {
      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.open(url, '_blank')
      }
    },
  },
}
</script>
