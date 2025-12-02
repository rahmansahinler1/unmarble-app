<template>
  <div v-if="isOpen" class="onboarding-modal-overlay">
    <div class="onboarding-modal">
      <!-- Logo -->
      <div class="onboarding-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Step Content -->
      <div class="onboarding-content">
        <!-- Step 1: Welcome -->
        <template v-if="currentStep === 0">
          <h2 class="onboarding-title">Welcome to Unmarble!</h2>
          <p class="onboarding-subtitle">
            Let's get you started with your design journey
          </p>
          <p class="onboarding-description">
            Create stunning outfit designs by combining your photos with clothing items.
            Upload your images, select your style, and watch the magic happen.
          </p>
        </template>

        <!-- Future steps can be added here -->
      </div>

      <!-- Step Indicator (for future multi-step) -->
      <div v-if="totalSteps > 1" class="onboarding-steps">
        <span
          v-for="step in totalSteps"
          :key="step"
          class="step-dot"
          :class="{ active: currentStep === step - 1 }"
        ></span>
      </div>

      <!-- Action Button -->
      <button
        class="btn-onboarding-action"
        :disabled="isSubmitting"
        @click="handleAction"
      >
        <span v-if="isSubmitting">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Getting started...
        </span>
        <span v-else>
          {{ isLastStep ? 'Get Started' : 'Next' }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { completeOnboarding } from '@/api/api'
import useUserStore from '@/stores/user'

export default {
  name: 'OnboardingModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['completed'],
  data() {
    return {
      currentStep: 0,
      totalSteps: 1, // Increase when adding more steps
      isSubmitting: false,
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isLastStep() {
      return this.currentStep === this.totalSteps - 1
    },
  },
  methods: {
    async handleAction() {
      if (this.isLastStep) {
        await this.finishOnboarding()
      } else {
        this.currentStep++
      }
    },
    async finishOnboarding() {
      this.isSubmitting = true
      try {
        const result = await completeOnboarding()
        if (result.success) {
          // Update local store
          this.userStore.setFirstTime(false)
          this.$emit('completed')
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      } finally {
        this.isSubmitting = false
      }
    },
  },
}
</script>
