<script setup>
import BookList from "@/components/MessageList.vue";

</script>

<template>
  <div class="h-screen flex flex-col bg-amber-500 overflow-hidden">
    <header class="bg-gray-800 h-20 ">
      <h1 class="text-white text-3xl font-bold underline">
        Hello world!
      </h1>
    </header>
    <div class="w-screen flex justify-center h-full bg-blue-700 overflow-hidden">
      <book-list class="w-full h-full" />
    </div>
  </div>

</template>