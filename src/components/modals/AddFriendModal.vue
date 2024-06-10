<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import { useUserStore } from '@/stores/user.js';
import FriendListItemButton from '@/components/FriendListItemButton.vue';

const userStore = useUserStore();

const show = defineModel({
  type: Boolean,
  default: false,
});

const inputBox = ref();
const searchQuery = ref('');

watch(show, (value) => {
  nextTick(() => {
    console.log(inputBox.value);
    if (value) {
      searchQuery.value = '';
      inputBox.value.focus();
    }
  });
});
</script>

<template>
  <teleport to="#modal">
    <div
      v-if="show"
      class="fixed inset-0 bg-black/50 flex items-center justify-center overflow-hidden"
      @click="show = false">
      <div
        class="relative text-white bg-gray-600 flex flex-col rounded-lg px-4 py-8 w-[40rem] h-96 min-w-0
          overflow-hidden md:mx-4"
        @click.stop>
        <button @click="show = false" class="absolute top-0 right-2 hover:text-gray-500">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
        <input
          type="text"
          ref="inputBox"
          v-model="searchQuery"
          placeholder="search for someone to add"
          class="border-2 bg-gray-500 border-gray-700" />
        <div class="border-b-2 border-gray-700 my-4" />
        <ul class="flex-grow overflow-auto">
          <li v-for="user in userStore.SearchUsers(searchQuery)">
            <FriendListUserItem :user>
              <friend-list-item-button class="ml-auto">
                <i class="fa-solid fa-plus" />
              </friend-list-item-button>
            </FriendListUserItem>
          </li>
        </ul>
      </div>
    </div>
  </teleport>
</template>
