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

  async function ConnectSocketAsync() {
    connection.value = new signalR.HubConnectionBuilder()
      .withUrl(`/hub?token=${GetToken()}`)
      .withHubProtocol(new MessagePackHubProtocol())
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();
    return connection.value;
  }

  return {
    user,
    IsLoggedIn,
    GetToken,
    ResetUser,
    LoginAsync,
    RegisterAsync,
    LogoutAsync,
    ConnectSocketAsync,
    GetUserAsync,
  };
});
