<script setup>
import { useUserStore } from '@/stores/user.js';
import { useConversationStore } from '@/stores/conversation.js';
import { computed } from 'vue';
import NotificationBadge from '@/components/NotificationBadge.vue';
import { useChatLeftSideMenuStore } from '@/stores/chatLeftSideMenu.js';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const chatLeftSideMenuStore = useChatLeftSideMenuStore();

function ToggleSideMenu() {
  chatLeftSideMenuStore.toggleLeftSideMenu();
}

const totalNotifications = computed(() => {
  return (
    Object.keys(conversationStore.GetALLConversations()).reduce((acc, key) => {
      return acc + conversationStore.GetConversationById(key).newUnseenMessages.length;
    }, 0) + userStore.GetFriendRequests().length
  );
});
</script>

<template>
  <div class="relative block size-8 md:hidden">
    <button
      @click="ToggleSideMenu"
      class="flex size-8 items-center justify-center text-center text-2xl text-white hover:text-gray-300">
      <i class="fa-solid fa-bars"></i>
    </button>
    <notification-badge
      class="absolute size-4 text-xs -top-1 -right-1"
      :notifications="totalNotifications" />
  </div>
</template>

<style scoped></style>
