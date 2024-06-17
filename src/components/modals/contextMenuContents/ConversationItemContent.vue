<script setup>
import { useContextMenuStore } from '@/stores/contextModal.js';
import { useConversationStore } from '@/stores/conversation.js';
import { ReplyToChatMessage } from '@/composables/commands/chatMessageCommands.js';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const contextMenuStore = useContextMenuStore();
const conversationStore = useConversationStore();

async function CloseConversation() {
  conversationStore.RemoveVisibleConversation(contextMenuStore.contextMenuArguments.convoId);
  if (route.params.id === contextMenuStore.contextMenuArguments.convoId) {
    await router.push({ name: 'friendList' });
  }
}
</script>

<template>
  <button
    @click="
      () => {
        CloseConversation();
        contextMenuStore.ShowContextMenu = false;
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700">
    close
  </button>
</template>
