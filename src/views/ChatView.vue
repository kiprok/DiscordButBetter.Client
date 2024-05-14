<script setup>
import ChatTopBar from "@/components/ChatTopBar.vue";
import { useUserStore } from "@/stores/user.js";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";
import ChatTextBox from "@/components/ChatTextBox.vue";
import { defineAsyncComponent, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useConversationStore } from "@/stores/conversation.js";
import ChatAreaInfoBar from "@/components/ChatAreaInfoBar.vue";

const MessageList = defineAsyncComponent(
  () => import("@/components/MessageList.vue"),
);

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sendMessageStore = useSendingMessageStore();
const conversationStore = useConversationStore();

const sideBarIsShowing = ref(false);

let conversation = conversationStore.GetConversationById(route.params.id);

watch(
  () => route.params.id,
  (newId) => {
    // noinspection PointlessBooleanExpressionJS
    if (newId in conversationStore.GetALLConversations() === false)
      router.push({ name: "friendList" });

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
    messageToSend.meta["reply"] = {
      messageId: sendMessageStore.replyTo.messageId,
      userId: sendMessageStore.replyTo.senderId,
    };
  } else if (messageToSend.meta.hasOwnProperty("reply")) {
    delete messageToSend.meta.reply;
  }

  let msg = userStore.SendMessage(route.params.id, messageToSend);
  sendMessageStore.sendingMessage = msg.messageId;
  if (
    !sendMessageStore.messageEditing &&
    !conversationStore.GetConversationById(route.params.id).viewingOlderMessages
  )
    conversationStore.AddMessage(route.params.id, msg);
  else sendMessageStore.sendingMessage = null;

  sendMessageStore.messageText = "";
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}
</script>

<template>
  <input
    type="checkbox"
    id="sidebar-check"
    v-model="sideBarIsShowing"
    class="hidden"
  />
  <div
    class="w-full flex flex-col flex-nowrap group"
    :class="{ 'sidebar-checked': sideBarIsShowing }"
  >
    <ChatTopBar class="flex-none">
      <h1
        class="text-white text-2xl font-bold group-[.sidebar-checked]:hidden lg:!block"
      >
        {{ conversationStore.GetConversationById(route.params.id)?.convoName }}
      </h1>
      <label
        for="sidebar-check"
        class="ml-auto text-white text-xl lg:hidden hover:text-gray-300"
      >
        <i class="fa-solid fa-magnifying-glass"></i>
      </label>
    </ChatTopBar>
    <div class="grow relative bg-purple-600 flex flex-row">
      <div class="grow bg-blue-600 flex flex-col flex-nowrap">
        <div class="grow bg-gray-300">
          <message-list
            :convoId="
              conversationStore.GetConversationById(route.params.id)?.convoId
            "
            :key="$route.path"
          />
        </div>
        <chat-area-info-bar
          :visible="
            conversationStore.GetConversationById(route.params.id)
              ?.viewingOlderMessages
          "
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
            {{
              userStore.GetUserById(sendMessageStore.replyTo.senderId)?.userName
            }}
          </span>
        </chat-area-info-bar>
        <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
          <ChatTextBox class="w-full" @send-chat-message="SendChatMessage" />
        </div>
      </div>
      <div
        class="flex-none absolute w-full h-full lg:relative hidden lg:!block group-[.sidebar-checked]:block lg:w-[22rem] bg-gray-600"
      ></div>
    </div>
  </div>
</template>
