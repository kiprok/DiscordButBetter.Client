<script setup>
import ChatSideMenu from '@/components/sideMenus/ChatSideMenu.vue';
import { useServerStore } from '@/stores/server.js';
import { useRouter } from 'vue-router';
import { watch } from 'vue';
import { useUserStore } from '@/stores/user.js';

const serverStore = useServerStore();
const userStore = useUserStore();
const router = useRouter();

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
    if(friendRequest.senderId === serverStore.user.userId) continue;
    const user = await serverStore.GetUserByIdAsync(friendRequest.senderId);
    userStore.AddFriendRequest(friendRequest, user);
  }
}

</script>

<template>
  <div class="flex h-dvh w-screen flex-row overflow-hidden bg-amber-500">
    <ChatSideMenu />
    <router-view />
  </div>
</template>
