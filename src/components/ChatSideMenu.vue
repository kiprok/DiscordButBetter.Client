<script setup>
import { useUserStore } from "@/stores/user.js";

const userStore = useUserStore();

function ToggleSideMenu() {
  let sideMenu = document.querySelector("#SideMenu");
  sideMenu.classList.toggle("hidden");
}
</script>

<template>
  <div
    id="SideMenu"
    class="z-10 bg-green-600 row-span-3 absolute top-0 left-0 h-screen w-screen flex-none hidden md:block md:w-72 md:h-full md:top-auto md:left-auto md:relative"
  >
    <div class="w-full h-full flex flex-col">
      <div class="h-14 bg-gray-800 flex-none flex items-center p-4">
        <h2 class="text-white text-3xl font-bold">Menu</h2>
      </div>
      <div class="bg-gray-500 grow flex flex-col px-2 overflow-auto">
        <router-link
          class="router-link"
          @click="ToggleSideMenu"
          :to="{ name: 'friendList' }"
        >
          Friends
        </router-link>
        <router-link
          v-for="(convo, index) in userStore.GetALLConversations()"
          :key="index"
          class="router-link"
          :to="{ name: 'chat', params: { id: convo.convoId } }"
          @click="ToggleSideMenu"
        >
          <div class="flex flex-nowrap flex-row items-center gap-2">
            <img
              :src="convo.convoPicture"
              alt="pfp"
              class="rounded-full size-10 flex-none"
            />
            <span>{{ convo.convoName }}</span>
          </div>
        </router-link>
      </div>
      <div class="w-full h-14 bg-gray-800 mt-auto flex-none">
        <div class="flex flex-nowrap flex-row items-center gap-2 h-full w-full">
          <img
            :src="userStore.myProfilePicture"
            alt="pfp"
            class="rounded-full size-10 flex-none"
          />
          <span class="text-xl text-white">{{ userStore.myUserName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link {
  @apply text-xl text-white hover:bg-gray-600/30 py-2 px-4 transition-colors ease-in-out rounded-lg;
}

.router-link-exact-active {
  @apply bg-gray-300/30;
}
</style>
