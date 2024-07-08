import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/user.js';

export const useConversationStore = defineStore('messageList', () => {
  const conversations = reactive({
    // id: {
    //   conversationId: "",
    //   conversationName: "",
    //   conversationType: 0, // 0 = private, 1 = group
    //   conversationPicture: "",
    //   visibleMessages: [],
    //   participants: [],
    //   scrollPosition: 0,
    //   viewingOlderMessages: false,
    //   lastMessageTime: 0,
    //   lastSeenMessage: "",
    //   newUnseenMessages: [],
    // },
  });

  const visibleConversations = reactive(new Set());

  const jumpToPlaceCallback = ref(null);

  function RegisterJumpCallback(callback) {
    jumpToPlaceCallback.value = callback;
  }

  function UnRegisterJumpCallback() {
    jumpToPlaceCallback.value = null;
  }

  function TriggerJumpToBottom(conversationId) {
    const userStore = useUserStore();
    if (!jumpToPlaceCallback.value) return;
    const olderMessage = userStore.GetOlderMessages(conversationId, null, 50);
    ClearVisibleMessages(conversationId);
    AddMessages(conversationId, olderMessage);

    jumpToPlaceCallback.value(olderMessage, null);
  }

  function TriggerJumpToMessage(conversationId, messageId) {
    const userStore = useUserStore();
    if (!jumpToPlaceCallback.value) return;

    let centerMessage;
    let final = [];

    if (GetVisibleMessages(conversationId).findIndex((x) => x.messageId === messageId) === -1) {
      centerMessage = userStore.GetMessageById(messageId);
      const newerMessages = userStore.GetNewerMessages(conversationId, centerMessage.messageId, 25);
      const olderMessages = userStore.GetOlderMessages(conversationId, centerMessage.messageId, 25);

      final = newerMessages.concat([centerMessage], olderMessages);

      ClearVisibleMessages(conversationId);
      AddMessages(conversationId, final);

      conversations[conversationId].viewingOlderMessages = true;
    } else {
      centerMessage = userStore.GetMessageById(messageId);
    }

    jumpToPlaceCallback.value(final, centerMessage);
  }

  function GetALLConversations() {
    return conversations;
  }

  function AddConversation(convo) {
    conversations[convo.conversationId] = {
      ...convo,
      visibleMessages: [],
      scrollPosition: 0,
      viewingOlderMessages: false,
      lastSeenMessage: '',
      lastMessageTime: 0,
      newUnseenMessages: [],
    };
  }

  function GetVisibleConversations() {
    return [...visibleConversations].map((x) => conversations[x]);
  }

  function AddVisibleConversation(conversationId) {
    visibleConversations.add(conversationId);
  }

  function RemoveVisibleConversation(conversationId) {
    visibleConversations.delete(conversationId);
  }

  function GetConversationById(id) {
    return conversations[id];
  }

  function GetVisibleMessages(conversationId) {
    if (!conversations.hasOwnProperty(conversationId)) {
      conversations[conversationId] = {
        conversationId: conversationId,
        visibleMessages: [],
        scrollPosition: 0,
        viewingOlderMessages: false,
      };
    }
    return conversations[conversationId].visibleMessages;
  }

  function ClearVisibleMessages(conversationId) {
    conversations[conversationId].visibleMessages.splice(
      0,
      conversations[conversationId].visibleMessages.length,
    );
  }

  function GetFirstMessage(conversationId) {
    return conversations[conversationId].visibleMessages[0];
  }

  function GetLastMessage(conversationId) {
    return conversations[conversationId].visibleMessages[
      conversations[conversationId].visibleMessages.length - 1
    ];
  }

  function UpdateMessage(conversationId, message) {
    if (!conversations[conversationId]) return;
    if (conversations[conversationId].visibleMessages.includes(message)) return;
    const index = conversations[conversationId].visibleMessages.findIndex(
      (x) => x.messageId === message.messageId,
    );
    conversations[conversationId].visibleMessages[index] = message;
  }

  function AddMessage(conversationId, message) {
    if (!conversations[conversationId]) return;
    if (conversations[conversationId].visibleMessages.includes(message)) return;
    conversations[conversationId].visibleMessages.push(message);
    conversations[conversationId].visibleMessages.sort((a, b) => a.sentAt - b.sentAt);
  }

  function AddMessages(conversationId, messages) {
    conversations[conversationId].visibleMessages.push(...messages);
    conversations[conversationId].visibleMessages.sort((a, b) => a.sentAt - b.sentAt);
  }

  function RemoveNewerMessages(conversationId, amount) {
    return conversations[conversationId].visibleMessages.splice(
      conversations[conversationId].visibleMessages.length - amount,
      amount,
    );
  }

  function RemoveOlderMessages(conversationId, amount) {
    return conversations[conversationId].visibleMessages.splice(0, amount);
  }

  function DeleteMessage(conversationId, messageId) {
    //this is insane
    conversations[conversationId].visibleMessages.splice(
      conversations[conversationId].visibleMessages.findIndex((x) => x.messageId === messageId),
      1,
    );
  }

  function GetLastMessageOfUser(conversationId, userId) {
    const messages = GetVisibleMessages(conversationId).filter((x) => x.userId === userId);
    return messages[messages.length - 1];
  }

  function SetScrollPosition(conversationId, pos) {
    if (conversations.hasOwnProperty(conversationId))
      conversations[conversationId].scrollPosition = pos;
  }

  function GetScrollPosition(conversationId) {
    if (conversations.hasOwnProperty(conversationId))
      return conversations[conversationId].scrollPosition;
    else return 0;
  }

  function UpdateLastMessageTime(conversationId, time) {
    conversations[conversationId].lastMessageTime = time;
  }

  function RemoveNewUnseenMessage(conversationId, messageId) {
    const index = conversations[conversationId].newUnseenMessages.indexOf(messageId);
    if (index > -1) conversations[conversationId].newUnseenMessages.splice(index, 1);
  }

  return {
    conversations,
    GetConversationById,
    AddConversation,
    GetALLConversations,
    GetVisibleConversations,
    AddVisibleConversation,
    RemoveVisibleConversation,
    GetVisibleMessages,
    ClearVisibleMessages,
    GetFirstMessage,
    GetLastMessage,
    UpdateMessage,
    AddMessage,
    AddMessages,
    RemoveNewerMessages,
    RemoveOlderMessages,
    GetLastMessageOfUser,
    DeleteMessage,
    SetScrollPosition,
    GetScrollPosition,
    RegisterJumpCallback,
    UnRegisterJumpCallback,
    TriggerJumpToMessage,
    TriggerJumpToBottom,
    UpdateLastMessageTime,
    RemoveNewUnseenMessage,
  };
});
