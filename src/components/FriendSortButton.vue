<script setup>
const props = defineProps({
  radioValue: String,
});
const model = defineModel();

const id = crypto.randomUUID();
</script>

<template>
  <label
    :for="id"
    class="text-sm flex items-center bg-gray-400 p-1 first:rounded-l-md border-y first:border-l border-r
      last:rounded-r-md border-black hover:bg-gray-500 select-none"
    :class="{ '!bg-gray-600': model === radioValue, 'text-white': model === radioValue }">
    <input :id="id" type="radio" :value="radioValue" v-model="model" class="hidden" />
    <slot />
  </label>
</template>
