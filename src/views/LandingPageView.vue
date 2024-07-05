<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
</script>

<template>
  <header
    class="w-screen min-h-20 bg-gray-700 text-white flex flex-col sm:flex-row sm:items-center">
    <div class="flex w-full sm:w-auto mt-4 sm:mt-0">
      <h1 class="sm:text-3xl text-2xl font-bold ml-4">Discord But Better</h1>
      <label
        for="topbar-check"
        class="ml-auto sm:hidden mr-2 text-2xl hover:cursor-pointer hover:text-gray-400">
        <i class="fa-solid fa-bars sm:hidden" />
      </label>
    </div>
    <input type="checkbox" id="topbar-check" v-model="sideBarIsShowing" class="hidden peer" />
    <div
      class="sm:ml-auto mt-4 sm:mt-0 sm:mr-2 hidden peer-checked:flex peer-checked:flex-col sm:!flex-row sm:flex
        sm:items-center sm:justify-evenly">
      <router-link class="router-link" to="/">Home</router-link>
      <router-link class="router-link" :to="{ name: 'login' }">Login</router-link>
      <router-link class="router-link" :to="{ name: 'register' }">Register</router-link>
    </div>
  </header>
</template>

<style scoped>
.router-link {
  @apply p-4 transition-colors ease-in-out hover:bg-black/30;
}

.router-link-exact-active {
  @apply !bg-black/40;
}
</style>
