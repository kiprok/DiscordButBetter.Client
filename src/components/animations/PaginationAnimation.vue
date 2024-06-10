<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  page: Number,
});

const animation = ref('pagination-animation-left');

watch(
  () => props.page,
  (newPage, oldPage) => {
    if (newPage > oldPage) {
      animation.value = 'pagination-animation-left';
    } else {
      animation.value = 'pagination-animation-right';
    }
  },
);
</script>

<template>
  <transition :name="animation" mode="out-in">
    <slot />
  </transition>
</template>

<style>
.pagination-animation-right-enter-active,
.pagination-animation-right-leave-active,
.pagination-animation-left-leave-active,
.pagination-animation-left-enter-active {
  transition: all 0.25s ease-in-out;
}

.pagination-animation-right-leave-to,
.pagination-animation-left-enter-from {
  opacity: 0;
  transform: translate(2rem, 0);
}

.pagination-animation-right-enter-from,
.pagination-animation-left-leave-to {
  opacity: 0;
  transform: translate(-2rem, 0);
}
</style>
