<script setup>
import { useUserStore } from '@/stores/user.js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { useConversationStore } from '@/stores/conversation.js';
import hljs from 'highlight.js';
import {
  escapeHtml,
  GetBlockQuoteMarkDown,
  GetMarkdownSize,
  reverseEscapeHtml,
} from '@/composables/utility.js';

const emits = defineEmits(['scroll-reply', 'OnMountChange']);
const props = defineProps(['message', 'index']);
const userStore = useUserStore();
const conversationStore = useConversationStore();
const sendMessageStore = useSendingMessageStore();

const refTextMessage = ref();

const timeSend = new Date(props.message.timeSend);

const reply = computed(() => {
  return userStore.GetMessageById(props.message.meta.reply?.messageId) ?? null;
});

const parseMarkdown = (text) => {
  return text
    .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>')
    .replace(/([*_])(.*?)\1/g, '<em>$2</em>')
    .replace(/(\|\|)(.*?)\1/g, '<span class="hidden-text bg-black rounded">$2</span>')
    .replace(/(^|\n)(#{1,6})(.+)/g, (match, p1, p2, p3) => GetMarkdownSize(p2.length, p3))
    .replace(
      /\[(.*?)]\((.*?)\)/g,
      '<a href="$2" class="text-blue-800 hover:cursor-pointer hover:text-white hover:underline">$1</a>',
    )
    .replace(/(?:^(?:&gt;)+.*\n?)+/gm, (match) => GetBlockQuoteMarkDown(match))
    .replace(
      /(`{3,})(.*?)\n([\s\S]*?)\1/g,
      (match, p1, p2, p3) =>
        `<pre class="border border-black my-1 rounded overflow-x-auto 2xl:max-w-[90%] my-4"><code class="hljs">${
          hljs.highlight(reverseEscapeHtml(p3), {
            language: hljs.getLanguage(p2) ? p2 : 'plaintext',
            ignoreIllegals: true,
          }).value
        }</code></pre>`,
    );
};

const finalMessage = computed(() => {
  let escapedMessage = escapeHtml(props.message.messageText);
  return parseMarkdown(escapedMessage);
});

const previousAlsoOwner = computed(() => {
  const prevMsg = conversationStore.GetVisibleMessages(props.message.convoId)[props.index - 1];
  return (
    !props.message.meta.edited &&
    !reply.value &&
    prevMsg &&
    prevMsg.senderId === props.message.senderId
  );
});

onMounted(() => {
  emits('OnMountChange', props.message, 1);
});

watch(
  () => props.message.messageText,
  () => {},
);

onUnmounted(() => {
  emits('OnMountChange', props.message, -1);
});

function RemoveChatMessage() {
  userStore.DeleteMessage(props.message.messageId);
  conversationStore.DeleteMessage(props.message.convoId, props.message.messageId);
}

function ReplyToMessage() {
  sendMessageStore.replyTo = userStore.GetMessageById(props.message.messageId);
  let chatInput = document.querySelector('#chat-input');
  if (chatInput) {
    chatInput.focus();
  }
}

function EditMessage() {
  sendMessageStore.EditMessage(props.message, reply.value);
  let chatInput = document.querySelector('#chat-input');
  if (chatInput) {
    chatInput.focus();
  }
}
</script>

<template>
  <li
    class="group/item relative flex flex-col hover:bg-gray-400"
    :class="{ 'mt-2': !previousAlsoOwner }">
    <div class="flex flex-row items-end" v-if="reply">
      <div class="ml-6 h-3 w-8 shrink-0 rounded-tl border border-b-0 border-r-0 border-black"></div>
      <div class="mb-0.5 truncate">
        <img
          :src="userStore.GetUserById(reply.senderId)?.profilePicture"
          alt="profile picture"
          class="mr-1 inline size-4 rounded-full" />
        <span
          class="hover:cursor-pointer hover:text-white hover:underline"
          @click="$emit('scroll-reply', reply.messageId)">
          <span class="mr-0.5 text-sm">{{ userStore.GetUserById(reply.senderId)?.userName }}</span>
          <span class="text-xs">{{ reply.messageText }}</span>
        </span>
      </div>
    </div>
    <div class="relative flex flex-row justify-between">
      <div class="ml-1 mr-2 mt-0 w-10 flex-none">
        <img
          :src="userStore.GetUserById(props.message.senderId).profilePicture"
          alt="profile picture"
          class="size-full h-10 rounded-full"
          v-if="!previousAlsoOwner" />
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
            {{ userStore.GetUserById(props.message.senderId).userName }}
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
      class="absolute -top-5 right-0 flex h-8 items-center p-1 opacity-0 duration-300
        group-hover/item:opacity-100 group-hover/item:ease-in-out">
      <button
        @click="ReplyToMessage"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700">
        <i class="fa-solid fa-reply"></i>
      </button>
      <button
        @click="EditMessage"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === userStore.myId">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button
        @click="RemoveChatMessage"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === userStore.myId">
        <i class="fa-solid fa-delete-left"></i>
      </button>
    </div>
  </li>
</template>
