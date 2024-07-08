<script setup>
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { ref, watch } from 'vue';
import { insertAtCursor } from '@/composables/utility.js';
import { useUserStore } from '@/stores/user.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useServerStore } from '@/stores/server.js';

const userStore = useUserStore();
const serverStore = useServerStore();
const conversationStore = useConversationStore();
const sendMessageStore = useSendingMessageStore();
const emit = defineEmits(['SendChatMessage']);
const props = defineProps(['conversation']);

const textBox = ref();

async function SendChatMessage() {
  if (!sendMessageStore.messageText.trim()) return;

  if (sendMessageStore.messageEditing) {
    const editedMessage = {
      content: sendMessageStore.messageText,
      metadata: {
        ...sendMessageStore.messageEditing.metadata,
        edited: true,
      },
    };

    if (sendMessageStore.replyTo) {
      editedMessage.metadata['reply'] = {
        messageId: sendMessageStore.replyTo.messageId,
        userId: sendMessageStore.replyTo.senderId,
      };
    } else if (editedMessage.metadata.hasOwnProperty('reply')) {
      delete editedMessage.metadata.reply;
    }

    editedMessage.content = editedMessage.content.trim();

    const response = await serverStore.UpdateMessageAsync(
      sendMessageStore.messageEditing.messageId,
      editedMessage,
    );

    if (response) {
      userStore.SendMessage(response);
      conversationStore.UpdateMessage(props.conversation.conversationId, response);
      sendMessageStore.sendingMessage = response.messageId;
    }
  } else {
    let messageToSend = {
      conversationId: props.conversation.conversationId,
      content: sendMessageStore.messageText,
      metadata: {},
    };

    if (sendMessageStore.replyTo) {
      messageToSend.metadata['reply'] = {
        messageId: sendMessageStore.replyTo.messageId,
        userId: sendMessageStore.replyTo.senderId,
      };
    } else if (messageToSend.metadata.hasOwnProperty('reply')) {
      delete messageToSend.metadata.reply;
    }

    messageToSend.content = messageToSend.content.trim();
    const response = await serverStore.SendMessageAsync(messageToSend);
    if (response) {
      userStore.SendMessage(response);
      sendMessageStore.sendingMessage = response.messageId;

      if (!sendMessageStore.messageEditing && !props.conversation.viewingOlderMessages)
        conversationStore.AddMessage(props.conversation.conversationId, response);
      else sendMessageStore.sendingMessage = null;
    }
  }

  conversationStore.UpdateLastMessageTime(props.conversation.conversationId, Date.now());

  sendMessageStore.messageText = '';
  sendMessageStore.messageEditing = null;
  sendMessageStore.replyTo = null;
}

function onPaste(event) {
  const paste = (event.clipboardData || window.clipboardData).getData('text/plain');

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

  if (event.key === 'ArrowUp' && sendMessageStore.messageText === '') {
    let lastMessage = conversationStore.GetLastMessage(props.conversationId, userStore.myUserId);

    if (lastMessage) {
      sendMessageStore.EditMessage(lastMessage);
    }
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
        class="relative h-fit max-h-44 md:max-h-96 min-h-8 w-24 grow content-center overflow-y-scroll
          overflow-x-hidden rounded-l-lg bg-white"
        @click="textBox.focus">
        <div
          v-if="sendMessageStore.messageText.trim() === ''"
          class="absolute w-full min-w-0 z-10 top-1/2 -translate-y-1/2 left-2 select-none text-black/40 truncate
            pointer-events-none">
          Message @{{
            conversation?.conversationType === 1
              ? conversation.conversationName
              : userStore.GetUserById(
                  conversation?.participants.find((user) => user !== serverStore.user?.userId),
                )?.username
          }}
        </div>
        <div
          contenteditable="true"
          @paste.prevent="onPaste"
          ref="textBox"
          class="h-fit w-full whitespace-pre-wrap break-words py-2 pl-2 focus-visible:outline-none"
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
