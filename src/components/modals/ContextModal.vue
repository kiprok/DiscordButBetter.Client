<script setup>
import { useModalStore } from '@/stores/modalStore.js';
const modalStore = useModalStore();

const modalName = 'contextMenu';

modalStore.RegisterModal(modalName);
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="modalStore.GetModalShowStatus(modalName)"
        class="w-screen h-dvh bg-black/70 flex flex-col items-center justify-end overflow-hidden"
        @click="modalStore.CloseModal(modalName)">
        <div
          class="center relative text-white bg-gray-600 flex flex-col rounded-t-lg px-4 py-8 w-full max-w-96 min-h-0
            min-w-0 h-fit max-h-full"
          @click.stop>
          <div class="border-b-2 border-gray-700 my-4" />
          <component
            :is="modalStore.GetModalType(modalName) ?? 'div'"
            :modal-Name="modalName"
            :modal-arguments="modalStore.GetModalArguments(modalName)" />
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
