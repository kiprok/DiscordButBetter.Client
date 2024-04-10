<script setup>

import MessageList from "@/components/MessageList.vue";
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import ChatTextBox from "@/components/ChatTextBox.vue";

const userStore = useUserStore();

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-3xl font-bold">
        {{ userStore.conversations[$route.params.id].otherName }}
      </h1>
    </ChatTopBar>
    <message-list :messages="userStore.conversations[$route.params.id].messages"/>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="(message) => userStore.conversations[$route.params.id].messages.push(message)"/>
    </div>
  </div>
</template>
