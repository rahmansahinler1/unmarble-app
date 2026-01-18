<template>
  <div class="container-fluid h-100 d-flex flex-column">
    <h1 class="dashboard-title mb-3 text-center">Design Your Outfit</h1>

    <div class="row h-100 align-items-center justify-content-center gx-3">
      <!-- Yourself Card -->
      <div class="col-auto">
        <h3 class="card-title mb-3 text-center"><i class="bi bi-person-fill me-2"></i>Yourself</h3>
        <div
          class="selection-card"
          :class="{ disabled: loadingCards.yourself || errorCards.yourself || isDesigning }"
          @click="
            !loadingCards.yourself && !errorCards.yourself && !isDesigning && openModal('yourself')
          "
        >
          <!-- Error State -->
          <div v-if="errorCards.yourself" class="card-error-overlay">
            <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem"></i>
            <p class="nav-text text-danger mb-0 mt-2">{{ errorCards.yourself }}</p>
            <button
              class="btn btn-sm btn-outline-danger mt-2"
              @click.stop="dismissError('yourself')"
            >
              Dismiss
            </button>
          </div>

          <!-- Loading State -->
          <div v-else-if="loadingCards.yourself" class="card-loading-overlay">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="nav-text text-muted mb-0">Loading image...</p>
          </div>

          <!-- Selected Image -->
          <img
            v-else-if="selections.yourself"
            :src="selections.yourself.base64"
            alt="Selected yourself image"
          />

          <!-- Placeholder -->
          <p v-else class="nav-text"><i class="bi bi-hand-index-thumb me-1"></i>Click to select</p>
        </div>
        <div class="d-flex justify-content-center mt-3">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!selections.yourself || isDesigning"
            @click="openModal('yourself')"
          >
            <i class="bi bi-arrow-clockwise me-1"></i> Replace
          </button>
        </div>
      </div>

      <!-- Plus Icon -->
      <div class="col-auto d-flex align-items-center" style="margin-top: 3rem">
        <img src="/assets/img/ic_swap_add.svg" alt="plus" class="separator-icon" />
      </div>

      <!-- Clothing Card -->
      <div class="col-auto">
        <h3 class="card-title mb-3 text-center"><i class="bi bi-tencent-qq me-2"></i>Clothing</h3>
        <div
          class="selection-card"
          :class="{ disabled: loadingCards.clothing || errorCards.clothing || isDesigning }"
          @click="
            !loadingCards.clothing && !errorCards.clothing && !isDesigning && openModal('clothing')
          "
        >
          <!-- Error State -->
          <div v-if="errorCards.clothing" class="card-error-overlay">
            <i class="bi bi-exclamation-circle text-danger" style="font-size: 3rem"></i>
            <p class="nav-text text-danger mb-0 mt-2">{{ errorCards.clothing }}</p>
            <button
              class="btn btn-sm btn-outline-danger mt-2"
              @click.stop="dismissError('clothing')"
            >
              Dismiss
            </button>
          </div>

          <!-- Loading State -->
          <div v-else-if="loadingCards.clothing" class="card-loading-overlay">
            <div class="spinner-border text-primary mb-2" role="status"></div>
            <p class="nav-text text-muted mb-0">Loading image...</p>
          </div>

          <!-- Selected Image -->
          <img
            v-else-if="selections.clothing"
            :src="selections.clothing.base64"
            alt="Selected clothing image"
          />

          <!-- Placeholder -->
          <p v-else class="nav-text"><i class="bi bi-hand-index-thumb me-1"></i>Click to select</p>
        </div>
        <div class="d-flex justify-content-center mt-3">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!selections.clothing || isDesigning"
            @click="openModal('clothing')"
          >
            <i class="bi bi-arrow-clockwise me-1"></i> Replace
          </button>
        </div>
      </div>

      <!-- Result Arrow Icon -->
      <div class="col-auto d-flex align-items-center" style="margin-top: 3rem">
        <img src="/assets/img/ic_swap_result.svg" alt="result" class="separator-icon" />
      </div>

      <!-- Designed Result Card -->
      <div class="col-auto">
        <h3 class="card-title mb-3 text-center"><i class="bi bi-camera-fill me-1"></i>Result</h3>
        <div
          class="selection-card"
          :class="{
            clickable: designedImage,
            'ready-to-design': canDesign && !designedImage && !isDesigning && !designError,
          }"
          @click="handleResultCardClick"
        >
          <!-- Error State -->
          <div v-if="designError" class="card-error-overlay">
            <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #333"></i>
            <p
              class="mb-0 fw-bold"
              style="
                color: #333;
                font-family: var(--font-family-base);
                white-space: pre-line;
                max-width: 90%;
                text-align: center;
              "
            >
              {{ designError }}
            </p>
            <div class="d-flex gap-2 mt-2">
              <button
                class="btn btn-sm btn-outline-primary profile-go-btn"
                style="font-family: var(--font-family-base); border-color: #00b7ed; color: #00b7ed"
                @click="goToProfile"
              >
                <i class="bi bi-person-circle me-1"></i>Go to Profile
              </button>
              <button
                class="btn btn-sm btn-outline-danger"
                style="font-family: var(--font-family-base)"
                @click="designError = null"
              >
                Dismiss
              </button>
            </div>
          </div>

          <!-- Designing State -->
          <div v-else-if="isDesigning" class="card-loading-overlay">
            <div class="spinner-border text-primary mb-2" role="status"></div>
          </div>

          <!-- Designed Image -->
          <img v-else-if="designedImage" :src="designedImage" alt="Designed result" />

          <!-- Select Pictures condition -->
          <p v-else-if="!canDesign" class="nav-text">
            <i class="bi bi-arrow-left-circle-fill me-1"></i>Select Pictures
          </p>

          <!-- Can design trigger -->
          <p v-else class="nav-text"><i class="bi bi-cursor me-1"></i>Click to Design</p>
        </div>

        <!-- Design, Redesign and Download buttons -->
        <div class="d-flex justify-content-center mt-3 gap-2 design-actions-row">
          <button
            class="design-btn"
            :class="{ 'design-btn-active': canDesign }"
            :disabled="!canDesign"
            @click="designImage"
          >
            <span>Design</span>
            <span><i class="bi bi-magic"></i> {{ userStore.userLimits.designsLeft || 0 }}</span>
          </button>
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!designedImage"
            @click="redesignImage"
          >
            <i class="bi bi-arrow-90deg-left me-2"></i> Redesign
          </button>
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!designedImage"
            @click="downloaddesignedImage"
          >
            <i class="bi bi-download me-2"></i> Download
          </button>
        </div>
      </div>
    </div>

    <!-- Design Button (desktop only) -->
    <div class="row design-btn-desktop-row">
      <div class="col-12 text-center mb-4">
        <button
          class="design-btn"
          :class="{ 'design-btn-active': canDesign }"
          :disabled="!canDesign"
          @click="designImage"
        >
          <span>Design</span>
          <span><i class="bi bi-magic"></i> {{ userStore.userLimits.designsLeft || 0 }}</span>
        </button>
      </div>
    </div>

    <!-- Selection Modal -->
    <SelectionModal
      :show="showModal"
      :category="modalCategory || 'yourself'"
      :images="filteredImages"
      @close="closeModal"
      @select="handleImageSelected"
    />

    <!-- Designed Image Modal -->
    <div
      class="modal fade"
      :class="{ show: showDesignedModal, 'd-block': showDesignedModal }"
      tabindex="-1"
      v-if="showDesignedModal"
      @click.self="closeDesignedModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
            <h5 class="modal-title">Designed Image</h5>
            <button type="button" class="btn-close" @click="closeDesignedModal"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body text-center">
            <img
              v-if="designedImage"
              :src="designedImage"
              alt="Designed outfit"
              class="img-fluid"
              style="max-height: 70vh"
            />
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-outline-secondary" @click="closeDesignedModal">
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="downloaddesignedImage">
              <i class="bi bi-download me-2"></i>Download
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Designed Modal Backdrop -->
    <div v-if="showDesignedModal" class="modal-backdrop fade show"></div>

    <!-- Limit Modal -->
    <LimitModal
      :isOpen="showLimitModal"
      :limitType="limitModalType"
      :userType="userType"
      :nextRenewalDate="nextRenewalDate"
      @close="closeLimitModal"
      @upgrade="handleUpgrade"
    />

    <!-- Pointing Hand Helper -->
    <PointingHand
      v-if="showPointingHand"
      target=".col-auto:nth-child(1) .selection-card"
      position="center"
      :show="showPointingHand"
      @dismiss="handlePointingHandDismiss"
      @target-click="handlePointingHandDismiss"
      @click-outside="handlePointingHandDismiss"
    />
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { getImage, getDesign, designImage, getCheckoutUrl } from '@/api/api'
import SelectionModal from '@/components/SelectionModal.vue'
import LimitModal from '@/components/LimitModal.vue'
import PointingHand from '@/components/PointingHand.vue'
import { posthog } from '@/utils/posthog'

