import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSendingMessageStore = defineStore('sendingMessage', () => {
  const messageText = ref('');
  const replyTo = ref(null);
  const messageEditing = ref(null);
  const sendingMessage = ref('');

  function EditMessage(message) {
    messageText.value = message.content;
    replyTo.value = message.metadata.reply || null;
    messageEditing.value = message;
  }

  function StopEditingMessage() {
    messageText.value = '';
    replyTo.value = null;
    messageEditing.value = null;
  }

  return {
    sendingMessage,
    messageText,
    replyTo,
    messageEditing,
    EditMessage,
    StopEditingMessage,
  };
});
