<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="cancellation-modal">
      <!-- Header -->
      <div class="modal-header">
        <h2 class="modal-title">Before you go...</h2>
        <button class="close-btn" @click="close">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>

      <!-- Reasons to stay -->
      <div class="reasons-section">
        <p class="reasons-subtitle">Things you might miss:</p>
        <ul class="reasons-list">
          <li>
            <i class="bi bi-star-fill reason-icon"></i>
            <span>50 image designs every month</span>
          </li>
          <li>
            <i class="bi bi-star-fill reason-icon"></i>
            <span>100 image storage capacity</span>
          </li>
          <li>
            <i class="bi bi-star-fill reason-icon"></i>
            <span>Higher quality image outputs</span>
          </li>
          <li>
            <i class="bi bi-star-fill reason-icon"></i>
            <span>Priority support & feature requests</span>
          </li>
          <li>
            <i class="bi bi-star-fill reason-icon"></i>
            <span>Your designs and images stored safely</span>
          </li>
        </ul>
      </div>

      <!-- Cancellation reason (optional) -->
      <div class="reason-input-section">
        <label class="reason-label">Why are you leaving? (optional)</label>
        <select v-model="selectedReason" class="reason-select">
          <option value="">Select a reason...</option>
          <option value="too_expensive">It's too expensive</option>
          <option value="not_using">I'm not using it enough</option>
          <option value="missing_features">Missing features I need</option>
          <option value="found_alternative">Found an alternative</option>
          <option value="temporary">Just need a break</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="error-card">
        <i class="bi bi-exclamation-circle me-2"></i>
        {{ errorMessage }}
        <p class="error-note">We're looking into this issue.</p>
      </div>

      <!-- Action buttons -->
      <div class="modal-actions">
        <button class="btn-keep" @click="close">Keep my subscription</button>
        <button class="btn-cancel" @click="confirmCancel" :disabled="isCancelling">
          <span v-if="isCancelling" class="spinner-border spinner-border-sm me-2"></span>
          {{ isCancelling ? 'Cancelling...' : 'Cancel subscription' }}
        </button>
      </div>

      <!-- Info note -->
      <p class="info-note">You'll keep access until {{ formattedEndDate }}</p>
    </div>
  </div>
</template>

<script>
import { cancelSubscription } from '@/api/api'

export default {
  name: 'CancellationModal',
  props: {
    isOpen: Boolean,
    nextRenewalDate: String,
  },
  emits: ['close', 'cancelled'],
  data() {
    return {
      selectedReason: '',
      isCancelling: false,
      errorMessage: '',
    }
  },
  computed: {
    formattedEndDate() {
      return this.nextRenewalDate || 'the end of your billing period'
    },
  },
  methods: {
    close() {
      this.selectedReason = ''
      this.$emit('close')
    },
    async confirmCancel() {
      this.isCancelling = true
      this.errorMessage = ''
      try {
        const result = await cancelSubscription(this.selectedReason)
        if (result.success) {
          this.$emit('cancelled')
        } else {
          this.errorMessage = result.error || 'Failed to cancel subscription'
        }
      } finally {
        this.isCancelling = false
      }
    },
  },
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}

.cancellation-modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.modal-title {
  font-family: var(--font-family-base);
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.close-btn i {
  font-size: 1.25rem;
  color: #5d5d5d;
}

.reasons-section {
  margin-bottom: 24px;
}

.reasons-subtitle {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin: 0 0 16px 0;
}

.reasons-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.reasons-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-family: var(--font-family-base);
  font-size: 14px;
  color: #333;
}

.reasons-list li:last-child {
  margin-bottom: 0;
}

.reason-icon {
  color: #00b7ed;
  font-size: 12px;
  flex-shrink: 0;
}

.reason-input-section {
  margin-bottom: 24px;
}

.reason-label {
  display: block;
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.reason-select {
  width: 100%;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: var(--font-family-base);
  font-size: 14px;
  color: #333;
  background-color: white;
  cursor: pointer;
}

.reason-select:focus {
  outline: none;
  border-color: #00b7ed;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.btn-keep {
  flex: 1;
  padding: 14px 24px;
  border-radius: 9999px;
  background: #00b7ed;
  color: white;
  border: none;
  font-family: var(--font-family-base);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-keep:hover {
  background: #0095c7;
}

.btn-cancel {
  flex: 1;
  padding: 14px 24px;
  border-radius: 9999px;
  background: transparent;
  color: #666;
  border: 1px solid #e0e0e0;
  font-family: var(--font-family-base);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel:hover:not(:disabled) {
  background: #f5f5f5;
}

.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.info-note {
  text-align: center;
  font-family: var(--font-family-base);
  font-size: 12px;
  color: #999;
  margin: 0;
}

.error-card {
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: #dc2626;
  font-family: var(--font-family-base);
  font-size: 14px;
}

.error-note {
  font-size: 12px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

@media (max-width: 480px) {
  .cancellation-modal {
    padding: 24px;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-keep,
  .btn-cancel {
    width: 100%;
  }
}
</style>
