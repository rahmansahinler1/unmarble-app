<template>
  <div v-if="isOpen" class="onboarding-modal-overlay">
    <div
      class="onboarding-modal"
      :class="{ 'gallery-step': currentStep === 2, 'upload-step': currentStep === 3 }"
    >
      <!-- Progress Bar (shows on steps 0-3, hidden on step 4) -->
      <div v-if="currentStep < 4" class="onboarding-progress">
        <div class="onboarding-progress-bar" :style="{ width: progressWidth }"></div>
      </div>

      <!-- Logo (only on welcome step) -->
      <div v-if="currentStep === 0" class="onboarding-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Back Button (shows on step 1-3, but NOT during generation, on success, or step 4) -->
      <button
        v-if="
          currentStep > 0 &&
          currentStep < 4 &&
          !(currentStep === 3 && (generationSuccess || isGenerating))
        "
        class="onboarding-back-btn"
        @click="goBack"
      >
        <i class="bi bi-arrow-left"></i>
      </button>

      <!-- Step Content -->
      <div class="onboarding-content">
        <!-- Step 1: Welcome -->
        <template v-if="currentStep === 0">
          <div class="onboarding-illustration">
            <img src="/assets/img/welcome.svg" alt="Welcome" />
          </div>
          <p class="onboarding-tagline">Let's design your first outfit!</p>
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
          <p class="onboarding-privacy">Select one to see yourself in</p>

          <div v-if="isLoadingPreviews" class="onboarding-loading">
            <span class="spinner-border"></span>
            <p>Loading clothing options...</p>
          </div>

          <div v-else class="onboarding-gallery">
            <!-- Default clothing items -->
            <div
              v-for="image in onboardingPreviews"
              :key="image.id"
              class="onboarding-gallery-item"
              :class="{ selected: selectedClothingId === image.id && !isCustomClothingSelected }"
              @click="selectClothing(image.id)"
            >
              <img :src="`data:image/webp;base64,${image.base64}`" alt="Clothing option" />
            </div>

            <!-- Upload button tile (9th tile) -->
            <div
              class="onboarding-gallery-item onboarding-upload-tile"
              :class="{ selected: isCustomClothingSelected }"
              @click="triggerCustomClothingInput"
            >
              <!-- Show preview if custom clothing file exists (regardless of selection state) -->
              <template v-if="customClothingPreviewUrl">
                <img :src="customClothingPreviewUrl" alt="Your clothing" class="custom-clothing-preview" />
                <div class="custom-clothing-overlay">
                  <i class="bi bi-arrow-repeat"></i>
                  <span>Click to change</span>
                </div>
              </template>

              <!-- Show upload prompt if not selected -->
              <template v-else>
                <i class="bi bi-plus-circle upload-icon"></i>
                <span class="upload-text">Upload your own</span>
              </template>
            </div>

            <!-- Hidden file input -->
            <input
              type="file"
              ref="customClothingInput"
              @change="handleCustomClothingSelect"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              hidden
            />
          </div>
        </template>

        <!-- Step 4: Image Upload & Generation -->
        <template v-else-if="currentStep === 3">
          <h2 class="onboarding-question">
            {{ generationSuccess ? 'Congratulations 🎉' : 'Upload your picture' }}
          </h2>
          <p class="onboarding-privacy">
            {{
              generationSuccess
                ? "You've completed your first design!"
                : 'In which picture you want to try this?'
            }}
          </p>

          <!-- Success: Show generated image -->
          <div v-if="generationSuccess" class="onboarding-result">
            <img :src="generatedImageUrl" alt="Your design" />
          </div>

          <!-- Upload dropzone -->
          <div
            v-else
            class="onboarding-dropzone"
            :class="{ 'has-preview': hasImageSelection }"
            @click="triggerFileInput"
            @dragover.prevent="onDragOver"
            @dragleave.prevent="onDragLeave"
            @drop.prevent="handleDrop"
          >
            <input
              type="file"
              ref="fileInput"
              @change="handleFileSelect"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              hidden
            />

            <!-- Generating overlay -->
            <div v-if="isGenerating" class="generating-overlay">
              <span class="spinner-border"></span>
              <p>Designing your outfit...</p>
            </div>

            <!-- Empty state -->
            <template v-else-if="!hasImageSelection">
              <i class="bi bi-cloud-upload"></i>
              <p>Click to browse or drag and drop</p>
              <span class="file-hint">JPG, PNG, WEBP, HEIC • Max 5MB</span>
            </template>

            <!-- Preview state -->
            <template v-else>
              <img :src="imagePreviewUrl" alt="Selected image" class="preview-image" />
              <div class="preview-change-overlay">
                <i class="bi bi-arrow-repeat"></i>
                <span>Click to change</span>
              </div>
            </template>
          </div>

          <!-- Error message -->
          <p v-if="generationError" class="generation-error">
            {{ generationError }}
          </p>
        </template>

        <!-- Step 5: Upgrade -->
        <template v-else-if="currentStep === 4">
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

          <button class="btn-maybe-later" @click="handleMaybeLater">Maybe later</button>
        </template>
      </div>

      <!-- Action Button (hidden on step 4 which has its own buttons) -->
      <button
        v-if="currentStep < 4"
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

      <!-- Skip option (appears after 12s during generation OR on error) - below button -->
      <div v-if="currentStep === 3 && (showSkipOption || generationError)" class="skip-option">
        <a href="#" @click.prevent="handleSkip">Skip for now</a>
      </div>
    </div>
  </div>
