<script setup>
import { useModalStore } from '@/stores/modalStore.js';
import { useConversationStore } from '@/stores/conversation.js';
import { ReplyToChatMessage } from '@/composables/commands/chatMessageCommands.js';
import { useRoute, useRouter } from 'vue-router';

const props = defineProps(['modalName', 'modalArguments']);

const router = useRouter();
const route = useRoute();
const modalStore = useModalStore();
const conversationStore = useConversationStore();

async function CloseConversation() {
  conversationStore.RemoveVisibleConversation(props.modalArguments.conversationId);
  if (route.params.id === props.modalArguments.conversationId) {
    await router.push({ name: 'friendList' });
  }
}
</script>

<template>
  <button
    @click="
      () => {
        CloseConversation();
        modalStore.CloseModal(modalName);
      }
    "
    class="w-full py-4 text-xl text-white hover:bg-gray-700">
    close
  </button>
</template>
