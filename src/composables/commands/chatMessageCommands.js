import { useConversationStore } from '@/stores/conversation.js';
import { useUserStore } from '@/stores/user.js';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';

export function RemoveChatMessage(conversationId, messageId) {
  const userStore = useUserStore();
  const conversationStore = useConversationStore();

  userStore.DeleteMessage(messageId);
  conversationStore.DeleteMessage(conversationId, messageId);
}

export function EditChatMessage(newMessage) {
  const sendMessageStore = useSendingMessageStore();

  sendMessageStore.EditMessage(newMessage);
  let chatInput = document.querySelector('#chat-input');
  if (chatInput) {
    chatInput.focus();
  }
}

export function ReplyToChatMessage(message) {
  const sendMessageStore = useSendingMessageStore();
  sendMessageStore.replyTo = message;
  let chatInput = document.querySelector('#chat-input');
  if (chatInput) {
    chatInput.focus();
  }
}
