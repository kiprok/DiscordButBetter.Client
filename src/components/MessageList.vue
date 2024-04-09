<script setup>
import BookListItem from "@/components/MessageListItem.vue";
import SimpleButton from "@/components/SimpleButton.vue";
import {computed, reactive, ref} from "vue";
import ChatTextBox from "@/components/ChatTextBox.vue";

const props = defineProps(['messages']);


function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RemoveChatMessage(id) {
  props.messages.splice(id, 1);
}

function RemoveAllChatMessages() {
  props.messages.splice(0, props.messages.length);
}

function AddRandomChatMessage() {
  props.messages.push(`Random message ${getRndInteger(1000, 9999)}`);
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
      <ul class="flex flex-col gap-2 p-4">
        <BookListItem :key="index" v-for="(message, index) in props.messages" :title="message"
                      @delete-book="RemoveChatMessage(index)"/>
      </ul>
    </div>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="(message) => props.messages.push(message)"/>
    </div>
  </div>
</template>