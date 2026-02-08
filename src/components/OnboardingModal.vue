<template>
  <div v-if="isOpen" class="onboarding-modal-overlay">
    <div
      class="onboarding-modal"
      :class="{
        'gallery-step': currentStep === STEP_CLOTHING,
        'upload-step': currentStep === STEP_UPLOAD,
        'upgrade-step': currentStep === STEP_UPGRADE,
      }"
    >
      <!-- Progress Bar (hidden on upgrade step) -->
      <div v-if="currentStep < STEP_UPGRADE" class="onboarding-progress">
        <div class="onboarding-progress-bar" :style="{ width: progressWidth }"></div>
      </div>

      <!-- Logo (only on welcome step) -->
      <div v-if="currentStep === STEP_WELCOME" class="onboarding-logo">
        <img src="/assets/img/logo-small.svg" alt="Unmarble" />
      </div>

      <!-- Back Button (shows on intermediate steps, but NOT during generation, on success, or upgrade) -->
      <button
        v-if="
          currentStep > 0 &&
          currentStep < STEP_UPGRADE &&
          !(currentStep === STEP_UPLOAD && (generationSuccess || isGenerating))
        "
        class="onboarding-back-btn"
        @click="goBack"
      >
        <i class="bi bi-arrow-left"></i>
      </button>

      <!-- Step Content -->
      <div class="onboarding-content">
        <!-- Step: Welcome -->
        <template v-if="currentStep === STEP_WELCOME">
          <div class="onboarding-illustration">
            <img src="/assets/img/welcome.svg" alt="Welcome" />
          </div>
          <p class="onboarding-tagline">Let's design your first outfit!</p>
        </template>

        <!-- Step: Download App (conditional, only when not in PWA) -->
        <template v-else-if="currentStep === STEP_DOWNLOAD">
          <div class="onboarding-download-icon">
            <img src="/assets/img/logo-small.svg" alt="Unmarble" />
          </div>
          <h2 class="onboarding-question">Get the App</h2>
          <p class="onboarding-privacy">Install for a better experience</p>

          <button v-if="pwaCanInstall" class="btn-onboarding-install" @click="handlePwaInstall">
            <i class="bi bi-download me-2"></i> Install
          </button>

          <div v-else-if="isIos" class="onboarding-ios-instructions">
            <p>Tap <i class="bi bi-box-arrow-up"></i> then <strong>"Add to Home Screen"</strong></p>
          </div>

          <div v-else-if="isSafari" class="onboarding-ios-instructions">
            <p>Go to <strong>File → Add to Dock</strong> to install</p>
          </div>
        </template>

        <!-- Step: Gender Selection -->
        <template v-else-if="currentStep === STEP_GENDER">
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

        <!-- Step: Clothing Selection -->
        <template v-else-if="currentStep === STEP_CLOTHING">
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
              role="button"
              aria-label="Upload your own clothing"
              tabindex="0"
              @keydown.enter="triggerCustomClothingInput"
              @keydown.space.prevent="triggerCustomClothingInput"
            >
              <!-- Show preview if custom clothing file exists (regardless of selection state) -->
              <template v-if="customClothingPreviewUrl">
                <img
                  :src="customClothingPreviewUrl"
                  alt="Your clothing"
                  class="custom-clothing-preview"
                />
              </template>

              <!-- Show upload prompt if not selected -->
              <template v-else>
                <div class="onboarding-upload-content">
                  <i class="bi bi-plus-circle-fill onboarding-upload-icon"></i>
                </div>
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

        <!-- Step: Image Upload & Generation -->
        <template v-else-if="currentStep === STEP_UPLOAD">
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

        <!-- Step: Upgrade -->
        <template v-else-if="currentStep === STEP_UPGRADE">
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

      <!-- Action Button (hidden on upgrade step which has its own buttons) -->
      <button
        v-if="currentStep < STEP_UPGRADE"
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
      <div
        v-if="currentStep === STEP_UPLOAD && (showSkipOption || generationError)"
        class="skip-option"
      >
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
import { onInstallAvailable, triggerInstallPrompt, getIsStandalone } from '@/utils/pwa'

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
      isSubmitting: false,
      // PWA install state
      pwaCanInstall: false,
      pwaUnsubscribe: null,
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
      uploadedClothingId: null,
    }
  },
  computed: {
    userStore() {
      return useUserStore()
    },
    hasImageSelection() {
      return this.selectedFile !== null
    },
    // PWA step offset logic
    isIos() {
      return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream
    },
    isSafari() {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    },
    showDownloadStep() {
      return !getIsStandalone() && (this.pwaCanInstall || this.isIos || this.isSafari)
    },
    stepOffset() {
      return this.showDownloadStep ? 1 : 0
    },
    STEP_WELCOME() {
      return 0
    },
    STEP_DOWNLOAD() {
      return this.showDownloadStep ? 1 : -1
    },
    STEP_GENDER() {
      return 1 + this.stepOffset
    },
    STEP_CLOTHING() {
      return 2 + this.stepOffset
    },
    STEP_UPLOAD() {
      return 3 + this.stepOffset
    },
    STEP_UPGRADE() {
      return 4 + this.stepOffset
    },
    buttonText() {
      if (this.currentStep === this.STEP_WELCOME) return 'Start'
      if (this.currentStep === this.STEP_DOWNLOAD) return 'Continue'
      if (this.currentStep === this.STEP_UPLOAD) {
        if (this.isGenerating) return 'Designing...'
        if (this.generationSuccess) return 'Continue'
        if (this.generationError) return 'Retry'
        return 'Design'
      }
      return 'Continue'
    },
    canProceed() {
      if (this.currentStep === this.STEP_GENDER) return this.selectedGender !== null
      if (this.currentStep === this.STEP_CLOTHING) {
        // Allow proceeding if EITHER default clothing OR custom clothing selected
        return this.selectedClothingId !== null || this.isCustomClothingSelected
      }
      if (this.currentStep === this.STEP_UPLOAD) {
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
      // Progress bar shows on all steps except upgrade
      const visibleSteps = this.showDownloadStep ? 5 : 4
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
        return // Don't trigger file picker
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
        // Reset upload state if going back from upload step
        if (this.currentStep === this.STEP_UPLOAD) {
          this.resetUploadState()
        }
        this.currentStep--
      }
    },
    async handleAction() {
      if (this.currentStep === this.STEP_DOWNLOAD) {
        this.currentStep++
        return
      }

      if (this.currentStep === this.STEP_GENDER) {
        this.currentStep++
        this.isLoadingPreviews = true
        await this.fetchDefaultPreviews()
        return
      }

      if (this.currentStep === this.STEP_CLOTHING) {
        this.currentStep++
        return
      }

      if (this.currentStep === this.STEP_UPLOAD) {
        if (this.generationSuccess) {
          this.currentStep = this.STEP_UPGRADE
          return
        }

        await this.handleDesignClick()
        return
      }

      this.currentStep++
    },
    async handlePwaInstall() {
      posthog?.capture('install_button_clicked', { location: 'onboarding' })
      const outcome = await triggerInstallPrompt()
      if (outcome === 'accepted') {
        posthog?.capture('pwa_installed', { location: 'onboarding' })
      }
      // No need to increment currentStep here.
      // When pwaCanInstall goes false, showDownloadStep becomes false reactively,
      // stepOffset shifts to 0, and currentStep (1) now maps to STEP_GENDER (1).
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
      this.$emit('completed')

      const url = getCheckoutUrl(this.userStore.userCred.email)
      if (url) {
        window.location.href = url
      }
    },
    handleMaybeLater() {
      // Set localStorage triggers for pointing hand helpers
      localStorage.setItem('unmarble_showDesignHelper', 'true')
      localStorage.setItem('unmarble_showGalleryHelper', 'true')
      this.userStore.galleryHelperPending = true

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

        // Upload yourself image (skip if already uploaded on a previous attempt)
        if (!this.uploadedImageId) {
          const processedFile = await processImageForUpload(this.selectedFile)
          const uploadResult = await uploadImage('yourself', processedFile)

          if (!uploadResult.success) {
            throw new Error(uploadResult.error || 'Failed to upload image')
          }

          this.uploadedImageId = uploadResult.data.image_id
          this.userStore.addPreviewImage('yourself', uploadResult.data)
          this.userStore.updateStorageLeft(uploadResult.data.storage_left)
        }

        // Upload custom clothing if selected (skip if already uploaded)
        if (this.isCustomClothingSelected && this.customClothingFile && !this.uploadedClothingId) {
          const processedClothing = await processImageForUpload(this.customClothingFile)
          const clothingUploadResult = await uploadImage('clothing', processedClothing)

          if (!clothingUploadResult.success) {
            throw new Error(clothingUploadResult.error || 'Failed to upload clothing')
          }

          this.uploadedClothingId = clothingUploadResult.data.image_id
          this.userStore.addPreviewImage('clothing', clothingUploadResult.data)
          this.userStore.updateStorageLeft(clothingUploadResult.data.storage_left)
        }

        // Call design API with appropriate parameters
        const designResult = await designOnboarding(
          this.uploadedImageId,
          this.isCustomClothingSelected ? null : this.selectedClothingId,
          this.uploadedClothingId,
        )

        if (designResult.success) {
          this.generationSuccess = true
          this.generatedImageUrl = `data:image/webp;base64,${designResult.data.image_base64}`

          this.userStore.addPreviewImage('design', designResult.data)
          this.userStore.updateStorageLeft(designResult.data.storage_left)
          this.userStore.updateDesignsLeft(designResult.data.designs_left)
        } else {
          throw new Error(designResult.error || 'Generation failed')
        }
      } catch (error) {
        console.error('Upload/generation failed:', error)
        this.generationError = 'Something went wrong. Please try again or change your picture.'
      } finally {
        this.isGenerating = false
        clearTimeout(this.skipTimer)
        if (!this.generationError) {
          this.showSkipOption = false
        }
      }
    },
    handleSkip() {
      this.isGenerating = false
      clearTimeout(this.skipTimer)
      this.showSkipOption = false

      // Set localStorage triggers for pointing hand helpers
      localStorage.setItem('unmarble_showDesignHelper', 'true')
      localStorage.setItem('unmarble_showGalleryHelper', 'true')
      this.userStore.galleryHelperPending = true

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
      this.uploadedClothingId = null
      clearTimeout(this.skipTimer)
    },
  },
  created() {
    this.pwaUnsubscribe = onInstallAvailable((canInstall) => {
      this.pwaCanInstall = canInstall
    })
  },
  beforeUnmount() {
    if (this.pwaUnsubscribe) this.pwaUnsubscribe()
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
