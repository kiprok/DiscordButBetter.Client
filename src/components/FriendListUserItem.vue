<script setup>
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';
import UserItemFullDetail from '@/components/user/UserItemFullDetail.vue';

const props = defineProps(['user']);
</script>
<template>
  <div
    class="size-full flex items-center rounded-lg p-2 hover:bg-black/30 ease-in-out transition-colors">
    <user-item-full-detail :user="user" />
    <slot />
  </div>
</template>
