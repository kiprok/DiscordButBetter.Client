<script setup>
import { useModalStore } from '@/stores/modalStore.js';
import {
  RemoveChatMessage,
  EditChatMessage,
  ReplyToChatMessage,
} from '@/composables/commands/chatMessageCommands.js';
import { useUserStore } from '@/stores/user.js';

const modalStore = useModalStore();
const userStore = useUserStore();

const props = defineProps(['modalName', 'modalArguments']);

console.log(props.modalArguments);
console.log(props.modalArguments.allowedFunctions);
console.log(props.modalName);
</script>

<template>
  <button
    @click="
      () => {
        ReplyToChatMessage(modalArguments.message);
        modalStore.CloseModal(modalName);
      }
    "
    v-if="modalArguments.allowedFunctions.allowReply"
    class="w-full py-4 text-xl text-white hover:bg-gray-700">
    Reply
  </button>
  <button
    @click="
      () => {
        EditChatMessage(modalArguments.message);
        modalStore.CloseModal(modalName);
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700"
    v-if="
      modalArguments.message.senderId === userStore.myId &&
      modalArguments.allowedFunctions.allowEdit
    ">
    Edit
  </button>
  <button
    @click="
      () => {
        RemoveChatMessage(modalArguments.convoId, modalArguments.message.messageId);
        modalStore.CloseModal(modalName);
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700"
    v-if="
      modalArguments.message.senderId === userStore.myId &&
      modalArguments.allowedFunctions.allowDelete
    ">
    Delete
  </button>
</template>

<style scoped></style>
