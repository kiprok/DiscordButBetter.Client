import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useServerStore } from '@/stores/server.js';

export const useUserStore = defineStore('user', () => {
  const serverStore = useServerStore();

  const myUserName = ref('kiprok');
  const myId = crypto.randomUUID();
  const myProfilePicture = ref('https://i.imgur.com/Y86bvSa.jpeg');


  const users = reactive({
    [myId]: {
      userId: myId,
      username: myUserName,
      profilePicture: myProfilePicture,
      status: 1,
      statusMessage: 'I am a cool person',
      biography: 'I am a cool person who does cool things.\nAnd i im going to do more cool things.',
    },
  });

  const friends = reactive(new Set());
  const friendRequests = reactive(new Set());

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
    let newId = message.hasOwnProperty('messageId') ? message.messageId : crypto.randomUUID();
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
          (messages[startpointId]?.timeSend ?? Infinity) - messages[key].timeSend > 0,
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

  function GetConversationMessages(convoId) {
    return Object.keys(messages)
      .filter((key) => convoId === messages[key].convoId)
      .toSorted((a, b) => messages[a].timeSend - messages[b].timeSend)
      .map((key) => messages[key]);
  }

  function SearchUsers(query) {
    if (query === '' || query === undefined || query === null) return [];
    return Object.values(users).filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) &&
        !friends.has(user.userId) &&
        user.userId !== myId,
    );
  }

  function GetUserById(id) {
    return users[id];
  }

  function GetMessageById(id) {
    return messages[id];
  }

  function GetFriendList() {
    return [...friends].map((friend) => users[friend]);
  }

  function GetFriendRequests() {
    return [...friendRequests].map((request) => users[request]);
  }

  function AddFriendRequest(request, user) {
    if (friendRequests.has(request.senderId)) return;
    users[request.senderId] = user;
    friendRequests.add(request.senderId);
  }

  function AcceptFriendRequest(userId) {
    if (friends.has(userId)) return;
    friends.add(userId);
    friendRequests.delete(userId)
  }

  function RejectFriendRequest(userId) {
    if (!friends.has(userId)) return;
    friendRequests.delete(userId)
  }

  function RemoveFriend(userId) {
    friends.delete(userId)
  }

  function DeleteMessage(messageId) {
    delete messages[messageId];
  }

  function AddUser(name, pfp) {
    let id = crypto.randomUUID();
    users[id] = {
      userId: id,
      username: name,
      profilePicture: pfp,
      status: Math.floor(Math.random() * 4),
      statusMessage: `i am ${name}`,
      biography: `I am ${name}\nAnd my id is ${id}`,
    };

    serverStore.RegisterAsync(name,"12345678");

    return id;
  }

  function AddFriend(user) {
    if (friends.has(user.userId)) return;
    users[user.userId] = user;
    friends.add(user.userId);
  }

  function SendFriendRequest(userId) {
    if (friends.has(userId)) return;
    friends.add(userId);
  }

  return {
    myUserName,
    myId,
    myProfilePicture,
    users,
    friends,
    friendRequests,
    messages,
    SearchUsers,
    AddUser,
    AddFriend,
    RemoveFriend,
    SendMessage,
    DeleteMessage,
    GetOlderMessages,
    GetNewerMessages,
    GetConversationMessages,
    GetUserById,
    GetMessageById,
    GetFriendList,
    GetFriendRequests,
    AddFriendRequest,
    AcceptFriendRequest,
    RejectFriendRequest,
    SendFriendRequest,
  };
});
