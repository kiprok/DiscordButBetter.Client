<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(["SendChatMessage"]);

function SendChatMessage() {
  if (!sendMessageStore.messageText) return;
  emit("SendChatMessage");
}
</script>

<template>
  <div class="size-full">
    <form class="size-full flex items-center" @submit.prevent="SendChatMessage">
      <input
        v-model="sendMessageStore.messageText"
        id="chat-input"
        class="grow h-4/6 rounded-l-lg"
        type="text"
        autocomplete="off"
      />
      <button class="flex-none px-2 w-fit h-4/6 bg-white rounded-r-lg">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
