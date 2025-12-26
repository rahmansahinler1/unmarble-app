<template>
  <div v-if="isOpen" class="logout-modal-overlay" @click.self="close">
    <div class="logout-modal">
      <h2 class="logout-modal-title">Are you sure you want to log out?</h2>
      <p class="logout-modal-subtitle">Log out of Unmarble as {{ userEmail }}?</p>

      <div class="logout-modal-actions">
        <button class="btn-logout-confirm" @click="confirmLogout">Log out</button>
        <button class="btn-logout-cancel" @click="close">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogoutModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false,
    },
    userEmail: {
      type: String,
      default: '',
    },
  },
  emits: ['close', 'confirm'],
  methods: {
    close() {
      this.$emit('close')
    },
    confirmLogout() {
      this.$emit('confirm')
    },
  },
}
</script>
