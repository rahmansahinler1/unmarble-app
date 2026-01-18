<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="pointing-hand"
      :class="[`pointing-hand--${position}`, { 'pointing-hand--active': isAnimating }]"
      :style="handStyle"
      @click="handleHandClick"
    >
      <img
        src="/assets/img/pointing-hand.svg"
        alt="Click here"
        class="pointing-hand__image"
      />
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'PointingHand',
  props: {
    // Target element selector or ref
    target: {
      type: [String, Object],
      required: true,
    },
    // Position relative to target: 'top', 'bottom', 'left', 'right'
    position: {
      type: String,
      default: 'top',
      validator: (v) => ['top', 'bottom', 'left', 'right'].includes(v),
    },
    // Offset from target element (px)
    offset: {
      type: Number,
      default: 10,
    },
    // Whether to show the hand
    show: {
      type: Boolean,
      default: true,
    },
    // Auto-dismiss when target is clicked
    autoDismiss: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['dismiss', 'target-click', 'click-outside'],
  data() {
    return {
      visible: false,
      isAnimating: true,
      handPosition: { top: 0, left: 0 },
      targetElement: null,
    }
  },
  computed: {
    handStyle() {
      return {
        top: `${this.handPosition.top}px`,
        left: `${this.handPosition.left}px`,
      }
    },
  },
  watch: {
    show: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => this.initHand())
        } else {
          this.visible = false
        }
      },
    },
    target() {
      if (this.show) {
        this.$nextTick(() => this.updatePosition())
      }
    },
  },
  methods: {
    initHand() {
      this.findTarget()
      if (this.targetElement) {
        this.updatePosition()
        this.visible = true
        this.attachTargetListener()
      }
    },
    findTarget() {
      if (typeof this.target === 'string') {
        this.targetElement = document.querySelector(this.target)
      } else if (this.target?.$el) {
        this.targetElement = this.target.$el
      } else if (this.target instanceof HTMLElement) {
        this.targetElement = this.target
      }
    },
    updatePosition() {
      if (!this.targetElement) return

      const rect = this.targetElement.getBoundingClientRect()
      const handWidth = 80 // CSS width of the hand image
      const handHeight = 67 // Proportional height based on aspect ratio

      let top, left

      switch (this.position) {
        case 'top':
          top = rect.top - handHeight - this.offset + window.scrollY
          left = rect.left + rect.width / 2 - handWidth / 2 + window.scrollX
          break
        case 'bottom':
          top = rect.bottom + this.offset + window.scrollY
          left = rect.left + rect.width / 2 - handWidth / 2 + window.scrollX
          break
        case 'left':
          top = rect.top + rect.height / 2 - handHeight / 2 + window.scrollY
          left = rect.left - handWidth - this.offset + window.scrollX
          break
        case 'right':
          top = rect.top + rect.height / 2 - handHeight / 2 + window.scrollY
          left = rect.right + this.offset + window.scrollX
          break
      }

      this.handPosition = { top, left }
    },
    attachTargetListener() {
      if (this.targetElement && this.autoDismiss) {
        this.targetElement.addEventListener('click', this.handleTargetClick, { once: true })
      }
    },
    handleTargetClick() {
      this.$emit('target-click')
      this.dismiss()
    },
    handleHandClick(event) {
      // Clicking the hand itself also dismisses
      event.stopPropagation()
      this.dismiss()
    },
    handleClickOutside(event) {
      if (!this.visible) return
      // Check if click is on hand element
      const handElement = document.querySelector('.pointing-hand')
      if (handElement?.contains(event.target)) return
      // Check if click is on target element
      if (this.targetElement?.contains(event.target)) return
      // Click was outside both - emit event
      this.$emit('click-outside')
    },
    dismiss() {
      this.visible = false
      this.$emit('dismiss')
    },
  },
  mounted() {
    window.addEventListener('resize', this.updatePosition)
    window.addEventListener('scroll', this.updatePosition)
    document.addEventListener('click', this.handleClickOutside)
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.updatePosition)
    window.removeEventListener('scroll', this.updatePosition)
    document.removeEventListener('click', this.handleClickOutside)
    if (this.targetElement) {
      this.targetElement.removeEventListener('click', this.handleTargetClick)
    }
  },
}
</script>
