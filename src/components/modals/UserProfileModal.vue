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

const contentRef = ref();
let mediaQuery = null;

const modalName = 'userProfile';

modalStore.RegisterModal(modalName);
watch(
  () => modalStore.GetModalShowStatus(modalName),
  (value) => {
    if (value) {
      nextTick(() => {
        let boundingRect = modalStore.GetModalArguments(modalName)?.anchor?.getBoundingClientRect();
        if (boundingRect) {
          mediaQuery = window.matchMedia(
            `(max-height: ${contentRef.value.offsetHeight + screen.height - boundingRect.top}px)`,
          );
          mediaQuery.addEventListener('change', MediaEventCallback);

          if (mediaQuery.matches) {
            SetProfileToSmall();
          } else {
            SetProfileToNormal();
          }
        }
      });
    } else {
      if (mediaQuery) {
        mediaQuery.removeEventListener('change', MediaEventCallback);
        mediaQuery = null;
      }
    }
  },
);

function MediaEventCallback(event) {
  if (event.matches) {
    SetProfileToSmall();
  } else {
    SetProfileToNormal();
  }
}

function SetProfileToNormal() {
  let boundingRect = modalStore.GetModalArguments(modalName)?.anchor?.getBoundingClientRect();
  if (!boundingRect) return;

  contentRef.value.style.position = 'absolute';
  contentRef.value.style.bottom = `${screen.height - boundingRect.top}px`;
  contentRef.value.style.left = `${boundingRect.left}px`;
  contentRef.value.style.height = '';
  contentRef.value.style.overflowY = '';
}

function SetProfileToSmall() {
  let boundingRect = modalStore.GetModalArguments(modalName)?.anchor?.getBoundingClientRect();
  if (!boundingRect) return;
  contentRef.value.style.position = 'absolute';
  contentRef.value.style.bottom = '0';
  contentRef.value.style.left = `${boundingRect.left}px`;
  contentRef.value.style.height = '100dvh';
  contentRef.value.style.overflowY = 'auto';
}
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="modalStore.GetModalShowStatus(modalName)"
        class="relative w-screen h-dvh overflow-y-auto flex items-center justify-center"
        :class="{ 'bg-black/70': !modalStore.GetModalArguments(modalName)?.anchor }"
        @click="modalStore.CloseModal(modalName)">
        <div
          class="max-w-full h-fit overflow-hidden bg-gray-600 w-96 pb-4 rounded-lg"
          @click.stop
          ref="contentRef">
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
