<template>
  <div
    id="app"
    class="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4"
  >
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App",
};
</script>

<style>
body {
  margin: 0;
}
</style>
