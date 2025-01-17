<script setup>
import ChatTopBar from '@/components/ChatTopBar.vue';
import { useUserStore } from '@/stores/user.js';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import ChatTextBox from '@/components/ChatTextBox.vue';
import { defineAsyncComponent, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConversationStore } from '@/stores/conversation.js';
import ChatAreaInfoBar from '@/components/ChatAreaInfoBar.vue';
import ChatLeftSideMenuButton from '@/components/ChatLeftSideMenuButton.vue';
import { useSearchStore } from '@/stores/search.js';
import { useServerStore } from '@/stores/server.js';
import UserItemFullDetail from '@/components/user/UserItemFullDetail.vue';
import { GetProfilePictureUrl } from '@/composables/utility.js';
import { useModalStore } from '@/stores/modalStore.js';
import RoundedImage from '@/components/RoundedImage.vue';

const MessageList = defineAsyncComponent(() => import('@/components/MessageList.vue'));
const ChatInfoMenu = defineAsyncComponent(() => import('@/components/sideMenus/ChatInfoMenu.vue'));

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const serverStore = useServerStore();
const sendMessageStore = useSendingMessageStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();
const modalStore = useModalStore();

const messageListRef = ref();

const sideBarIsShowing = ref(false);

let conversation = conversationStore.GetConversationById(route.params.id);

watch(
  () => route.params.id,
  (newId) => {
    // noinspection PointlessBooleanExpressionJS
    if (newId in conversationStore.GetALLConversations() === false)
      router.push({ name: 'friendList' });

    sideBarIsShowing.value = false;

    conversation = conversationStore.GetConversationById(route.params.id);
    if (conversation) {
      if (conversation.conversationType === 1) document.title = conversation.conversationName;
      else
        document.title = userStore.GetUserById(
          conversation.participants.find((user) => user !== serverStore.user.userId),
        ).username;
    }
  },
  { immediate: true },
);

onMounted(() => {
  messageListRef.value.addEventListener('click', (event) => {
    let target = event.target.closest('.hidden-text');
    if (!target) return;
    target.classList.toggle('!bg-black/50');
    target.classList.toggle('!text-white');
    target.classList.toggle('!select-auto');
    let targetText = target.querySelector('span');
    if (!targetText) return;
    targetText.classList.toggle('invisible');
  });
});

function SendChatMessage() {}
</script>

<template>
  <input type="checkbox" id="sidebar-check" v-model="sideBarIsShowing" class="hidden" />
  <div class="group flex grow flex-col min-w-0" :class="{ 'sidebar-checked': sideBarIsShowing }">
    <chat-top-bar>
      <chat-left-side-menu-button class="group-[.sidebar-checked]:hidden" />
      <label
        for="sidebar-check"
        class="hidden text-xl text-white hover:text-gray-300 group-[.sidebar-checked]:block lg:!hidden">
        <i class="fa-solid fa-chevron-left"></i>
      </label>
      <div
        class="flex min-w-0 gap-2 items-center group-[.sidebar-checked]:hidden lg:!flex text-white"
        v-if="conversationStore.GetConversationById(route.params.id)?.conversationType === 1">
        <rounded-image
          :src="
            GetProfilePictureUrl(
              conversationStore.GetConversationById(route.params.id)?.conversationPicture,
            )
          "
          class="size-10"
          alt="chat image" />
        <h1 class="text-2xl font-bold truncate min-w-0 group-[.sidebar-checked]:hidden lg:!block">
          {{ conversationStore.GetConversationById(route.params.id)?.conversationName }}
        </h1>
        <span
          class="rounded-lg bg-white/20 p-1 flex-none hover:bg-white/40 select-none cursor-pointer"
          @click="
            () => {
              modalStore.OpenModal('editConversation', {
                conversation: conversationStore.GetConversationById(route.params.id),
              });
            }
          ">
          Edit
          <i class="fa-solid fa-pencil"></i>
        </span>
      </div>

      <user-item-full-detail
        v-else-if="conversationStore.GetConversationById(route.params.id)"
        :user="
          userStore.GetUserById(
            conversationStore
              .GetConversationById(route.params.id)
              ?.participants.find((user) => user !== serverStore.user.userId),
          )
        "
        class="text-white group-[.sidebar-checked]:hidden lg:!flex" />
      <label
        for="sidebar-check"
        class="ml-auto text-xl text-white hover:text-gray-300 group-[.sidebar-checked]:hidden lg:hidden">
        <i class="fa-solid fa-magnifying-glass"></i>
      </label>
      <form
        @submit.prevent="
          () => {
            searchStore.GetSearchDataById(route.params.id).searchIsShowing =
              searchStore.GetSearchDataById(route.params.id).searchQuery !== '';
            searchStore.SearchMessages(route.params.id);
          }
        "
        class="ml-auto hidden w-full group-[.sidebar-checked]:block lg:!block lg:max-w-[16rem]">
        <input
          class="w-full"
          type="text"
          v-model="searchStore.GetSearchDataById(route.params.id).searchQuery"
          placeholder="Search for text" />
      </form>
    </chat-top-bar>
    <div class="relative flex grow min-w-0 flex-row overflow-hidden bg-purple-600">
      <div class="flex flex-col bg-blue-600 grow min-w-0 lg:!flex" ref="messageListRef">
        <div class="size-full bg-gray-300">
          <message-list
            :conversation="conversationStore.GetConversationById(route.params.id)"
            :key="$route.path" />
        </div>
        <chat-area-info-bar
          :visible="conversationStore.GetConversationById(route.params.id)?.viewingOlderMessages"
          :bar-click="true"
          button-class="fa-solid fa-angles-down"
          @on-click="
            () => {
              conversationStore.TriggerJumpToBottom(route.params.id);
            }
          ">
          Viewing older messages click here to return
        </chat-area-info-bar>
        <chat-area-info-bar
          :visible="sendMessageStore.messageEditing"
          button-class="fa-solid fa-xmark"
          @on-click="
            () => {
              sendMessageStore.StopEditingMessage();
            }
          ">
          Editing message
        </chat-area-info-bar>
        <chat-area-info-bar
          :visible="sendMessageStore.replyTo"
          button-class="fa-solid fa-xmark"
          @on-click="
            () => {
              sendMessageStore.replyTo = null;
            }
          ">
          <span class="mr-1 text-white">replying to </span>
          <span class="font-bold text-white">
            {{ userStore.GetUserById(sendMessageStore.replyTo.senderId)?.username }}
          </span>
        </chat-area-info-bar>
        <div class="flex h-fit flex-none flex-row items-center bg-gray-600 px-6 py-2">
          <ChatTextBox
            @send-chat-message="SendChatMessage"
            :conversation="conversationStore.GetConversationById(route.params.id)" />
        </div>
      </div>
      <chat-info-menu
        class="flex-none absolute z-10 top-0 translate-x-full transition-transform h-full ease-out
          group-[.sidebar-checked]:translate-x-0 lg:translate-x-0 lg:transition-none lg:static"
        :conversationId="route.params.id" />
    </div>
  </div>
</template>
