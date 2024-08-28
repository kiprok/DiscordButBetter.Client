<script setup>
const props = defineProps({ src: String, alt: String });
</script>

<template>
  <div class="rounded-full overflow-hidden flex items-center justify-center content-center">
    <img :src="src" :alt="alt" class="object-cover w-full h-full" />
  </div>
</template>
