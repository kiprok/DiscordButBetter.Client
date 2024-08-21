<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import ContextModal from '@/components/modals/ContextModal.vue';
import AddFriendModal from '@/components/modals/AddFriendModal.vue';
import UserProfileModal from '@/components/modals/UserProfileModal.vue';
import { useServerStore } from '@/stores/server.js';
import { useUserStore } from '@/stores/user.js';
import AccountSettingsModal from '@/components/modals/AccountSettingsModal.vue';
import { useCurrentTimeStore } from '@/stores/currentTime.js';
import CreateGroupConversationModal from '@/components/modals/CreateGroupConversationModal.vue';
const serverStore = useServerStore();
const userStore = useUserStore();
const timeStore = useCurrentTimeStore();

timeStore.StartClock();

const token = serverStore.GetToken();

if (token !== '') {
  serverStore.GetUserAsync().then((user) => {
    if (user === null) return;
    userStore.users[user.userId] = user;
  });
}
</script>

<template>
  <router-view />
  <context-modal />
  <add-friend-modal />
  <user-profile-modal />
  <account-settings-modal />
  <create-group-conversation-modal />
</template>
