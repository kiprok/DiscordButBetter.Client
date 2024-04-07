<script setup>
import {library} from "@fortawesome/fontawesome-svg-core";
import {faBars} from "@fortawesome/free-solid-svg-icons";
import BookListItem from "@/components/MessageListItem.vue";
import SimpleButton from "@/components/SimpleButton.vue";
import {computed, reactive, ref} from "vue";

library.add(faBars)

const User = reactive({
  name: "john smith",
  books: []
});

const textMessage = ref('')

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

function SendChatMessage(){
  if (!textMessage.value)
    return;
  User.books.push(textMessage.value);
  textMessage.value = "";
}

function ToggleSideMenu(){
  let sideMenu = document.querySelector("#SideMenu")
  sideMenu.classList.toggle("hidden")
}

</script>

<template>
  <div class="flex flex-col items-stretch flex-nowrap">

    <header class="bg-gray-800 h-14 flex flex-row items-center flex-none px-4 gap-4">
      <button @click="ToggleSideMenu" class="h-8 w-8 text-white text-2xl text-center flex justify-center items-center hover:text-gray-300 md:hidden">
        <font-awesome-icon icon="fa-solid fa-bars" />
      </button>
      <h1 class="text-white text-3xl font-bold">
        Title
      </h1>
    </header>
    <div class="flex flex-col flex-nowrap h-full">
      <div class="flex flex-row flex-none">
        <SimpleButton @click="AddRandomChatMessage()" class="px-2 rounded-br-none rounded-bl-none rounded-tr-none border-blue-900 border" >
          add random
        </SimpleButton>
        <SimpleButton @click="RemoveAllChatMessages()" class="px-2 rounded-br-none rounded-bl-none rounded-tl-none border-blue-900 border">
          remove all
        </SimpleButton>
      </div>
      <div :class="EvenAmountOfChatMessages" class="flex flex-col-reverse grow h-16 overflow-auto">
        <ul class="flex flex-col gap-2 p-4 h-auto">
          <BookListItem :key="index" v-for="(book, index) in User.books" :title="book" @delete-book="RemoveChatMessage(index)" />
        </ul>
      </div>
      <div class="bg-gray-600 h-14 flex-none flex flex-row items-center px-6">
        <div class="w-full flex flex-row items-center">
          <input @keyup.enter="SendChatMessage" v-model="textMessage" class="grow h-6">
          <SimpleButton @click="SendChatMessage" class="flex-none px-2 w-fit h-6 rounded-l-none">send</SimpleButton>
        </div>
      </div>
    </div>
  </div>

</template>