const CONTENT_SAFETY_MESSAGE = `⚠️ Content Safety Violation

The uploaded images or generated content violate our safety policies.

Please ensure:
• All uploaded images are appropriate
• You're not attempting to generate NSFW content
• Clothing items are suitable for public settings

Repeated violations may result in account suspension.`

export default {
  name: 'Design',
  components: {
    SelectionModal,
    LimitModal,
    PointingHand,
  },
  data() {
    return {
      showModal: false,
      modalCategory: null,
      selections: {
        yourself: null,
        clothing: null,
      },
      loadingCards: {
        yourself: false,
        clothing: false,
      },
      errorCards: {
        yourself: null,
        clothing: null,
      },
      errorTimeouts: {
        yourself: null,
        clothing: null,
      },
      pendingRequests: {
        yourself: null,
        clothing: null,
      },
      showDesignedModal: false,
      designedImage: null,
      designedImageId: null,
      isDesigning: false,
      designError: null,
      showLimitModal: false,
      limitModalType: 'design',
      showPointingHand: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    canDesign() {
      return this.selections.yourself && this.selections.clothing && !this.isDesigning
    },
    userType() {
      return this.userStore?.userCred?.type || 'trial'
    },
    nextRenewalDate() {
      return this.userStore?.userCred?.nextRenewalDate || null
    },
    filteredImages() {
      if (!this.modalCategory) return []

      const yourself = this.userStore?.previewImages?.yourself || []
      const clothing = this.userStore?.previewImages?.clothing || []
      const design = this.userStore?.previewImages?.design || []

      let images = []
      if (this.modalCategory === 'yourself') {
        images = [
          ...yourself.map((img) => ({ ...img, category: 'yourself' })),
          ...design.map((img) => ({ ...img, category: 'design' })),
        ]
      } else if (this.modalCategory === 'clothing') {
        images = [...clothing.map((img) => ({ ...img, category: 'clothing' }))]
      }

      return images.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    },
  },
  methods: {
    handleResultCardClick() {
      if (this.designedImage) {
        this.opendesignedImageModal()
      } else if (this.canDesign && !this.designError) {
        this.designImage()
      }
    },
    openModal(category) {
      this.modalCategory = category
      this.showModal = true
    },
    closeModal() {
      this.showModal = false
      this.modalCategory = null
    },
    handleImageSelected(imageId, imageCategory) {
      if (!imageId || !imageCategory || !this.modalCategory) return

      this.loadSelection(imageId, imageCategory, this.modalCategory)
    },
    async loadSelection(imageId, imageCategory, modalCategory) {
      const requestId = Date.now()

      this.pendingRequests[modalCategory] = requestId
      this.loadingCards[modalCategory] = true

      try {
        let result

        if (imageCategory === 'design') {
          result = await getDesign(imageId)
        } else {
          result = await getImage(imageId)
        }

        if (this.pendingRequests[modalCategory] !== requestId) {
          return
        }

        if (result.success) {
          this.selections[modalCategory] = {
            id: imageId,
            category: imageCategory,
            base64: `data:image/jpeg;base64,${result.data.image_base64}`,
          }
          this.loadingCards[modalCategory] = false
          this.pendingRequests[modalCategory] = null
        } else {
          this.loadingCards[modalCategory] = false
          this.pendingRequests[modalCategory] = null
          this.showError(modalCategory, result.error || 'Failed to load image')
        }
      } catch (error) {
        if (this.pendingRequests[modalCategory] === requestId) {
          this.loadingCards[modalCategory] = false
          this.pendingRequests[modalCategory] = null
          this.showError(modalCategory, 'Network error. Please try again.')
        }
      }
    },
    showError(category, message) {
      if (this.errorTimeouts[category]) {
        clearTimeout(this.errorTimeouts[category])
      }

      this.errorCards[category] = message

      this.errorTimeouts[category] = setTimeout(() => {
        this.errorCards[category] = null
        this.errorTimeouts[category] = null
      }, 5000)
    },
    dismissError(category) {
      if (this.errorTimeouts[category]) {
        clearTimeout(this.errorTimeouts[category])
        this.errorTimeouts[category] = null
      }
      this.errorCards[category] = null
    },
    async designImage() {
      if (!this.selections.yourself || !this.selections.clothing) return

      posthog.capture('design_button_clicked', { button_location: 'main' })

      if (this.userStore.userLimits.storageLeft <= 0) {
        this.limitModalType = 'storage'
        this.showLimitModal = true
        return
      }

      if (this.userStore.userLimits.designsLeft <= 0) {
        this.limitModalType = 'design'
        this.showLimitModal = true
        return
      }

      this.isDesigning = true
      this.designError = null

      try {
        const result = await designImage(
          this.selections.yourself.id,
          this.selections.clothing.id,
          this.selections.yourself.category,
        )

        if (result.success) {
          this.designedImage = `data:image/jpeg;base64,${result.data.image_base64}`
          this.designedImageId = result.data.image_id

          this.userStore.addPreviewImage('design', {
            image_id: result.data.image_id,
            preview_base64: result.data.preview_base64,
            faved: false,
            created_at: result.data.created_at,
          })

          this.userStore.updateDesignsLeft(result.data.designs_left)
          this.userStore.updateStorageLeft(result.data.storage_left)
        } else {
          // Check for content safety violations
          const errorMsg = result.error || 'Design failed. Please try again.'
          if (errorMsg.includes('Content Safety Violation')) {
            this.designError = CONTENT_SAFETY_MESSAGE
          } else {
            this.designError = errorMsg
          }
        }
      } catch (error) {
        const errorMsg = error.message || 'Design error. Please try again.'
        if (errorMsg.includes('Content Safety Violation')) {
          this.designError = CONTENT_SAFETY_MESSAGE
        } else {
          this.designError = errorMsg
        }
      } finally {
        this.isDesigning = false
      }
    },
    opendesignedImageModal() {
      if (this.designedImage) {
        this.showDesignedModal = true
        window.addEventListener('keydown', this.handleDesignedModalEscape)
      }
    },
    closeDesignedModal() {
      this.showDesignedModal = false
      window.removeEventListener('keydown', this.handleDesignedModalEscape)
    },
    handleDesignedModalEscape(event) {
      if (event.key === 'Escape') {
        this.closeDesignedModal()
      }
    },
    downloaddesignedImage() {
      if (!this.designedImage) return

      const link = document.createElement('a')
      link.href = this.designedImage
      link.download = `designed-outfit-${Date.now()}.jpg`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
    },
    redesignImage() {
      if (!this.designedImage || !this.designedImageId) return

      this.selections.yourself = {
        id: this.designedImageId,
        category: 'design',
        base64: this.designedImage,
      }

      this.selections.clothing = null
      this.designedImage = null
      this.designedImageId = null
    },
    goToProfile() {
      this.designError = null
      this.$router.push('/profile')
    },
    closeLimitModal() {
      this.showLimitModal = false
    },
    handleUpgrade() {
      posthog.capture('upgrade_button_clicked', { source: 'modal' })
      this.showLimitModal = false
      const checkoutUrl = getCheckoutUrl(this.userStore?.userCred?.email || '')
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      } else {
        this.$router.push('/pricing')
      }
    },
    async checkForGallerySelections() {
      const { yourself, clothing } = this.userStore.gallerySelections

      if (!yourself && !clothing) return

      // Load both selections in parallel
      const promises = []
      if (yourself) {
        promises.push(this.loadSelection(yourself.id, yourself.category, 'yourself'))
      }
      if (clothing) {
        promises.push(this.loadSelection(clothing.id, clothing.category, 'clothing'))
      }

      await Promise.all(promises)
      this.userStore.clearGallerySelections()
    },
    handlePointingHandDismiss() {
      this.showPointingHand = false
      localStorage.setItem('unmarble_showDesignHelper', 'false')
    },
  },
  mounted() {
    this.checkForGallerySelections()

    // Check if we should show pointing hand helper (after onboarding)
    if (localStorage.getItem('unmarble_showDesignHelper') === 'true') {
      // Use setTimeout to ensure DOM is fully rendered
      setTimeout(() => {
        this.showPointingHand = true
      }, 100)
    }
  },
  beforeUnmount() {
    Object.values(this.errorTimeouts).forEach((timeout) => {
      if (timeout) clearTimeout(timeout)
    })
    window.removeEventListener('keydown', this.handleDesignedModalEscape)
  },
}
</script>
