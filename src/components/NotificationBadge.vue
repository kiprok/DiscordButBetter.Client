<script setup>
const props = defineProps(['notifications']);
</script>

<template>
  <span
    v-if="notifications > 0"
    class="flex items-center justify-center font-bold bg-red-600 text-white rounded-full"
    >{{ Math.min(notifications, 99) }}
  </span>
</template>

<style scoped></style>
