<script setup>
import {ref, reactive} from 'vue'

const author = reactive({
  name: "john smith",
  books: [
    "amazing book title 1",
    "amazing book title 2",
    "amazing book title 3",
    "amazing book title 4",
    "amazing book title 5",
    "amazing book title 6"

  ]

});

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function RemoveBook(id) {
  author.books.splice(id, 1);
}

function AddRandomBook() {
  author.books.push(`Random book ${getRndInteger(1000, 9999)}`)
}
</script>

<template>
  <h1 class="text-3xl font-bold underline hover:text-white">
    Hello world!
  </h1>
  <button @click="AddRandomBook()">add random book</button>
  <ul class="flex bg-gray-200 flex-col gap-2">
    <li :key="index" v-for="(book, index) in author.books">
      {{ book }} - <button @click="RemoveBook(index)">delete</button>
    </li>
  </ul>
</template>

<style scoped>
button {
  @apply font-bold px-4 rounded bg-blue-500 text-white;
}

button:hover {
  @apply bg-blue-700;
}
</style>