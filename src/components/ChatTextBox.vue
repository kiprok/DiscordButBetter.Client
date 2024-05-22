<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);

const textarea = ref(null);
const textBox = ref(null);

function SendChatMessage() {
  if (!sendMessageStore.messageText) return;
  emit('SendChatMessage');
}

function autoResize() {
  if (sendMessageStore.messageText === '') {
    textarea.value.style.height = '';
    return;
  }
  if (
    textarea.value.scrollHeight >
    parseFloat(getComputedStyle(textarea.value).fontSize) * 1.5
  ) {
    textarea.value.style.height = 'auto';
    textarea.value.style.height = `${textarea.value.scrollHeight}px`;
  }
}

function onPaste(event) {
  const paste = (event.clipboardData || window.clipboardData).getData('text');

  // Split pasted data into lines
  const lines = paste.split('\n');

  // Insert each line as a separate text node
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  selection.deleteFromDocument();
  lines.forEach((line, index) => {
    selection.getRangeAt(0).insertNode(document.createTextNode(line));
    if (index < lines.length - 1) {
      selection.getRangeAt(0).insertNode(document.createElement('br'));
    }
  });
  selection.collapseToEnd();
}

function OnEnter(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    const lines = event.target.innerText.split('\n');
    const lastLine = lines[lines.length - 1];
    const caretPos = window.getSelection().getRangeAt(0).endOffset;
    const caretLine = window.getSelection().getRangeAt(0)
      .startContainer.textContent;
    console.log(caretPos, caretLine, lastLine);
    if (caretPos === lastLine.length && caretLine === lastLine) {
      event.preventDefault();
      SendChatMessage();
    }
  }
}

watch(
  () => sendMessageStore.messageText,
  (newVal) => {
    if (textBox.value)
      if (textBox.value?.innerText !== newVal) {
        console.log('test');
        textBox.value.innerText = newVal;
      }
  },
  { immediate: true },
);

function onInput() {
  sendMessageStore.messageText = textBox.value?.innerText;
}
</script>

<template>
  <div class="size-full">
    <form class="size-full flex items-center" @submit.prevent="SendChatMessage">
      <div
        class="grow content-center h-fit w-24 min-h-8 rounded-l-lg bg-white max-h-44 overflow-y-scroll"
      >
        <div
          contenteditable="true"
          @paste.prevent="onPaste"
          ref="textBox"
          class="h-fit w-full break-words inline-block focus-visible:outline-none"
          @keydown.enter="OnEnter"
          @input="onInput"
        ></div>
      </div>
      <button class="flex-none px-2 w-fit h-full bg-white rounded-r-lg">
        <i class="fa-solid fa-share"></i>
      </button>
    </form>
  </div>
</template>
