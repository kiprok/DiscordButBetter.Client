<script setup>
import BookListItem from "@/components/MessageListItem.vue";
import SimpleButton from "@/components/SimpleButton.vue";
import {computed, reactive} from "vue";

const User = reactive({
  name: "john smith",
  books: []
});

for (let i = 0; i < 100; i++) {
  AddRandomChatMessage();
}

const EvenAmountOfChatMessages = computed(() => ({
  "bg-gray-200": User.books.length%2 === 0,
  "bg-red-700": User.books.length%2 !== 0
}))

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RemoveChatMessage(id) {
  User.books.splice(id, 1);
}

function RemoveAllChatMessages () {
  User.books = [];
}
function AddRandomChatMessage() {
  User.books.push(`Random message ${getRndInteger(1000, 9999)}`);
}

</script>

<template>
  <div class="flex flex-row flex-nowrap">
    <div class="bg-green-600 row-span-3 h-full w-12
    md:w-72 md:block">

    </div>
    <div class="flex flex-col flex-nowrap w-full">
      <div class="flex flex-row">
        <SimpleButton @click="AddRandomChatMessage()" class="rounded-br-none rounded-bl-none rounded-tr-none border-blue-900 border" >
          add random
        </SimpleButton>
        <SimpleButton @click="RemoveAllChatMessages()" class="rounded-br-none rounded-bl-none rounded-tl-none border-blue-900 border">
          remove all
        </SimpleButton>
      </div>
      <div :class="EvenAmountOfChatMessages" class="flex flex-col-reverse h-full overflow-auto">
        <ul class="flex flex-col gap-2 p-4 h-auto">
          <BookListItem :key="index" v-for="(book, index) in User.books" :title="book" @delete-book="RemoveChatMessage(index)" />
        </ul>
      </div>
      <div class="bg-gray-600 h-20">

      </div>
    </div>
  </div>

</template>