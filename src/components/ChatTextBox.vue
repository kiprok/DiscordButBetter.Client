<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);

const textarea = ref();

function SendChatMessage() {
  if (!sendMessageStore.messageText.trim()) return;
  emit('SendChatMessage');
}

function autoResize() {
  if (
    sendMessageStore.messageText === '' ||
    sendMessageStore.messageText.split('\n').length === 1
  ) {
    textarea.value.style.height = '';
    return;
  }
  if (
    textarea.value.scrollHeight >
    parseFloat(getComputedStyle(textarea.value).fontSize) * 2
  ) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
}

function OnEnter(event) {
  if (textarea.value.selectionStart !== textarea.value.selectionEnd) return;

  const isCursorAtEnd =
    textarea.value.selectionEnd === textarea.value.value.length;
  if (event.key === 'Enter' && !event.shiftKey && isCursorAtEnd) {
    SendChatMessage();
    event.preventDefault();
  }
}

watch(
  () => sendMessageStore.messageText,
  () => {
    setTimeout(() => {
      autoResize();
    }, 0);
  },
);
</script>

<template>
  <div class="size-full">
    <form class="size-full flex items-center" @submit.prevent="SendChatMessage">
      <textarea
        v-model="sendMessageStore.messageText"
        ref="textarea"
        id="chat-input"
        class="grow h-[2em] pl-2 pt-1 rounded-l-lg no-underline focus-visible:outline-none max-h-32 resize-none"
        @keydown.enter="OnEnter"
        autocomplete="off"
      ></textarea>
      <button class="flex-none px-2 w-fit h-full bg-white rounded-r-lg">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
