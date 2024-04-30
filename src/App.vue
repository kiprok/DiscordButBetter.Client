<script setup>
import ChatSideMenu from "@/components/ChatSideMenu.vue";
</script>

<template>
  <div
    class="h-screen flex flex-row items-stretch bg-amber-500 overflow-hidden"
  >
    <ChatSideMenu />
    <router-view />
  </div>
</template>
