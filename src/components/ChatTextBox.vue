<script setup>
import SimpleButton from "@/components/SimpleButton.vue";
import {ref} from "vue";

const emit = defineEmits(['SendChatMessage'])
const textMessage = ref('')

function SendChatMessage(){
  if (!textMessage.value)
    return;
  emit("SendChatMessage",textMessage.value)
  textMessage.value = "";
}

</script>

<template>
  <div class="flex flex-row items-center">
    <input @keyup.enter="SendChatMessage" v-model="textMessage" class="grow h-6">
    <SimpleButton @click="SendChatMessage" class="flex-none px-2 w-fit h-6 rounded-l-none">send</SimpleButton>
  </div>
</template>