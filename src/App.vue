<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import ContextModal from '@/components/modals/ContextModal.vue';
import AddFriendModal from '@/components/modals/AddFriendModal.vue';
import UserProfileModal from '@/components/modals/UserProfileModal.vue';
import { useServerStore } from '@/stores/server.js';

const serverStore = useServerStore();

const token = serverStore.GetToken();

if (token !== '') {
  serverStore.GetUserAsync();
}
</script>

<template>
  <router-view />
  <context-modal />
  <add-friend-modal />
  <user-profile-modal />
</template>
