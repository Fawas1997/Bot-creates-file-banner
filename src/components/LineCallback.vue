<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600"
  >
    <div class="bg-white p-8 rounded-lg shadow-xl">
      <div class="flex items-center justify-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
        ></div>
      </div>
      <p class="mt-4 text-gray-600 text-center">กำลังเข้าสู่ระบบ...</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { exchangeCodeForAccessToken, getLineProfile } from "../utils/LineLogin";

const router = useRouter();

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code");

  if (code) {
    try {
      const accessToken = await exchangeCodeForAccessToken(code);
      if (accessToken) {
        const profile = await getLineProfile(accessToken);
        if (profile) {
          localStorage.setItem("line_profile", JSON.stringify(profile));
        }
      }
      localStorage.setItem("line_auth_code", code);
      router.push("/xlsx-reader");
    } catch (error) {
      console.error("Error:", error);
    }
  }
});
</script>
