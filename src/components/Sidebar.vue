<template>
  <!-- Sidebar -->
  <div class="app-sidebar d-flex flex-column">
    <!-- Navigation Sections -->
    <div class="flex-grow-1">
      <div class="nav-section mt-3">
        <!-- Logo -->
        <button type="button" class="logo-button mb-5 mt-3">
          <img src="/assets/img/logo_wide.svg" alt="Unmarble" class="logo-image" />
        </button>

        <!-- Section Title -->
        <h6 class="section-title text mb-2">Sections</h6>

        <router-link to="/gallery" class="nav-item">
          <i class="bi bi-images nav-icon"></i>
          <span class="nav-text">Gallery</span>
        </router-link>

        <router-link to="/design" class="nav-item">
          <i class="bi bi-palette nav-icon"></i>
          <span class="nav-text">Design</span>
        </router-link>

        <router-link to="/profile" class="nav-item">
          <i class="bi bi-person-vcard nav-icon"></i>
          <span class="nav-text">Profile</span>
        </router-link>
      </div>
    </div>
    <!-- Profile Section -->
    <div class="profile-section">
      <!-- Upgrade Banner for Trial Users -->
      <a
        v-if="!isPremium"
        @click="handleUpgrade"
        class="upgrade-banner-link d-flex align-items-center w-100 mb-2"
        style="cursor: pointer"
      >
        <i class="bi bi-stars me-2" style="color: #00b7ed"></i>
        <span class="flex-grow-1">Upgrade your plan</span>
        <i class="bi bi-arrow-right"></i>
      </a>

      <div class="dropdown">
        <button
          type="button"
          class="profile-button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          @click="toggleDropdown"
        >
          <div class="d-flex align-items-center w-100">
            <div class="profile-avatar me-2" v-if="userCred.pictureUrl">
              <img
                :src="userCred.pictureUrl"
                alt="Profile"
                class="rounded-circle"
                style="width: 40px; height: 40px; object-fit: cover"
              />
            </div>
            <div class="profile-avatar-initials me-2" v-else>
              <span>{{ userInitials }}</span>
            </div>
            <div class="flex-grow-1 text-start">
              <div class="profile-name">{{ userCred.name }} {{ userCred.surname }}</div>
              <div class="profile-plan-badge">{{ isPremium ? 'Premium plan' : 'Trial plan' }}</div>
            </div>
            <i
              :class="isDropdownOpen ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"
              style="color: #5d5d5d; font-size: 0.9rem"
            ></i>
          </div>
        </button>
        <ul class="dropdown-menu dropdown-menu-up w-100">
          <li class="dropdown-header">
            <div class="nav-text-small text-muted">{{ userCred.email }}</div>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <router-link to="/profile" class="dropdown-item d-flex align-items-center">
              <i class="bi bi-person-vcard me-2" style="font-size: 1rem; color: #5d5d5d"></i>
              <span class="nav-text" style="color: #5d5d5d">Profile</span>
            </router-link>
          </li>
          <li v-if="!isPremium">
            <a
              class="dropdown-item d-flex align-items-center"
              @click="handleUpgrade"
              style="cursor: pointer"
            >
              <i class="bi bi-stars me-2" style="font-size: 1rem; color: #5d5d5d"></i>
              <span class="nav-text" style="color: #5d5d5d">Upgrade premium</span>
            </a>
          </li>
          <li>
            <button class="dropdown-item d-flex align-items-center" @click="handleLogout">
              <i class="bi bi-box-arrow-right me-2" style="font-size: 1rem; color: #5d5d5d"></i>
              <span class="nav-text" style="color: #5d5d5d">Log out</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'

export default {
  name: 'Sidebar',
  data() {
    return {
      isDropdownOpen: false,
    }
  },
  computed: {
    ...mapStores(useUserStore),
    userCred() {
      return this.userStore?.userCred || { name: '', surname: '', email: '', pictureUrl: '' }
    },
    isPremium() {
      return this.userStore?.userCred?.type === 'premium'
    },
    userInitials() {
      const firstName = this.userCred.name || ''
      const lastName = this.userCred.surname || ''
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    },
  },
  methods: {
    toggleDropdown() {
      this.isDropdownOpen = !this.isDropdownOpen
    },
    handleLogout() {
      const domain = import.meta.env.VITE_COOKIE_DOMAIN
      document.cookie = `authToken=; domain=${domain}; path=/; max-age=0`

      localStorage.setItem('logout-event', Date.now().toString())

      window.location.href = import.meta.env.VITE_WEBSITE_URL
    },
    handleUpgrade() {
      this.$router.push('/pricing')
    },
  },
  mounted() {
    // Listen for Bootstrap dropdown events to sync state
    this.$nextTick(() => {
      const dropdownButton = this.$el?.querySelector?.('[data-bs-toggle="dropdown"]')
      if (dropdownButton) {
        dropdownButton.addEventListener('shown.bs.dropdown', () => {
          this.isDropdownOpen = true
        })
        dropdownButton.addEventListener('hidden.bs.dropdown', () => {
          this.isDropdownOpen = false
        })
      }
    })
  },
}
</script>

<style lang="scss" scoped></style>
