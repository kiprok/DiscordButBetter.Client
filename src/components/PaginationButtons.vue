<script setup>
const props = defineProps([
  'firstPageBoundary',
  'lastPageBoundary',
  'lastPageNumber',
  'currentPlace',
]);
const emit = defineEmits(['setSearchPagePlace']);
</script>

<template>
  <div class="flex-none text-black p-1 flex flex-row items-center justify-center overflow-hidden">
    <button
      class="bg-gray-300 rounded-full size-8 flex items-center mr-1 justify-center flex-none hover:bg-gray-400
        cursor-pointer select-none"
      :class="{ invisible: firstPageBoundary === 1 }"
      @click="$emit('setSearchPagePlace', 1)">
      1
    </button>
    <div
      class="size-4 flex text-white items-center mr-1 justify-center flex-none"
      :class="{ invisible: firstPageBoundary === 1 }">
      &hellip;
    </div>
    <button
      v-for="index in Math.min(lastPageNumber, 5)"
      @click="$emit('setSearchPagePlace', index + firstPageBoundary - 1)"
      class="bg-gray-300 rounded-full size-8 flex items-center mr-1 justify-center flex-none hover:bg-gray-400
        cursor-pointer select-none"
      :class="{
        '!bg-gray-500': index + firstPageBoundary - 1 === currentPlace,
        '!text-white': index + firstPageBoundary - 1 === currentPlace,
      }">
      {{ index + firstPageBoundary - 1 }}
    </button>
    <div
      class="size-4 flex text-white items-center mr-1 justify-center flex-none"
      :class="{
        invisible: lastPageBoundary >= lastPageNumber,
      }">
      &hellip;
    </div>
    <button
      class="bg-gray-300 rounded-full size-8 flex items-center justify-center flex-none hover:bg-gray-400
        cursor-pointer select-none"
      :class="{
        invisible: lastPageBoundary >= lastPageNumber,
      }"
      @click="$emit('setSearchPagePlace', lastPageNumber)">
      {{ lastPageNumber }}
    </button>
  </div>
</template>
