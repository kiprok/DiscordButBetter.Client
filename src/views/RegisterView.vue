<script setup>
import { ref } from 'vue';
import { useServerStore } from '@/stores/server.js';
import { useRouter } from 'vue-router';

const serverStore = useServerStore();
const router = useRouter();

const username = ref('');
const password = ref('');
const passwordRepeat = ref('');
const registerStatus = ref(0); // 0 = not logged in, 1 = logged in, 2 = error
const _registerIsLoading = ref(false);

if (serverStore.IsLoggedIn) router.push({ name: 'friendList' });

async function Register() {
  if (password.value !== passwordRepeat.value) {
    registerStatus.value = 2;
    return;
  }
  _registerIsLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const success = await serverStore.RegisterAsync(username.value, password.value);
  if (!success) {
    registerStatus.value = 2;
  } else {
    await router.push({ name: 'login' });
  }

  _registerIsLoading.value = false;
}
</script>

<template>
  <div class="w-screen h-dvh flex bg-gray-500 justify-center items-center">
    <main class="text-white max-w-full w-96 bg-gray-700 px-6 pt-6 flex flex-col">
      <h1 class="text-3xl font-bold">Register</h1>
      <form class="flex-col flex mt-4" @submit.prevent="Register">
        <span v-if="registerStatus === 2" class="text-red-600">Invalid username or password</span>
        <label for="username">Username</label>
        <input
          type="text"
          class="text-black w-full"
          id="username"
          :class="{ 'border-red-600 border-2': registerStatus === 2 }"
          v-model="username" />
        <label for="password">Password</label>
        <input
          type="password"
          class="text-black w-full"
          id="password"
          :class="{ 'border-red-600 border-2': registerStatus === 2 }"
          v-model="password" />
        <label for="passwordRepeat">Password</label>
        <input
          type="password"
          class="text-black w-full"
          id="passwordRepeat"
          :class="{ 'border-red-600 border-2': registerStatus === 2 }"
          v-model="passwordRepeat" />
        <div class="flex gap-2 mt-4">
          <router-link
            :to="{ name: 'login' }"
            class="border border-gray-500 p-2 hover:bg-gray-600 hover:border-gray-600">
            Login
          </router-link>
          <button
            type="submit"
            class="bg-gray-500 hover:bg-gray-600 p-2"
            :disabled="_registerIsLoading">
            <i class="fa-solid fa-spinner mr-1 animate-spin" v-if="_registerIsLoading"></i>
            <span>Register</span>
          </button>
        </div>
        <router-link to="/" class="ml-auto mr-auto hover:text-gray-400 text-sm mt-4">
          Go back home
        </router-link>
      </form>
    </main>
  </div>
</template>
