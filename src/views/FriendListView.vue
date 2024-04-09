<script setup>
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";

const userStore = useUserStore();


</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-3xl font-bold">
        Friends
      </h1>
    </ChatTopBar>
    <div>
      <span v-if="userStore.conversations.length > 0">
        {{userStore.conversations.length}} friends
      </span>
      <span v-else>
        no friends
      </span>

    </div>
  </div>
</template>