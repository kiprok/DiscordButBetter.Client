import { defineStore } from "pinia";
import { reactive, ref } from "vue";

export const useUserStore = defineStore("user", () => {
  const myUserName = ref("kiprok");
  const myId = crypto.randomUUID();
  const myProfilePicture = ref("https://i.imgur.com/Y86bvSa.jpeg");

  const users = reactive({
    [myId]: {
      userId: myId,
      userName: myUserName,
      profilePicture: myProfilePicture,
    },
  });

  const friends = reactive([]);

  const messages = reactive({
    /*
            "": {
                messageId: "",
                senderId: "",
                convoId: "",
                messageText: "",
                timeSend: 0,
                meta: {}
            }
             */
  });

  function SendMessage(convoId, message) {
    let newId = message.hasOwnProperty("messageId")
      ? message.messageId
      : crypto.randomUUID();
    messages[newId] = {
      messageId: newId,
      senderId: message.senderId,
      convoId: message.convoId,
      messageText: message.messageText,
      timeSend: message.timeSend,
      meta: message.meta,
    };
    return messages[newId];
  }

  function GetOlderMessages(convoId, startpointId, amount) {
    return Object.keys(messages)
      .filter(
        (key) =>
          convoId === messages[key].convoId &&
          (messages[startpointId]?.timeSend ?? Infinity) -
            messages[key].timeSend >
            0,
      )
      .toSorted((a, b) => messages[b].timeSend - messages[a].timeSend)
      .slice(0, amount)
      .map((key) => messages[key]);
  }

  function GetNewerMessages(convoId, startpointId, amount) {
    return Object.keys(messages)
      .filter(
        (key) =>
          convoId === messages[key].convoId &&
          (messages[startpointId]?.timeSend ?? 0) - messages[key].timeSend < 0,
      )
      .toSorted((a, b) => messages[a].timeSend - messages[b].timeSend)
      .slice(0, amount)
      .map((key) => messages[key]);
  }

  function GetUserById(id) {
    return users[id];
  }

  function GetMessageById(id) {
    return messages[id];
  }

  function GetFriendList() {
    return friends.map((friend) => users[friend]);
  }

  function DeleteMessage(messageId) {
    delete messages[messageId];
  }

  function AddUser(name, pfp) {
    let id = crypto.randomUUID();
    users[id] = {
      userId: id,
      userName: name,
      profilePicture: pfp,
    };

    return id;
  }

  function AddFriend(userId) {
    friends.push(userId);
  }

  return {
    myUserName,
    myId,
    myProfilePicture,
    users,
    friends,
    messages,
    AddUser,
    AddFriend,
    SendMessage,
    DeleteMessage,
    GetOlderMessages,
    GetNewerMessages,
    GetUserById,
    GetMessageById,
    GetFriendList,
  };
});
