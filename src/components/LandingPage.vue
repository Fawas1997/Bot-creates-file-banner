<template>
  <div
    class="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col font-sans"
  >
    <header class="w-full py-6 px-4 sm:px-6 lg:px-8">
      <nav>
        <div class="text-center">
          <h1
            class="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200 animate-shimmer inline-block"
          >
            Bot Creates File Banner
          </h1>
        </div>
      </nav>
    </header>

    <main
      class="flex-grow flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div class="max-w-1xl w-full text-center">
        <h2
          class="text-7xl sm:text-6xl font-extrabold text-white leading-tight mb-8 whitespace-pre-wrap"
        >
          <template v-for="(char, index) in titleArray" :key="index">
            <span
              :class="{ 'opacity-0': !showTitle[index] }"
              class="inline-block transition-opacity duration-75"
            >
              {{ char }}
            </span>
          </template>
        </h2>
        <p
          class="text-xl text-indigo-100 mb-12 max-w-2xl mx-auto whitespace-pre-wrap"
        >
          <template v-for="(char, index) in descriptionArray" :key="index">
            <span
              :class="{ 'opacity-0': !showDescription[index] }"
              class="inline-block transition-opacity duration-75"
            >
              {{ char }}
            </span>
          </template>
        </p>
        <div class="relative inline-block">
          <div class="absolute inset-0 rounded-full animate-pulse-ring"></div>
          <button
            @click="loginWithLine"
            class="bg-[#00B900] hover:bg-[#00A000] text-white text-lg font-semibold py-4 px-8 rounded-full transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center relative z-10"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg"
              alt="LINE logo"
              class="w-6 h-6 mr-3"
            />
            Start Chatting with LINE Login
          </button>
        </div>
      </div>
    </main>

    <footer class="w-full py-8 bg-indigo-900/90 backdrop-blur-sm">
      <div class="w-full px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-bold text-white mb-6 text-center">
          Key Features
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="flex items-center justify-center p-6 bg-indigo-800/50 rounded-xl backdrop-blur-sm hover:bg-indigo-800/70 transition-all duration-300"
          >
            <svg
              class="w-6 h-6 text-green-400 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span class="text-indigo-100 text-lg">{{ feature }}</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { lineLogin } from "../utils/LineLogin";

const titleText = "Smart Processing Simple Chat";
const descriptionText =
  "Chatbot create complex file processing banner send update data to Directus We can help you.";

const titleArray = computed(() => titleText.split(""));
const descriptionArray = computed(() => descriptionText.split(""));

const showTitle = ref(Array(titleText.length).fill(false));
const showDescription = ref(Array(descriptionText.length).fill(false));

const features = [
  "Intelligent file processing",
  "Natural language understanding",
  "Seamless integration with Directus",
];

const typeText = async (text, showArray, delay = 50) => {
  for (let i = 0; i < text.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));
    showArray.value[i] = true;
  }
};

const loginWithLine = () => {
  lineLogin();
};

onMounted(async () => {
  await typeText(titleText, showTitle);
  await typeText(descriptionText, showDescription, 30);
});
</script>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
  background-size: 200% auto;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 20px rgba(255, 255, 255, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 255, 255, 0);
  }
}

.animate-pulse-ring {
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
