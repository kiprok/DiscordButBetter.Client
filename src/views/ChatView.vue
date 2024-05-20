<script setup>
import ChatTopBar from '@/components/ChatTopBar.vue';
import { useUserStore } from '@/stores/user.js';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import ChatTextBox from '@/components/ChatTextBox.vue';
import { defineAsyncComponent, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useConversationStore } from '@/stores/conversation.js';
import ChatAreaInfoBar from '@/components/ChatAreaInfoBar.vue';
import ChatLeftSideMenuButton from '@/components/ChatLeftSideMenuButton.vue';
import { useSearchStore } from '@/stores/search.js';

const MessageList = defineAsyncComponent(() => import('@/components/MessageList.vue'));

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sendMessageStore = useSendingMessageStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();

const sideBarIsShowing = ref(false);

let conversation = conversationStore.GetConversationById(route.params.id);

watch(
  () => route.params.id,
  (newId) => {
    // noinspection PointlessBooleanExpressionJS
    if (newId in conversationStore.GetALLConversations() === false) router.push({ name: 'friendList' });

    sideBarIsShowing.value = false;

    conversation = conversationStore.GetConversationById(route.params.id);
    if (conversation) document.title = conversation.convoName;
  },
  { immediate: true },
);

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
  }

  if (sendMessageStore.replyTo) {
    messageToSend.meta['reply'] = {
      messageId: sendMessageStore.replyTo.messageId,
      userId: sendMessageStore.replyTo.senderId,
    };
  } else if (messageToSend.meta.hasOwnProperty('reply')) {
    delete messageToSend.meta.reply;
  }

  let msg = userStore.SendMessage(route.params.id, messageToSend);
  sendMessageStore.sendingMessage = msg.messageId;
  if (!sendMessageStore.messageEditing && !conversationStore.GetConversationById(route.params.id).viewingOlderMessages)
    conversationStore.AddMessage(route.params.id, msg);
  else sendMessageStore.sendingMessage = null;

  sendMessageStore.messageText = '';
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}
</script>

