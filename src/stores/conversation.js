import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';

export const useConversationStore = defineStore('messageList', () => {
  const userStore = useUserStore();
  const serverStore = useServerStore();

  const conversations = reactive({
    // id: {
    //   conversationId: "",
    //   ownerId: "",
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
    //   isLoadingMessages: false,
    // },
  });

  const visibleConversations = reactive(new Set());

  const jumpToPlaceCallback = ref(null);

  function Reset() {
    visibleConversations.clear();
  }

  function RegisterJumpCallback(callback) {
    jumpToPlaceCallback.value = callback;
  }

  function UnRegisterJumpCallback() {
    jumpToPlaceCallback.value = null;
  }

  function TriggerJumpToBottom(conversationId) {
    if (!jumpToPlaceCallback.value && conversations[conversationId].isLoadingMessages) return;

    //const olderMessage = userStore.GetOlderMessages(conversationId, null, 50);
    conversations[conversationId].isLoadingMessages = true;
    ClearVisibleMessages(conversationId);
    serverStore.GetMessagesAsync(conversationId).then((messages) => {
      if (messages == null) {
        conversations[conversationId].isLoadingMessages = false;
        return;
      }
      if (messages.length === 0) conversations[conversationId].isLoadingMessages = false;
      userStore.AddMessages(messages);
      AddMessages(conversationId, messages);
      jumpToPlaceCallback.value(messages, null);
    });
  }

  function TriggerJumpToMessage(conversationId, messageId) {
    if (!jumpToPlaceCallback.value && conversations[conversationId].isLoadingMessages) return;

    let centerMessage;

    if (GetVisibleMessages(conversationId).findIndex((x) => x.messageId === messageId) === -1) {
      conversations[conversationId].isLoadingMessages = true;
      ClearVisibleMessages(conversationId);
      serverStore.GetMessagesFromPointAsync(conversationId, messageId).then((messages) => {
        if (messages == null) {
          conversations[conversationId].isLoadingMessages = false;
          return;
        }
        if (messages.length === 0) conversations[conversationId].isLoadingMessages = false;
        userStore.AddMessages(messages);
        centerMessage = userStore.GetMessageById(messageId);
        console.log(messages);
        AddMessages(conversationId, messages);
        conversations[conversationId].viewingOlderMessages = true;
        jumpToPlaceCallback.value(messages, centerMessage);
      });
      return;
    }

    console.log('Jumping to message');
    centerMessage = userStore.GetMessageById(messageId);
    jumpToPlaceCallback.value([], centerMessage);
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
      newUnseenMessages: [],
      isLoadingMessages: false,
    };
    return conversations[convo.conversationId];
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
    console.log(conversations[conversationId].visibleMessages);
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
    if (
      conversations[conversationId].visibleMessages.find((x) => x.messageId === message.messageId)
    )
      return;
    conversations[conversationId].visibleMessages.push(message);

    conversations[conversationId].visibleMessages.sort(
      (a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt),
    );
  }

  function AddMessages(conversationId, messages) {
    conversations[conversationId].visibleMessages.push(...messages);

    conversations[conversationId].visibleMessages.sort(
      (a, b) => Date.parse(a.sentAt) - Date.parse(b.sentAt),
    );
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
    //console.log('setting scroll position', pos);
    if (conversations.hasOwnProperty(conversationId))
      conversations[conversationId].scrollPosition = pos;
  }

  function GetScrollPosition(conversationId) {
    if (conversations.hasOwnProperty(conversationId))
      return conversations[conversationId].scrollPosition;
    else return 0;
  }

  function UpdateLastMessageTime(conversationId, time) {
    conversations[conversationId].lastMessageTime = new Date(time).toISOString();
  }

  function RemoveNewUnseenMessage(conversationId, messageId) {
    const index = conversations[conversationId].newUnseenMessages.indexOf(messageId);
    if (index > -1) conversations[conversationId].newUnseenMessages.splice(index, 1);
  }

  return {
    Reset,
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
