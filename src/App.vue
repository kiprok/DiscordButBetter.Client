<script setup>
import BookList from "@/components/MessageList.vue";
import SimpleButton from "@/components/SimpleButton.vue";
import MessageList from "@/components/MessageList.vue";

function ToggleSideMenu(){
  let sideMenu = document.querySelector("#SideMenu")
  sideMenu.classList.toggle("hidden")
}

</script>

<template>
  <div class="h-screen flex flex-row items-stretch bg-amber-500 overflow-hidden">
    <div id="SideMenu" class="bg-green-600 row-span-3 absolute top-0 left-0 h-screen w-screen flex-none
    hidden md:block md:w-72 md:h-full md:top-auto md:left-auto md:relative">
      <div class="w-full h-full flex flex-col">
        <div class="h-14 bg-gray-800 flex-none flex  items-center">
          <SimpleButton @click="ToggleSideMenu" class="w-fit md:hidden h-fit">
            close
          </SimpleButton>
        </div>
        <div class="bg-purple-700 grow flex flex-col px-6">
          <router-link to="/">chat</router-link>
          <router-link to="/friends">Friends</router-link>
        </div>
      </div>
    </div>
    <router-view />
  </div>

</template>