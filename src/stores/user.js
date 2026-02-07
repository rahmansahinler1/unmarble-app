import { defineStore } from 'pinia'
import { getUser, getPreviews } from '@/api/api'
import { identifyUser } from '@/utils/posthog'

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
      user_status: 'active',
    },
    userLimits: { storageLeft: null, designsLeft: null },
    previewImages: { yourself: [], clothing: [], design: [] },
    gallerySelections: { yourself: null, clothing: null },
    onboardingData: {
      gender: null,
      selectedClothingId: null,
    },
    onboardingPreviews: [],
    galleryHelperPending: false,
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
          this.userCred.user_status = user_fetch.data.user_info['user_status'] || 'active'
          this.userLimits.storageLeft = user_fetch.data.user_info['storage_left']
          this.userLimits.designsLeft = user_fetch.data.user_info['designs_left']

          // Identify user in PostHog
          identifyUser(userId, {
            name: this.userCred.name,
            surname: this.userCred.surname,
            email: this.userCred.email,
            type: this.userCred.type,
            renewal_date: this.userCred.nextRenewalDate,
            subscription_status: this.userCred.subscriptionStatus,
            subscription_ends_at: this.userCred.subscriptionEndsAt,
            days_until_expiry: this.userCred.daysUntilExpiry,
            days_since_expiry: this.userCred.daysSinceExpiry,
            storage_left: this.userLimits.storageLeft,
            designs_left: this.userLimits.designsLeft,
          })
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
        isNew: true,
      })
    },
    clearNewFlag(category, imageId) {
      const image = this.previewImages[category].find((img) => img.id === imageId)
      if (image) {
        image.isNew = false
      }
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
    setUserStatus(status) {
      this.userCred.user_status = status
    },
    setOnboardingGender(value) {
      this.onboardingData.gender = value
    },
    setOnboardingPreviews(previews) {
      this.onboardingPreviews = previews
    },
    setOnboardingClothingId(id) {
      this.onboardingData.selectedClothingId = id
    },
    clearOnboardingData() {
      this.onboardingData = { gender: null, selectedClothingId: null }
      this.onboardingPreviews = []
    },
  },
})
