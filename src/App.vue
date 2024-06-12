<script setup>
import ChatSideMenu from '@/components/ChatSideMenu.vue';
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
  </div>
</template>
