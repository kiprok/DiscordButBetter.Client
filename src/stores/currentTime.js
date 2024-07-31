import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useCurrentTimeStore = defineStore('currentTime', () => {
  const currentTime = ref(new Date(Date.now()));

  function StartClock() {
    setInterval(() => {
      currentTime.value = new Date(Date.now());
    }, 1000 * 60);
  }

  return {
    currentTime,
    StartClock,
  };
});
