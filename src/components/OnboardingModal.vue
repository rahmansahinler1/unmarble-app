<template>
  <div v-if="isOpen" class="onboarding-modal-overlay">
    <div class="onboarding-modal" :class="{ 'gallery-step': currentStep === 2, 'upload-step': currentStep === 3 }">
      <!-- Progress Bar (shows on steps 0-3, hidden on step 4) -->
      <div v-if="currentStep < 4" class="onboarding-progress">
        <div class="onboarding-progress-bar" :style="{ width: progressWidth }"></div>
      </div>

      <!-- Logo (only on welcome step) -->
      <div v-if="currentStep === 0" class="onboarding-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Back Button (shows on step 1-3, but NOT on success or step 4) -->
      <button
        v-if="currentStep > 0 && currentStep < 4 && !(currentStep === 3 && generationSuccess)"
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
              <p>Creating your design...</p>
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
import heic2any from 'heic2any'

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
      if (this.currentStep === 2) return this.selectedClothingId !== null
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
      this.selectedClothingId = id
      this.userStore.setOnboardingClothingId(id)
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
      // When moving from step 1 (gender) to step 2 (clothing selection)
      if (this.currentStep === 1) {
        this.currentStep++
        this.isLoadingPreviews = true
        await this.fetchDefaultPreviews()
        return
      }

      // Step 3: Upload & Generation
      if (this.currentStep === 3) {
        if (this.generationSuccess) {
          // Generation succeeded, complete onboarding and move to upgrade step
          await this.completeAndMoveToUpgrade()
          return
        }
        // Start or retry upload and generation
        await this.handleUploadAndGenerate()
        return
      }

      // Default: move to next step
      this.currentStep++
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
    async completeAndMoveToUpgrade() {
      this.isSubmitting = true
      try {
        const result = await completeOnboarding(this.selectedGender)
        if (result.success) {
          // Update storage in store
          this.userStore.updateStorageLeft(result.data.storage_left)

          // Add copied clothing images to store (transform format for addPreviewImage)
          if (result.data.copied_images && result.data.copied_images.length > 0) {
            for (const image of result.data.copied_images) {
              this.userStore.addPreviewImage('clothing', {
                image_id: image.id,
                preview_base64: image.base64,
                faved: image.faved,
                created_at: image.created_at,
              })
            }
          }

          // Move to upgrade step (firstTime stays true until user clicks "Maybe later")
          this.currentStep = 4
        }
      } catch (error) {
        console.error('Failed to complete onboarding:', error)
      } finally {
        this.isSubmitting = false
      }
    },
    handleUpgrade() {
      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.location.href = url
      }
    },
    handleMaybeLater() {
      // Only set firstTime to false when user explicitly dismisses the upgrade modal
      this.userStore.setFirstTime(false)
      this.$emit('completed')
    },
    // Step 3 methods
    triggerFileInput() {
      if (!this.isGenerating) {
        this.$refs.fileInput.click()
      }
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) this.processFile(file)
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      if (file) this.processFile(file)
    },
    onDragOver() {
      // Could add visual feedback for drag over state
    },
    onDragLeave() {
      // Could remove visual feedback
    },
    async processFile(file) {
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

      // Validate file size (5MB)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        this.generationError = 'File size must be less than 5MB'
        return
      }

      this.generationError = null

      // Handle HEIC conversion
      let processedFile = file
      if (file.type.toLowerCase() === 'image/heic' || file.type.toLowerCase() === 'image/heif') {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
          })
          processedFile = new File([convertedBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg',
          })
        } catch (error) {
          console.error('HEIC conversion failed:', error)
          this.generationError = 'Failed to process HEIC image. Please try a different format.'
          return
        }
      }

      // Store file and create preview
      this.selectedFile = processedFile
      this.imagePreviewUrl = URL.createObjectURL(processedFile)
    },
    async handleUploadAndGenerate() {
      this.isGenerating = true
      this.generationError = null

      // Start 12-second timer for skip option
      this.skipTimer = setTimeout(() => {
        this.showSkipOption = true
      }, 12000)

      try {
        // 1. Convert file to base64
        const base64 = await this.convertFileToBase64(this.selectedFile)

        // 2. Upload image to 'yourself' category
        const uploadResult = await uploadImage('yourself', base64)

        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload image')
        }

        this.uploadedImageId = uploadResult.data.image_id

        // Add uploaded image to store
        this.userStore.addPreviewImage('yourself', uploadResult.data)
        this.userStore.updateStorageLeft(uploadResult.data.storage_left)

        // 3. Call onboarding design endpoint
        const designResult = await designOnboarding(this.uploadedImageId, this.selectedClothingId)

        if (designResult.success) {
          this.generationSuccess = true
          this.generatedImageUrl = `data:image/webp;base64,${designResult.data.image_base64}`

          // Add design to store
          this.userStore.addPreviewImage('design', designResult.data)
          this.userStore.updateStorageLeft(designResult.data.storage_left)
          this.userStore.updateDesignsLeft(designResult.data.designs_left)
        } else {
          throw new Error(designResult.error || 'Generation failed')
        }
      } catch (error) {
        console.error('Upload/generation failed:', error)
        this.generationError = error.message
      } finally {
        this.isGenerating = false
        clearTimeout(this.skipTimer)
        // Keep showSkipOption visible on error so user can skip
        if (!this.generationError) {
          this.showSkipOption = false
        }
      }
    },
    convertFileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          // Remove data URL prefix to get raw base64
          const base64 = reader.result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    handleSkip() {
      // Stop any ongoing generation
      this.isGenerating = false
      clearTimeout(this.skipTimer)
      this.showSkipOption = false

      // Complete onboarding and move to upgrade step
      this.completeAndMoveToUpgrade()
    },
    resetUploadState() {
      // Clean up preview URL to prevent memory leaks
      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl)
      }
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
    // Clean up preview URL
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl)
    }
    clearTimeout(this.skipTimer)
  },
}
</script>
