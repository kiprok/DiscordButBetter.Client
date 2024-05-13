<script setup>
const props = defineProps(["visible", "buttonClass", "barClick"]);
const emit = defineEmits(["onClick"]);
</script>

<template>
  <div
    class="bg-gray-500 flex-none h-6 px-4 flex hover:cursor-pointer"
    v-if="props.visible"
    @click="
      () => {
        if (props.barClick) emit('onClick');
      }
    "
  >
    <span class="text-white text-sm mr-1"><slot></slot></span>
    <span
      v-if="props.buttonClass"
      class="ml-auto text-white hover:text-gray-600"
      @click="
        () => {
          if (props.buttonClass) emit('onClick');
        }
      "
    >
      <i :class="props.buttonClass"></i>
    </span>
  </div>
</template>
