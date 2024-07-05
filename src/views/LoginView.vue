<script setup></script>

<template>
  <div class="w-screen h-dvh flex bg-gray-500 justify-center items-center">
    <main class="text-white h-fit bg-gray-700 px-6 pt-6 flex flex-col">
      <h1 class="text-3xl font-bold">Login</h1>
      <form class="flex-col flex mt-4">
        <label for="username">Username</label>
        <input type="text" class="text-black" id="username" />
        <label for="password">Password</label>
        <input type="password" class="text-black" id="password" />
        <div class="flex gap-2 mt-4">
          <router-link
            :to="{ name: 'register' }"
            class="border border-gray-500 p-2 hover:bg-gray-600 hover:border-gray-600">
            Register
          </router-link>
          <button type="submit" class="bg-gray-500 hover:bg-gray-600 p-2">Login</button>
        </div>
        <router-link to="/" class="ml-auto mr-auto hover:text-gray-400 text-sm mt-4">
          Go back home
        </router-link>
      </form>
    </main>
  </div>
</template>
