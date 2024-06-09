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
import MessageListItem from '@/components/MessageListItem.vue';
import PaginationButtons from '@/components/PaginationButtons.vue';
import ChatInfoMenu from '@/components/ChatInfoMenu.vue';

const MessageList = defineAsyncComponent(() => import('@/components/MessageList.vue'));

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sendMessageStore = useSendingMessageStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();

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
    if (conversation) document.title = conversation.convoName;
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

function SendChatMessage() {
  let messageToSend = {
    senderId: userStore.myId,
    convoId: route.params.id,
    messageText: sendMessageStore.messageText,
    timeSend: Date.now(),
    meta: {},
  };

  if (sendMessageStore.messageEditing) {
    messageToSend = sendMessageStore.messageEditing;
    messageToSend.messageText = sendMessageStore.messageText;
    messageToSend.meta['edited'] = true;
  }

  if (sendMessageStore.replyTo) {
    messageToSend.meta['reply'] = {
      messageId: sendMessageStore.replyTo.messageId,
      userId: sendMessageStore.replyTo.senderId,
    };
  } else if (messageToSend.meta.hasOwnProperty('reply')) {
    delete messageToSend.meta.reply;
  }

  messageToSend.messageText = messageToSend.messageText.trim();
  let msg = userStore.SendMessage(route.params.id, messageToSend);
  sendMessageStore.sendingMessage = msg.messageId;
  if (
    !sendMessageStore.messageEditing &&
    !conversationStore.GetConversationById(route.params.id).viewingOlderMessages
  )
    conversationStore.AddMessage(route.params.id, msg);
  else sendMessageStore.sendingMessage = null;

  if (conversationStore.GetConversationById(route.params.id).lastMessageTime < msg.timeSend)
    conversationStore.UpdateLastMessageTime(route.params.id, msg.timeSend);

  sendMessageStore.messageText = '';
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}
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

      <h1 class="text-2xl font-bold text-white truncate group-[.sidebar-checked]:hidden lg:!block">
        {{ conversationStore.GetConversationById(route.params.id)?.convoName }}
      </h1>
      <label
        for="sidebar-check"
        class="ml-auto text-xl text-white hover:text-gray-300 group-[.sidebar-checked]:hidden lg:hidden">
        <i class="fa-solid fa-magnifying-glass"></i>
      </label>
      <form
        @submit.prevent="
          () => {
            searchStore.GetSearchDataById(route.params.id).searchIsShowing = true;
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
    <div class="static flex grow min-w-0 flex-row overflow-hidden bg-purple-600">
      <div
        class="flex flex-col bg-blue-600 grow min-w-0 group-[.sidebar-checked]:hidden lg:!flex"
        ref="messageListRef">
        <div class="size-full bg-gray-300">
          <message-list
            :convoId="conversationStore.GetConversationById(route.params.id)?.convoId"
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
            {{ userStore.GetUserById(sendMessageStore.replyTo.senderId)?.userName }}
          </span>
        </chat-area-info-bar>
        <div class="flex h-fit flex-none flex-row items-center bg-gray-600 px-6 py-2">
          <ChatTextBox @send-chat-message="SendChatMessage" :convo-id="route.params.id" />
        </div>
      </div>
      <chat-info-menu
        class="flex-none hidden group-[.sidebar-checked]:block lg:!block"
        :convoId="route.params.id" />
    </div>
  </div>
</template>
