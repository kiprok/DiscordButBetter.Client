<script setup>
import { useUserStore } from '@/stores/user.js';
import { useConversationStore } from '@/stores/conversation.js';

const userStore = useUserStore();
const conversationStore = useConversationStore();

function ToggleSideMenu() {
  let sideMenu = document.querySelector('#SideMenu');
  sideMenu.classList.toggle('hidden');
}
</script>

<template>
  <div
    id="SideMenu"
    class="absolute left-0 top-0 z-10 hidden h-screen w-screen flex-none bg-green-600 md:static md:left-auto
      md:top-auto md:block md:h-full md:w-72">
    <div class="flex size-full flex-col">
      <div class="flex h-14 flex-none items-center bg-gray-800 p-4">
        <h2 class="text-3xl font-bold text-white">Menu</h2>
      </div>
      <div class="flex grow flex-col overflow-auto bg-gray-500 px-2">
        <router-link class="router-link" @click="ToggleSideMenu" :to="{ name: 'friendList' }">
          Friends
        </router-link>
        <router-link
          v-for="(convo, index) in conversationStore.GetALLConversations()"
          :key="index"
          class="router-link"
          :to="{ name: 'chat', params: { id: convo.convoId } }"
          @click="ToggleSideMenu">
          <div class="flex flex-row flex-nowrap items-center gap-2">
            <img :src="convo.convoPicture" alt="pfp" class="size-10 flex-none rounded-full" />
            <span>{{ convo.convoName }}</span>
          </div>
        </router-link>
      </div>
      <div class="mt-auto h-14 w-full flex-none bg-gray-800">
        <div class="flex h-full w-full flex-row flex-nowrap items-center gap-2">
          <img :src="userStore.myProfilePicture" alt="pfp" class="size-10 flex-none rounded-full" />
          <span class="text-xl text-white">{{ userStore.myUserName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link {
  @apply rounded-lg px-4 py-2 text-xl text-white transition-colors ease-in-out hover:bg-gray-600/30;
}

.router-link-exact-active {
  @apply bg-gray-300/30;
}
</style>
