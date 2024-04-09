<script setup>

import MessageList from "@/components/MessageList.vue";
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";

const userStore = useUserStore();

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-3xl font-bold">
        Title
      </h1>
    </ChatTopBar>
  <message-list :messages="userStore.conversations[$route.params.id].messages" />
  </div>
</template>
