import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useChatLeftSideMenuStore = defineStore('chatLeftSideMenu', () => {
  const leftSideMenuIsOpen = ref(false);

  function toggleLeftSideMenu() {
    leftSideMenuIsOpen.value = !leftSideMenuIsOpen.value;
  }

  return {
    leftSideMenuIsOpen,
    toggleLeftSideMenu,
  };
});
