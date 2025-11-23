<template>
  <!-- Upload Clothing Page -->
  <div class="container-fluid">
    <h1 class="dashboard-title mb-3 text-center">Upload Picture</h1>

    <div class="row">
      <div class="col-md-8 mb-4">
        <div class="card h-100" style="min-height: 85vh">
          <div class="card-body d-flex flex-column">
            <h3 class="card-title mb-3">Selection</h3>
            <!-- Hidden file input - always in DOM -->
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              @change="handleFileSelect"
            />
            <div
              v-if="!hasSelection"
              class="upload-dropzone flex-grow-1 justify-content-center"
              @click="triggerFileSelection"
              @dragover.prevent
              @drop.prevent="handleDrop"
            >
              <i class="bi bi-cloud-upload-fill" style="font-size: 3rem; color: #5d5d5d"></i>
              <h5>Drag and drop your picture in here</h5>
              <p class="nav-text text-muted">or click to browse files</p>
              <button class="btn btn-outline-primary">Browse Files</button>
            </div>
            <div v-else class="upload-dropzone mb-2 position-relative">
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

            <div class="d-flex flex-row mt-4 justify-content-between align-items-start">
              <div>
                <h6 class="section-title">Category</h6>
                <button
                  class="btn btn-sm me-2 mb-2"
                  :class="
                    selectedCategory === 'yourself' ? 'btn-secondary' : 'btn-outline-secondary'
                  "
                  :disabled="!selectedFile || isUploading"
                  @click="selectCategory('yourself')"
                >
                  <i class="bi bi-person-fill"></i> Yourself
                </button>
                <button
                  class="btn btn-sm me-2 mb-2"
                  :class="
                    selectedCategory === 'clothing' ? 'btn-secondary' : 'btn-outline-secondary'
                  "
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
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <h3 class="card-title mb-3">Guideline</h3>
            <ul class="nav-text text-muted">
              <li>
                First, select your picture from your device, then select your category, then upload
                it if you like
              </li>
              <li>Supported file formats: JPG, PNG, WEBP, HEIC</li>
              <li>Maximum file size is 5MB</li>
              <li>Use neutral backgrounds for your pictures</li>
              <li>Ensure clothing is visible</li>
              <li>Good lighting is essential</li>
              <li>One item per photo</li>
            </ul>

            <div class="mt-4">
              <h6 class="section-title">Current Pictures</h6>
              <div class="upload-summary">
                <div class="d-flex justify-content-between">
                  <span class="nav-text text-muted">Yourself:</span>
                  <span class="nav-text fw-semibold">{{ userStore.imageCounts.yourself }}</span>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="nav-text text-muted">Clothes:</span>
                  <span class="nav-text fw-semibold">{{ userStore.imageCounts.clothing }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { uploadImage } from '@/api/api'
import { mapStores } from 'pinia'
import useUserStore from '@/stores/user'
import heic2any from 'heic2any'

export default {
  name: 'Upload',
  data() {
    return {
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
    canUpload() {
      return this.selectedFile && this.selectedCategory && !this.isUploading
    },
    hasSelection() {
      return this.selectedFile !== null
    },
  },
  methods: {
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
      event.target.value = ''
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

      if (file.type === 'image/heic' || file.type === 'image/heif') {
        try {
          const convertedBlob = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.9,
          })
          file = new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
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

      this.selectedFile = file
      this.previewUrl = URL.createObjectURL(file)
      this.uploadStatus = null
      this.uploadMessage = ''
    },
    async uploadFile() {
      // Checks
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
      // Upload
      try {
        const fileBase64 = await this.convertFile(this.selectedFile)
        const result = await uploadImage(this.selectedCategory, fileBase64)

        if (result.success) {
          this.uploadStatus = 'success'
          this.uploadMessage = 'Upload Successful'
          this.userStore.addPreviewImage(this.selectedCategory, result.data)
          this.userStore.updateStorageLeft(result.data.storage_left)
          setTimeout(() => {
            this.removeFile()
          }, 2000)
        } else {
          this.uploadStatus = 'error'
          // Check if it's a storage error
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
      this.selectedCategory = null
      this.uploadStatus = null
      this.uploadMessage = ''
    },
    goToProfile() {
      this.$router.push('/profile')
    },
  },
}
</script>
