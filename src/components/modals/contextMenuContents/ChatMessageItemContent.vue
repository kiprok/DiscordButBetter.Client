<script setup>
import { useContextMenuStore } from '@/stores/contextModal.js';
import {
  RemoveChatMessage,
  EditChatMessage,
  ReplyToChatMessage,
} from '@/composables/commands/chatMessageCommands.js';
import { useUserStore } from '@/stores/user.js';

const contextMenuStore = useContextMenuStore();
const userStore = useUserStore();
</script>

<template>
  <button
    @click="
      () => {
        ReplyToChatMessage(contextMenuStore.contextMenuArguments.message);
        contextMenuStore.ShowContextMenu = false;
      }
    "
    v-if="contextMenuStore.contextMenuArguments.allowedFunctions.allowReply"
    class="w-full py-4 text-xl text-white hover:bg-gray-700">
    Reply
  </button>
  <button
    @click="
      () => {
        EditChatMessage(contextMenuStore.contextMenuArguments.message);
        contextMenuStore.ShowContextMenu = false;
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700"
    v-if="
      contextMenuStore.contextMenuArguments.message.senderId === userStore.myId &&
      contextMenuStore.contextMenuArguments.allowedFunctions.allowEdit
    ">
    Edit
  </button>
  <button
    @click="
      () => {
        RemoveChatMessage(
          contextMenuStore.contextMenuArguments.convoId,
          contextMenuStore.contextMenuArguments.message.messageId,
        );
        contextMenuStore.ShowContextMenu = false;
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700"
    v-if="
      contextMenuStore.contextMenuArguments.message.senderId === userStore.myId &&
      contextMenuStore.contextMenuArguments.allowedFunctions.allowDelete
    ">
    Delete
  </button>
</template>

<style scoped></style>
