<template>
  <div class="min-h-screen bg-gradient-to-br from-water-50 via-teal-50 to-cyan-50">
    <!-- Hero Section -->
    <div class="relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0">
        <div class="absolute top-10 left-10 w-72 h-72 bg-primary-teal/5 rounded-full animate-float"></div>
        <div class="absolute top-40 right-20 w-96 h-96 bg-accent-teal/5 rounded-full animate-float" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-20 left-1/2 w-80 h-80 bg-light-teal/5 rounded-full animate-float" style="animation-delay: 2s;"></div>
      </div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div class="text-center">
          <!-- Logo and Brand -->
          <div class="flex items-center justify-center space-x-4 mb-8">
            <div class="w-20 h-20 bg-primary-teal rounded-xl flex items-center justify-center shadow-lg">
              <BeakerIcon class="w-12 h-12 text-white" />
            </div>
            <div class="text-left">
              <h1 class="text-4xl md:text-5xl font-bold text-dark-teal">Smartfish</h1>
              <p class="text-lg text-primary-teal font-medium">Aquaculture Monitoring</p>
            </div>
          </div>

          <!-- Hero Content -->
          <div class="max-w-3xl mx-auto">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Monitoramento Inteligente para
              <span class="text-primary-teal">Aquicultura Profissional</span>
            </h2>
            
            <p class="text-xl text-gray-600 mb-8 leading-relaxed">
              Sistema avançado de monitoramento em tempo real para condições críticas da água,
              garantindo a saúde e o crescimento otimizado dos peixes em operações de aquicultura.
            </p>

            <!-- CTA Buttons -->
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link
                to="/"
                class="inline-flex items-center justify-center px-8 py-4 bg-primary-teal text-white font-semibold rounded-xl hover:bg-dark-teal transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus-ring"
              >
                <ChartBarIcon class="w-5 h-5 mr-2" />
                Ver Tanques
              </router-link>
              
              <button
                @click="scrollToFeatures"
                class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-teal font-semibold rounded-xl border-2 border-primary-teal hover:bg-primary-teal hover:text-white transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus-ring"
              >
                <InformationCircleIcon class="w-5 h-5 mr-2" />
                Saiba Mais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div ref="featuresSection" class="py-20 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Recursos Avançados de Monitoramento
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Tecnologia de ponta para garantir condições ideais de crescimento e saúde dos peixes
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <!-- Real-time Monitoring -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
              <ClockIcon class="w-8 h-8 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Tempo Real</h3>
            <p class="text-gray-600">
              Monitoramento contínuo com atualizações instantâneas dos parâmetros críticos da água
            </p>
          </div>

          <!-- Smart Alerts -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-red-200 transition-colors">
              <BellIcon class="w-8 h-8 text-red-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Alertas Inteligentes</h3>
            <p class="text-gray-600">
              Sistema de alertas configurável com níveis de prioridade para ação rápida
            </p>
          </div>

          <!-- Multi-parameter Monitoring -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
              <BeakerIcon class="w-8 h-8 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Multi-parâmetros</h3>
            <p class="text-gray-600">
              Temperatura, pH, oxigênio dissolvido e salinidade em um único painel
            </p>
          </div>

          <!-- Data Analytics -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon class="w-8 h-8 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Análise de Dados</h3>
            <p class="text-gray-600">
              Análise histórica e tendências para otimização contínua das condições
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technology Stack Section -->
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Tecnologia Moderna e Confiável
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Construído com as mais recentes tecnologias web para garantir performance e confiabilidade
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl font-bold text-green-600">V3</span>
            </div>
            <h4 class="font-semibold text-gray-900">Vue 3</h4>
            <p class="text-sm text-gray-600">Framework Reativo</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl font-bold text-orange-600">FB</span>
            </div>
            <h4 class="font-semibold text-gray-900">Firebase</h4>
            <p class="text-sm text-gray-600">Banco em Tempo Real</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl font-bold text-blue-600">TW</span>
            </div>
            <h4 class="font-semibold text-gray-900">Tailwind</h4>
            <p class="text-sm text-gray-600">Estilização Moderna</p>
          </div>
          
          <div class="text-center">
            <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <span class="text-2xl font-bold text-purple-600">VT</span>
            </div>
            <h4 class="font-semibold text-gray-900">Vite</h4>
            <p class="text-sm text-gray-600">Build Otimizado</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Multi-Tank Features Section -->
    <div class="py-20 bg-white/50 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Gerenciamento Multi-Tanque
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Monitore múltiplos tanques simultaneamente com visão unificada e controle individual
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Overview Dashboard -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-200 transition-colors">
              <ViewColumnsIcon class="w-8 h-8 text-indigo-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Visão Geral</h3>
            <p class="text-gray-600">
              Dashboard central com cards intuitivos mostrando status de todos os tanques
            </p>
          </div>

          <!-- Individual Monitoring -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-200 transition-colors">
              <EyeIcon class="w-8 h-8 text-teal-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Monitoramento Individual</h3>
            <p class="text-gray-600">
              Navegação fluida para monitoramento detalhado de cada tanque específico
            </p>
          </div>

          <!-- Centralized Alerts -->
          <div class="glass-card text-center group hover:scale-105 transition-transform duration-300">
            <div class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-amber-200 transition-colors">
              <ExclamationTriangleIcon class="w-8 h-8 text-amber-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-3">Alertas Centralizados</h3>
            <p class="text-gray-600">
              Sistema unificado de alertas com priorização e gestão eficiente para todos os tanques
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Start Section -->
    <div class="py-20 bg-primary-teal">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-white mb-6">
          Pronto para Começar?
        </h2>
        <p class="text-xl text-teal-100 mb-8">
          Acesse a visão geral dos tanques e comece a monitorar agora mesmo
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/"
            class="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-teal font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus-ring"
          >
            <ViewColumnsIcon class="w-5 h-5 mr-2" />
            Ver Tanques
          </router-link>
          
          <router-link
            to="/settings"
            class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white font-semibold rounded-xl border-2 border-white hover:bg-white hover:text-primary-teal transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 focus-ring"
          >
            <CogIcon class="w-5 h-5 mr-2" />
            Configurações
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  BeakerIcon,
  ChartBarIcon,
  InformationCircleIcon,
  ClockIcon,
  BellIcon,
  CogIcon,
  ViewColumnsIcon,
  EyeIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Template refs
