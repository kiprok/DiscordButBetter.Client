<script setup>
import { useUserStore } from '@/stores/user.js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { useConversationStore } from '@/stores/conversation.js';
import { escapeHtml, parseMarkdownMessage, parseMarkdownReply } from '@/composables/markdown.js';
import ContextModal from '@/components/modals/ContextModal.vue';
import ChatMessageItemContent from '@/components/modals/contextMenuContents/ChatMessageItemContent.vue';
import TouchComponentHold from '@/components/touch/TouchComponentHold.vue';
import {
  EditChatMessage,
  RemoveChatMessage,
  ReplyToChatMessage,
} from '@/composables/commands/chatMessageCommands.js';
import { useModalStore } from '@/stores/modalStore.js';
import { useServerStore } from '@/stores/server.js';

const emits = defineEmits(['scroll-reply', 'OnMountChange']);
const props = defineProps(['message', 'allowedFunctions', 'previousAlsoOwner', 'tag']);
const userStore = useUserStore();
const modalStore = useModalStore();
const serverStore = useServerStore();

const refTextMessage = ref();
const timeSend = new Date(props.message.timeSend);

const reply = computed(() => {
  return userStore.GetMessageById(props.message.meta.reply?.messageId) ?? null;
});

const finalMessage = computed(() => {
  let escapedMessage = escapeHtml(props.message.messageText);
  return parseMarkdownMessage(escapedMessage);
});

const finalReply = computed(() => {
  if (!reply.value) return '';
  let escapedMessage = escapeHtml(reply.value.messageText);
  return parseMarkdownReply(escapedMessage);
});

onMounted(() => {
  emits('OnMountChange', props.message, 1);
});

onUnmounted(() => {
  emits('OnMountChange', props.message, -1);
});

function OpenContextMenu() {
  modalStore.OpenModal('contextMenu', {
    componentType: ChatMessageItemContent,
    message: props.message,
    allowedFunctions: props.allowedFunctions,
    conversationId: props.message.conversationId,
  });
}
</script>

<template>
  <touch-component-hold
    @held="OpenContextMenu"
    :tag="tag ? tag : 'div'"
    class="group/item flex flex-col w-full"
    :class="{ 'mt-2': !previousAlsoOwner }">
    <div class="pl-6 h-5 flex flex-row items-end truncate overflow-hidden w-full" v-if="reply">
      <div class="flex-none h-3 w-8 rounded-tl border border-b-0 border-r-0 border-black"></div>
      <img
        :src="userStore.GetUserById(reply.senderId)?.profilePicture"
        alt="profile picture"
        class="mr-1 size-4 flex-none rounded-full" />
      <div
        class="flex items-center content-center grow min-w-0 hover:cursor-pointer hover:text-white hover:underline"
        @click="$emit('scroll-reply', reply.messageId)">
        <span class="block mr-0.5 w-fit flex-none min-w-0 text-sm">{{
          userStore.GetUserById(reply.senderId)?.username
        }}</span>
        <span
          class="block text-xs grow min-w-0 truncate"
          v-html="finalReply.replaceAll('\n', ' ')"></span>
      </div>
    </div>
    <div class="relative flex flex-row justify-between">
      <div class="ml-1 mr-2 mt-0 w-10 flex-none">
        <img
          :src="userStore.GetUserById(props.message.senderId).profilePicture"
          alt="profile picture"
          class="size-full h-10 rounded-full hover:cursor-pointer"
          v-if="!previousAlsoOwner"
          @click="
            modalStore.OpenModal('userProfile', {
              user: userStore.GetUserById(props.message.senderId),
            })
          " />
        <div v-if="previousAlsoOwner" class="flex h-6 items-center justify-center">
          <span class="invisible text-xs group-hover/item:visible">
            {{
              timeSend.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            }}
          </span>
        </div>
      </div>
      <div class="flex w-12 grow flex-col">
        <div class="flex items-center gap-1" v-if="!previousAlsoOwner">
          <h3 class="block truncate text-lg">
            {{ userStore.GetUserById(props.message.senderId).username }}
          </h3>
          <span class="block shrink-0 text-xs">
            {{ timeSend.toLocaleTimeString() }}
          </span>
          <span class="block shrink-0 text-xs" v-if="props.message.meta.edited" title="edited">
            <i class="fa-solid fa-pencil"></i>
          </span>
        </div>
        <span
          class="w-full whitespace-pre-wrap text-pretty break-words"
          v-html="finalMessage"
          ref="refTextMessage"></span>
      </div>
    </div>
    <div
      class="absolute -top-5 right-0 h-8 items-center p-1 opacity-0 duration-300 flex
        mouse:group-hover/item:opacity-100 touch:hidden group-hover/item:ease-in-out">
      <button
        @click.stop="ReplyToChatMessage(props.message)"
        v-if="allowedFunctions.allowReply"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700">
        <i class="fa-solid fa-reply"></i>
      </button>
      <button
        @click.stop="EditChatMessage(props.message)"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === serverStore.user.userId && allowedFunctions.allowEdit">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button
        @click.stop="RemoveChatMessage(props.message.conversationId, props.message.messageId)"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === serverStore.user.userId && allowedFunctions.allowDelete">
        <i class="fa-solid fa-delete-left"></i>
      </button>
    </div>
  </touch-component-hold>
</template>
