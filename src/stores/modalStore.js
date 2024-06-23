import { defineStore } from 'pinia';
import { reactive, ref, shallowRef } from 'vue';

export const useModalStore = defineStore('modal', () => {
  const modals = {};

  function RegisterModal(name) {
    modals[name] = {
      modalIsShowing: ref(false),
      modalType: shallowRef(null),
      modalArguments: ref(null),
    };
  }

  function OpenModal(name, type, args = null) {
    modals[name].modalIsShowing.value = true;
    modals[name].modalType.value = type;
    modals[name].modalArguments.value = args;
  }

  function CloseModal(name) {
    modals[name].modalIsShowing.value = false;
    modals[name].modalType.value = null;
    modals[name].modalArguments.value = null;
  }

  function GetModalShowStatus(name) {
    return modals[name].modalIsShowing.value;
  }

  function GetModalType(name) {
    return modals[name].modalType.value;
  }

  function GetModalArguments(name) {
    return modals[name].modalArguments.value;
  }

  return {
    GetModalShowStatus,
    GetModalType,
    GetModalArguments,
    OpenModal,
    CloseModal,
    RegisterModal,
  };
});
