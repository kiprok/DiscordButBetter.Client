import { defineStore } from "pinia";
import { reactive } from "vue";

export const useMessageListStore = defineStore("messageList", () => {
  const conversations = reactive({
    id: {
      convoId: "",
      visibleMessages: [],
      scrollPosition: 0,
      viewingOlderMessages: false,
    },
  });

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
    conversations[convoId].visibleMessages.sort(
      (a, b) => a.timeSend - b.timeSend,
    );
  }

  function AddMessages(convoId, messages) {
    conversations[convoId].visibleMessages.push(...messages);
    conversations[convoId].visibleMessages.sort(
      (a, b) => a.timeSend - b.timeSend,
    );
  }

  function SetScrollPosition(convoId, pos) {
    if (conversations.hasOwnProperty(convoId))
      conversations[convoId].scrollPosition = pos;
  }

  function GetScrollPosition(convoId) {
    if (conversations.hasOwnProperty(convoId))
      return conversations[convoId].scrollPosition;
    else return 0;
  }

  return {
    conversations,
    GetVisibleMessages,
    GetFirstMessage,
    GetLastMessage,
    AddMessage,
    AddMessages,
    SetScrollPosition,
    GetScrollPosition,
  };
});
