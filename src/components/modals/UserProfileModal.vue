<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import { useUserStore } from '@/stores/user.js';
import FriendListItemButton from '@/components/FriendListItemButton.vue';
import DefaultListAnimation from '@/components/animations/DefaultListAnimation.vue';
import { useModalStore } from '@/stores/modalStore.js';
import UserProfile from '@/components/user/UserProfile.vue';

const userStore = useUserStore();
const modalStore = useModalStore();

const containerRef = ref();

const modalName = 'userProfile';

modalStore.RegisterModal(modalName);

watch(
  () => modalStore.GetModalShowStatus(modalName),
  (value) => {
    nextTick(() => {
      let boundingRect = modalStore.GetModalArguments(modalName)?.anchor?.getBoundingClientRect();
      if (boundingRect) {
        containerRef.value.style.position = 'fixed';
        containerRef.value.style.bottom = `${Math.ceil(screen.height - boundingRect.top)}px`;
        containerRef.value.style.left = `${boundingRect.left}px`;
      }
    });
  },
);
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="modalStore.GetModalShowStatus(modalName)"
        class="w-screen h-dvh bg-black/70 flex items-center justify-center overflow-hidden"
        @click="modalStore.CloseModal(modalName)">
        <div
          class="max-h-full min-w-0 max-w-full bg-gray-600 w-96 pb-4 rounded-lg overflow-hidden"
          @click.stop
          ref="containerRef">
          <user-profile :user="modalStore.GetModalArguments(modalName).user" />
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
  transform: scale(0.8);
}
</style>
