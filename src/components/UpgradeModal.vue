<template>
  <div v-if="isOpen" class="limit-modal-overlay" @click.self="close">
    <div class="limit-modal">
      <!-- Close Button -->
      <button class="upgrade-modal-close" @click="close">
        <i class="bi bi-x-lg"></i>
      </button>

      <!-- Logo -->
      <div class="limit-modal-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Header Text -->
      <h2 class="limit-modal-title">Get full access</h2>
      <p class="limit-modal-subtitle">
        Upgrade like
        <span class="user-avatars">
          <img src="/assets/img/user-testimonial1.webp" alt="" class="avatar-icon" />
          <img src="/assets/img/user-testimonial2.webp" alt="" class="avatar-icon" />
          <img src="/assets/img/user-testimonial3.webp" alt="" class="avatar-icon" />
        </span>
        for only
      </p>
      <p class="limit-modal-price">$10 per month — Cancel anytime.</p>

      <!-- Premium Card -->
      <div class="premium-card">
        <div class="premium-card-header">
          <span class="premium-label">Premium</span>
          <span class="popular-badge">Popular</span>
        </div>

        <ul class="premium-benefits">
          <li>
            <i class="bi bi-star-fill"></i>
            <span>50 designs every month</span>
          </li>
          <li>
            <i class="bi bi-star-fill"></i>
            <span>100 image storage capacity</span>
          </li>
          <li>
            <i class="bi bi-star-fill"></i>
            <span>Higher quality image outputs</span>
          </li>
          <li>
            <i class="bi bi-star-fill"></i>
            <span>Priority support & feature requests</span>
          </li>
        </ul>

        <button class="btn-upgrade-new" @click="handleUpgrade">Upgrade for $10 / mo</button>
      </div>

      <button class="btn-maybe-later" @click="close">Maybe later</button>
    </div>
  </div>
</template>

<script>
import { getCheckoutUrl } from '@/api/api'
import useUserStore from '@/stores/user'

export default {
  name: 'UpgradeModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
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
    handleUpgrade() {
      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.location.href = url
      }
    },
  },
}
</script>