<template>
  <input type="checkbox" id="sidebar-check" v-model="sideBarIsShowing" class="hidden" />
  <div class="size-full flex flex-col group" :class="{ 'sidebar-checked': sideBarIsShowing }">
    <ChatTopBar class="flex-none h-14">
      <chat-left-side-menu-button class="group-[.sidebar-checked]:hidden" />
      <label for="sidebar-check" class="text-white text-xl hover:text-gray-300 hidden group-[.sidebar-checked]:block lg:!hidden">
        <i class="fa-solid fa-chevron-left"></i>
      </label>

      <h1 class="text-white text-2xl font-bold group-[.sidebar-checked]:hidden lg:!block">
        {{ conversationStore.GetConversationById(route.params.id)?.convoName }}
      </h1>
      <label for="sidebar-check" class="ml-auto text-white text-xl group-[.sidebar-checked]:hidden lg:hidden hover:text-gray-300">
        <i class="fa-solid fa-magnifying-glass"></i>
      </label>
      <form
        @submit.prevent="
          () => {
            searchStore.GetSearchDataById(route.params.id).searchIsShowing = !searchStore.GetSearchDataById(route.params.id)
              .searchIsShowing;
            searchStore.SearchMessages(route.params.id);
          }
        "
        class="w-full hidden group-[.sidebar-checked]:block lg:max-w-[16rem] ml-auto lg:!block"
      >
        <input
          class="w-full"
          type="text"
          v-model="searchStore.GetSearchDataById(route.params.id).searchQuery"
          placeholder="Search for text"
        />
      </form>
    </ChatTopBar>
    <div class="grow static bg-purple-600 overflow-hidden flex flex-row">
      <div class="grow bg-blue-600 flex flex-col lg:!flex group-[.sidebar-checked]:hidden">
        <div class="grow bg-gray-300">
          <message-list :convoId="conversationStore.GetConversationById(route.params.id)?.convoId" :key="$route.path" />
        </div>
        <chat-area-info-bar
          :visible="conversationStore.GetConversationById(route.params.id)?.viewingOlderMessages"
          :bar-click="true"
          button-class="fa-solid fa-angles-down"
          @on-click="
            () => {
              conversationStore.TriggerJumpToBottom(route.params.id);
            }
          "
        >
          Viewing older messages click here to return
        </chat-area-info-bar>
        <chat-area-info-bar
          :visible="sendMessageStore.messageEditing"
          button-class="fa-solid fa-xmark"
          @on-click="
            () => {
              sendMessageStore.StopEditingMessage();
            }
          "
        >
          Editing message
        </chat-area-info-bar>
        <chat-area-info-bar
          :visible="sendMessageStore.replyTo"
          button-class="fa-solid fa-xmark"
          @on-click="
            () => {
              sendMessageStore.replyTo = null;
            }
          "
        >
          <span class="text-white mr-1">replying to </span>
          <span class="text-white font-bold">
            {{ userStore.GetUserById(sendMessageStore.replyTo.senderId)?.userName }}
          </span>
        </chat-area-info-bar>
        <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
          <ChatTextBox @send-chat-message="SendChatMessage" />
        </div>
      </div>
      <div
        class="flex-none w-full h-full hidden overflow-hidden lg:!block group-[.sidebar-checked]:block bg-gray-600 p-4"
        :class="{
          'lg:w-[18rem]': !searchStore.GetShowingStatus(route.params.id),
          'lg:w-[24rem]': searchStore.GetShowingStatus(route.params.id),
        }"
      >
        <div class="text-white size-full" :class="{ hidden: !searchStore.GetShowingStatus(route.params.id) }">
          <div class="size-full flex flex-col">
            <div class="flex">
              <span class="font-bold text-lg h-fit flex-none"> search results </span>
              <div class="flex-none ml-auto">
                <button
                  @click="
                    () => {
                      searchStore.GetSearchDataById(route.params.id).searchIsShowing = false;
                    }
                  "
                  class="text-white hover:text-gray-300 text-lg"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            </div>

            <div class="flex-grow overflow-auto">
              <ul class="size-full flex flex-col p-2">
                <li
                  v-for="(result, index) in searchStore.GetSearchResults(route.params.id)"
                  key="result.messageId"
                  class="flex flex-col relative group/item bg-black/20 hover:bg-black/10 hover:cursor-pointer transition-colors ease-in-out rounded-md p-3 mt-2"
                  @click="
                    () => {
                      conversationStore.TriggerJumpToMessage(route.params.id, result.messageId);
                    }
                  "
                >
                  <div class="flex flex-row justify-between relative">
                    <div class="w-10 ml-1 mr-2 mt-0 flex-none">
                      <img
                        :src="userStore.GetUserById(result.senderId).profilePicture"
                        alt="profile picture"
                        class="rounded-full size-full h-10"
                      />
                    </div>
                    <div class="flex flex-col grow w-12">
                      <div class="flex items-center gap-1">
                        <h3 class="text-lg block truncate">
                          {{ userStore.GetUserById(result.senderId).userName }}
                        </h3>
                        <span class="text-xs block shrink-0">{{ new Date(result.timeSend).toLocaleTimeString() }}</span>
                      </div>
                      <span class="text-pretty break-words w-full">{{ result.messageText }}</span>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div :class="{ hidden: searchStore.GetShowingStatus(route.params.id) }">
          <span class="text-white font-bold p-2">Members</span>
          <ul class="flex flex-col overflow-auto">
            <li
              v-for="(participant, index) in conversationStore.GetConversationById(route.params.id)?.participants"
              :key="participant"
              class="text-xl text-white hover:bg-black/30 p-2 transition-colors ease-in-out rounded-lg"
            >
              <div class="flex flex-nowrap flex-row items-center gap-2">
                <img :src="userStore.GetUserById(participant).profilePicture" alt="pfp" class="rounded-full size-10 flex-none" />
                <span> {{ userStore.GetUserById(participant).userName }} </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
