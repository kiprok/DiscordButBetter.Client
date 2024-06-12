<script setup>
import { ref } from 'vue';

const props = defineProps(['tag']);
const emit = defineEmits(['held']);

const timeTouchHold = ref(-1);

function onPointerDown() {
  if (window.screen.width > 640) return;
  timeTouchHold.value = Date.now();
}

function onPointerUp() {
  if (window.screen.width > 640) return;
  if (timeTouchHold.value !== -1 && Date.now() - timeTouchHold.value > 500) {
    emit('held');
    timeTouchHold.value = -1;
  } else {
    timeTouchHold.value = -1;
  }
}

function onPointerMove() {
  if (window.screen.width > 640 || timeTouchHold.value === -1) return;
  timeTouchHold.value = -1;
}
</script>

<template>
  <component
    :is="tag"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
    class="relative">
    <span class="absolute top-0 left-0 size-full overflow-hidden pointer-events-none">
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-0 bg-black/40 duration-100"
        :class="{
          '!size-full transition-all ease-linear delay-200 !duration-300': timeTouchHold !== -1,
        }" />
    </span>
    <slot :timeHold="timeTouchHold" />
  </component>
</template>

<style scoped></style>
