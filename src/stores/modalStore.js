import { defineStore } from 'pinia';
import { reactive, ref, shallowRef } from 'vue';

export const useModalStore = defineStore('modal', () => {
  const modals = {};

  function RegisterModal(name) {
    modals[name] = {
      modalIsShowing: ref(false),
      modalArguments: shallowRef(null),
    };
  }

  function OpenModal(name, args = null) {
    modals[name].modalIsShowing.value = true;
    modals[name].modalArguments.value = args;
  }

  function CloseModal(name) {
    modals[name].modalIsShowing.value = false;
    modals[name].modalArguments.value = null;
  }

  function GetModalShowStatus(name) {
    return modals[name].modalIsShowing.value;
  }

  function GetModalArguments(name) {
    return modals[name].modalArguments.value;
  }

  return {
    GetModalShowStatus,
    GetModalArguments,
    OpenModal,
    CloseModal,
    RegisterModal,
  };
});
