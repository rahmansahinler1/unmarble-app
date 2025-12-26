<template>
  <!-- Profile Page -->
  <div id="profile" class="page-content">
    <div class="container-fluid" style="max-width: 700px">
      <h1 class="profile-page-title mb-4">Profile</h1>

      <!-- Profile Information -->
      <div class="mb-4">
        <div class="d-flex align-items-center p-3 border rounded">
          <div class="profile-picture me-3">
            <img
              :src="userCred.pictureUrl || 'https://via.placeholder.com/70'"
              alt="Profile"
              class="rounded-circle"
              style="width: 70px; height: 70px; object-fit: cover"
            />
          </div>
          <div class="profile-info">
            <h6 class="profile-header mb-1">{{ userCred.name }} {{ userCred.surname }}</h6>
            <p class="profile-text text-muted mb-0">{{ userCred.email }}</p>
          </div>
        </div>
      </div>

      <!-- Plan Information -->
      <div class="mb-4">
        <!-- Premium User -->
        <div v-if="isPremium" class="p-3 border rounded">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div class="d-flex align-items-center mb-1">
                <i class="bi bi-stars me-2" style="font-size: 1.75rem; color: #00b7ed"></i>
                <h6 class="profile-header mb-0">Premium</h6>
              </div>
              <p class="profile-text-small text-muted mb-1">Monthly</p>
              <!-- Show renewal date for active subscriptions -->
              <p
                v-if="subscriptionStatus === 'active' && userCred.nextRenewalDate"
                class="profile-text-small text-muted mb-0"
              >
                Auto renews {{ userCred.nextRenewalDate }}
              </p>
              <!-- Show end date for cancelled subscriptions -->
              <p
                v-else-if="subscriptionStatus === 'cancelled'"
                class="profile-text-small mb-0"
                style="color: #dc3545"
              >
                Ends {{ formattedEndDate }}
              </p>
            </div>
          </div>
          <div class="pt-3 border-top d-flex justify-content-between align-items-start">
            <!-- Active subscription -->
            <template v-if="subscriptionStatus === 'active'">
              <p class="profile-text text-muted mb-0" style="max-width: 400px">
                Your access will continue until the end of your billing period.
              </p>
              <button
                class="btn btn-outline-danger btn-sm profile-btn"
                @click="showCancelModal = true"
              >
                Cancel Subscription
              </button>
            </template>

            <!-- Cancelled subscription (still has access) -->
            <template v-else-if="subscriptionStatus === 'cancelled'">
              <div class="d-flex flex-column w-100">
                <div class="d-flex justify-content-between align-items-start">
                  <p class="profile-text text-muted mb-0" style="max-width: 400px">
                    Your subscription has been cancelled. You'll keep access until your billing
                    period.
                  </p>
                  <button
                    class="btn btn-sm profile-btn"
                    style="background-color: #00b7ed; color: white"
                    :disabled="isResuming || resumeSuccess"
                    @click="handleRenew"
                  >
                    <span v-if="isResuming">
                      <span class="spinner-border spinner-border-sm me-1"></span>Processing...
                    </span>
                    <span v-else> <i class="bi bi-arrow-repeat me-1"></i>Resume Subscription </span>
                  </button>
                </div>
                <!-- Resume Success Message -->
                <div v-if="resumeSuccess" class="alert alert-success mt-3 mb-0 py-2">
                  <i class="bi bi-check-circle me-2"></i>
                  Subscription resumed!
                </div>
                <!-- Resume Error Message -->
                <div v-if="resumeError" class="alert alert-danger mt-3 mb-0 py-2">
                  <i class="bi bi-exclamation-circle me-2"></i>
                  {{ resumeError }}
                  <p class="mb-0 mt-1" style="font-size: 12px; color: #9ca3af">
                    We're looking into this issue.
                  </p>
                </div>
              </div>
            </template>

            <!-- Default case (none/other) - show cancel button -->
            <template v-else>
              <p class="profile-text text-muted mb-0" style="max-width: 400px">
                Your access will continue until the end of your billing period.
              </p>
              <button
                class="btn btn-outline-danger btn-sm profile-btn"
                @click="showCancelModal = true"
              >
                Cancel Subscription
              </button>
            </template>
          </div>
        </div>

        <!-- Trial User -->
        <div v-else class="p-3 border rounded">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <div class="d-flex align-items-center mb-1">
                <i class="bi bi-droplet-half me-2" style="font-size: 1.75rem; color: #00b7ed"></i>
                <h6 class="profile-header mb-0">Trial</h6>
              </div>
            </div>
          </div>
          <div class="pt-3 border-top d-flex justify-content-between align-items-start">
            <p class="profile-text text-muted mb-0" style="max-width: 400px">
              Get premium, design freely!
            </p>
            <button class="btn btn-sm profile-btn upgrade-btn" @click="handleUpgrade">
              <i class="bi bi-stars me-1"></i>Upgrade your plan
            </button>
          </div>
        </div>
      </div>

      <!-- Cancellation Modal -->
      <CancellationModal
        :isOpen="showCancelModal"
        :nextRenewalDate="userCred.nextRenewalDate"
        @close="showCancelModal = false"
        @cancelled="handleCancelled"
      />

      <!-- Upgrade Modal -->
      <UpgradeModal :isOpen="showUpgradeModal" @close="showUpgradeModal = false" />

      <!-- Usage -->
      <div class="mb-4 pb-4 border-bottom">
        <div class="row g-3">
          <!-- Storage Card -->
          <div class="col-6">
            <div class="border rounded p-3 d-flex align-items-center">
              <div class="me-3">
                <i class="bi bi-database-fill" style="font-size: 1.75rem; color: #00b7ed"></i>
              </div>
              <div>
                <div class="nav-text fw-bold mb-0">{{ userLimits.storageLeft }}</div>
                <div class="nav-text-small text-muted">Storage left</div>
              </div>
            </div>
          </div>

          <!-- Designs Card -->
          <div class="col-6">
            <div class="border rounded p-3 d-flex align-items-center">
              <div class="me-3">
                <i class="bi bi-magic" style="font-size: 1.75rem; color: #00b7ed"></i>
              </div>
              <div>
                <div class="nav-text fw-bold mb-0">{{ userLimits.designsLeft }}</div>
                <div class="nav-text-small text-muted">Designs left</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feedback -->
      <div class="mb-4">
        <div class="p-3 border rounded">
          <textarea
            v-model="feedbackText"
            class="form-control mb-2 nav-text-small"
            rows="3"
            placeholder="Anything you want to share?"
            maxlength="150"
            :disabled="isSendingFeedback"
          ></textarea>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div>
              <!-- Success Message -->
              <small v-if="feedbackStatus === 'success'" class="nav-text-small text-success">
                <i class="bi bi-check-circle me-1"></i>{{ feedbackMessage }}
              </small>
              <!-- Error Message -->
              <small v-else-if="feedbackStatus === 'error'" class="nav-text-small text-danger">
                <i class="bi bi-exclamation-circle me-1"></i>{{ feedbackMessage }}
              </small>
            </div>
            <small class="nav-text-small text-muted">{{ feedbackText.length }}/150</small>
          </div>
          <div class="d-flex justify-content-end">
            <button
              class="btn btn-outline-secondary btn-sm profile-btn"
              :disabled="!canSendFeedback"
              @click="sendFeedback"
            >
              <span v-if="isSendingFeedback">
                <span class="spinner-border spinner-border-sm me-1"></span>Sending...
              </span>
              <span v-else>Send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { submitFeedback, resumeSubscription } from '@/api/api'
