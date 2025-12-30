<template>
  <!-- Gallery Page -->
  <div class="container-fluid">
    <h1 class="dashboard-title mb-3 mt-3 text-center">Gallery</h1>

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
              <!-- Upload button FIRST -->
              <div class="gallery-item gallery-item-upload" @click="showUploadModal = true">
                <div class="gallery-upload-content">
                  <i class="bi bi-plus-circle-fill gallery-upload-icon"></i>
                </div>
              </div>
              <!-- Gallery items -->
              <div
                class="gallery-item"
                :class="{ 'gallery-item-selected': isImageSelected(image.id) }"
                :data-category="image.category"
                v-for="image in getPreviews"
                :key="image.id"
              >
                <div
                  class="gallery-image-wrapper"
                  @click="handleImageClick(image)"
                  style="cursor: pointer"
                >
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
                    <div class="gallery-actions-right">
                      <button
                        class="gallery-action-btn gallery-action-btn-confirm"
                        @click="deleteImage(image.id, image.category)"
                      >
                        <i class="bi bi-check-lg"></i>
                      </button>
                      <button
                        class="gallery-action-btn gallery-action-btn-cancel"
                        @click="cancelDelete"
                      >
                        <i class="bi bi-x-lg"></i>
                      </button>
                    </div>
                  </template>

                  <!-- Normal buttons -->
                  <template v-else>
                    <div class="gallery-actions-left">
                      <button
                        class="gallery-action-btn gallery-action-btn-like"
                        @click.stop="toggleImageFav(image)"
                      >
                        <i
                          :class="image.faved ? 'bi bi-heart-fill' : 'bi bi-heart'"
                          :style="{ color: image.faved ? '#dc3545' : '#5d5d5d' }"
                        ></i>
                      </button>
                      <button
                        class="gallery-action-btn gallery-action-btn-search"
                        @click.stop="openImageModal(image.id, image.category)"
                      >
                        <i class="bi bi-search"></i>
                      </button>
                      <button
                        class="gallery-action-btn gallery-action-btn-download"
                        @click.stop="downloadImageDirect(image.id, image.category)"
                      >
                        <i class="bi bi-download"></i>
                      </button>
                    </div>
                    <button
                      class="gallery-action-btn gallery-action-btn-trash"
                      @click.stop="showDeleteConfirm(image.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </template>
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
            <h5 class="modal-title">Your Photo</h5>
            <button type="button" class="btn-close" @click="closeImageModal"></button>
          </div>

          <div class="modal-body text-center">
            <div v-if="loadingFullImage" class="py-5">
              <div class="spinner-border text-primary mb-2" role="status"></div>
              <p class="nav-text text-muted">Loading image...</p>
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

    <!-- Upload Modal -->
    <UploadModal :show="showUploadModal" @close="showUploadModal = false" />
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
  completeTour,
} from '@/api/api'
import UploadModal from '@/components/UploadModal.vue'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'

