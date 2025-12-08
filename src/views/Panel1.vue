<template>
  <div class="app-container">
    <Sidebar />
    <div class="app-content">
      <Gallery />
    </div>

    <!-- Mobile Bottom Navigation -->
    <nav class="mobile-bottom-nav">
      <router-link to="/gallery" class="mobile-nav-item">
        <i class="bi bi-images"></i>
        <span>Gallery</span>
      </router-link>
      <router-link to="/design" class="mobile-nav-item">
        <i class="bi bi-palette"></i>
        <span>Design</span>
      </router-link>
      <router-link to="/profile" class="mobile-nav-item">
        <i class="bi bi-person"></i>
        <span>Profile</span>
      </router-link>
    </nav>
  </div>
</template>

<script>
import Sidebar from '@/components/Sidebar.vue'
import Gallery from '@/components/Gallery.vue'

export default {
  name: 'firstPanel',
  components: {
    Sidebar,
    Gallery,
  },
}
</script>
