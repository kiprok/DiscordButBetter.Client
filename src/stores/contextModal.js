import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';

export const useContextMenuStore = defineStore('contextMenu', () => {
  const ShowContextMenu = ref(false);
  const contextMenuType = shallowRef(null);
  const contextMenuArguments = ref(null);

  function OpenContextMenu(type, args = null) {
    ShowContextMenu.value = true;
    contextMenuType.value = type;
    contextMenuArguments.value = args;
  }

  return {
    ShowContextMenu,
    contextMenuType,
    contextMenuArguments,
    OpenContextMenu,
  };
});
