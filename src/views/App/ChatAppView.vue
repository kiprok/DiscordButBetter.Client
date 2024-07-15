<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import { useServerStore } from '@/stores/server.js';
import { useRoute, useRouter } from 'vue-router';
import { ref, watch } from 'vue';
import { useUserStore } from '@/stores/user.js';
import SkellyLoading from '@/components/Skeletons/SkellyLoading.vue';
import { useConversationStore } from '@/stores/conversation.js';
import { HubConnectionState } from '@microsoft/signalr';
import { RegisterNotificationAsync } from '@/composables/Notifications.js';

const serverStore = useServerStore();
const conversationStore = useConversationStore();
const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const _isLoading = ref(true);

serverStore.IsFullyLoaded = false;

if (!serverStore.IsLoggedIn) router.push({ name: 'login' });
console.log('Connected', serverStore.GetConnectionState() === HubConnectionState.Connected);
if (serverStore.GetConnectionState() !== HubConnectionState.Connected) {
  ConnectToServer();
} else {
  LoadUserData();
}

watch(
  () => serverStore.IsLoggedIn,
  async (isLoggedIn) => {
    if (!isLoggedIn) {
      await router.push({ name: 'login' });
      return;
    }
  },
);

watch(serverStore.GetConnectionState, async (state) => {
  console.log('New connection state', state);
  if (state === HubConnectionState.Connected && !_isLoading.value) {
    _isLoading.value = true;
    serverStore.IsFullyLoaded = false;
    await LoadUserData();
  }
});

async function ConnectToServer() {
  const connection = await serverStore.ConnectSocketAsync();
  connection.on('InitializedUser', async () => {
    console.log('User Initialized');
    await LoadUserData();
  });

  connection.onreconnecting(() => {
    console.log('Reconnecting to server');
    _isLoading.value = true;
    serverStore.IsFullyLoaded = false;
  });

  connection.onreconnected(async () => {
    console.log('Reconnected to server');
    await LoadUserData();
  });

  await RegisterNotificationAsync(connection, route);

  await connection.start();
  console.log('Connected to server');
}

async function LoadUserData() {
  userStore.Reset();
  conversationStore.Reset();

  const friends = await serverStore.GetFriendListAsync();

  if (friends == null) return;

  for (const friend of friends) {
    userStore.AddFriend(friend);
  }
  const friendRequests = await serverStore.GetFriendRequestsAsync();

  if (friendRequests == null) return;

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

  if (conversations == null) return;

  for (const convo of conversations) {
    conversationStore.AddConversation(convo);
    for (const participantId of convo.participants) {
      var user = await serverStore.GetUserByIdAsync(participantId);
      userStore.users[participantId] = user;
    }
  }
  const visibleConversations = await serverStore.GetVisibleConversationsAsync();

  if (visibleConversations == null) return;

  for (const convo of visibleConversations) {
    conversationStore.AddVisibleConversation(convo);
  }

  serverStore.IsFullyLoaded = true;
  _isLoading.value = false;
}
</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view
      v-if="!_isLoading && serverStore.GetConnectionState() === HubConnectionState.Connected" />
    <div v-else class="z-[1000] bg-gray-600 w-screen h-dvh fixed top-0 left-0">
      <skelly-loading class="size-full text-white text-[10rem]" />
    </div>
  </div>
</template>
