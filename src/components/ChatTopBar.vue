<script setup>

import {library} from "@fortawesome/fontawesome-svg-core";
import {faBars} from "@fortawesome/free-solid-svg-icons";

library.add(faBars)

function ToggleSideMenu() {
  let sideMenu = document.querySelector("#SideMenu")
  sideMenu.classList.toggle("hidden")
}
</script>

<template>
  <header class="bg-gray-800 h-14 flex flex-row items-center flex-none px-4 gap-4">
    <button @click="ToggleSideMenu"
            class="h-8 w-8 text-white text-2xl text-center flex justify-center items-center hover:text-gray-300 md:hidden">
      <font-awesome-icon icon="fa-solid fa-bars"/>
    </button>
    <slot></slot>
  </header>
</template>