<template>
  <div v-if="isOpen" class="onboarding-modal-overlay">
    <div class="onboarding-modal" :class="{ 'gallery-step': currentStep === 2 }">
      <!-- Progress Bar (shows on all steps) -->
      <div class="onboarding-progress">
        <div class="onboarding-progress-bar" :style="{ width: progressWidth }"></div>
      </div>

      <!-- Logo (only on welcome step) -->
      <div v-if="currentStep === 0" class="onboarding-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Back Button (shows on step 1+) -->
      <button v-if="currentStep > 0" class="onboarding-back-btn" @click="goBack">
        <i class="bi bi-arrow-left"></i>
      </button>

      <!-- Step Content -->
      <div class="onboarding-content">
        <!-- Step 1: Welcome -->
        <template v-if="currentStep === 0">
          <div class="onboarding-illustration">
            <img src="/assets/img/welcome.svg" alt="Welcome" />
          </div>
          <p class="onboarding-tagline">Try clothes with one click!</p>
        </template>

        <!-- Step 2: Gender Selection -->
        <template v-else-if="currentStep === 1">
          <h2 class="onboarding-question">How do you identify?</h2>
          <p class="onboarding-privacy">This information will always be private</p>

          <div class="onboarding-options">
            <button
              class="onboarding-option-btn"
              :class="{ selected: selectedGender === 'female' }"
              @click="selectGender('female')"
            >
              Female
            </button>
            <button
              class="onboarding-option-btn"
              :class="{ selected: selectedGender === 'male' }"
              @click="selectGender('male')"
            >
              Male
            </button>
            <button
              class="onboarding-option-btn"
              :class="{ selected: selectedGender === 'other' }"
              @click="selectGender('other')"
            >
              Other
            </button>
          </div>
        </template>

        <!-- Step 3: Clothing Selection -->
        <template v-else-if="currentStep === 2">
          <h2 class="onboarding-question">What do you want to try on?</h2>
          <p class="onboarding-privacy">Select one of the given clothing to see yourself in</p>

          <div v-if="isLoadingPreviews" class="onboarding-loading">
            <span class="spinner-border"></span>
            <p>Loading clothing options...</p>
          </div>

          <div v-else class="onboarding-gallery">
            <div
              v-for="image in onboardingPreviews"
              :key="image.id"
              class="onboarding-gallery-item"
              :class="{ selected: selectedClothingId === image.id }"
              @click="selectClothing(image.id)"
            >
              <img :src="`data:image/webp;base64,${image.base64}`" alt="Clothing option" />
            </div>
          </div>
        </template>
      </div>

      <!-- Action Button -->
      <button
        class="btn-onboarding-action"
        :disabled="isSubmitting || !canProceed"
        @click="handleAction"
      >
        <span v-if="isSubmitting">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Getting started...
        </span>
        <span v-else>
          {{ buttonText }}
        </span>
      </button>
    </div>
  </div>
</template>

<script>
import { completeOnboarding, getDefaultPreviews } from '@/api/api'
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
      totalSteps: 6,
      isSubmitting: false,
      selectedGender: null,
      selectedClothingId: null,
      isLoadingPreviews: false,
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    isLastStep() {
      return this.currentStep === this.totalSteps - 1
    },
    buttonText() {
      if (this.currentStep === 0) return "Let's Start"
      if (this.isLastStep) return 'Get Started'
      return 'Continue'
    },
    canProceed() {
      if (this.currentStep === 1) return this.selectedGender !== null
      if (this.currentStep === 2) return this.selectedClothingId !== null
      return true
    },
    onboardingPreviews() {
      return this.userStore.onboardingPreviews
    },
    progressWidth() {
      // Start with some fill on step 0, then progress to 100% at last step
      return `${((this.currentStep + 1) / this.totalSteps) * 100}%`
    },
  },
  methods: {
    selectGender(gender) {
      this.selectedGender = gender
      this.userStore.setOnboardingGender(gender)
    },
    selectClothing(id) {
      this.selectedClothingId = id
      this.userStore.setOnboardingClothingId(id)
    },
    goBack() {
      if (this.currentStep > 0) {
        this.currentStep--
      }
    },
    async handleAction() {
      // When moving from step 1 (gender) to step 2 (clothing selection)
      if (this.currentStep === 1) {
        this.currentStep++
        this.isLoadingPreviews = true
        await this.fetchDefaultPreviews()
        return
      }

      if (this.isLastStep) {
        await this.finishOnboarding()
      } else {
        this.currentStep++
      }
    },
    async fetchDefaultPreviews() {
      try {
        const result = await getDefaultPreviews(this.selectedGender)
        if (result.success) {
          this.userStore.setOnboardingPreviews(result.data.previews)
          // Clear previous selection when new previews load
          this.selectedClothingId = null
          this.userStore.setOnboardingClothingId(null)
        }
      } catch (error) {
        console.error('Failed to fetch default previews:', error)
      } finally {
        this.isLoadingPreviews = false
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
