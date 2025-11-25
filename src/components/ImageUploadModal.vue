<template>
  <!-- Image Upload Modal - Combined Selection + Upload -->
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
        <div class="modal-header">
          <div class="d-flex align-items-center">
            <button
              v-if="currentView === 'upload'"
              type="button"
              class="btn btn-link p-0 me-2"
              @click="switchToSelection"
            >
              <i class="bi bi-arrow-left" style="font-size: 1.25rem; color: #5d5d5d"></i>
            </button>
            <h5 class="modal-title mb-0">
              {{ modalTitle }}
            </h5>
          </div>
          <button type="button" class="btn-close" @click="closeModal"></button>
        </div>

        <!-- Modal Body with Transition -->
        <div class="modal-body">
          <Transition name="view-fade" mode="out-in">
            <!-- Selection View -->
            <div v-if="currentView === 'selection'" key="selection">
              <div class="gallery-grid">
                <div
                  v-for="image in images"
                  :key="image.id"
                  class="gallery-item"
                  :class="{ selected: selectedImageId === image.id }"
                  @click="selectImage(image.id)"
                  @dblclick="handleDoubleClick(image.id)"
                >
                  <div class="gallery-image-wrapper">
                    <img :src="image.base64" :alt="category" />
                  </div>
                </div>
                <!-- Upload button -->
                <div class="gallery-item">
                  <div class="gallery-image-wrapper">
                    <div class="gallery-upload-content">
                      <i
                        class="bi bi-plus-circle-fill gallery-upload-icon"
                        @click="switchToUpload"
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload View -->
            <div v-else-if="currentView === 'upload'" key="upload">
              <!-- Hidden file input -->
              <input
                ref="fileInput"
                type="file"
                class="d-none"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                @change="handleFileSelect"
              />

              <!-- Dropzone -->
              <div
                v-if="!hasSelection"
                class="upload-dropzone-modal"
                @click="triggerFileSelection"
                @dragover.prevent
                @drop.prevent="handleDrop"
              >
                <i class="bi bi-cloud-upload-fill" style="font-size: 3rem; color: #5d5d5d"></i>
                <h5>Drag and drop your picture in here</h5>
                <p class="nav-text text-muted">or click to browse files</p>
                <button class="btn btn-outline-primary">Browse Files</button>
              </div>

              <!-- Preview with upload states -->
              <div v-else class="upload-dropzone-modal position-relative">
                <img :src="previewUrl" alt="Selected image" class="preview-image" />
                <!-- Upload Overlay -->
                <div v-if="uploadStatus" class="upload-overlay">
                  <!-- Uploading State -->
                  <div v-if="uploadStatus === 'uploading'" class="upload-feedback">
                    <div class="spinner-border text-primary mb-2" role="status"></div>
                    <p class="mb-0">Uploading...</p>
                  </div>

                  <!-- Success State -->
                  <div v-if="uploadStatus === 'success'" class="upload-feedback text-success">
                    <i class="bi bi-check-circle" style="font-size: 3rem"></i>
                    <p class="mb-0 fw-bold">{{ uploadMessage }}</p>
                  </div>

                  <!-- Error State -->
                  <div v-if="uploadStatus === 'error'" class="upload-feedback">
                    <i class="bi bi-emoji-frown" style="font-size: 3rem; color: #333"></i>
                    <p
                      class="mb-0 fw-bold"
                      style="color: #333; font-family: var(--font-family-base)"
                    >
                      {{ uploadMessage }}
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
                        @click="uploadStatus = null"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Category and Action buttons -->
              <div class="d-flex flex-row mt-4 justify-content-between align-items-start">
                <div>
                  <h6 class="section-title">Category</h6>
                  <button
                    class="btn btn-sm me-2 mb-2"
                    :class="selectedCategory === 'yourself' ? 'btn-secondary' : 'btn-outline-secondary'"
                    :disabled="!selectedFile || isUploading"
                    @click="selectCategory('yourself')"
                  >
                    <i class="bi bi-person-fill"></i> Yourself
                  </button>
                  <button
                    class="btn btn-sm me-2 mb-2"
                    :class="selectedCategory === 'clothing' ? 'btn-secondary' : 'btn-outline-secondary'"
                    :disabled="!selectedFile || isUploading"
                    @click="selectCategory('clothing')"
                  >
                    <i class="bi bi-tencent-qq"></i> Clothing
                  </button>
                </div>
                <div class="preview-actions">
                  <h6 class="section-title">Action</h6>
                  <button
                    class="btn btn-outline-danger btn-sm me-2 mb-2"
                    @click="removeFile"
                    :disabled="!selectedFile || isUploading"
                  >
                    <i class="bi bi-trash"></i> Remove
                  </button>
                  <button
                    class="btn btn-outline-success btn-sm me-2 mb-2"
                    @click="uploadFile"
                    :disabled="!selectedFile || !selectedCategory || isUploading"
                  >
                    <i class="bi bi-upload"></i> Upload
                  </button>
                </div>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Modal Footer (only for selection view) -->
        <div v-if="currentView === 'selection'" class="modal-footer">
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
  <div v-if="show" class="modal-backdrop fade show"></div>
