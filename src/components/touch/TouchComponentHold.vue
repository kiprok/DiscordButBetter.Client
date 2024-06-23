<script setup>
import { ref } from 'vue';

const props = defineProps(['tag', 'backClasses']);
const emit = defineEmits(['held']);

const timeTouchHold = ref(-1);
const isTouch = ref(false);

function onPointerDown(event) {
  isTouch.value = event.pointerType === 'touch';
  if (event.pointerType !== 'touch') return;
  timeTouchHold.value = Date.now();
}

function onPointerUp(event) {
  if (event.pointerType !== 'touch') return;
  timeTouchHold.value = -1;
}

function onPointerMove(event) {
  if (event.pointerType !== 'touch' || timeTouchHold.value === -1) return;
  timeTouchHold.value = -1;
}

function onContextMenu(event) {
  console.log(event.type);
  console.log(event instanceof PointerEvent);
  console.log(event);
  if (isTouch.value) {
    event.preventDefault();
    emit('held');
  }
}
</script>

<template>
  <component
    :is="tag"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointerleave="onPointerMove"
    @contextmenu="onContextMenu"
    class="relative">
    <span class="absolute top-0 left-0 size-full overflow-hidden pointer-events-none">
      <span
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-0 bg-black/30 duration-100"
        :class="{
          '!size-full transition-all ease-linear delay-200 !duration-300': timeTouchHold !== -1,
          ...backClasses,
        }" />
    </span>
    <slot />
  </component>
</template>

<style scoped></style>
