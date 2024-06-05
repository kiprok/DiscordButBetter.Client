<script setup>
const props = defineProps(['user']);
</script>
<template>
  <div
    class="size-full flex items-center rounded-lg p-2 hover:bg-black/30 ease-in-out transition-colors">
    <div class="mr-2 inline-block flex-none size-10">
      <img :src="user.profilePicture" :alt="user.userName" class="rounded-full" />
    </div>
    <span class="min-w-0 truncate">
      {{ user.userName }}
    </span>
    <slot />
  </div>
</template>