import CancellationModal from '@/components/CancellationModal.vue'
import UpgradeModal from '@/components/UpgradeModal.vue'

export default {
  name: 'Profile',
  components: {
    CancellationModal,
    UpgradeModal,
  },
  data() {
    return {
      feedbackText: '',
      isSendingFeedback: false,
      feedbackStatus: null,
      feedbackMessage: '',
      showCancelModal: false,
      showUpgradeModal: false,
      isResuming: false,
      resumeError: '',
      resumeSuccess: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    userCred() {
      return (
        this.userStore?.userCred || {
          name: '',
          surname: '',
          email: '',
          type: 'trial',
          pictureUrl: '',
          nextRenewalDate: null,
          subscriptionStatus: 'none',
          subscriptionEndsAt: null,
        }
      )
    },
    userLimits() {
      return this.userStore?.userLimits || { storageLeft: 0, designsLeft: 0 }
    },
    isPremium() {
      return this.userCred.type === 'premium'
    },
    subscriptionStatus() {
      return this.userCred.subscriptionStatus || 'none'
    },
    formattedEndDate() {
      if (!this.userCred.subscriptionEndsAt) return ''
      return new Date(this.userCred.subscriptionEndsAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    },
    canSendFeedback() {
      return this.feedbackText.trim().length > 0 && !this.isSendingFeedback
    },
  },
  methods: {
    async sendFeedback() {
      if (!this.canSendFeedback) return

      this.isSendingFeedback = true
      this.feedbackStatus = null
      this.feedbackMessage = ''

      try {
        const result = await submitFeedback(this.feedbackText)

        if (result.success) {
          this.feedbackStatus = 'success'
          this.feedbackMessage = 'Thank you for your feedback!'
          this.feedbackText = ''

          // Clear success message after 3 seconds
          setTimeout(() => {
            this.feedbackStatus = null
            this.feedbackMessage = ''
          }, 3000)
        } else {
          this.feedbackStatus = 'error'
          this.feedbackMessage = result.error || 'Failed to send feedback'

          // Clear error message after 5 seconds
          setTimeout(() => {
            this.feedbackStatus = null
            this.feedbackMessage = ''
          }, 5000)
        }
      } catch (error) {
        this.feedbackStatus = 'error'
        this.feedbackMessage = 'Network error. Please try again.'

        setTimeout(() => {
          this.feedbackStatus = null
          this.feedbackMessage = ''
        }, 5000)
      } finally {
        this.isSendingFeedback = false
      }
    },
    handleUpgrade() {
      this.showUpgradeModal = true
    },
    async handleCancelled() {
      this.showCancelModal = false
      // Reload page after short delay to ensure webhook has processed
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    async handleRenew() {
      this.isResuming = true
      this.resumeError = ''
      this.resumeSuccess = false
      try {
        const result = await resumeSubscription()
        if (result.success) {
          this.resumeSuccess = true
          // Reload page after short delay to ensure webhook has processed
          setTimeout(() => {
            window.location.reload()
          }, 1500)
        } else {
          this.resumeError = result.error || 'Failed to resume subscription'
        }
      } finally {
        this.isResuming = false
      }
    },
  },
}
</script>
