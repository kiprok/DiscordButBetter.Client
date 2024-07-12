import { defineStore } from 'pinia';
import * as signalR from '@microsoft/signalr';
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';
import { computed, ref } from 'vue';

export const useServerStore = defineStore('server', () => {
  const connection = ref();
  const user = ref(null);
  const token = ref('');

  const IsLoggedIn = computed(() => token.value !== '');

  function GetToken() {
    if (token.value !== '') {
      return token.value;
    }
    token.value = localStorage.getItem('token') ?? '';
    return token.value;
  }

  async function GetUserAsync() {
    if (user.value) {
      return user.value;
    } else if (GetToken() !== '') {
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          Authorization: GetToken(),
        },
      });
      if (response.ok) {
        user.value = await response.json();
        return user.value;
      } else {
        ResetUser();
        return null;
      }
    }
  }

  async function GetUserByIdAsync(id) {
    const response = await fetch(`/api/users/${id}`, {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function SearchUsersAsync(searchString) {
    const response = await fetch(`/api/users/search?query=${searchString}`, {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function LoginAsync(username, password) {
    if (username === '' || password === '') return false;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const data = await response.json();
      token.value = data.token;
      localStorage.setItem('token', token.value);
      user.value = await GetUserAsync();
      return true;
    } else {
      return false;
    }
  }

  async function RegisterAsync(username, password) {
    const response = await fetch('/api/auth/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });
    return response.ok;
  }

  async function LogoutAsync() {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        Authorization: GetToken(),
      },
    });
    ResetUser();
  }

  function ResetUser() {
    user.value = null;
    token.value = '';
    localStorage.removeItem('token');
  }

  async function GetFriendListAsync() {
    const response = await fetch('/api/users/friends', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function DeleteFriendAsync(id) {
    const response = await fetch(`/api/users/friends/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok;
  }

  async function GetFriendRequestsAsync() {
    const response = await fetch('/api/users/friends/requests', {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function AcceptFriendRequestAsync(requestId, userId) {
    const response = await fetch(`/api/users/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify({
        type: 1,
        userId: userId,
        requestId: requestId,
      }),
    });
    return response.ok;
  }

  async function DeclineFriendRequestAsync(requestId, userId) {
    const response = await fetch(`/api/users/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify({
        type: 2,
        userId: userId,
        requestId: requestId,
      }),
    });
    return response.ok;
  }

  async function SendFriendRequestAsync(userId) {
    const response = await fetch(`/api/users/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify({
        type: 0,
        userId: userId,
      }),
    });
    return response.ok ? await response.json() : null;
  }

  async function CancelFriendRequestAsync(requestId, userId) {
    const response = await fetch(`/api/users/friends/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify({
        type: 3,
        userId: userId,
        requestId: requestId,
      }),
    });
    return response.ok;
  }

  async function GetConversationsAsync() {
    const response = await fetch('/api/conversations', {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function GetVisibleConversationsAsync() {
    const response = await fetch('/api/conversations/visible', {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function RemoveFromVisibleConversationsAsync(id) {
    const response = await fetch(`/api/conversations/visible/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok;
  }

  async function GetConversationByIdAsync(id) {
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function CreateConversationAsync(name, conversationType, userIds, picture = null) {
    const response = await fetch('/api/conversations', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify({
        conversationName: name,
        conversationType: conversationType,
        participants: userIds,
        conversationPicture: picture,
      }),
    });
    return response.ok ? await response.json() : null;
  }

  async function DeleteConversationAsync(id) {
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok;
  }

  // toUpdate = { conversationName: "", conversationPicture: "", participantsToAdd: [], participantsToRemove: []}
  async function UpdateConversationAsync(id, toUpdate) {
    const response = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify(toUpdate),
    });
    return response.ok;
  }

  async function SendMessageAsync(message) {
    const response = await fetch(`/api/messages`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify(message),
    });
    return response.ok ? await response.json() : null;
  }

  async function UpdateMessageAsync(messageId, message) {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: GetToken(),
      },
      body: JSON.stringify(message),
    });
    return response.ok ? await response.json() : null;
  }

  async function DeleteMessageAsync(messageId) {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok;
  }

  async function GetMessageByIdAsync(messageId) {
    const response = await fetch(`/api/messages/${messageId}`, {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function GetMessagesAsync(conversationId) {
    const response = await fetch(`/api/messages/conversation/${conversationId}`, {
      method: 'GET',
      headers: {
        Authorization: GetToken(),
      },
    });
    return response.ok ? await response.json() : null;
  }

  async function GetOlderMessagesAsync(conversationId, messageTime) {
    const response = await fetch(
      `/api/messages/conversation/${conversationId}/older/${messageTime}`,
      {
        method: 'GET',
        headers: {
          Authorization: GetToken(),
        },
      },
    );
    return response.ok ? await response.json() : null;
  }

  async function GetNewerMessagesAsync(conversationId, messageTime) {
    const response = await fetch(
      `/api/messages/conversation/${conversationId}/newer/${messageTime}`,
      {
        method: 'GET',
        headers: {
          Authorization: GetToken(),
        },
      },
    );
    return response.ok ? await response.json() : null;
  }

  async function GetMessagesFromPointAsync(conversationId, messageId) {
    const response = await fetch(
      `/api/messages/conversation/${conversationId}/point/${messageId}`,
      {
        method: 'GET',
        headers: {
          Authorization: GetToken(),
        },
      },
    );
    return response.ok ? await response.json() : null;
  }

  async function SearchMessagesAsync(conversationId, query, page = 1) {
    const response = await fetch(
      `/api/messages/conversation/${conversationId}/search?query=${query}&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: GetToken(),
        },
      },
    );
    return response.ok ? await response.json() : null;
  }

  async function ConnectSocketAsync() {
    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(`/hub?token=${GetToken()}`)
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    return connection.value;
  }

  async function AddToGroupAsync(groupId) {
    await connection.value.invoke('AddUserToGroup', groupId);
  }

  function GetConnectionState() {
    return connection.value?.state;
  }

  return {
    user,
    IsLoggedIn,
    GetToken,
    ResetUser,
    LoginAsync,
    RegisterAsync,
    LogoutAsync,
    GetUserAsync,
    GetUserByIdAsync,
    SearchUsersAsync,
    GetFriendListAsync,
    DeleteFriendAsync,
    GetFriendRequestsAsync,
    AcceptFriendRequestAsync,
    DeclineFriendRequestAsync,
    SendFriendRequestAsync,
    CancelFriendRequestAsync,
    GetConversationsAsync,
    GetVisibleConversationsAsync,
    RemoveFromVisibleConversationsAsync,
    GetConversationByIdAsync,
    CreateConversationAsync,
    DeleteConversationAsync,
    UpdateConversationAsync,
    SendMessageAsync,
    UpdateMessageAsync,
    DeleteMessageAsync,
    GetMessageByIdAsync,
    GetMessagesAsync,
    GetOlderMessagesAsync,
    GetNewerMessagesAsync,
    GetMessagesFromPointAsync,
    SearchMessagesAsync,
    ConnectSocketAsync,
    GetConnectionState,
  };
});
