<script setup>
const show = defineModel({
  type: Boolean,
  default: false,
});

const props = defineProps({
  header: String,
});
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="show"
        class="w-screen h-dvh bg-black/70 flex flex-col items-center justify-end overflow-hidden"
        @click="show = false">
        <div
          class="center relative text-white bg-gray-600 flex flex-col rounded-t-lg px-4 py-8 w-full min-h-0 min-w-0
            h-fit max-h-full"
          @click.stop>
          <h2 class="text-3xl">{{ header }}</h2>
          <div class="border-b-2 border-gray-700 my-4" />
          <slot></slot>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.show-modal-enter-active,
.show-modal-enter-active .center,
.show-modal-leave-active,
.show-modal-leave-active .center {
  transition: all 0.3s ease;
}

.show-modal-enter-from,
.show-modal-leave-to {
  opacity: 0;
}

.show-modal-enter-from .center,
.show-modal-leave-to .center {
  transform: translate(0, 100%);
}
</style>
