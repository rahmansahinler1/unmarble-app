<template>
  <!-- Gallery Page -->
  <div class="container-fluid">
    <h1 class="dashboard-title mb-3 text-center">Gallery</h1>

    <div class="row">
      <div class="col-12 mb-4">
        <div class="card" style="min-height: 85vh">
          <div class="card-body">
            <!-- Filter Buttons -->
            <div class="gallery-filters mb-4">
              <button
                class="btn btn-sm me-2"
                :class="this.selectedFilter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'"
                @click="selectFilter('all')"
              >
                All
                <span class="badge bg-light text-dark ms-1">{{ imageCounts.all }}</span>
              </button>
              <button
                class="btn btn-sm me-2"
                :class="
                  this.selectedFilter === 'yourself' ? 'btn-secondary' : 'btn-outline-secondary'
                "
                @click="selectFilter('yourself')"
              >
                Yourself
                <span class="badge bg-light text-dark ms-1">{{ imageCounts.yourself }}</span>
              </button>
              <button
                class="btn btn-sm me-2"
                :class="
                  this.selectedFilter === 'clothing' ? 'btn-secondary' : 'btn-outline-secondary'
                "
                @click="selectFilter('clothing')"
              >
                Clothing
                <span class="badge bg-light text-dark ms-1">{{ imageCounts.clothing }}</span>
              </button>
              <button
                class="btn btn-sm me-2"
                :class="
                  this.selectedFilter === 'design' ? 'btn-secondary' : 'btn-outline-secondary'
                "
                @click="selectFilter('design')"
              >
                Design
                <span class="badge bg-light text-dark ms-1">{{ imageCounts.design }}</span>
              </button>
              <button
                class="btn btn-sm me-2"
                :class="
                  this.selectedFilter === 'favorites' ? 'btn-secondary' : 'btn-outline-secondary'
                "
                @click="selectFilter('favorites')"
              >
                Favorites
                <span class="badge bg-light text-dark ms-1">{{ imageCounts.favorites }}</span>
              </button>
            </div>

            <!-- Gallery Grid -->
            <div class="gallery-grid">
              <!-- Gallery items will go here -->
              <div class="gallery-item" v-for="image in getPreviews" :key="image.id">
                <div
                  class="gallery-image-wrapper"
                  @click="openImageModal(image.id, image.category)"
                  style="cursor: pointer"
                >
                  <!-- Like Button Badge -->
                  <button class="gallery-like-badge" @click.stop="toggleImageFav(image)">
                    <i
                      :class="image.faved ? 'bi bi-heart-fill' : 'bi bi-heart'"
                      :style="{ color: image.faved ? '#dc3545' : 'white' }"
                    ></i>
                  </button>
                  <!-- Category Badge -->
                  <span class="gallery-category-badge">{{ image.category }}</span>
                  <!-- Image -->
                  <div class="gallery-placeholder">
                    <img :src="image.base64" :alt="image.category" />
                  </div>
                </div>
                <!-- Action Buttons -->
                <div class="gallery-actions">
                  <!-- Show confirmation if this image is being deleted -->
                  <template v-if="deleteConfirmId === image.id">
                    <button
                      class="btn btn-sm gallery-action-btn"
                      @click="deleteImage(image.id, image.category)"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button class="btn btn-sm gallery-action-btn" @click="cancelDelete">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </template>

                  <!-- Normal buttons -->
                  <template v-else>
                    <button class="btn btn-sm gallery-action-btn" @click="toggleImageFav(image)">
                      <i
                        :class="image.faved ? 'bi bi-heart-fill' : 'bi bi-heart'"
                        :style="{ color: image.faved ? '#dc3545' : 'inherit' }"
                      ></i>
                    </button>
                    <button
                      class="btn btn-sm gallery-action-btn"
                      @click="showDeleteConfirm(image.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
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
        </div>
      </div>
    </div>

    <div
      class="modal fade"
      :class="{ show: showImageModal, 'd-block': showImageModal }"
      tabindex="-1"
      v-if="showImageModal"
      @click.self="closeImageModal"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Full Image</h5>
            <button type="button" class="btn-close" @click="closeImageModal"></button>
          </div>

          <div class="modal-body text-center">
            <div v-if="loadingFullImage" class="py-5">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <p class="nav-text text-muted">Loading full image...</p>
            </div>
            <img
              v-else-if="fullImage"
              :src="fullImage"
              alt="Full resolution image"
              class="img-fluid"
              style="max-height: 70vh"
            />
          </div>

          <div class="modal-footer justify-content-between">
            <button type="button" class="btn btn-outline-secondary" @click="closeImageModal">
              Close
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="downloadImage"
              :disabled="!fullImage"
            >
              <i class="bi bi-download me-2"></i>Download
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showImageModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import {
  deleteImage,
  updateImageFav,
  getImage,
  deleteDesign,
  updateDesignFav,
  getDesign,
} from '@/api/api'

