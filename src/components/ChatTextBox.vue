<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
import { insertAtCursor } from '@/composables/utility.js';
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);

const textBox = ref();

function SendChatMessage() {
  if (!sendMessageStore.messageText.trim()) return;
  emit('SendChatMessage');
}

function onPaste(event) {
  const paste = (event.clipboardData || window.clipboardData).getData(
    'text/plain',
  );

  insertAtCursor(paste);

  onInput();
}

function OnKeyDown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    SendChatMessage();
  }
  if (event.key === 'Tab') {
    event.preventDefault();
    insertAtCursor('\t');
    onInput();
  }
}

watch(
  () => sendMessageStore.messageText,
  (newVal) => {
    if (textBox.value)
      if (textBox.value?.innerText !== newVal) {
        textBox.value.innerText = newVal;
      }
  },
  { immediate: true },
);

function onInput() {
  sendMessageStore.messageText = textBox.value?.innerText ?? '';
}
</script>

<template>
  <div class="size-full">
    <form class="flex size-full items-center" @submit.prevent="SendChatMessage">
      <div
        class="h-fit max-h-44 md:max-h-96 min-h-8 w-24 grow content-center overflow-y-scroll
          rounded-l-lg bg-white"
        @click="textBox.focus">
        <div
          contenteditable="true"
          @paste.prevent="onPaste"
          ref="textBox"
          class="h-fit w-full whitespace-pre-wrap break-words py-2 pl-2
            focus-visible:outline-none"
          @keydown="OnKeyDown"
          @input="onInput"
          @blur="onInput"
          id="chat-input"></div>
      </div>
      <button class="h-full w-fit flex-none rounded-r-lg bg-white px-2">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
