<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);

const textarea = ref(null);

function SendChatMessage() {
  if (!sendMessageStore.messageText) return;
  emit('SendChatMessage');
}

function autoResize() {
  if (sendMessageStore.messageText === '') {
    textarea.value.style.height = '';
    return;
  }
  if (textarea.value.scrollHeight > parseFloat(getComputedStyle(textarea.value).fontSize) * 1.5) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
}

function OnEnter(event) {
  const selStart = textarea.value.selectionStart;
  const isCursorAtEnd =
    textarea.value.selectionStart === textarea.value.value.length && textarea.value.selectionEnd === textarea.value.value.length;
  if (event.key === 'Enter' && !event.shiftKey && isCursorAtEnd) {
    SendChatMessage();
  } else if (event.key === 'Enter') {
    sendMessageStore.messageText =
      sendMessageStore.messageText.substring(0, textarea.value.selectionStart) +
      '\n' +
      sendMessageStore.messageText.substring(textarea.value.selectionEnd);
    setTimeout(() => {
      textarea.value.setSelectionRange(selStart + 1, selStart + 1);
      autoResize();
    }, 0);
  }
}

watch(
  () => sendMessageStore.messageText,
  () => {
    console.log('test');
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
        class="grow h-[1.5em] pl-2 rounded-l-lg no-underline focus-visible:outline-none max-h-24 resize-none"
        @keydown.enter.prevent="OnEnter"
        autocomplete="off"
      ></textarea>
      <button class="flex-none px-2 w-fit h-full bg-white rounded-r-lg">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
