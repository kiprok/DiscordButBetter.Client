<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
import { insertAtCursor } from '@/composables/utility.js';
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);

const textBox = ref();

function SendChatMessage() {
  if (!sendMessageStore.messageText) return;
  emit('SendChatMessage');
}

function onPaste(event) {
  const paste = (event.clipboardData || window.clipboardData).getData(
    'text/plain',
  );

  document.execCommand('insertText', false, paste);
  //insertAtCursor(paste);

  onInput();
}

function OnEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    SendChatMessage();
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
    <form class="size-full flex items-center" @submit.prevent="SendChatMessage">
      <div
        class="grow content-center h-fit w-24 min-h-8 rounded-l-lg bg-white max-h-44 overflow-y-scroll"
        @click="textBox.focus"
      >
        <div
          contenteditable="true"
          @paste.prevent="onPaste"
          ref="textBox"
          class="h-fit w-full break-words pl-2 py-2 focus-visible:outline-none"
          @keydown.enter="OnEnter"
          @input="onInput"
          @blur="onInput"
          id="chat-input"
        ></div>
      </div>
      <button class="flex-none px-2 w-fit h-full bg-white rounded-r-lg">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