</template>

<script>
import { uploadImage } from '@/api/api'
import { mapStores } from 'pinia'
import useUserStore from '@/stores/user'
import heic2any from 'heic2any'

export default {
  name: 'ImageUploadModal',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
  },
  emits: ['close', 'select'],
  data() {
    return {
      currentView: 'selection',
      selectedImageId: null,
      // Upload state
      selectedFile: null,
      previewUrl: null,
      selectedCategory: null,
      isUploading: false,
      uploadStatus: null,
      uploadMessage: '',
    }
  },
  computed: {
    ...mapStores(useUserStore),
    modalTitle() {
      if (this.currentView === 'upload') {
        return 'Upload Picture'
      }
      return this.category === 'yourself' ? 'Select Your Picture' : 'Select Clothing Picture'
    },
    hasSelection() {
      return this.selectedFile !== null
    },
  },
  watch: {
    show(newVal) {
      if (newVal) {
        // Reset state when modal opens
        this.currentView = 'selection'
        this.selectedImageId = null
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
        if (this.currentView === 'upload') {
          this.switchToSelection()
        } else {
          this.closeModal()
        }
      }
    },

    // View switching
    switchToUpload() {
      this.currentView = 'upload'
      // Pre-select category from prop
      this.selectedCategory = this.category
    },
    switchToSelection() {
      this.currentView = 'selection'
      this.resetUploadState()
    },

    // Selection methods
    selectImage(imageId) {
      this.selectedImageId = imageId
    },
    handleDoubleClick(imageId) {
      this.selectedImageId = imageId
      this.confirmSelection()
    },
    confirmSelection() {
      if (this.selectedImageId) {
        this.$emit('select', this.selectedImageId)
        this.closeModal()
      }
    },

    // Upload methods
    triggerFileSelection() {
      this.$refs.fileInput.click()
    },
    selectCategory(category) {
      this.selectedCategory = category
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
        this.uploadStatus = 'error'
        this.uploadMessage = 'No storage space left'
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

          // Auto-select the newly uploaded image and close modal
          setTimeout(() => {
            this.$emit('select', result.data.image_id)
            this.closeModal()
          }, 1000)
        } else {
          this.uploadStatus = 'error'
          if (result.error.includes('Insufficient') || result.error.includes('storage')) {
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
    removeFile() {
      if (this.previewUrl) {
        URL.revokeObjectURL(this.previewUrl)
      }
      this.selectedFile = null
      this.previewUrl = null
      this.uploadStatus = null
      this.uploadMessage = ''
    },
    resetUploadState() {
      this.removeFile()
      this.selectedCategory = null
      this.isUploading = false
    },
    goToProfile() {
      this.closeModal()
      this.$router.push('/profile')
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
