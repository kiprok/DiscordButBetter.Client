import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import { useServerStore } from '@/stores/server.js';

export const useUserStore = defineStore('user', () => {
  const serverStore = useServerStore();

  const users = reactive({
    /*
            "": {
                userId: "",
                username: "",
                profilePicture: "",
                status: 0,
                statusMessage: "",
                biography: ""
            }
             */
  });

  const friends = reactive(new Set());
  const friendRequestsReceived = reactive(new Set());
  const friendRequestsSend = reactive(new Set());

  const messages = reactive({
    /*
            "": {
                messageId: "",
                senderId: "",
                conversationId: "",
                content: "",
                sentAt: 0,
                metadata: {}
            }
             */
  });

  function Reset() {
    friends.clear();
    friendRequestsReceived.clear();
    friendRequestsSend.clear();
  }

  function SendMessage(message) {
    messages[message.messageId] = message;
  }

  function AddMessages(newMessages) {
    newMessages.forEach((message) => {
      messages[message.messageId] = message;
    });
  }

  function GetOlderMessages(conversationId, startpointId, amount) {
    return Object.keys(messages)
      .filter(
        (key) =>
          conversationId === messages[key].conversationId &&
          (messages[startpointId]?.sentAt ?? Infinity) - messages[key].sentAt > 0,
      )
      .toSorted((a, b) => messages[b].sentAt - messages[a].sentAt)
      .slice(0, amount)
      .map((key) => messages[key]);
  }

  function GetNewerMessages(conversationId, startpointId, amount) {
    return Object.keys(messages)
      .filter(
        (key) =>
          conversationId === messages[key].conversationId &&
          (messages[startpointId]?.sentAt ?? 0) - messages[key].sentAt < 0,
      )
      .toSorted((a, b) => messages[a].sentAt - messages[b].sentAt)
      .slice(0, amount)
      .map((key) => messages[key]);
  }

  function GetConversationMessages(conversationId) {
    return Object.keys(messages)
      .filter((key) => conversationId === messages[key].conversationId)
      .toSorted((a, b) => messages[a].sentAt - messages[b].sentAt)
      .map((key) => messages[key]);
  }

  function SearchUsers(query) {
    if (query === '' || query === undefined || query === null) return [];
    return Object.values(users).filter(
      (user) =>
        user.username.toLowerCase().includes(query.toLowerCase()) &&
        !friends.has(user.userId) &&
        user.userId !== serverStore.user.userId,
    );
  }

  function GetUserById(id) {
    return users[id];
  }

  function GetMessageById(id) {
    if (messages[id]) return messages[id];
    serverStore.GetMessageByIdAsync(id).then((message) => {
      if (message) messages[message.messageId] = message;
    });
  }

  function GetFriendList() {
    return [...friends].map((friend) => users[friend]);
  }

  function GetFriendRequests() {
    return [...friendRequestsReceived].map((request) => ({
      ...users[request.senderId],
      requestId: request.requestId,
    }));
  }

  function GetFriendRequestsSend() {
    return [...friendRequestsSend].map((request) => ({
      ...users[request.receiverId],
      requestId: request.requestId,
    }));
  }

  function AddFriendRequest(request, user) {
    if (friendRequestsReceived.has(request.senderId)) return;
    users[request.senderId] = user;
    friendRequestsReceived.add(request);
  }

  function AddFriendRequestSent(request, user) {
    if (friendRequestsSend.has(request.receiverId)) return;
    users[request.receiverId] = user;
    friendRequestsSend.add(request);
  }

  function RemoveFriendRequestSent(request) {
    const rq = [...friendRequestsSend].find((r) => r.requestId === request.requestId);
    console.log('request', rq);
    friendRequestsSend.delete(rq);
  }

  function AcceptFriendRequest(request) {
    const rq = [...friendRequestsReceived].find((r) => r.requestId === request.requestId);
    friendRequestsReceived.delete(rq);
  }

  function RejectFriendRequest(request) {
    const rq = [...friendRequestsReceived].find((r) => r.requestId === request.requestId);
    console.log('request', rq);
    friendRequestsReceived.delete(rq);
  }

  function RemoveFriend(userId) {
    friends.delete(userId);
  }

  function DeleteMessage(messageId) {
    delete messages[messageId];
  }

  function AddFriend(user) {
    if (friends.has(user.userId)) return;
    users[user.userId] = user;
    friends.add(user.userId);
  }

  function SendFriendRequest(userId) {
    friendRequestsSend.add(userId);
  }

  return {
    Reset,
    users,
    friends,
    friendRequestsReceived,
    friendRequestsSend,
    messages,
    SearchUsers,
    AddFriend,
    RemoveFriend,
    AddMessages,
    SendMessage,
    DeleteMessage,
    GetOlderMessages,
    GetNewerMessages,
    GetConversationMessages,
    GetUserById,
    GetMessageById,
    GetFriendList,
    GetFriendRequests,
    GetFriendRequestsSend,
    AddFriendRequestSent,
    RemoveFriendRequestSent,
    AddFriendRequest,
    AcceptFriendRequest,
    RejectFriendRequest,
    SendFriendRequest,
  };
});
