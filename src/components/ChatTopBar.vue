<script setup>
function ToggleSideMenu() {
  let sideMenu = document.querySelector("#SideMenu");
  sideMenu.classList.toggle("hidden");
}
</script>

<template>
  <header
    class="bg-gray-800 h-14 flex flex-row items-center flex-none px-4 gap-4"
  >
    <div class="block md:hidden size-8">
      <button
        @click="ToggleSideMenu"
        class="size-8 text-white text-2xl text-center flex justify-center items-center hover:text-gray-300"
      >
        <i class="fa-solid fa-bars"></i>
      </button>
    </div>

    <slot></slot>
  </header>
</template>
