<script setup>
import { useUserStore } from '@/stores/user.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useRoute, useRouter } from 'vue-router';
import NotificationBadge from '@/components/NotificationBadge.vue';
import UserProfilePicture from '@/components/UserProfilePicture.vue';

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const conversationStore = useConversationStore();

function ToggleSideMenu() {
  let sideMenu = document.querySelector('#SideMenu');
  sideMenu.classList.toggle('hidden');
}

async function CloseConversation(convoId) {
  conversationStore.RemoveVisibleConversation(convoId);
  if (route.params.id === convoId) {
    await router.push({ name: 'friendList' });
  }
}
</script>

<template>
  <div
    id="SideMenu"
    class="absolute left-0 top-0 z-10 hidden h-dvh w-screen flex-none bg-green-600 md:static md:left-auto
      md:top-auto md:block md:h-full md:w-72">
    <div class="flex size-full flex-col">
      <div class="flex h-14 flex-none items-center bg-gray-800 p-4">
        <h2 class="text-3xl font-bold text-white">Menu</h2>
      </div>
      <div class="flex grow flex-col overflow-auto bg-gray-500 px-2">
        <router-link
          class="router-link flex items-center"
          @click="ToggleSideMenu"
          :to="{ name: 'friendList' }">
          <span>Friends</span>
          <notification-badge
            class="ml-auto size-5 text-sm"
            :notifications="userStore.GetFriendRequests().length" />
        </router-link>
        <transition-group name="con-list">
          <router-link
            v-for="(convo, index) in conversationStore
              .GetVisibleConversations()
              .toSorted((a, b) => {
                if (a.lastMessageTime < b.lastMessageTime) return 1;
                if (a.lastMessageTime > b.lastMessageTime) return -1;
                return 0;
              })"
            :key="convo.convoId"
            class="router-link group"
            :to="{ name: 'chat', params: { id: convo.convoId } }"
            @click="ToggleSideMenu">
            <div class="min-w-0 size-full flex flex-row flex-nowrap items-center gap-2">
              <img
                :src="convo.convoPicture"
                v-if="convo.convoType === 1"
                alt="pfp"
                class="size-10 flex-none rounded-full" />
              <user-profile-picture
                v-else
                :user="
                  userStore.GetUserById(convo.participants.find((user) => user !== userStore.myId))
                "
                class="size-10 flex-none" />
              <span class="truncate">{{ convo.convoName }}</span>
              <div class="ml-auto flex-none flex items-center gap-2 size-fit">
                <notification-badge
                  class="flex-none size-5 text-sm"
                  :notifications="
                    conversationStore.GetConversationById(convo.convoId).newUnseenMessages.length
                  " />
                <button
                  class="size-fit flex-none hover:text-gray-400 sm:hidden group-hover:block"
                  @click.stop.prevent="CloseConversation(convo.convoId)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>
          </router-link>
        </transition-group>
      </div>
      <div class="mt-auto h-14 w-full flex-none bg-gray-800">
        <div class="flex h-full w-full flex-row flex-nowrap items-center gap-2">
          <user-profile-picture
            :user="userStore.GetUserById(userStore.myId)"
            class="size-10 flex-none" />
          <span class="text-xl text-white">{{
            userStore.GetUserById(userStore.myId)?.userName
          }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link {
  @apply rounded-lg px-4 py-2 text-xl text-white transition-colors ease-in-out hover:bg-black/30;
}

.router-link-exact-active {
  @apply !bg-black/40;
}

.con-list-move,
.con-list-leave-active,
.con-list-enter-active {
  transition: all 0.3s ease;
}

.con-list-enter-from {
  opacity: 0;
  transform: translate(-5rem, 0);
}

.con-list-leave-to {
  opacity: 0;
  transform: translate(5rem, 0);
}
</style>
