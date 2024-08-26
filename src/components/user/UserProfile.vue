<script setup>
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';
import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';
import { ref } from 'vue';

const props = defineProps(['user']);

const userStore = useUserStore();
const serverStore = useServerStore();

const _loading = ref(false);

async function AddFriend() {
  _loading.value = true;
  await serverStore.SendFriendRequestAsync(props.user.userId);
  _loading.value = false;
}

async function RemoveFriend() {
  _loading.value = true;
  await serverStore.DeleteFriendAsync(props.user.userId);
  _loading.value = false;
}
</script>

<template>
  <div class="flex flex-col w-full h-fit">
    <div class="relative flex-none min-h-28 bg-blue-200">
      <user-profile-picture
        :user="user"
        class="size-16 ml-4 absolute -bottom-4 left-0 rounded-full border-4 border-gray-700" />
      <button
        v-if="
          userStore.GetFriendList().find((f) => f.userId === user.userId) == null &&
          user.userId !== serverStore.user.userId &&
          !_loading
        "
        class="absolute top-1 right-1 bg-green-600 rounded-lg text-white p-1 flex gap-1 items-center
          hover:cursor-pointer select-none hover:bg-green-400"
        @click="AddFriend">
        <span>Add</span>
        <i class="fa-solid fa-person-circle-plus" />
      </button>
      <button
        v-else-if="user.userId !== serverStore.user.userId && !_loading"
        class="absolute top-1 right-1 bg-red-600 rounded-lg text-white p-1 flex gap-1 items-center
          hover:cursor-pointer select-none hover:bg-red-400"
        @click="RemoveFriend">
        <span>Remove</span>
        <i class="fa-solid fa-person-circle-xmark" />
      </button>
    </div>
    <div class="mt-6 mx-2 p-2 min-h-0 text-white rounded-lg bg-gray-800">
      <h2 class="font-bold text-lg">
        {{ user?.username }}
      </h2>
      <span class="text-xs">{{ user?.statusMessage }}</span>
      <div class="w-full h-0.5 bg-gray-700 my-2" />
      <h3 class="font-bold text-sm uppercase">about me</h3>
      <span class="whitespace-pre-wrap text-sm">
        {{ user?.biography }}
      </span>
    </div>
  </div>
</template>
