<script setup>
import { useUserStore } from '@/stores/user.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useRoute, useRouter } from 'vue-router';
import NotificationBadge from '@/components/NotificationBadge.vue';
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';
import { useChatLeftSideMenuStore } from '@/stores/chatLeftSideMenu.js';
import TouchComponentHold from '@/components/touch/TouchComponentHold.vue';
import ContextModal from '@/components/modals/ContextModal.vue';
import { useModalStore } from '@/stores/modalStore.js';
import ConversationItemContent from '@/components/modals/contextMenuContents/ConversationItemContent.vue';
import UserItemFullDetail from '@/components/user/UserItemFullDetail.vue';
import { ref } from 'vue';
import { useServerStore } from '@/stores/server.js';
import SkellyLoading from '@/components/Skeletons/SkellyLoading.vue';
import { FormatLastMessageTimeShort, GetProfilePictureUrl } from '../../composables/utility.js';
import { useCurrentTimeStore } from '@/stores/currentTime.js';
import RoundedImage from '@/components/RoundedImage.vue';

const route = useRoute();
const router = useRouter();

const userStore = useUserStore();
const conversationStore = useConversationStore();
const chatLeftSideMenuStore = useChatLeftSideMenuStore();
const modalStore = useModalStore();
const serverStore = useServerStore();
const timeStore = useCurrentTimeStore();

const userAnchorRef = ref();

function ToggleSideMenu() {
  chatLeftSideMenuStore.toggleLeftSideMenu();
}

async function CloseConversation(conversationId) {
  conversationStore.RemoveVisibleConversation(conversationId);
  const conversation = conversationStore.GetConversationById(conversationId);
  if (conversation.conversationType === 0) {
    await serverStore.RemoveFromVisibleConversationsAsync(conversationId);
  } else {
    await serverStore.DeleteConversationAsync(conversationId);
  }
  if (route.params.id === conversationId) {
    await router.push({ name: 'friendList' });
  }
}
</script>

<template>
  <div
    id="SideMenu"
    class="absolute left-0 transition-[transform] ease-out top-0 z-20 h-dvh w-screen flex-none bg-green-600
      md:static md:left-auto md:top-auto md:block md:translate-x-0 md:h-full md:transition-none md:w-72"
    :class="{ '-translate-x-full': !chatLeftSideMenuStore.leftSideMenuIsOpen }">
    <div class="flex size-full flex-col">
      <div class="flex h-14 flex-none items-center bg-gray-800 p-4">
        <h2 class="text-3xl font-bold text-white">Menu</h2>
      </div>
      <div class="flex grow flex-col overflow-auto bg-gray-500 px-2">
        <router-link
          class="router-link flex items-center p-4"
          @click="ToggleSideMenu"
          :to="{ name: 'friendList' }">
          <span>Friends</span>
          <notification-badge
            class="ml-auto size-5 text-sm"
            :notifications="userStore.GetFriendRequests().length" />
        </router-link>
        <div class="flex flex-none items-center mb-4">
          <div class="w-full h-0 min-w-0 border border-gray-400" />
          <span
            class="text-gray-400 hover:text-gray-300"
            @click="modalStore.OpenModal('createConversation')">
            <i class="fa-solid fa-plus text-2xl ml-2" />
          </span>
        </div>
        <transition-group name="con-list">
          <router-link
            v-for="(convo, index) in conversationStore
              .GetVisibleConversations()
              .toSorted((a, b) => {
                if (a.lastMessageTime < b.lastMessageTime) return 1;
                if (a.lastMessageTime > b.lastMessageTime) return -1;
                return 0;
              })"
            :key="convo.conversationId"
            class="router-link relative group"
            :to="{ name: 'chat', params: { id: convo.conversationId } }"
            @click="ToggleSideMenu">
            <touch-component-hold
              class="p-2 min-w-0 size-full flex flex-row flex-nowrap items-center gap-2"
              tag="div"
              :back-classes="{ 'rounded-lg': true }"
              @held="
                () => {
                  modalStore.OpenModal('contextMenu', {
                    componentType: ConversationItemContent,
                    conversationId: convo.conversationId,
                  });
                }
              ">
              <div class="flex items-center min-w-0" v-if="convo.conversationType === 1">
                <rounded-image
                  :src="GetProfilePictureUrl(convo.conversationPicture)"
                  alt="pfp"
                  class="size-10 flex-none" />
                <span class="truncate text-sm font-bold ml-2 min-w-0">
                  {{ convo.conversationName }}
                </span>
              </div>
              <user-item-full-detail
                v-else
                :user="
                  userStore.GetUserById(
                    convo.participants.find((user) => user !== serverStore.user.userId),
                  )
                "
                class="flex" />
              <div class="ml-auto flex-none flex items-center gap-2 size-fit">
                <notification-badge
                  class="flex-none size-5 text-sm"
                  :notifications="
                    conversationStore.GetConversationById(convo.conversationId)?.newUnseenMessages
                      .length
                  " />
                <span class="absolute right-1 top-0 text-xs text-gray-300">
                  {{ FormatLastMessageTimeShort(convo.lastMessageTime, timeStore.currentTime) }}
                </span>
                <button
                  class="size-fit flex-none hover:text-gray-400 sm:hidden touch:hidden mouse:group-hover:block"
                  @click.stop.prevent="CloseConversation(convo.conversationId)">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </touch-component-hold>
          </router-link>
        </transition-group>
      </div>
      <div class="mt-auto h-14 w-full flex items-center flex-none bg-gray-800" ref="userAnchorRef">
        <user-item-full-detail
          v-if="serverStore.user"
          :user="userStore.GetUserById(serverStore.user.userId)"
          class="text-white hover:bg-white/30 hover:cursor-pointer rounded-lg p-1 select-none"
          @click="
            (event) =>
              modalStore.OpenModal('userProfile', {
                user: userStore.GetUserById(serverStore.user.userId),
                anchor: userAnchorRef,
              })
          " />
        <skelly-loading v-else class="w-full h-14 text-white" />
        <button
          class="ml-auto text-2xl p-2 text-white hover:text-gray-300 flex-none"
          @click="modalStore.OpenModal('accountSettings')">
          <i class="fa-solid fa-cog" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.router-link {
  @apply rounded-lg text-xl text-white transition-colors ease-in-out hover:bg-black/30;
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
