<script setup>
import { useUserStore } from '@/stores/user.js';
import { useModalStore } from '@/stores/modalStore.js';
import { useServerStore } from '@/stores/server.js';
import { computed, defineAsyncComponent, ref } from 'vue';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const serverStore = useServerStore();
const modalStore = useModalStore();
const router = useRouter();

const SettingsMenuItems = {
  accountSettings: {
    text: 'Account Settings',
    icon: 'fa-solid fa-person',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/AccountSettings.vue'),
    ),
  },
  appSettings: {
    text: 'App Settings',
    icon: 'fa-cog',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  textSettings: {
    text: 'Text Settings',
    icon: 'fa-regular fa-comments',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  mediaSettings: {
    text: 'Media Settings',
    icon: 'fa-solid fa-video',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  notificationSettings: {
    text: 'Notification Settings',
    icon: 'fa-solid fa-bell',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  privacySettings: {
    text: 'Privacy Settings',
    icon: 'fa-solid fa-lock',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  securitySettings: {
    text: 'Security Settings',
    icon: 'fa-solid fa-shield',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
  helpSettings: {
    text: 'Help',
    icon: 'fa-solid fa-question-circle',
    component: defineAsyncComponent(
      () => import('@/components/modals/SettingsComponents/PlaceholderSettings.vue'),
    ),
  },
};

const _currentSelectedMenu = ref('none');
const currentSelectedMenu = computed(() =>
  _currentSelectedMenu.value !== 'none' ? _currentSelectedMenu.value : 'accountSettings',
);

const modalName = 'accountSettings';

modalStore.RegisterModal(modalName);

function OpenMenu(key) {
  console.log('Opening menu', key);
  _currentSelectedMenu.value = key;
}

async function Logout() {
  modalStore.CloseModal(modalName);
  await router.push({ name: 'login' });
  await serverStore.LogoutAsync();
}
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="modalStore.GetModalShowStatus(modalName)"
        class="w-screen h-lvh bg-black/70 flex items-center justify-center overflow-hidden md:p-6"
        @click="modalStore.CloseModal(modalName)">
        <div
          class="center relative text-white bg-gray-600 flex flex-col rounded-lg px-4 py-8 size-full"
          @click.stop>
          <button
            @click="modalStore.CloseModal(modalName)"
            class="absolute top-2 right-2 hover:text-gray-500">
            <i class="fa-solid fa-xmark text-3xl"></i>
          </button>
          <h2
            class="text-3xl ml-4 font-bold text-white"
            :class="{ 'hidden sm:block': _currentSelectedMenu !== 'none' }">
            Settings
          </h2>
          <div class="h-1 bg-gray-500 mt-4"></div>
          <div class="flex items-stretch size-full min-w-0 min-h-0">
            <nav
              class="size-full mr-0 sm:mr-4 overflow-y-auto sm:mt-4 sm:flex-none sm:w-48"
              :class="{
                'hidden sm:block': _currentSelectedMenu !== 'none',
              }">
              <ul class="flex flex-col flex-none size-full">
                <li
                  v-for="(item, key) in SettingsMenuItems"
                  :key="key"
                  class="w-full"
                  :class="{ 'sm:bg-gray-700': key === currentSelectedMenu }">
                  <button
                    @click="OpenMenu(key)"
                    class="flex items-center justify-center sm:justify-start w-full gap-2 hover:bg-black/40 p-2">
                    <i :class="`fa-solid ${item.icon}`"></i>
                    <span>{{ item.text }}</span>
                  </button>
                </li>
                <li key="logout" class="w-full mt-auto">
                  <button
                    @click="Logout"
                    class="flex items-center justify-center sm:justify-start w-full gap-2 bg-red-600 hover:bg-red-700 p-2">
                    <i class="fa-solid fa-right-from-bracket"></i>
                    <span>logout</span>
                  </button>
                </li>
              </ul>
            </nav>
            <div class="w-1 bg-gray-500 mt-4 hidden sm:block"></div>
            <div
              class="size-full"
              :class="{
                'flex flex-col': _currentSelectedMenu !== 'none',
                'hidden sm:flex sm:flex-col': _currentSelectedMenu === 'none',
              }">
              <div class="w-full flex items-center h-14 sm:hidden">
                <button
                  @click="_currentSelectedMenu = 'none'"
                  class="flex items-center justify-center gap-2 size-14 text-3xl hover:text-gray-400 p-2">
                  <i class="fa-solid fa-chevron-left"></i>
                </button>
                <span class="font-bold text-lg">
                  {{ SettingsMenuItems[currentSelectedMenu].text }}
                </span>
              </div>
              <div class="h-1 bg-gray-500 sm:hidden"></div>
              <component :is="SettingsMenuItems[currentSelectedMenu].component" class="p-4" />
            </div>
          </div>
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
