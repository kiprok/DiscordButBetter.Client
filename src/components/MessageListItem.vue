<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faDeleteLeft} from "@fortawesome/free-solid-svg-icons";
import {useUserStore} from "@/stores/user.js";

const emits = defineEmits(['delete-book'])
const props = defineProps(['message'])
const userStore = useUserStore();

const timeSend = new Date(props.message.timeSend);

const hasReply = props.message.meta.hasOwnProperty('reply');
const repliedUserName = userStore.users[props.message.meta.reply?.userId]?.userName ?? "DELETED";

library.add(faDeleteLeft)
</script>

<template>
  <li class="flex flex-col">
    <div class="flex flex-row items-end" :class="{hidden: !hasReply}">
      <div class="w-8 ml-6 h-3 border border-b-0 border-r-0 border-black rounded-tl"></div>
      <div class="mb-0.5">
        <img :src="userStore.users[props.message.senderId].profilePicture" alt="profile picture"
             class="rounded-full size-4 inline mr-1">
        <span class="text-xs">{{repliedUserName}}</span>
      </div>
    </div>
    <div class="flex flex-row justify-between border border-black">
      <img :src="userStore.users[props.message.senderId].profilePicture" alt="profile picture"
           class="rounded-full size-10 m-2">
      <div class="flex flex-col grow w-12">
        <div>
          <h3 class="text-lg inline mr-2">{{ userStore.users[props.message.senderId].userName }}</h3>
          <span class="text-sm inline">{{ timeSend.toLocaleTimeString() }}</span>
        </div>
        <span class="text-pretty break-words w-full">{{ props.message.messageText }}</span>
      </div>
      <SimpleButton @click="$emit('delete-book')" class="flex-none px-1 py-1 gap-4 h-fit">
        <span class="hidden sm:inline">delete </span>
        <font-awesome-icon icon="fa-solid fa-delete-left"/>
      </SimpleButton>
    </div>
  </li>
</template>