<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {library} from "@fortawesome/fontawesome-svg-core";
import {faDeleteLeft} from "@fortawesome/free-solid-svg-icons";
import {useUserStore} from "@/stores/user.js";
import {computed} from "vue";

const emits = defineEmits(['delete-book', 'scroll-reply'])
const props = defineProps(['message'])
const userStore = useUserStore();

const timeSend = new Date(props.message.timeSend);

const hasReply = computed(()=>{
  return props.message.meta.hasOwnProperty('reply')
});
const replyId = computed(()=>{
  return props.message.meta.reply?.messageId;
});
const replyUserId = computed(()=>{
  return props.message.meta.reply?.userId;
});

library.add(faDeleteLeft);
</script>

<template>
  <li class="flex flex-col">
    <div class="flex flex-row items-end" :class="{hidden: !hasReply}">
      <div class="w-8 ml-6 h-3 shrink-0 border border-b-0 border-r-0 border-black rounded-tl"></div>
      <div class="mb-0.5 truncate">
        <img :src="userStore.GetUserById(replyUserId)?.profilePicture" alt="profile picture"
             class="rounded-full size-4 inline mr-1">
        <span class="hover:underline hover:text-white hover:cursor-pointer"
              @click="$emit('scroll-reply',replyId)">
          <span class="text-sm mr-0.5">{{ userStore.GetUserById(replyUserId)?.userName }}</span>
          <span class="text-xs">{{ userStore.GetMessageById(replyId)?.messageText }}</span>
        </span>
      </div>
    </div>
    <div class="flex flex-row justify-between border border-black">
      <img :src="userStore.GetUserById(props.message.senderId).profilePicture" alt="profile picture"
           class="rounded-full size-10 ml-1 mr-2 mt-0">
      <div class="flex flex-col grow w-12">
        <div class="flex items-center gap-1">
          <h3 class="text-lg block truncate">{{ userStore.GetUserById(props.message.senderId).userName }}</h3>
          <span class="text-xs block shrink-0">{{ timeSend.toLocaleTimeString() }}</span>
        </div>
        <span class="text-pretty break-words w-full">{{ props.message.messageText }}</span>
      </div>
      <SimpleButton @click="$emit('delete-book',props.message.messageId)" class="flex-none px-1 py-1 gap-4 h-fit">
        <span class="hidden sm:inline">delete </span>
        <font-awesome-icon icon="fa-solid fa-delete-left"/>
      </SimpleButton>
    </div>
  </li>
</template>