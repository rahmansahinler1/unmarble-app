<template>
  <div class="container-fluid h-100 d-flex flex-column">
    <h1 class="dashboard-title mb-3 text-center">Create Your Outfit</h1>

    <div class="row h-100 align-items-center justify-content-center gx-3">
      <!-- Yourself Card -->
      <div class="col-auto">
        <h3 class="card-title mb-3 text-center"><i class="bi bi-person-fill me-2"></i>Yourself</h3>
        <div
          class="selection-card"
          :class="{ disabled: loadingCards.yourself || errorCards.yourself || isGenerating }"
          @click="
            !loadingCards.yourself && !errorCards.yourself && !isGenerating && openModal('yourself')
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
            :disabled="!selections.yourself || isGenerating"
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
          :class="{ disabled: loadingCards.clothing || errorCards.clothing || isGenerating }"
          @click="
            !loadingCards.clothing && !errorCards.clothing && !isGenerating && openModal('clothing')
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
            :disabled="!selections.clothing || isGenerating"
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

      <!-- Generated Result Card -->
      <div class="col-auto">
        <h3 class="card-title mb-3 text-center"><i class="bi bi-camera-fill me-1"></i>Result</h3>
        <div
          class="selection-card"
          :class="{ clickable: generatedImage }"
          @click="generatedImage && openGeneratedImageModal()"
        >
          <!-- Error State -->
          <div v-if="generationError" class="card-error-overlay">
            <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #333"></i>
            <p class="mb-0 fw-bold" style="color: #333; font-family: var(--font-family-base)">
              {{ generationError }}
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
                @click="generationError = null"
              >
                Dismiss
              </button>
            </div>
          </div>

          <!-- Generating State -->
          <div v-else-if="isGenerating" class="card-loading-overlay">
            <div class="spinner-border text-primary mb-2" role="status"></div>
          </div>

          <!-- Generated Image -->
          <img v-else-if="generatedImage" :src="generatedImage" alt="Generated result" />

          <!-- Select Pictures condition -->
          <p v-else-if="!canGenerate" class="nav-text">
            <i class="bi bi-arrow-left-circle-fill me-1"></i>Select Pictures
          </p>

          <!-- Can generate trigger -->
          <p v-else class="nav-text"><i class="bi bi-magic me-1"></i>Click Generate Button</p>
        </div>

        <!-- Download button -->
        <div class="d-flex justify-content-center mt-3">
          <button
            class="btn btn-outline-secondary btn-sm"
            :disabled="!generatedImage"
            @click="downloadGeneratedImage"
          >
            <i class="bi bi-download me-2"></i> Download
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Button -->
    <div class="row">
      <div class="col-12 text-center mb-4">
        <button
          class="generate-btn"
          :class="{ 'generate-btn-active': canGenerate }"
          :disabled="!canGenerate"
          @click="designImage"
        >
          <span>Generate</span>
          <span><i class="bi bi-magic"></i> {{ userStore.userLimits.generationsLeft || 0 }}</span>
        </button>
      </div>
    </div>

    <!-- Selection Modal -->
    <div
      class="modal fade"
      :class="{ show: showModal, 'd-block': showModal }"
      tabindex="-1"
      v-if="showModal"
      @click.self="closeModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
            <h5 class="modal-title">
              {{ modalCategory === 'yourself' ? 'Select Your Picture' : 'Select Clothing Picture' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Gallery Grid -->
            <div class="gallery-grid">
              <div
                v-for="image in filteredImages"
                :key="image.id"
                class="gallery-item"
                :class="{ selected: selectedImageId === image.id }"
                @click="selectImage(image.id)"
                @dblclick="handleDoubleClick(image.id)"
              >
                <div class="gallery-image-wrapper">
                  <img :src="image.base64" :alt="modalCategory" />
                </div>
              </div>
              <!-- Upload button -->
              <div class="gallery-item">
                <div class="gallery-image-wrapper">
                  <div class="gallery-upload-content">
                    <i
                      class="bi bi-plus-circle-fill gallery-upload-icon"
                      @click="this.$router.push('/upload')"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" @click="closeModal">
              Cancel
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :disabled="!selectedImageId"
              @click="confirmSelection"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal Backdrop -->
    <div v-if="showModal" class="modal-backdrop fade show"></div>

    <!-- Generated Image Modal -->
    <div
      class="modal fade"
      :class="{ show: showGeneratedModal, 'd-block': showGeneratedModal }"
      tabindex="-1"
      v-if="showGeneratedModal"
      @click.self="closeGeneratedModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header">
            <h5 class="modal-title">Generated Image</h5>
            <button type="button" class="btn-close" @click="closeGeneratedModal"></button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body text-center">
            <img
              v-if="generatedImage"
              :src="generatedImage"
              alt="Generated outfit"
              class="img-fluid"
              style="max-height: 70vh"
            />
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-outline-secondary" @click="closeGeneratedModal">
              Close
            </button>
            <button type="button" class="btn btn-primary" @click="downloadGeneratedImage">
              <i class="bi bi-download me-2"></i>Download
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Generated Modal Backdrop -->
    <div v-if="showGeneratedModal" class="modal-backdrop fade show"></div>

    <!-- Error Popup Modal -->
    <div
      class="modal fade"
      :class="{ show: showErrorPopup, 'd-block': showErrorPopup }"
      tabindex="-1"
      v-if="showErrorPopup"
      @click.self="showErrorPopup = false"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <!-- Modal Body -->
          <div class="modal-body text-center py-4">
            <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #333"></i>
            <p class="mb-0 fw-bold mt-3" style="color: #333; font-family: var(--font-family-base)">
              {{ errorMessage }}
            </p>
            <div class="d-flex gap-2 mt-3 justify-content-center">
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
                @click="showErrorPopup = false"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Error Popup Backdrop -->
    <div v-if="showErrorPopup" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { getImage, designImage } from '@/api/api'

export default {
  name: 'Design',
  data() {
    return {
      showModal: false,
      modalCategory: null,
      selectedImageId: null,
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
      showGeneratedModal: false,
      generatedImage: null,
      isGenerating: false,
      generationError: null,
      showErrorPopup: false,
      errorMessage: '',
    }
  },
  computed: {
    ...mapStores(useUserStore),
    canGenerate() {
      return this.selections.yourself && this.selections.clothing && !this.isGenerating
    },
    filteredImages() {
      if (!this.modalCategory) return []

      if (this.modalCategory === 'yourself') {
        return this.userStore?.previewImages?.yourself || []
      } else if (this.modalCategory === 'clothing') {
        return this.userStore?.previewImages?.clothing || []
      }

      return []
    },
  },
  methods: {
    openModal(category) {
      this.modalCategory = category
      this.showModal = true
      this.selectedImageId = null
    },
    closeModal() {
      this.showModal = false
      this.selectedImageId = null
      this.modalCategory = null
    },
    selectImage(imageId) {
      this.selectedImageId = imageId
    },
    handleDoubleClick(imageId) {
      this.selectedImageId = imageId
      this.confirmSelection()
    },
    async confirmSelection() {
      if (!this.selectedImageId || !this.modalCategory) return

      // Store values before clearing state
      const selectedId = this.selectedImageId
      const category = this.modalCategory

      // Create unique request ID to handle race conditions
      const requestId = Date.now()
      this.pendingRequests[category] = requestId

      // Close modal and reset state
      this.showModal = false
      this.selectedImageId = null
      this.modalCategory = null

      this.loadingCards[category] = true

      try {
        const result = await getImage(selectedId)

        // Check if this is still the latest request (race condition protection)
        if (this.pendingRequests[category] !== requestId) {
          return // Ignore outdated response
        }

        if (result.success) {
          this.selections[category] = {
            id: selectedId,
            base64: `data:image/jpeg;base64,${result.data.image_base64}`,
          }
          this.loadingCards[category] = false
          this.pendingRequests[category] = null
        } else {
          // API returned success: false
          this.loadingCards[category] = false
          this.pendingRequests[category] = null
          this.showError(category, result.error || 'Failed to load image')
        }
      } catch (error) {
        // Only show error if still latest request
        if (this.pendingRequests[category] === requestId) {
          this.loadingCards[category] = false
          this.pendingRequests[category] = null
          this.showError(category, 'Network error. Please try again.')
        }
      }
    },
    showError(category, message) {
      // Clear existing timeout if any
      if (this.errorTimeouts[category]) {
        clearTimeout(this.errorTimeouts[category])
      }

      this.errorCards[category] = message

      // Store timeout ID for cleanup
      this.errorTimeouts[category] = setTimeout(() => {
        this.errorCards[category] = null
        this.errorTimeouts[category] = null
      }, 5000)
    },
    dismissError(category) {
      // Clear timeout if exists
      if (this.errorTimeouts[category]) {
        clearTimeout(this.errorTimeouts[category])
        this.errorTimeouts[category] = null
      }
      this.errorCards[category] = null
    },
    handleEscape(event) {
      if (event.key === 'Escape' && this.showModal) {
        this.closeModal()
      }
    },
    async designImage() {
      if (!this.selections.yourself || !this.selections.clothing) return

      if (this.userStore.userLimits.generationsLeft <= 0) {
        this.showErrorPopup = true
        this.errorMessage = 'No generation credits left'
        return
      }

      this.isGenerating = true
      this.generationError = null

      try {
        const result = await designImage(this.selections.yourself.id, this.selections.clothing.id)

        if (result.success) {
          this.generatedImage = `data:image/jpeg;base64,${result.data.image_base64}`
          // Add to Gallery as 'design' category
          this.userStore.addPreviewImage('design', {
            image_id: result.data.image_id,
            preview_base64: result.data.preview_base64,
            faved: false,
            created_at: result.data.created_at,
          })
          this.userStore.updateGenerationsLeft(result.data.generations_left)
          // recentsLeft update removed - handled in future update
        } else {
          this.generationError = result.error || 'Generation failed. Please try again.'
        }
      } catch (error) {
        this.generationError = error.message || 'Generation error. Please try again.'
      } finally {
        this.isGenerating = false
      }
    },
    openGeneratedImageModal() {
      if (this.generatedImage) {
        this.showGeneratedModal = true
      }
    },
    closeGeneratedModal() {
      this.showGeneratedModal = false
    },
    downloadGeneratedImage() {
      if (!this.generatedImage) return

      const link = document.createElement('a')
      link.href = this.generatedImage
      link.download = `generated-outfit-${Date.now()}.jpg`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
    },
    goToProfile() {
      this.showErrorPopup = false
      this.generationError = null
      this.$router.push('/profile')
    },
  },
  mounted() {
    window.addEventListener('keydown', this.handleEscape)
  },
  beforeUnmount() {
    // Clear all timeouts on component destroy
    Object.values(this.errorTimeouts).forEach((timeout) => {
      if (timeout) clearTimeout(timeout)
    })
    // Remove event listener
    window.removeEventListener('keydown', this.handleEscape)
  },
}
</script>
