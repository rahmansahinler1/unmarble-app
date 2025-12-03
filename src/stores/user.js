import { defineStore } from 'pinia'
import { getUser, getPreviews } from '@/api/api'

export default defineStore('user', {
  state: () => ({
    userId: null,
    userLoggedIn: false,
    userCred: {
      name: '',
      surname: '',
      email: '',
      type: 'trial',
      pictureUrl: '',
      nextRenewalDate: null,
      subscriptionStatus: 'none',
      subscriptionEndsAt: null,
      daysUntilExpiry: null,
      daysSinceExpiry: null,
      firstTime: false,
    },
    userLimits: { storageLeft: null, designsLeft: null },
    previewImages: { yourself: [], clothing: [], design: [] },
    gallerySelections: { yourself: null, clothing: null },
    onboardingData: {
      gender: null,
    },
  }),
  getters: {
    imageCounts(state) {
      return {
        yourself: state.previewImages.yourself.length,
        clothing: state.previewImages.clothing.length,
        design: state.previewImages.design.length,
        all:
          state.previewImages.yourself.length +
          state.previewImages.clothing.length +
          state.previewImages.design.length,
      }
    },
  },
  actions: {
    async initialize(userId) {
      this.userId = userId

      try {
        const user_fetch = await getUser()
        if (user_fetch.success) {
          this.userLoggedIn = true
          this.userCred.name = user_fetch.data.user_info['name']
          this.userCred.surname = user_fetch.data.user_info['surname']
          this.userCred.email = user_fetch.data.user_info['email']
          this.userCred.type = user_fetch.data.user_info['type']
          this.userCred.pictureUrl = user_fetch.data.user_info['picture_url']
          this.userCred.nextRenewalDate = user_fetch.data.user_info['next_renewal_date']
          this.userCred.subscriptionStatus =
            user_fetch.data.user_info['subscription_status'] || 'none'
          this.userCred.subscriptionEndsAt = user_fetch.data.user_info['subscription_ends_at']
          this.userCred.daysUntilExpiry = user_fetch.data.user_info['days_until_expiry']
          this.userCred.daysSinceExpiry = user_fetch.data.user_info['days_since_expiry']
          this.userCred.firstTime = user_fetch.data.user_info['first_time']
          this.userLimits.storageLeft = user_fetch.data.user_info['storage_left']
          this.userLimits.designsLeft = user_fetch.data.user_info['designs_left']
        }

        const preview_fetch = await getPreviews()
        if (preview_fetch.success) {
          // Map and add data for all image categories (yourself, clothing, design)
          const image_previews = preview_fetch.data.image_previews

          this.previewImages.yourself = (image_previews.yourself || []).map((img) => ({
            id: img.id,
            base64: `data:image/jpeg;base64,${img.base64}`,
            faved: img.faved,
            created_at: img.created_at,
          }))

          this.previewImages.clothing = (image_previews.clothing || []).map((img) => ({
            id: img.id,
            base64: `data:image/jpeg;base64,${img.base64}`,
            faved: img.faved,
            created_at: img.created_at,
          }))

          this.previewImages.design = (image_previews.design || []).map((img) => ({
            id: img.id,
            base64: `data:image/jpeg;base64,${img.base64}`,
            faved: img.faved,
            created_at: img.created_at,
          }))
        }
      } catch (error) {
        console.log(error)
      }
    },
    addPreviewImage(category, imageData) {
      this.previewImages[category].unshift({
        id: imageData.image_id,
        base64: `data:image/jpeg;base64,${imageData.preview_base64}`,
        faved: imageData.faved || false,
        created_at: imageData.created_at,
      })
    },
    removePreviewImage(category, imageId) {
      this.previewImages[category] = this.previewImages[category].filter(
        (img) => img.id !== imageId,
      )
    },
    updateStorageLeft(newValue) {
      this.userLimits.storageLeft = newValue
    },
    updateDesignsLeft(newValue) {
      this.userLimits.designsLeft = newValue
    },
    setGallerySelection(slot, selection) {
      this.gallerySelections[slot] = selection
    },
    clearGallerySelections() {
      this.gallerySelections = { yourself: null, clothing: null }
    },
    setFirstTime(value) {
      this.userCred.firstTime = value
    },
    setOnboardingGender(value) {
      this.onboardingData.gender = value
    },
    clearOnboardingData() {
      this.onboardingData = { gender: null }
    },
  },
})