</template>

<script>
import {
  completeOnboarding,
  getDefaultPreviews,
  uploadImage,
  designOnboarding,
  getCheckoutUrl,
} from '@/api/api'
import useUserStore from '@/stores/user'
import { processImageForUpload } from '@/utils/imageProcessor'
import { posthog } from '@/utils/posthog'

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
      totalSteps: 5,
      isSubmitting: false,
      selectedGender: null,
      selectedClothingId: null,
      isLoadingPreviews: false,
      // Custom clothing upload state
      customClothingFile: null,
      customClothingPreviewUrl: null,
      isCustomClothingSelected: false,
      // Step 3 (upload & generation) state
      selectedFile: null,
      imagePreviewUrl: null,
      isGenerating: false,
      generationSuccess: false,
      generationError: null,
      generatedImageUrl: null,
      showSkipOption: false,
      skipTimer: null,
      uploadedImageId: null,
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    hasImageSelection() {
      return this.selectedFile !== null
    },
    buttonText() {
      if (this.currentStep === 0) return 'Start'
      if (this.currentStep === 3) {
        if (this.isGenerating) return 'Designing...'
        if (this.generationSuccess) return 'Continue'
        if (this.generationError) return 'Retry'
        return 'Design'
      }
      return 'Continue'
    },
    canProceed() {
      if (this.currentStep === 1) return this.selectedGender !== null
      if (this.currentStep === 2) {
        // Allow proceeding if EITHER default clothing OR custom clothing selected
        return this.selectedClothingId !== null || this.isCustomClothingSelected
      }
      if (this.currentStep === 3) {
        // Can proceed if: has file selected (for Design), generation succeeded (for Continue), or has error (for Retry)
        if (this.generationSuccess) return true
        if (this.generationError) return true
        return this.hasImageSelection && !this.isGenerating
      }
      return true
    },
    onboardingPreviews() {
      return this.userStore.onboardingPreviews
    },
    progressWidth() {
      // Progress bar shows on steps 0-3 (4 visible steps), fills to 100% at step 3
      const visibleSteps = 4
      return `${((this.currentStep + 1) / visibleSteps) * 100}%`
    },
  },
  methods: {
    selectGender(gender) {
      this.selectedGender = gender
      this.userStore.setOnboardingGender(gender)
    },
    selectClothing(id) {
      // Mark default as selected (custom clothing preview remains visible but unselected)
      this.selectedClothingId = id
      this.userStore.setOnboardingClothingId(id)

      // Unselect custom clothing tile (but keep preview visible)
      this.isCustomClothingSelected = false
    },
    triggerCustomClothingInput() {
      // If preview exists but not selected, select it first
      if (this.customClothingPreviewUrl && !this.isCustomClothingSelected) {
        // Mark custom clothing as selected
        this.isCustomClothingSelected = true
        // Unselect default clothing
        this.selectedClothingId = null
        this.userStore.setOnboardingClothingId(null)
        return  // Don't trigger file picker
      }

      // If preview exists and is already selected, trigger re-selection
      // OR if no preview exists, trigger initial selection
      this.$refs.customClothingInput.click()
    },
    handleCustomClothingSelect(event) {
      const file = event.target.files[0]
      if (!file) return

      // Validate file type
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ]
      if (!validTypes.includes(file.type.toLowerCase())) {
        this.generationError = 'Please select a valid image file (JPG, PNG, WEBP, or HEIC)'
        return
      }

      // Validate file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        this.generationError = 'File too large. Maximum size is 25MB.'
        return
      }

      // Clean up previous preview URL if exists
      if (this.customClothingPreviewUrl) {
        URL.revokeObjectURL(this.customClothingPreviewUrl)
      }

      // Store file and create preview
      this.customClothingFile = file
      this.customClothingPreviewUrl = URL.createObjectURL(file)
      this.isCustomClothingSelected = true

      // Clear any default clothing selection
      this.selectedClothingId = null
      this.userStore.setOnboardingClothingId(null)

      // Clear any error messages
      this.generationError = null

      // Reset file input to allow re-selecting same file
      event.target.value = ''
    },
    clearCustomClothing() {
      if (this.customClothingPreviewUrl) {
        URL.revokeObjectURL(this.customClothingPreviewUrl)
      }
      this.customClothingFile = null
      this.customClothingPreviewUrl = null
      this.isCustomClothingSelected = false
    },
    goBack() {
      if (this.currentStep > 0) {
        // Reset step 3 state if going back from it
        if (this.currentStep === 3) {
          this.resetUploadState()
        }
        this.currentStep--
      }
    },
    async handleAction() {
      if (this.currentStep === 1) {
        posthog.capture('onboarding_step_completed', { step: 1 })
        this.currentStep++
        this.isLoadingPreviews = true
        await this.fetchDefaultPreviews()
        return
      }

      if (this.currentStep === 2) {
        posthog.capture('onboarding_step_completed', { step: 2 })
        this.currentStep++
        return
      }

      if (this.currentStep === 3) {
        if (this.generationSuccess) {
          posthog.capture('onboarding_step_completed', { step: 3 })
          this.currentStep = 4
          return
        }

        await this.handleDesignClick()
        return
      }

      this.currentStep++
    },
    async fetchDefaultPreviews() {
      try {
        const result = await getDefaultPreviews(this.selectedGender)
        if (result.success) {
          this.userStore.setOnboardingPreviews(result.data.previews)
          this.selectedClothingId = null
          this.userStore.setOnboardingClothingId(null)
        }
      } catch (error) {
        console.error('Failed to fetch default previews:', error)
      } finally {
        this.isLoadingPreviews = false
      }
    },
    handleUpgrade() {
      posthog.capture('upgrade_button_clicked', { source: 'onboarding' })

      this.$emit('completed')

      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.location.href = url
      }
    },
    handleMaybeLater() {
      posthog.capture('onboarding_upgrade_skipped', { source: 'maybe_later' })

      this.$emit('completed')
      this.$router.push('/gallery')
    },
    triggerFileInput() {
      if (!this.isGenerating) {
        this.$refs.fileInput.click()
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) this.selectFile(file)
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) this.selectFile(file)
    },
    onDragOver() {
      // Could add visual feedback for drag over state
    },
    onDragLeave() {
      // Could remove visual feedback
    },
    selectFile(file) {
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ]
      if (!validTypes.includes(file.type.toLowerCase())) {
        this.generationError = 'Please select a valid image file (JPG, PNG, WEBP, or HEIC)'
        return
      }

      if (file.size > 25 * 1024 * 1024) {
        this.generationError = 'File too large. Maximum size is 25MB.'
        return
      }

      this.generationError = null

      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)
      }
      this.selectedFile = file
      this.imagePreviewUrl = URL.createObjectURL(file)
    },
    async handleDesignClick() {
      this.isGenerating = true
      this.generationError = null
      this.skipTimer = setTimeout(() => {
        this.showSkipOption = true
      }, 20000)

      try {
        const onboardingResult = await completeOnboarding(this.selectedGender)

        if (onboardingResult.success) {
          if (onboardingResult.data.storage_left !== undefined) {
            this.userStore.updateStorageLeft(onboardingResult.data.storage_left)
          }

          this.userStore.setUserStatus('onboarded')

          if (
            onboardingResult.data.copied_images &&
            onboardingResult.data.copied_images.length > 0
          ) {
            for (const image of onboardingResult.data.copied_images) {
              this.userStore.addPreviewImage('clothing', {
                image_id: image.id,
                preview_base64: image.base64,
                faved: image.faved,
                created_at: image.created_at,
              })
            }
          }
        }

        const processedFile = await processImageForUpload(this.selectedFile)
        const uploadResult = await uploadImage('yourself', processedFile)

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }

        this.uploadedImageId = uploadResult.data.image_id

        this.userStore.addPreviewImage('yourself', uploadResult.data)
        this.userStore.updateStorageLeft(uploadResult.data.storage_left)

        // If custom clothing selected, upload it
        let uploadedClothingId = null
        if (this.isCustomClothingSelected && this.customClothingFile) {
          const processedClothing = await processImageForUpload(this.customClothingFile)
          const clothingUploadResult = await uploadImage('clothing', processedClothing)

          if (!clothingUploadResult.success) {
            throw new Error(clothingUploadResult.error || 'Failed to upload clothing')
          }

          uploadedClothingId = clothingUploadResult.data.image_id
          this.userStore.addPreviewImage('clothing', clothingUploadResult.data)
          this.userStore.updateStorageLeft(clothingUploadResult.data.storage_left)
        }

        // Call design API with appropriate parameters
        const designResult = await designOnboarding(
          this.uploadedImageId,
          this.isCustomClothingSelected ? null : this.selectedClothingId,
          uploadedClothingId
        )

        if (designResult.success) {
          this.generationSuccess = true
          this.generatedImageUrl = `data:image/webp;base64,${designResult.data.image_base64}`

          this.userStore.addPreviewImage('design', designResult.data)
          this.userStore.updateStorageLeft(designResult.data.storage_left)
          this.userStore.updateDesignsLeft(designResult.data.designs_left)

          posthog.capture('onboarding_design_completed', {
            gender: this.selectedGender,
            clothing_id: this.selectedClothingId,
            custom_clothing: this.isCustomClothingSelected,
          })
        } else {
          throw new Error(designResult.error || 'Generation failed')
        }
      } catch (error) {
        console.error('Upload/generation failed:', error)
        this.generationError = error.message
      } finally {
        this.isGenerating = false
        clearTimeout(this.skipTimer)
        if (!this.generationError) {
          this.showSkipOption = false
        }
      }
    },
    handleSkip() {
      posthog.capture('onboarding_design_skipped', { reason: 'timeout_20s' })

      this.isGenerating = false
      clearTimeout(this.skipTimer)
      this.showSkipOption = false

      this.$emit('completed')
      this.$router.push('/gallery')
    },
    resetUploadState() {
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)
      }
      // DO NOT clear custom clothing - preserve selection when going back
      this.selectedFile = null
      this.imagePreviewUrl = null
      this.isGenerating = false
      this.generationSuccess = false
      this.generationError = null
      this.generatedImageUrl = null
      this.showSkipOption = false
      this.uploadedImageId = null
      clearTimeout(this.skipTimer)
    },
  },
  beforeUnmount() {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl)
    }
    if (this.customClothingPreviewUrl) {
      URL.revokeObjectURL(this.customClothingPreviewUrl)
    }
    clearTimeout(this.skipTimer)
  },
}
</script>

<style scoped>
/* Upload tile specific styles */
.onboarding-upload-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  border: 2px dashed #ccc;
  background-color: #f9f9f9;
}

.onboarding-upload-tile:hover {
  border-color: #666;
  background-color: #f0f0f0;
}

.onboarding-upload-tile.selected {
  border: 2px solid #000;
  border-style: solid;
}

.upload-icon {
  font-size: 2rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.upload-text {
  font-size: 0.875rem;
  color: #666;
  text-align: center;
}

/* Custom clothing preview styles */
.custom-clothing-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.custom-clothing-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  opacity: 0;
  transition: opacity 0.2s;
}

.onboarding-upload-tile:hover .custom-clothing-overlay {
  opacity: 1;
}
</style>
