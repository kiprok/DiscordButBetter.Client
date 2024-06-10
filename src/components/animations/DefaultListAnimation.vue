<script setup></script>

<template>
  <transition-group name="default-list-animation">
    <slot />
  </transition-group>
</template>

<style>
.default-list-animation-move,
.default-list-animation-enter-active {
  transition: all 0.4s ease;
}
.default-list-animation-enter-from {
  opacity: 0;
  transform: translate(-5rem, 0);
}

.default-list-animation-leave-to {
  opacity: 0;
}

.default-list-animation-leave-active {
  transition: all 0.3s ease;
  position: absolute;
}
</style>
