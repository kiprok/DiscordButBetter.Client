<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faDeleteLeft} from "@fortawesome/free-solid-svg-icons";
const emits = defineEmits(['delete-book'])
const props = defineProps(['title'])

library.add(faDeleteLeft)
</script>

<template>
  <li class="flex flex-row justify-between border border-black">
    <span class="text-pretty break-words grow w-12">{{ props.title }}</span>
    <SimpleButton @click="$emit('delete-book')" class="flex-none px-1 py-1 gap-4 h-fit">
    <span class="hidden sm:inline">delete </span>
      <font-awesome-icon icon="fa-solid fa-delete-left" />
    </SimpleButton>
  </li>
</template>