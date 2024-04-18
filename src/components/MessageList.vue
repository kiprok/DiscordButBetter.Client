<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {useUserStore} from "@/stores/user.js";
import MessageListItem from "@/components/MessageListItem.vue";

const props = defineProps(['convoId']);

const userStore = useUserStore();

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RemoveChatMessage(id) {
  userStore.DeleteMessage(id);

}

function RemoveAllChatMessages() {
  userStore.DeleteAllMessages(props.convoId);
}

function AddRandomChatMessage() {
  userStore.SendMessage(props.convoId, {
    senderId: userStore.myId,
    convoId: props.convoId,
    messageText: `person ${userStore.myUserName} says random message ${getRndInteger(1000, 9999)}`,
    timeSend: Date.now(),
    meta: {}
  });
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
    <div class="flex flex-row flex-none">
      <SimpleButton @click="AddRandomChatMessage()"
                    class="px-2 rounded-br-none rounded-bl-none rounded-tr-none border-blue-900 border">
        add random
      </SimpleButton>
      <SimpleButton @click="RemoveAllChatMessages()"
                    class="px-2 rounded-br-none rounded-bl-none rounded-tl-none border-blue-900 border">
        remove all
      </SimpleButton>
    </div>
    <div class="flex flex-col-reverse grow h-16 bg-gray-300 overflow-auto">
      <ul class="flex flex-col gap-2 p-4" id="message-list">
        <message-list-item :key="index" :data-msg-id="message.messageId"
                      v-for="(message, index) in userStore.GetMessagesFromConversation(props.convoId)"
                      :message="message"
                      @delete-book="RemoveChatMessage"
                      @scroll-reply="ScrollToMessage"/>
      </ul>
    </div>
  </div>
</template>