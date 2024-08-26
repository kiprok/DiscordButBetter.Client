<script setup>
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';

const props = defineProps(['user', 'owner']);
</script>

<template>
  <div class="flex min-w-0">
    <user-profile-picture :user="user" class="size-10 flex-none mr-2" />
    <div class="flex flex-col min-w-0">
      <span class="truncate font-bold text-sm">
        {{ user?.username }}
        <i v-if="owner" class="fa-solid fa-star text-yellow-500" />
      </span>
      <span class="truncate text-xs">
        {{ user?.statusMessage }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
