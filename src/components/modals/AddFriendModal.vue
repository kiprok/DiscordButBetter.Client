<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import { useUserStore } from '@/stores/user.js';
import FriendListItemButton from '@/components/FriendListItemButton.vue';
import DefaultListAnimation from '@/components/animations/DefaultListAnimation.vue';

const userStore = useUserStore();

const show = defineModel({
  type: Boolean,
  default: false,
});

const inputBox = ref();
const searchQuery = ref('');

watch(show, (value) => {
  nextTick(() => {
    searchQuery.value = '';

    if (value) {
      inputBox.value.focus();
    }
  });
});
</script>

<template>
  <teleport to="#modal">
    <div
      v-if="show"
      class="w-screen h-screen bg-black/50 flex items-center justify-center overflow-hidden"
      @click="show = false">
      <div
        class="relative text-white bg-gray-600 flex flex-col rounded-lg px-4 py-8 w-[40rem] min-h-0 min-w-0 h-96
          max-h-full md:mx-4"
        @click.stop>
        <button @click="show = false" class="absolute top-0 right-2 hover:text-gray-500">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
        <input
          type="text"
          ref="inputBox"
          v-model="searchQuery"
          placeholder="search for someone to add"
          class="border-2 bg-gray-500 border-gray-700 flex-none" />
        <div class="flex-none border-b-2 border-gray-700 my-4" />
        <ul class="relative grow min-h-0 min-w-0 overflow-y-scroll">
          <default-list-animation>
            <li v-for="user in userStore.SearchUsers(searchQuery)">
              <FriendListUserItem :user>
                <friend-list-item-button class="ml-auto">
                  <i class="fa-solid fa-plus" />
                </friend-list-item-button>
              </FriendListUserItem>
            </li>
          </default-list-animation>
        </ul>
      </div>
    </div>
  </teleport>
</template>
