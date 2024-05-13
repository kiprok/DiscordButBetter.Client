<script setup>
import { useUserStore } from "@/stores/user.js";
import { computed, onMounted, onUnmounted } from "vue";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";
import { useConversationStore } from "@/stores/conversation.js";

const emits = defineEmits(["scroll-reply", "OnMountChange"]);
const props = defineProps(["message", "index"]);
const userStore = useUserStore();
const conversationStore = useConversationStore();
const sendMessageStore = useSendingMessageStore();

const timeSend = new Date(props.message.timeSend);

const reply = computed(() => {
  return userStore.GetMessageById(props.message.meta.reply?.messageId) ?? null;
});

const previousAlsoOwner = computed(() => {
  if (reply.value) return false;
  let previousElement = document.querySelector(
    `#message-list [data-msg-list-index="${props.index - 1}"]`,
  );
  if (!previousElement) return false;
  return (
    previousElement.getAttribute("data-msg-sender-id") ===
    props.message.senderId
  );
});

onMounted(() => {
  emits("OnMountChange", props.message, 1);
});

onUnmounted(() => {
  emits("OnMountChange", props.message, -1);
});

function RemoveChatMessage() {
  userStore.DeleteMessage(props.message.messageId);
  conversationStore.DeleteMessage(
    props.message.convoId,
    props.message.messageId,
  );
}

function ReplyToMessage() {
  sendMessageStore.replyTo = userStore.GetMessageById(props.message.messageId);
  let chatInput = document.querySelector("#chat-input");
  if (chatInput) {
    chatInput.focus();
  }
}

function EditMessage() {
  sendMessageStore.EditMessage(props.message, reply.value);
  let chatInput = document.querySelector("#chat-input");
  if (chatInput) {
    chatInput.focus();
  }
}
</script>

<template>
  <li
    class="flex flex-col relative group/item hover:bg-gray-400"
    :class="{ 'mt-2': !previousAlsoOwner }"
  >
    <div class="flex flex-row items-end" v-if="reply">
      <div
        class="w-8 ml-6 h-3 shrink-0 border border-b-0 border-r-0 border-black rounded-tl"
      ></div>
      <div class="mb-0.5 truncate">
        <img
          :src="userStore.GetUserById(reply.senderId)?.profilePicture"
          alt="profile picture"
          class="rounded-full size-4 inline mr-1"
        />
        <span
          class="hover:underline hover:text-white hover:cursor-pointer"
          @click="$emit('scroll-reply', reply.messageId)"
        >
          <span class="text-sm mr-0.5">{{
            userStore.GetUserById(reply.senderId)?.userName
          }}</span>
          <span class="text-xs">{{ reply.messageText }}</span>
        </span>
      </div>
    </div>
    <div class="flex flex-row justify-between relative">
      <div class="w-10 ml-1 mr-2 mt-0 flex-none">
        <img
          :src="userStore.GetUserById(props.message.senderId).profilePicture"
          alt="profile picture"
          class="rounded-full size-full h-10"
          v-if="!previousAlsoOwner"
        />
        <div
          v-if="previousAlsoOwner"
          class="flex items-center justify-center h-6"
        >
          <span class="text-xs invisible group-hover/item:visible">
            {{
              timeSend.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            }}</span
          >
        </div>
      </div>
      <div class="flex flex-col grow w-12">
        <div class="flex items-center gap-1" v-if="!previousAlsoOwner">
          <h3 class="text-lg block truncate">
            {{ userStore.GetUserById(props.message.senderId).userName }}
          </h3>
          <span class="text-xs block shrink-0">{{
            timeSend.toLocaleTimeString()
          }}</span>
        </div>
        <span class="text-pretty break-words w-full">{{
          props.message.messageText
        }}</span>
      </div>
    </div>
    <div
      class="opacity-0 group-hover/item:opacity-100 absolute right-0 -top-5 h-8 p-1 group-hover/item:ease-in-out duration-300 flex items-center"
    >
      <button
        @click="ReplyToMessage"
        class="bg-gray-800 first:rounded-l-lg last:rounded-r-lg px-1 py-1 h-fit hover:bg-gray-700 text-white"
      >
        <i class="fa-solid fa-reply"></i>
      </button>
      <button
        @click="EditMessage"
        class="bg-gray-800 first:rounded-l-lg last:rounded-r-lg px-1 py-1 h-fit hover:bg-gray-700 text-white"
        v-if="props.message.senderId === userStore.myId"
      >
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button
        @click="RemoveChatMessage"
        class="bg-gray-800 first:rounded-l-lg last:rounded-r-lg px-1 py-1 h-fit hover:bg-gray-700 text-white"
        v-if="props.message.senderId === userStore.myId"
      >
        <i class="fa-solid fa-delete-left"></i>
      </button>
    </div>
  </li>
</template>
