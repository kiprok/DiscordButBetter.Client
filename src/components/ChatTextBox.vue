<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {useSendingMessageStore} from "@/stores/sendingMessage.js";
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage'])

function SendChatMessage(){
  if (!sendMessageStore.messageText)
    return;
  emit("SendChatMessage");
}

</script>

<template>
  <div class="flex flex-row items-center">
    <input @keyup.enter="SendChatMessage" v-model="sendMessageStore.messageText" id="chat-input" class="grow h-6">
    <SimpleButton @click="SendChatMessage" class="flex-none px-2 w-fit h-6 rounded-l-none">send</SimpleButton>
  </div>
</template>