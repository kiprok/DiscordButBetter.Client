import { defineStore } from "pinia";
import { reactive } from "vue";

export const useConversationStore = defineStore("messageList", () => {
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

  function GetALLConversations() {
    console.log("Getting conversations");
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
      (a, b) => b.timeSend - a.timeSend,
    );
  }

  function AddMessages(convoId, messages) {
    conversations[convoId].visibleMessages.push(...messages);
    conversations[convoId].visibleMessages.sort(
      (a, b) => b.timeSend - a.timeSend,
    );
  }

  function DeleteMessage(convoId, messageId) {
    //this is insane
    conversations[convoId].visibleMessages.splice(
      conversations[convoId].visibleMessages.findIndex(
        (x) => x.messageId === messageId,
      ),
      1,
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
    GetConversationById,
    GetALLConversations,
    GetVisibleMessages,
    GetFirstMessage,
    GetLastMessage,
    AddMessage,
    AddMessages,
    DeleteMessage,
    SetScrollPosition,
    GetScrollPosition,
  };
});