const featuresSection = ref(null)

// Methods
const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ 
    behavior: 'smooth',
    block: 'start'
  })
}
</script>

<style scoped>
/* Enhanced floating animation */
@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  33% {
    transform: translateY(-20px) rotate(1deg);
  }
  66% {
    transform: translateY(-10px) rotate(-1deg);
  }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

/* Staggered animations for feature cards */
.grid > div {
  animation: slideInUp 0.6s ease-out;
}

.grid > div:nth-child(1) { animation-delay: 0.1s; }
.grid > div:nth-child(2) { animation-delay: 0.2s; }
.grid > div:nth-child(3) { animation-delay: 0.3s; }
.grid > div:nth-child(4) { animation-delay: 0.4s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Parallax effect for background elements */
@media (min-width: 768px) {
  .absolute.inset-0 > div {
    will-change: transform;
  }
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .grid > div,
  .group:hover,
  .transform {
    animation: none;
    transition: none;
    transform: none;
  }
}

/* Custom hover effects */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

.group:hover .group-hover\:bg-blue-200 {
  background-color: #dbeafe;
}

.group:hover .group-hover\:bg-red-200 {
  background-color: #fecaca;
}

.group:hover .group-hover\:bg-green-200 {
  background-color: #bbf7d0;
}

.group:hover .group-hover\:bg-purple-200 {
  background-color: #e9d5ff;
}

.group:hover .group-hover\:bg-indigo-200 {
  background-color: #c7d2fe;
}

.group:hover .group-hover\:bg-teal-200 {
  background-color: #99f6e4;
}

.group:hover .group-hover\:bg-amber-200 {
  background-color: #fde68a;
}
</style>