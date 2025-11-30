<template>
  <div v-if="isOpen" class="limit-modal-overlay" @click.self="close">
    <div class="limit-modal">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">{{ title }}</h2>
        <button class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Trial User Content -->
      <template v-if="userType === 'trial'">
        <div class="limit-info">
          <i class="bi bi-exclamation-circle limit-icon"></i>
          <p class="limit-message">{{ limitMessage }}</p>
        </div>

        <div class="upgrade-section">
          <p class="upgrade-subtitle">Upgrade to Premium to get:</p>
          <ul class="benefits-list">
            <li>
              <i class="bi bi-star-fill benefit-icon"></i>
              <span>50 credits every month</span>
            </li>
            <li>
              <i class="bi bi-star-fill benefit-icon"></i>
              <span>100 image storage capacity</span>
            </li>
            <li>
              <i class="bi bi-star-fill benefit-icon"></i>
              <span>Higher quality image outputs</span>
            </li>
            <li>
              <i class="bi bi-star-fill benefit-icon"></i>
              <span>Priority support & feature requests</span>
            </li>
          </ul>
        </div>

        <div class="modal-actions">
          <button class="btn-upgrade" @click="handleUpgrade">
            <i class="bi bi-arrow-up-circle me-2"></i>Upgrade to Premium
          </button>
          <button class="btn-dismiss" @click="close">Maybe later</button>
        </div>
      </template>

      <!-- Premium User Content -->
      <template v-else>
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
