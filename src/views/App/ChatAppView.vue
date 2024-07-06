<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import { useServerStore } from '@/stores/server.js';
import { useRouter } from 'vue-router';
import { watch } from 'vue';

const serverStore = useServerStore();
const router = useRouter();

if (!serverStore.IsLoggedIn) router.push({ name: 'login' });

watch(
  () => serverStore.IsLoggedIn,
  (isLoggedIn) => {
    if (!isLoggedIn) router.push({ name: 'login' });
  },
);
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
  </div>
</template>
