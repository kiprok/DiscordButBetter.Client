<script setup>

import MessageList from "@/components/MessageList.vue";
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import ChatTextBox from "@/components/ChatTextBox.vue";
import { watch} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

if (route.params.id in userStore.GetALLConversations() === false) {
  router.push({name: "friendList"});
}


watch(() => route.params.id, newId => {
  if (newId in userStore.GetALLConversations() === false)
    router.push({name: "friendList"});
})

function SendChatMessage(message) {
  userStore.SendMessage(route.params.id, {
    senderId: userStore.myId,
    convoId: route.params.id,
    messageText: message,
    timeSend: Date.now(),
    meta: {}
  });
}

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-2xl font-bold">
        {{ userStore.GetConversationById(route.params.id)?.convoName }}
      </h1>
    </ChatTopBar>
    <message-list :convoId="userStore.GetConversationById(route.params.id)?.convoId"/>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="SendChatMessage"/>
    </div>
  </div>
</template>