export default {
  name: 'Gallery',
  components: {
    UploadModal,
  },
  mounted() {
    // Check tour status on mount
    this.checkAndStartTour()
  },
  watch: {
    // Watch for user_status changes to handle race condition during navigation
    'userStore.userCred.user_status': {
      handler(newStatus) {
        if (newStatus === 'onboarded' && !this.tourStarted) {
          this.checkAndStartTour()
        }
      },
      immediate: false
    }
  },
  data() {
    return {
      selectedFilter: 'all',
      deleteConfirmId: null,
      tourStarted: false,
      showImageModal: false,
      showUploadModal: false,
      fullImage: null,
      loadingFullImage: false,
      currentImageCategory: null,
      escapeKeyHandler: null,
      localSelections: { yourself: null, clothing: null },
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
    hasAnySelection() {
      return this.localSelections.yourself || this.localSelections.clothing
    },
  },
  methods: {
    checkAndStartTour() {
      // Only show tour if user completed onboarding but hasn't seen tour yet
      if (this.userStore.userCred.user_status === 'onboarded' && !this.tourStarted) {
        this.tourStarted = true
        this.startGalleryTour()
      }
    },
    startGalleryTour() {
      // Helper to get mobile-friendly placement
      const isMobile = window.innerWidth < 768
      const getPlacement = (desktopSide) => {
        if (!isMobile) return desktopSide
        // On mobile, prefer 'bottom' for most cases
        if (desktopSide === 'right') return 'bottom'
        return desktopSide
      }

      // Helper to get responsive alignment
      const getAlignment = (desktopAlign) => {
        return isMobile ? 'start' : desktopAlign
      }

      // Check if we have clothing and at least one non-clothing photo for Steps 5a and 5b
      const hasClothing = this.userStore?.previewImages?.clothing?.length > 0
      const hasNonClothing =
        this.userStore?.previewImages?.yourself?.length > 0 ||
        this.userStore?.previewImages?.design?.length > 0

      const driverObj = driver({
        showProgress: true,
        popoverClass: 'unmarble-tour-popover',
        onHighlightStarted: async (element, step, options) => {
          // On first step shown, complete tour
          if (options.state.activeIndex === 0) {
            try {
              const result = await completeTour()
              if (result.success) {
                // Update user status to active (tour completed)
                this.userStore.setUserStatus('active')
              }
            } catch (error) {
              console.error('Failed to complete tour:', error)
              // Still update status locally to prevent tour from showing again
              this.userStore.setUserStatus('active')
            }
          }
        },
        steps: [
          {
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_welcome.svg', import.meta.url).href}"
                    alt="Welcome to Unmarble"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Welcome to Unmarble!</h2>
                    <p class="tour-text">
                      This is your gallery. Upload your photos and clothing here, then select them to try on new outfits.
                    </p>
                  </div>
                </div>
              `,
            },
          },
          {
            element: '.gallery-item:not(.gallery-item-upload)',
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 2"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Your Photos</h2>
                    <p class="tour-text">
                      This is one of your photo. Photos, clothing, and designs appear as cards like this, grouped by category.
                    </p>
                  </div>
                </div>
              `,
              side: getPlacement('right'),
              align: 'start',
            },
          },
          {
            element: '.gallery-item:not(.gallery-item-upload) .gallery-actions',
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 3"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Action Buttons</h2>
                    <p class="tour-text">
                      Use these buttons to favorite, view full size, download, or delete an item.
                    </p>
                  </div>
                </div>
              `,
              side: 'bottom',
              align: getAlignment('center'),
              popoverOffset: 20,
            },
          },
          {
            element: '.gallery-item-upload',
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 4"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Upload a photo</h2>
                    <p class="tour-text">
                      Add a new photo here. Click the card, choose your image, and pick a category.
                    </p>
                  </div>
                </div>
              `,
              side: getPlacement('right'),
              align: 'start',
            },
          },
          {
            ...(hasClothing ? { element: '.gallery-item[data-category="clothing"]' } : {}),
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 5a"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Select Clothing</h2>
                    <p class="tour-text">
                      First, select a clothing item like this one by clicking on it.
                    </p>
                  </div>
                </div>
              `,
              side: getPlacement('right'),
              align: 'start',
            },
          },
          {
            ...(hasNonClothing
              ? {
                  element: () => {
                    // Find first non-clothing item (yourself or design)
                    const nonClothing = document.querySelector(
                      '.gallery-item[data-category="yourself"], .gallery-item[data-category="design"]',
                    )
                    return nonClothing
                  },
                }
              : {}),
            popover: {
              title: '',
              description: `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 5b"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Select Your Photo</h2>
                    <p class="tour-text">
                      Then, select a photo of yourself or a design. Unmarble will open the design view automatically.
                    </p>
                  </div>
                </div>
              `,
              side: isMobile ? 'top' : 'right',
              align: 'start',
            },
          },
          {
            element:
              window.innerWidth >= 768
                ? '.app-sidebar a[href*="design"]'
                : '.mobile-bottom-nav a[href*="design"]',
            popover: {
              title: '',
              description:
                window.innerWidth >= 768
                  ? `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 6"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Use the Sidebar</h2>
                    <p class="tour-text">
                      Use the sidebar to move between pages, like Design and your gallery.
                    </p>
                  </div>
                </div>
              `
                  : `
                <div class="tour-content">
                  <img
                    src="${new URL('/assets/img/tour_pointing.svg', import.meta.url).href}"
                    alt="Tour Step 6"
                    class="tour-image"
                  />
                  <div class="tour-text-container">
                    <h2 class="tour-title">Navigation</h2>
                    <p class="tour-text">
                      Tap the Design icon here to switch between Gallery, Design, and Profile pages.
                    </p>
                  </div>
                </div>
              `,
              side: window.innerWidth >= 768 ? 'right' : 'top',
              align: 'center',
            },
          },
        ],
      })

      driverObj.drive()
    },
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
            this.userStore.updateStorageLeft(result.data.storage_left)
          }
        } else {
          result = await deleteImage(imageId)
          if (result.success) {
            this.userStore.removePreviewImage(category, imageId)
            this.userStore.updateStorageLeft(result.data.storage_left)
          }
        }

        if (result.success) {
          this.deleteConfirmId = null
          // Clear selection if deleted image was selected
          if (this.localSelections.yourself?.id === imageId) {
            this.localSelections.yourself = null
          }
          if (this.localSelections.clothing?.id === imageId) {
            this.localSelections.clothing = null
          }
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
    async downloadImageDirect(imageId, category) {
      try {
        let result
        if (category === 'design') {
          result = await getDesign(imageId)
        } else {
          result = await getImage(imageId)
        }

        if (result.success) {
          const imageData = `data:image/jpeg;base64,${result.data.image_base64}`
          const link = document.createElement('a')
          link.href = imageData
          link.download = `${category}-${Date.now()}.jpg`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else {
          alert('Failed to download image')
        }
      } catch (error) {
        console.error('Download error:', error)
        alert('Error downloading image')
      }
    },
    handleImageClick(image) {
      const slot = image.category === 'clothing' ? 'clothing' : 'yourself'

      // Toggle if already selected
      if (this.localSelections[slot]?.id === image.id) {
        this.localSelections[slot] = null
        return
      }

      // Select (replaces previous)
      this.localSelections[slot] = { id: image.id, category: image.category }

      // Auto-navigate when both filled
      if (this.localSelections.yourself && this.localSelections.clothing) {
        this.navigateToDesign()
      }
    },
    isImageSelected(imageId) {
      return (
        this.localSelections.yourself?.id === imageId ||
        this.localSelections.clothing?.id === imageId
      )
    },
    navigateToDesign() {
      this.userStore.setGallerySelection('yourself', this.localSelections.yourself)
      this.userStore.setGallerySelection('clothing', this.localSelections.clothing)
      this.$router.push('/design')
    },
  },
  beforeUnmount() {
    if (this.escapeKeyHandler) {
      document.removeEventListener('keydown', this.escapeKeyHandler)
    }
  },
}
</script>
