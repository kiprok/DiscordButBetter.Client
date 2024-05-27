<script setup>
function ToggleSideMenu() {
  let sideMenu = document.querySelector('#SideMenu');
  sideMenu.classList.toggle('hidden');
}
</script>

<template>
  <div class="block size-8 md:hidden">
    <button
      @click="ToggleSideMenu"
      class="flex size-8 items-center justify-center text-center text-2xl text-white hover:text-gray-300">
      <i class="fa-solid fa-bars"></i>
    </button>
  </div>
</template>

<style scoped></style>
