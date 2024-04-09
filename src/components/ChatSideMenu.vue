<script setup>
function ToggleSideMenu(){
  let sideMenu = document.querySelector("#SideMenu")
  sideMenu.classList.toggle("hidden")
}
</script>

<template>
  <div id="SideMenu" class="bg-green-600 row-span-3 absolute top-0 left-0 h-screen w-screen flex-none
    hidden md:block md:w-72 md:h-full md:top-auto md:left-auto md:relative">
    <div class="w-full h-full flex flex-col">
      <div class="h-14 bg-gray-800 flex-none flex items-center p-4">
        <h2 class="text-white text-3xl font-bold">
          Menu
        </h2>
      </div>
      <div class="bg-purple-700 grow flex flex-col px-6">
        <router-link @click="ToggleSideMenu" :to="{name: 'friendList'}">
          Friends
        </router-link>
        <router-link @click="ToggleSideMenu" :to="{name: 'chat'}">
          chat
        </router-link>

      </div>
    </div>
  </div>
</template>
