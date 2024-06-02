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
    console.log('test');
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

  sendMessageStore.messageText = '';
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}
</script>

<template>
  <input type="checkbox" id="sidebar-check" v-model="sideBarIsShowing" class="hidden" />
  <div class="group flex grow flex-col min-w-0" :class="{ 'sidebar-checked': sideBarIsShowing }">
    <ChatTopBar class="h-14 flex-none">
      <chat-left-side-menu-button class="group-[.sidebar-checked]:hidden" />
      <label
        for="sidebar-check"
        class="hidden text-xl text-white hover:text-gray-300 group-[.sidebar-checked]:block lg:!hidden">
        <i class="fa-solid fa-chevron-left"></i>
      </label>

      <h1 class="text-2xl font-bold text-white group-[.sidebar-checked]:hidden lg:!block">
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
    </ChatTopBar>
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
      <div
        class="hidden h-full w-full flex-none overflow-hidden bg-gray-600 p-4 group-[.sidebar-checked]:block
          lg:!block"
        :class="{
          'lg:w-[18rem]': !searchStore.GetShowingStatus(route.params.id),
          'lg:w-[26rem]': searchStore.GetShowingStatus(route.params.id),
        }">
        <div
          class="size-full text-white"
          :class="{ hidden: !searchStore.GetShowingStatus(route.params.id) }">
          <div class="flex size-full flex-col">
            <div class="flex">
              <span class="h-fit flex-none text-lg font-bold"> search results </span>
              <div class="ml-auto flex-none">
                <button
                  @click="
                    () => {
                      searchStore.GetSearchDataById(route.params.id).searchIsShowing = false;
                      searchStore.GetSearchDataById(route.params.id).searchQuery = '';
                    }
                  "
                  class="text-lg text-white hover:text-gray-300">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div class="flex-grow overflow-auto">
              <ul class="flex size-full flex-col p-2">
                <li
                  v-for="result in searchStore.GetSearchResults(route.params.id)"
                  key="result.messageId"
                  class="group/item relative mt-2 flex flex-col rounded-md bg-black/20 p-3 transition-colors ease-in-out
                    hover:cursor-pointer hover:bg-black/10"
                  @click="
                    () => {
                      conversationStore.TriggerJumpToMessage(route.params.id, result.messageId);
                    }
                  ">
                  <message-list-item
                    :message="result"
                    :convoId="route.params.id"
                    :key="result.messageId"
                    :allowed-functions="{ allowReply: true }" />
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div :class="{ hidden: searchStore.GetShowingStatus(route.params.id) }">
          <span class="p-2 font-bold text-white">Members</span>
          <ul class="flex flex-col overflow-auto">
            <li
              v-for="participant in conversationStore.GetConversationById(route.params.id)
                ?.participants"
              :key="participant"
              class="rounded-lg p-2 text-xl text-white transition-colors ease-in-out hover:bg-black/30">
              <div class="flex flex-row flex-nowrap items-center gap-2">
                <img
                  :src="userStore.GetUserById(participant).profilePicture"
                  alt="pfp"
                  class="size-10 flex-none rounded-full" />
                <span> {{ userStore.GetUserById(participant).userName }} </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
