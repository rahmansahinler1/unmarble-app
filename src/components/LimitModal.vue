<template>
  <div v-if="isOpen" class="limit-modal-overlay" @click.self="close">
    <div class="limit-modal">
      <!-- Trial User Content - New Design -->
      <template v-if="userType === 'trial'">
        <!-- Close Button -->
        <button class="upgrade-modal-close" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>

        <!-- Logo -->
        <div class="limit-modal-logo">
          <img src="/assets/img/logo-small.svg" alt="Unmarble" />
        </div>

        <!-- Header Text -->
        <h2 class="limit-modal-title">Limits reached</h2>
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
      </template>

      <!-- Premium User Content -->
      <template v-else>
        <div class="modal-header">
          <h2 class="modal-title">{{ title }}</h2>
          <button class="close-btn" @click="close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="limit-info">
          <i class="bi bi-hourglass-split limit-icon limit-icon-premium"></i>
          <p class="limit-message">{{ limitMessage }}</p>
        </div>

        <!-- Storage limit: suggest freeing up space -->
        <div v-if="limitType === 'storage'" class="storage-info">
          <i class="bi bi-recycle storage-icon"></i>
          <p class="storage-text">
            You can delete some of your pictures to open up some space. Don't forget to download
            them!
          </p>
        </div>

        <!-- Design limit: show renewal date -->
        <div v-else class="renewal-info">
          <i class="bi bi-calendar-check renewal-icon"></i>
          <p class="renewal-text">
            Your credits will renew on
            <strong>{{ formattedRenewalDate }}</strong>
          </p>
        </div>

        <div class="modal-actions">
          <button class="btn-got-it" @click="close">Got it</button>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LimitModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    limitType: {
      type: String,
      required: true,
      validator: (value) => ['storage', 'design'].includes(value),
    },
    userType: {
      type: String,
      required: true,
      validator: (value) => ['trial', 'premium'].includes(value),
    },
    nextRenewalDate: {
      type: String,
      default: null,
    },
  },
  emits: ['close', 'upgrade'],
  computed: {
    title() {
      if (this.limitType === 'design') {
        return 'No credits left'
      }
      return 'Storage limit reached'
    },
    limitMessage() {
      if (this.userType === 'trial') {
        if (this.limitType === 'design') {
          return "You've used all your trial credits."
        }
        return "You've reached your trial storage limit."
      }
      if (this.limitType === 'design') {
        return "You've used all your credits for this month."
      }
      return "You've reached your storage limit."
    },
    formattedRenewalDate() {
      if (!this.nextRenewalDate) return 'your next billing date'
      try {
        const date = new Date(this.nextRenewalDate)
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      } catch {
        return this.nextRenewalDate
      }
    },
  },
  methods: {
    close() {
      this.$emit('close')
    },
    handleUpgrade() {
      this.$emit('upgrade')
    },
  },
}
</script>
