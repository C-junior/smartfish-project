<template>
  <div
    id="app"
    class="min-h-screen bg-gradient-to-br from-slate-50 via-water-50 to-water-100"
  >
    <!-- Navigation Header -->
    <nav class="glass-morphism border-b border-white/30 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Brand -->
          <div class="flex items-center space-x-3">
            <div class="flex-shrink-0">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
              >
                <!-- <BeakerIcon class="w-6 h-6 text-white" /> -->
                <img src="./assets/img/smartfishlogo.png" alt="" />
              </div>
            </div>
            <div>
              <h1 class="text-xl font-bold text-dark-teal">Smartish</h1>
              <p class="text-xs text-gray-600">Aquaculture Monitoring</p>
            </div>
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                to="/"
                class="nav-link"
                :class="
                  $route.name === 'Home'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                "
              >
                <HomeIcon class="w-4 h-4 inline mr-2" />
                Tanques
              </router-link>
              <router-link
                to="/about"
                class="nav-link"
                :class="
                  $route.name === 'About'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                "
              >
                <InformationCircleIcon class="w-4 h-4 inline mr-2" />
                Sobre
              </router-link>
              <router-link
                to="/settings"
                class="nav-link"
                :class="
                  $route.name === 'Settings'
                    ? 'nav-link-active'
                    : 'nav-link-inactive'
                "
              >
                <CogIcon class="w-4 h-4 inline mr-2" />
                Configurações
              </router-link>
            </div>
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden">
            <button
              @click="toggleMobileMenu"
              class="p-2 rounded-md text-gray-600 hover:text-primary-teal focus-ring"
              aria-label="Toggle mobile menu"
            >
              <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6" />
              <XMarkIcon v-else class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div v-if="mobileMenuOpen" class="md:hidden">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <router-link
              to="/"
              @click="closeMobileMenu"
              class="block nav-link"
              :class="
                $route.name === 'Home' ? 'nav-link-active' : 'nav-link-inactive'
              "
            >
              <HomeIcon class="w-4 h-4 inline mr-2" />
              Tanques
            </router-link>
            <router-link
              to="/about"
              @click="closeMobileMenu"
              class="block nav-link"
              :class="
                $route.name === 'About'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              "
            >
              <InformationCircleIcon class="w-4 h-4 inline mr-2" />
              Sobre
            </router-link>
            <router-link
              to="/settings"
              @click="closeMobileMenu"
              class="block nav-link"
              :class="
                $route.name === 'Settings'
                  ? 'nav-link-active'
                  : 'nav-link-inactive'
              "
            >
              <CogIcon class="w-4 h-4 inline mr-2" />
              Configurações
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="glass-morphism border-t border-white/30 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 text-sm">
            © 2025 Smartish. Professional Aquaculture Monitoring System.
          </p>
          <p class="text-gray-500 text-xs mt-2">
            Ensuring optimal conditions for healthy fish farming operations.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  HomeIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BeakerIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';

// Mobile menu state
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
};
</script>

<style scoped>
/* Router link transition animations */
.router-link-active {
  transition: all 0.2s ease-in-out;
}

/* Focus styles for accessibility */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary-teal focus:ring-offset-2;
}
</style>
