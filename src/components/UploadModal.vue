<template>
  <!-- Upload Modal - Standalone upload for Gallery -->
  <div
    class="modal fade"
    :class="{ show: show, 'd-block': show }"
    tabindex="-1"
    v-if="show"
    @click.self="handleBackdropClick"
  >
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header justify-content-center position-relative">
          <h5 class="modal-title mb-0">Upload</h5>
          <button
            type="button"
            class="btn-close position-absolute end-0 me-3"
            @click="closeModal"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Hidden file input -->
          <input
            ref="fileInput"
            type="file"
            class="d-none"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
            @change="handleFileSelect"
          />

          <!-- Empty Dropzone (no file selected) -->
          <div
            v-if="!hasSelection"
            class="upload-dropzone-modal"
            @click="triggerFileSelection"
            @dragover.prevent
            @drop.prevent="handleDrop"
          >
            <i
              class="bi bi-cloud-upload-fill"
              style="font-size: 3rem; color: #00b7ed; opacity: 0.75"
            ></i>
            <h5>Drag and drop your picture in here</h5>
            <p class="nav-text text-muted">or click to browse files</p>
          </div>

          <!-- Preview (file selected) - clickable for re-selection -->
          <div
            v-else
            class="upload-dropzone-modal position-relative"
            @click="!isUploading && triggerFileSelection()"
            :style="{ cursor: isUploading ? 'not-allowed' : 'pointer' }"
          >
            <img :src="previewUrl" alt="Selected image" class="preview-image" />
            <!-- Uploading State -->
            <div v-if="uploadStatus === 'uploading'" class="upload-overlay">
              <div class="upload-feedback">
                <div class="spinner-border text-primary mb-2" role="status"></div>
                <p class="mb-0">Uploading...</p>
              </div>
            </div>

            <!-- Error State -->
            <div v-if="uploadStatus === 'error'" class="upload-overlay">
              <div class="upload-feedback">
                <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #333"></i>
                <p class="mb-0 fw-bold" style="color: #333; font-family: var(--font-family-base)">
                  {{ uploadMessage }}
                </p>
                <div class="d-flex gap-2 mt-2">
                  <button
                    class="btn btn-sm btn-outline-primary profile-go-btn"
                    style="
                      font-family: var(--font-family-base);
                      border-color: #00b7ed;
                      color: #00b7ed;
                    "
                    @click.stop="goToProfile"
                  >
                    <i class="bi bi-person-circle me-1"></i>Go to Profile
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    style="font-family: var(--font-family-base)"
                    @click.stop="uploadStatus = null"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Category selection and Upload button -->
          <div class="d-flex flex-row mt-4 justify-content-between align-items-center">
            <!-- Category selection (activates after file selection) -->
            <div>
              <button
                class="btn btn-sm me-2"
                :class="[
                  selectedCategory === 'yourself' ? 'btn-secondary' : 'btn-outline-secondary',
                  { 'category-btn-active': canSelectCategory && !selectedCategory },
                ]"
                @click="selectedCategory = 'yourself'"
                :disabled="!canSelectCategory"
              >
                <i class="bi bi-person-fill"></i> Yourself
              </button>
              <button
                class="btn btn-sm"
                :class="[
                  selectedCategory === 'clothing' ? 'btn-secondary' : 'btn-outline-secondary',
                  { 'category-btn-active': canSelectCategory && !selectedCategory },
                ]"
                @click="selectedCategory = 'clothing'"
                :disabled="!canSelectCategory"
              >
                <i class="bi bi-tencent-qq"></i> Clothing
              </button>
            </div>

            <!-- Upload button -->
            <button
              class="upload-btn"
              :class="{ 'upload-btn-active': canUpload }"
              :disabled="!canUpload"
              @click="uploadFile"
            >
              <span><i class="bi bi-upload me-2"></i>Upload</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal Backdrop -->
  <div v-if="show" class="modal-backdrop fade show"></div>

  <!-- Limit Modal -->
  <LimitModal
    :isOpen="showLimitModal"
    limitType="storage"
    :userType="userType"
    :nextRenewalDate="nextRenewalDate"
    @close="closeLimitModal"
    @upgrade="handleUpgrade"
  />
</template>

<script>
import { uploadImage, getCheckoutUrl } from '@/api/api'
import { mapStores } from 'pinia'
import useUserStore from '@/stores/user'
import heic2any from 'heic2any'
import LimitModal from '@/components/LimitModal.vue'

