<script setup>
import BookListItem from "@/components/MessageListItem.vue";
import SimpleButton from "@/components/SimpleButton.vue";
import {computed, reactive, ref} from "vue";
import ChatTextBox from "@/components/ChatTextBox.vue";

const User = reactive({
  name: "john smith",
  Messages: []
});

for (let i = 0; i < 100; i++) {
  AddRandomChatMessage();
}

const EvenAmountOfChatMessages = computed(() => ({
  "bg-gray-200": User.Messages.length % 2 === 0,
  "bg-red-700": User.Messages.length % 2 !== 0
}))

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RemoveChatMessage(id) {
  User.Messages.splice(id, 1);
}

function RemoveAllChatMessages() {
  User.Messages = [];
}

function AddRandomChatMessage() {
  User.Messages.push(`Random message ${getRndInteger(1000, 9999)}`);
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
    <div :class="EvenAmountOfChatMessages" class="flex flex-col-reverse grow h-16 overflow-auto">
      <ul class="flex flex-col gap-2 p-4">
        <BookListItem :key="index" v-for="(message, index) in User.Messages" :title="message"
                      @delete-book="RemoveChatMessage(index)"/>
      </ul>
    </div>
    <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
      <ChatTextBox class="w-full" @send-chat-message="(message) => User.Messages.push(message)"/>
    </div>
  </div>
</template>