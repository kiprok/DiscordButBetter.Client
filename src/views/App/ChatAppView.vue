<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import { useServerStore } from '@/stores/server.js';
import { useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.js';
import SkellyLoading from '@/components/Skeletons/SkellyLoading.vue';
import { useConversationStore } from '@/stores/conversation.js';

const serverStore = useServerStore();
const conversationStore = useConversationStore();
const userStore = useUserStore();
const router = useRouter();
const _isLoading = ref(true);

if (!serverStore.IsLoggedIn) router.push({ name: 'login' });

LoadUserData();

watch(
  () => serverStore.IsLoggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) {
      await router.push({ name: 'login' });
      return;
    }
  },
);

async function LoadUserData() {
  const friends = await serverStore.GetFriendListAsync();

  for (const friend of friends) {
    userStore.AddFriend(friend);
  }
  const friendRequests = await serverStore.GetFriendRequestsAsync();

  for (const friendRequest of friendRequests) {
    if (friendRequest.senderId === serverStore.user.userId) {
      const user = await serverStore.GetUserByIdAsync(friendRequest.receiverId);
      userStore.AddFriendRequestSent(friendRequest, user);
    } else {
      const user = await serverStore.GetUserByIdAsync(friendRequest.senderId);
      userStore.AddFriendRequest(friendRequest, user);
    }
  }

  const conversations = await serverStore.GetConversationsAsync();
  for (const convo of conversations) {
    conversationStore.AddConversation(convo);
    for (const participantId of convo.participants) {
      var user = await serverStore.GetUserByIdAsync(participantId);
      userStore.users[participantId] = user;
    }
  }
  const visibleConversations = await serverStore.GetVisibleConversationsAsync();
  for (const convo of visibleConversations) {
    conversationStore.AddVisibleConversation(convo);
  }

  _isLoading.value = false;
}
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
    <div v-if="_isLoading" class="z-[1000] bg-gray-600 w-screen h-dvh fixed top-0 left-0">
      <skelly-loading class="size-full text-white text-[10rem]" />
    </div>
  </div>
</template>
