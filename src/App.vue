<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import ContextModal from '@/components/modals/ContextModal.vue';
import AddFriendModal from '@/components/modals/AddFriendModal.vue';
import UserProfileModal from '@/components/modals/UserProfileModal.vue';
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
  </div>
  <context-modal />
  <add-friend-modal />
  <user-profile-modal />
</template>
