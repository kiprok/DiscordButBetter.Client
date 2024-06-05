<script setup>
const props = defineProps(['friend']);
</script>
<template>
  <div
    class="size-full flex items-center rounded-lg p-2 hover:bg-black/30 ease-in-out transition-colors">
    <div class="mr-2 inline-block flex-none size-10">
      <img :src="friend.profilePicture" :alt="friend.userName" class="rounded-full" />
    </div>
    <span class="min-w-0 truncate">
      {{ friend.userName }}
    </span>
  </div>
</template>
