import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/user.js';

export const useConversationStore = defineStore('messageList', () => {
  const userStore = useUserStore();

  const conversations = reactive({
    // id: {
    //   convoId: "",
    //   convoName: "",
    //   convoType: 0, // 0 = private, 1 = group
    //   convoPicture: "",
    //   visibleMessages: [],
    //   participants: [],
    //   scrollPosition: 0,
    //   viewingOlderMessages: false,
    // },
  });

  const jumpToPlaceCallback = ref(null);

  function RegisterJumpCallback(callback) {
    jumpToPlaceCallback.value = callback;
  }

  function UnRegisterJumpCallback() {
    jumpToPlaceCallback.value = null;
  }

  function TriggerJumpToBottom(convoId) {
    if (!jumpToPlaceCallback.value) return;
    const olderMessage = userStore.GetOlderMessages(convoId, null, 25);
    ClearVisibleMessages(convoId);
    AddMessages(convoId, olderMessage);

    jumpToPlaceCallback.value(olderMessage, null);
  }

  function TriggerJumpToMessage(convoId, messageId) {
    if (!jumpToPlaceCallback.value) return;

    let centerMessage;
    let final = [];

    if (GetVisibleMessages(convoId).findIndex((x) => x.messageId === messageId) === -1) {
      centerMessage = userStore.GetMessageById(messageId);
      const newerMessages = userStore.GetNewerMessages(convoId, centerMessage.messageId, 25);
      const olderMessages = userStore.GetOlderMessages(convoId, centerMessage.messageId, 25);

      final = newerMessages.concat([centerMessage], olderMessages);

      ClearVisibleMessages(convoId);
      AddMessages(convoId, final);

      conversations[convoId].viewingOlderMessages = true;
    } else {
      centerMessage = userStore.GetMessageById(messageId);
    }

    jumpToPlaceCallback.value(final, centerMessage);
  }

  function GetALLConversations() {
    return conversations;
  }

  function GetConversationById(id) {
    return conversations[id];
  }

  function GetVisibleMessages(convoId) {
    if (!conversations.hasOwnProperty(convoId)) {
      conversations[convoId] = {
        convoId: convoId,
        visibleMessages: [],
        scrollPosition: 0,
        viewingOlderMessages: false,
      };
    }
    return conversations[convoId].visibleMessages;
  }

  function ClearVisibleMessages(convoId) {
    conversations[convoId].visibleMessages.splice(0, conversations[convoId].visibleMessages.length);
  }

  function GetFirstMessage(convoId) {
    return conversations[convoId].visibleMessages[0];
  }

  function GetLastMessage(convoId) {
    return conversations[convoId].visibleMessages[
      conversations[convoId].visibleMessages.length - 1
    ];
  }

  function AddMessage(convoId, message) {
    conversations[convoId].visibleMessages.push(message);
    conversations[convoId].visibleMessages.sort((a, b) => a.timeSend - b.timeSend);
  }

  function AddMessages(convoId, messages) {
    conversations[convoId].visibleMessages.push(...messages);
    conversations[convoId].visibleMessages.sort((a, b) => a.timeSend - b.timeSend);
  }

  function RemoveNewerMessages(convoId, amount) {
    conversations[convoId].visibleMessages.splice(
      conversations[convoId].visibleMessages.length - amount,
      amount,
    );
  }

  function RemoveOlderMessages(convoId, amount) {
    conversations[convoId].visibleMessages.splice(0, amount);
  }

  function DeleteMessage(convoId, messageId) {
    //this is insane
    conversations[convoId].visibleMessages.splice(
      conversations[convoId].visibleMessages.findIndex((x) => x.messageId === messageId),
      1,
    );
  }

  function SetScrollPosition(convoId, pos) {
    if (conversations.hasOwnProperty(convoId)) conversations[convoId].scrollPosition = pos;
  }

  function GetScrollPosition(convoId) {
    if (conversations.hasOwnProperty(convoId)) return conversations[convoId].scrollPosition;
    else return 0;
  }

  return {
    conversations,
    GetConversationById,
    GetALLConversations,
    GetVisibleMessages,
    ClearVisibleMessages,
    GetFirstMessage,
    GetLastMessage,
    AddMessage,
    AddMessages,
    RemoveNewerMessages,
    RemoveOlderMessages,
    DeleteMessage,
    SetScrollPosition,
    GetScrollPosition,
    RegisterJumpCallback,
    UnRegisterJumpCallback,
    TriggerJumpToMessage,
    TriggerJumpToBottom,
  };
});
