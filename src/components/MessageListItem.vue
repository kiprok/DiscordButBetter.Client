<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faDeleteLeft} from "@fortawesome/free-solid-svg-icons";
import {useUserStore} from "@/stores/user.js";
const emits = defineEmits(['delete-book'])
const props = defineProps(['message'])
const userStore = useUserStore();

const timeSend = new Date(props.message.timeSend);

library.add(faDeleteLeft)
</script>

<template>
  <li class="flex flex-row justify-between border border-black">
    <img :src="userStore.users[props.message.senderId].profilePicture" alt="profile picture" class="rounded-full size-10 m-2">
  <div class="flex flex-col grow w-12">
  <div>
    <h3 class="text-lg inline mr-2">{{ userStore.users[props.message.senderId].userName }}</h3>
    <span class="text-sm inline">{{timeSend.toLocaleTimeString()}}</span>
  </div>
    <span class="text-pretty break-words w-full">{{ props.message.messageText }}</span>
  </div>
    <SimpleButton @click="$emit('delete-book')" class="flex-none px-1 py-1 gap-4 h-fit">
    <span class="hidden sm:inline">delete </span>
      <font-awesome-icon icon="fa-solid fa-delete-left" />
    </SimpleButton>
  </li>
</template>