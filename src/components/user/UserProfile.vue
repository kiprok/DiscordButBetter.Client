<script setup>
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';

const props = defineProps(['user']);
</script>

<template>
  <div class="flex flex-col w-full h-fit">
    <div class="relative flex-none min-h-28 bg-blue-200">
      <user-profile-picture
        :user="user"
        class="size-16 ml-4 absolute -bottom-4 left-0 rounded-full border-4 border-gray-700" />
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