export default {
  name: 'Gallery',
  data() {
    return {
      selectedFilter: 'all',
      deleteConfirmId: null,
      showImageModal: false,
      fullImage: null,
      loadingFullImage: false,
      currentImageCategory: null,
      escapeKeyHandler: null,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    userCred() {
      return this.userStore?.userCred || null
    },
    getPreviews() {
      const yourself = this.userStore?.previewImages?.yourself || []
      const clothing = this.userStore?.previewImages?.clothing || []
      const design = this.userStore?.previewImages?.design || []

      let images = []

      if (this.selectedFilter === 'yourself') {
        images = yourself.map((img) => ({ ...img, category: 'yourself' }))
      } else if (this.selectedFilter === 'clothing') {
        images = clothing.map((img) => ({ ...img, category: 'clothing' }))
      } else if (this.selectedFilter === 'design') {
        images = design.map((img) => ({ ...img, category: 'design' }))
      } else if (this.selectedFilter === 'favorites') {
        images = [
          ...yourself.filter((img) => img.faved).map((img) => ({ ...img, category: 'yourself' })),
          ...clothing.filter((img) => img.faved).map((img) => ({ ...img, category: 'clothing' })),
          ...design.filter((img) => img.faved).map((img) => ({ ...img, category: 'design' })),
        ]
      } else {
        images = [
          ...yourself.map((img) => ({ ...img, category: 'yourself' })),
          ...clothing.map((img) => ({ ...img, category: 'clothing' })),
          ...design.map((img) => ({ ...img, category: 'design' })),
        ]
      }

      return images.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at)
      })
    },
    imageCounts() {
      const yourself = this.userStore?.previewImages?.yourself || []
      const clothing = this.userStore?.previewImages?.clothing || []
      const design = this.userStore?.previewImages?.design || []

      return {
        yourself: yourself.length,
        clothing: clothing.length,
        design: design.length,
        all: yourself.length + clothing.length + design.length,
        favorites:
          yourself.filter((img) => img.faved).length +
          clothing.filter((img) => img.faved).length +
          design.filter((img) => img.faved).length,
      }
    },
  },
  methods: {
    selectFilter(filter) {
      this.selectedFilter = filter
    },
    showDeleteConfirm(imageId) {
      this.deleteConfirmId = imageId
    },
    cancelDelete() {
      this.deleteConfirmId = null
    },
    async deleteImage(imageId, category) {
      try {
        let result

        // Use appropriate API based on category
        if (category === 'design') {
          result = await deleteDesign(imageId)
          if (result.success) {
            this.userStore.removePreviewImage('design', imageId)
            // Designed images don't refund credits
          }
        } else {
          result = await deleteImage(imageId)
          if (result.success) {
            this.userStore.removePreviewImage(category, imageId)
            this.userStore.updateUploadsLeft(result.data.uploads_left)
          }
        }

        if (result.success) {
          this.deleteConfirmId = null
        } else {
          alert('Failed to delete image')
        }
      } catch (error) {
        console.error('Delete error:', error)
        alert('Error deleting image')
      }
    },
    async toggleImageFav(image) {
      const category = image.category
      const imageInStore = this.userStore.previewImages[category].find((img) => img.id === image.id)
      if (!imageInStore) return

      const previousState = imageInStore.faved
      imageInStore.faved = !imageInStore.faved

      try {
        let result

        // Use appropriate API based on category
        if (category === 'design') {
          result = await updateDesignFav(image.id)
        } else {
          result = await updateImageFav(image.id)
        }

        if (!result.success) {
          imageInStore.faved = previousState
          alert('Failed to update favorite')
        }
      } catch (error) {
        imageInStore.faved = previousState
        console.error('Error updating favorite:', error)
        alert('Error updating favorite')
      }
    },
    async openImageModal(imageId, category) {
      this.showImageModal = true
      this.loadingFullImage = true
      this.fullImage = null
      this.currentImageCategory = category

      this.escapeKeyHandler = (event) => {
        if (event.key === 'Escape') {
          this.closeImageModal()
        }
      }
      document.addEventListener('keydown', this.escapeKeyHandler)

      try {
        let result

        // Use appropriate API based on category
        if (category === 'design') {
          result = await getDesign(imageId)
        } else {
          result = await getImage(imageId)
        }

        if (result.success) {
          this.fullImage = `data:image/jpeg;base64,${result.data.image_base64}`
        } else {
          alert('Failed to load full image')
          this.closeImageModal()
        }
      } catch (error) {
        console.error('Error loading full image:', error)
        alert('Error loading image')
        this.closeImageModal()
      } finally {
        this.loadingFullImage = false
      }
    },
    closeImageModal() {
      this.showImageModal = false
      this.fullImage = null
      if (this.escapeKeyHandler) {
        document.removeEventListener('keydown', this.escapeKeyHandler)
        this.escapeKeyHandler = null
      }
    },
    downloadImage() {
      if (!this.fullImage) return

      const link = document.createElement('a')
      link.href = this.fullImage
      link.download = `image-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
  },
  beforeUnmount() {
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler)
    }
  },
}
</script>
