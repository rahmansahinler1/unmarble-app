<template>
  <div class="pricing-page">
    <!-- Close Button -->
    <button class="pricing-close-btn" @click="goBack">
      <i class="bi bi-x-lg"></i>
    </button>

    <!-- Header -->
    <div class="pricing-header">
      <h1 class="pricing-title">Upgrade your plan</h1>
    </div>

    <!-- Pricing Cards Container -->
    <div class="pricing-cards-container">
      <!-- Trial Card -->
      <div class="pricing-card">
        <div class="pricing-card-header">
          <h2 class="pricing-plan-name">Trial</h2>
          <div class="pricing-price">
            <span class="pricing-currency">$</span>
            <span class="pricing-amount">0</span>
            <span class="pricing-period">USD / month</span>
          </div>
          <p class="pricing-subtitle">See the Unmarble capabilities</p>
        </div>

        <button class="pricing-btn pricing-btn-disabled" disabled>Your current plan</button>

        <ul class="pricing-features">
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Get 2 trial image designs</span>
          </li>
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Have 10 image storage capacity</span>
          </li>
        </ul>
      </div>

      <!-- Premium Card -->
      <div class="pricing-card pricing-card-premium">
        <div class="pricing-card-header">
          <h2 class="pricing-plan-name">Premium</h2>
          <div class="pricing-price">
            <span class="pricing-currency">$</span>
            <span class="pricing-amount">9</span>
            <span class="pricing-period">USD / month</span>
          </div>
          <p class="pricing-subtitle">Unlock the full experience</p>
        </div>

        <button class="pricing-btn pricing-btn-premium" @click="handleGetPremium">
          Get Premium
        </button>

        <ul class="pricing-features">
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Get 30 image designs, renews every month</span>
          </li>
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Have 50 image storage capacity</span>
          </li>
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Higher quality images</span>
          </li>
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Get priority support, request features</span>
          </li>
          <li>
            <i class="bi bi-star-fill pricing-feature-icon"></i>
            <span>Request refund for 2 weeks</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import useUserStore from '@/stores/user'
import { mapStores } from 'pinia'
import { getCheckoutUrl } from '@/api/api'

export default {
  name: 'PricingPage',
  computed: {
    ...mapStores(useUserStore),
    userEmail() {
      return this.userStore?.userCred?.email || ''
    },
  },
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.go(-1)
      } else {
        this.$router.push('/gallery')
      }
    },
    handleGetPremium() {
      const checkoutUrl = getCheckoutUrl(this.userEmail)
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    },
  },
}
</script>

<style scoped>
.pricing-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 24px;
  position: relative;
}

.pricing-close-btn {
  position: absolute;
  top: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

.pricing-close-btn:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.pricing-close-btn i {
  font-size: 1.25rem;
  color: #5d5d5d;
}

.pricing-header {
  text-align: center;
  margin-bottom: 48px;
}

.pricing-title {
  font-family: var(--font-family-base);
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.pricing-cards-container {
  display: flex;
  gap: 24px;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 900px;
}

.pricing-card {
  width: 380px;
  padding: 32px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
}

.pricing-card-premium {
  border: 2px solid #00b7ed;
}

.pricing-card-header {
  margin-bottom: 24px;
}

.pricing-plan-name {
  font-family: var(--font-family-base);
  font-size: 22px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  margin-bottom: 8px;
}

.pricing-currency {
  font-family: var(--font-family-base);
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin-right: 2px;
}

.pricing-amount {
  font-family: var(--font-family-base);
  font-size: 48px;
  font-weight: 600;
  color: #333;
  line-height: 1;
}

.pricing-period {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 400;
  color: #666;
  margin-left: 8px;
}

.pricing-subtitle {
  font-family: var(--font-family-base);
  font-size: 14px;
  font-weight: 400;
  color: #666;
  margin: 0;
}

.pricing-btn {
  width: 100%;
  padding: 14px 24px;
  border-radius: 9999px;
  font-family: var(--font-family-base);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 24px;
}

.pricing-btn-disabled {
  background-color: #f5f5f5;
  color: #999;
  border: 1px solid #e0e0e0;
  cursor: default;
}

.pricing-btn-premium {
  background-color: #00b7ed;
  color: #ffffff;
  border: none;
}

.pricing-btn-premium:hover {
  background-color: #0095c7;
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  flex-grow: 1;
}

.pricing-features li {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
  font-family: var(--font-family-base);
  font-size: 14px;
  color: #333;
}

.pricing-features li:last-child {
  margin-bottom: 0;
}

.pricing-feature-icon {
  color: #00b7ed;
  font-size: 12px;
  margin-top: 3px;
  flex-shrink: 0;
}

@media (max-width: 840px) {
  .pricing-cards-container {
    flex-direction: column;
    align-items: center;
  }

  .pricing-card {
    width: 100%;
    max-width: 400px;
  }
}
</style>
