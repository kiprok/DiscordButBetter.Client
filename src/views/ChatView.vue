<script setup>

import MessageList from "@/components/MessageList.vue";
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import ChatTextBox from "@/components/ChatTextBox.vue";
import {computed, reactive, ref, watch} from "vue";
import {useRoute, useRouter} from "vue-router";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

if(route.params.id in userStore.conversations === false){
  router.push({name: "friendList"});
}

const conversation = ref(userStore.conversations[route.params.id]);

watch(() => route.params.id, newId => {
  if(newId in userStore.conversations === false){
    router.push({name: "friendList"});
  }

  conversation.value = userStore.conversations[newId];
})

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-2xl font-bold">
        {{ conversation?.convoName }}
      </h1>
    </ChatTopBar>
    <message-list :messages="conversation?.messages"/>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="(message) => conversation.messages.push(message)"/>
    </div>
  </div>
</template>
