<script setup>
import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';
import { ref } from 'vue';

const userStore = useUserStore();
const serverStore = useServerStore();

const profilePicture = ref(serverStore.user.profilePicture);
const statusMessage = ref(serverStore.user.statusMessage);
const biography = ref(serverStore.user.biography);

const _loading = ref(false);

async function SaveChanges() {
  _loading.value = true;
  const newInfo = {};
  if (profilePicture.value !== serverStore.user.profilePicture)
    newInfo.profilePicture = profilePicture.value;
  if (statusMessage.value !== serverStore.user.statusMessage)
    newInfo.statusMessage = statusMessage.value;
  if (biography.value !== serverStore.user.biography) newInfo.biography = biography.value;

  const response = await serverStore.UpdateUserAsync(newInfo);

  if (response) {
    serverStore.user.profilePicture = profilePicture.value;
    serverStore.user.statusMessage = statusMessage.value;
    serverStore.user.biography = biography.value;
    console.log('Updated user info');
  }

  _loading.value = false;
}
</script>

<template>
  <div class="flex flex-col overflow-y-auto">
    <label for="pfp" class="text-lg font-bold">Profile Picture</label>
    <!--    <input type="file" accept="image/*" @change="profilePicture = $event" />-->
    <input type="text" v-model="profilePicture" id="pfp" class="text-black" />
    <label for="status" class="text-lg font-bold">Status Message</label>
    <input type="text" v-model="statusMessage" id="status" class="text-black" />
    <label for="bio" class="text-lg font-bold">Biography</label>
    <textarea v-model="biography" id="bio" class="text-black h-20"></textarea>
    <button
      @click="SaveChanges"
      class="w-fit mt-4 p-2 bg-blue-600 hover:bg-blue-800 disabled:bg-gray-600"
      :disabled="_loading">
      Save Changes
    </button>
  </div>
</template>

<style scoped></style>
