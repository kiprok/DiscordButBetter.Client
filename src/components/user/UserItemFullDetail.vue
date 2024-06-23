<script setup>
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';

const props = defineProps(['user']);
</script>

<template>
  <div class="flex min-w-0">
    <user-profile-picture :user="user" class="size-10 flex-none mr-2" />
    <div class="flex flex-col min-w-0">
      <span class="truncate font-bold text-sm">
        {{ user.userName }}
      </span>
      <span class="truncate text-xs">
        {{ user.statusMessage }}
      </span>
    </div>
  </div>
</template>

<style scoped></style>
