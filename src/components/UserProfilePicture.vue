<script setup>
const props = defineProps(['user']);
</script>

<template>
  <div>
    <div class="relative size-full">
      <img :src="user.profilePicture" :alt="user.userName" class="rounded-full size-full" />
      <div v-if="user.status === 0" class="bg-gray-600 notification-dot" />
      <div v-if="user.status === 1" class="bg-green-600 notification-dot" />
      <div v-if="user.status === 2" class="bg-yellow-500 notification-dot">
        <div class="size-1.5 rounded-tl-full bg-gray-700" />
      </div>
      <div
        v-if="user.status === 3"
        class="bg-red-600 notification-dot flex justify-center items-center">
        <div class="w-[8px] h-[2px] rounded-sm bg-gray-700" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-dot {
  @apply w-3 h-3 rounded-full outline outline-2 outline-gray-700 absolute -right-0 -bottom-0;
}
</style>
