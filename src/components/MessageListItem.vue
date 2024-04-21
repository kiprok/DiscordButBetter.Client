<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {useUserStore} from "@/stores/user.js";
import {computed} from "vue";
import {useSendingMessageStore} from "@/stores/sendingMessage.js";

const emits = defineEmits(['scroll-reply'])
const props = defineProps(['message'])
const userStore = useUserStore();
const sendMessageStore = useSendingMessageStore();

const timeSend = new Date(props.message.timeSend);

const reply = computed(() => {
  return userStore.GetMessageById(props.message.meta.reply?.messageId) ?? null;
})

function RemoveChatMessage() {
  userStore.DeleteMessage(props.message.messageId);
}

function ReplyToMessage() {
  sendMessageStore.replyTo = userStore.GetMessageById(props.message.messageId);
}

function EditMessage() {
  sendMessageStore.EditMessage(props.message, reply.value);
}

</script>

<template>
  <li class="flex flex-col relative">
    <div class="flex flex-row items-end" v-if="reply">
      <div class="w-8 ml-6 h-3 shrink-0 border border-b-0 border-r-0 border-black rounded-tl"></div>
      <div class="mb-0.5 truncate">
        <img :src="userStore.GetUserById(reply.senderId)?.profilePicture" alt="profile picture"
             class="rounded-full size-4 inline mr-1">
        <span class="hover:underline hover:text-white hover:cursor-pointer"
              @click="$emit('scroll-reply',reply.messageId)">
          <span class="text-sm mr-0.5">{{ userStore.GetUserById(reply.senderId)?.userName }}</span>
          <span class="text-xs">{{ reply.messageText }}</span>
        </span>
      </div>
    </div>
    <div class="flex flex-row justify-between group border border-black relative">
      <img :src="userStore.GetUserById(props.message.senderId).profilePicture" alt="profile picture"
           class="rounded-full size-10 ml-1 mr-2 mt-0">
      <div class="flex flex-col grow w-12">
        <div class="flex items-center gap-1">
          <h3 class="text-lg block truncate">{{ userStore.GetUserById(props.message.senderId).userName }}</h3>
          <span class="text-xs block shrink-0">{{ timeSend.toLocaleTimeString() }}</span>
        </div>
        <span class="text-pretty break-words w-full">{{ props.message.messageText }}</span>
      </div>
      <div class="opacity-0 group-hover:opacity-100 absolute right-0 -top-8 h-8 bg-black/50 rounded-t-lg p-1
    group-hover:ease-in-out duration-300
    flex items-center">
        <SimpleButton @click="ReplyToMessage" class="px-1 py-1 gap-4 h-fit">
          <i class="fa-solid fa-reply"></i>
        </SimpleButton>
        <SimpleButton @click="EditMessage" class="px-1 py-1 gap-4 h-fit" v-if="props.message.senderId === userStore.myId">
          <i class="fa-solid fa-pen-to-square"></i>
        </SimpleButton>
        <SimpleButton @click="RemoveChatMessage" class="px-1 py-1 gap-4 h-fit" v-if="props.message.senderId === userStore.myId">
          <i class="fa-solid fa-delete-left"></i>
        </SimpleButton>
      </div>
    </div>
  </li>
</template>