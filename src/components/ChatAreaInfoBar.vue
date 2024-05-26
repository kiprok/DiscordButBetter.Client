<script setup>
const props = defineProps(['visible', 'buttonClass', 'barClick']);
const emit = defineEmits(['onClick']);
</script>

<template>
  <div
    class="flex h-6 flex-none bg-gray-500 px-4 hover:cursor-pointer"
    v-if="props.visible"
    @click="
      () => {
        if (props.barClick) emit('onClick');
      }
    ">
    <span class="mr-1 text-sm text-white"><slot></slot></span>
    <span
      v-if="props.buttonClass"
      class="ml-auto text-white hover:text-gray-600"
      @click="
        () => {
          if (props.buttonClass) emit('onClick');
        }
      ">
      <i :class="props.buttonClass"></i>
    </span>
  </div>
</template>
