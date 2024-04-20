<script setup>
import {useUserStore} from "@/stores/user.js";
import {defineAsyncComponent} from "vue";

const MessageListItem = defineAsyncComponent(
    () => import('@/components/MessageListItem.vue')
)

const props = defineProps(['convoId']);

const userStore = useUserStore();

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function ScrollToMessage(messageId) {
  let msgElement = document.querySelector(`#message-list [data-msg-id="${messageId}"]`);
  if (!msgElement)
    return;

  msgElement.scrollIntoView({
    block: 'center',
    behavior: 'smooth'
  });
}

</script>

<template>
  <div class="flex flex-col flex-nowrap h-full">
    <div class="flex flex-col-reverse grow h-16 bg-gray-300 overflow-auto">
      <ul class="flex flex-col gap-2 p-4" id="message-list">
        <message-list-item :key="index" :data-msg-id="message.messageId"
                      v-for="(message, index) in userStore.GetMessagesFromConversation(props.convoId)"
                      :message="message"
                      @scroll-reply="ScrollToMessage"/>
      </ul>
    </div>
  </div>
</template>