export default {
  name: 'UploadModal',
  components: {
    LimitModal,
  },
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
  emits: ['close', 'uploaded'],
  data() {
    return {
      selectedFile: null,
      previewUrl: null,
      selectedCategory: null,
      isUploading: false,
      uploadStatus: null,
      uploadMessage: '',
      showLimitModal: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    hasSelection() {
      return this.selectedFile !== null
    },
    canSelectCategory() {
      return this.selectedFile && !this.isUploading
    },
    canUpload() {
      return this.selectedFile && this.selectedCategory && !this.isUploading
    },
    userType() {
      return this.userStore?.userCred?.type || 'trial'
    },
    nextRenewalDate() {
      return this.userStore?.userCred?.nextRenewalDate || null
    },
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Reset state when modal opens
        this.resetUploadState()
        // Add escape key listener
        window.addEventListener('keydown', this.handleEscape)
      } else {
        // Remove escape key listener when modal closes
        window.removeEventListener('keydown', this.handleEscape)
      }
    },
  },
  methods: {
    // Modal controls
    closeModal() {
      this.$emit('close')
    },
    handleBackdropClick() {
      this.closeModal()
    },
    handleEscape(event) {
      if (event.key === 'Escape') {
        this.closeModal()
      }
    },

    // File selection methods
    triggerFileSelection() {
      this.$refs.fileInput.click()
    },
    handleFileSelect(event) {
      const file = event.target.files[0]
      this.processFile(file)
      event.target.value = ''
    },
    handleDrop(event) {
      const file = event.dataTransfer.files[0]
      this.processFile(file)
    },
    async processFile(file) {
      if (!file) return

      const maxSize = 5 * 1024 * 1024
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
      ]

      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, WEBP, HEIC)')
        return
      }

      if (file.size > maxSize) {
        alert('Please upload files smaller than 5MB')
        return
      }

      let processedFile = file

      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
          })
          processedFile = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
            type: 'image/jpeg',
          })
        } catch (error) {
          alert('Failed to convert HEIC image. Please try a different format.')
          return
        }
      }

      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }

      this.selectedFile = processedFile
      this.previewUrl = URL.createObjectURL(processedFile)
      this.uploadStatus = null
      this.uploadMessage = ''
    },
    async uploadFile() {
      if (!this.selectedFile || !this.selectedCategory) {
        alert('Please select picture and category')
        return
      }

      // Check storage
      if (this.userStore.userLimits.storageLeft <= 0) {
        this.showLimitModal = true
        return
      }

      this.uploadStatus = 'uploading'
      this.uploadMessage = ''
      this.isUploading = true

      try {
        const fileBase64 = await this.convertFile(this.selectedFile)
        const result = await uploadImage(this.selectedCategory, fileBase64)

        if (result.success) {
          this.uploadStatus = 'success'
          this.uploadMessage = 'Upload Successful'
          this.userStore.addPreviewImage(this.selectedCategory, result.data)
          this.userStore.updateStorageLeft(result.data.storage_left)

          // Emit uploaded event and close modal
          this.$emit('uploaded', this.selectedCategory)
          this.closeModal()
        } else {
          this.uploadStatus = 'error'
          if (result.error.includes('Insufficient') || result.error.includes('storage')) {
            this.showLimitModal = true
            this.uploadMessage = 'No storage space remaining. Please upgrade to premium.'
          } else {
            this.uploadMessage = `Upload Failed: ${result.error}`
          }
        }
      } catch (error) {
        this.uploadStatus = 'error'
        this.uploadMessage = `Upload Error: ${error.message}`
      } finally {
        this.isUploading = false
      }
    },
    convertFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => {
          const base64String = reader.result.split(',')[1]
          resolve(base64String)
        }
        reader.onerror = (error) => reject(error)
      })
    },
    resetUploadState() {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }
      this.selectedFile = null
      this.previewUrl = null
      this.selectedCategory = null
      this.isUploading = false
      this.uploadStatus = null
      this.uploadMessage = ''
    },
    goToProfile() {
      this.closeModal()
      this.$router.push('/profile')
    },
    closeLimitModal() {
      this.showLimitModal = false
    },
    handleUpgrade() {
      this.showLimitModal = false
      this.closeModal()
      const checkoutUrl = getCheckoutUrl(this.userStore?.userCred?.email || '')
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    },
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.handleEscape)
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl)
    }
  },
}
</script>
