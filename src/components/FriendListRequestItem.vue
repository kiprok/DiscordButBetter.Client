<script setup>
import { useUserStore } from '@/stores/user.js';

const props = defineProps(['request']);

const userStore = useUserStore();

function AcceptRequest() {
  userStore.AcceptFriendRequest(props.request.userId);
}

function RejectRequest() {
  userStore.RejectFriendRequest(props.request.userId);
}
</script>
<template>
  <div
    class="size-full flex items-center rounded-lg p-2 hover:bg-black/30 ease-in-out transition-colors">
    <div class="mr-2 inline-block flex-none size-10">
      <img :src="request.profilePicture" :alt="request.userName" class="rounded-full" />
    </div>
    <span class="min-w-0 truncate">
      {{ request.userName }}
    </span>
    <div class="ml-auto h-full flex flex-row gap-2">
      <button
        class="bg-gray-400 rounded-full size-8 flex items-center justify-center flex-none hover:bg-gray-500
          hover:text-green-500 cursor-pointer select-none"
        @click="AcceptRequest">
        <i class="fa-solid fa-check"></i>
      </button>
      <button
        class="bg-gray-400 rounded-full size-8 flex items-center justify-center flex-none hover:bg-gray-500
          hover:text-red-600 cursor-pointer select-none"
        @click="RejectRequest">
        <i class="fa-solid fa-xmark"></i>
      </button>
    </div>
  </div>
</template>
