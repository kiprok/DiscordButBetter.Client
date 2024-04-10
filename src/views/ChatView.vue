<script setup>

import MessageList from "@/components/MessageList.vue";
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import ChatTextBox from "@/components/ChatTextBox.vue";
import {reactive, watch} from "vue";
import {useRoute} from "vue-router";

const route = useRoute()

const userStore = useUserStore();

const user = reactive({currentConversation: userStore.conversations[route.params.id]})

watch(() => route.params.id, newId => {
  user.currentConversation = userStore.conversations[newId]
})



</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-3xl font-bold">
        {{ user.currentConversation.otherName }}
      </h1>
    </ChatTopBar>
    <message-list :messages="user.currentConversation.messages"/>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="(message) => user.currentConversation.messages.push(message)"/>
    </div>
  </div>
</template>
