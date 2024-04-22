<script setup>
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import {useSendingMessageStore} from "@/stores/sendingMessage.js";
import ChatTextBox from "@/components/ChatTextBox.vue";
import {defineAsyncComponent, watch} from "vue";
import {useRoute, useRouter} from "vue-router";

const MessageList = defineAsyncComponent(
    () => import('@/components/MessageList.vue')
)

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const sendMessageStore = useSendingMessageStore();

// noinspection PointlessBooleanExpressionJS
if (route.params.id in userStore.GetALLConversations() === false) {
  router.push({name: "friendList"});
}

let conversation = userStore.GetConversationById(route.params.id);
if (conversation)
  document.title = conversation.convoName;

watch(() => route.params.id, newId => {
  // noinspection PointlessBooleanExpressionJS
  if (newId in userStore.GetALLConversations() === false)
    router.push({name: "friendList"});

  conversation = userStore.GetConversationById(route.params.id);
  if (conversation)
    document.title = conversation.convoName;
})

function SendChatMessage() {
  let messageToSend = {
    senderId: userStore.myId,
    convoId: route.params.id,
    messageText: sendMessageStore.messageText,
    timeSend: Date.now(),
    meta: {}
  };

  if (sendMessageStore.messageEditing) {
    messageToSend = sendMessageStore.messageEditing;
    messageToSend.messageText = sendMessageStore.messageText;
  }

  if (sendMessageStore.replyTo) {
    messageToSend.meta['reply'] = {
      messageId: sendMessageStore.replyTo.messageId,
      userId: sendMessageStore.replyTo.senderId
    };
  } else if (messageToSend.meta.hasOwnProperty('reply')) {
    delete messageToSend.meta.reply;
  }


  userStore.SendMessage(route.params.id, messageToSend);

  let msgList = document.querySelector('#list-container');
  if (msgList && !sendMessageStore.messageEditing) {
    msgList.scroll({
      top: 0,
      behavior: "smooth"
    })
  } else {
    let msgElement = document.querySelector(`#message-list [data-msg-id="${sendMessageStore.messageEditing.messageId}"]`);
    if (msgElement)
      msgElement.scrollIntoView({
        block: 'center',
        behavior: 'smooth'
      });
  }

  sendMessageStore.messageText = "";
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-2xl font-bold">
        {{ userStore.GetConversationById(route.params.id)?.convoName }}
      </h1>
    </ChatTopBar>
    <div class="h-full bg-gray-300">
      <message-list :convoId="userStore.GetConversationById(route.params.id)?.convoId"/>
    </div>
    <div class="bg-gray-500 flex-none h-6 px-4 flex" v-if="sendMessageStore.messageEditing">
      <span class="text-white mr-1">Editing message</span>
      <span class="ml-auto text-white hover:text-gray-600" @click="()=> {sendMessageStore.StopEditingMessage()}">
        <i class="fa-solid fa-xmark"></i>
      </span>
    </div>
    <div class="bg-gray-500 flex-none h-6 px-4 flex" v-if="sendMessageStore.replyTo">
      <span class="text-white mr-1">replying to </span>
      <span class="text-white font-bold">
        {{ userStore.GetUserById(sendMessageStore.replyTo.senderId)?.userName }}
      </span>
      <span class="ml-auto text-white hover:text-gray-600" @click="()=> {sendMessageStore.replyTo = null}">
        <i class="fa-solid fa-xmark"></i>
      </span>
    </div>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="SendChatMessage"/>
    </div>
  </div>
</template>
