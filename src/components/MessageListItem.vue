<script setup>
import { useUserStore } from '@/stores/user.js';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { useConversationStore } from '@/stores/conversation.js';
import hljs from 'highlight.js';
import {
  ApplyBlockQuoteMarkdown,
  ApplyCodeMarkdown,
  ApplyHeadingMarkdown,
  ApplyHiddenTextMarkdown,
  ApplyItalicMarkdown,
  ApplyLinkMarkdown,
  ApplyStrongMarkdown,
  escapeHtml,
  GetBlockQuoteMarkDown,
  GetMarkdownSize,
  reverseEscapeHtml,
} from '@/composables/markdown.js';

const emits = defineEmits(['scroll-reply', 'OnMountChange']);
const props = defineProps(['message', 'allowedFunctions', 'previousAlsoOwner']);
const userStore = useUserStore();
const conversationStore = useConversationStore();
const sendMessageStore = useSendingMessageStore();

const refTextMessage = ref();

const timeSend = new Date(props.message.timeSend);

const reply = computed(() => {
  return userStore.GetMessageById(props.message.meta.reply?.messageId) ?? null;
});

function parseMarkdownMessage(text) {
  let codeBlocks = [];
  text = ApplyCodeMarkdown(text, (match, p1, p2, p3) => {
    codeBlocks.push(
      `<pre class="border border-black rounded overflow-x-auto xl:max-w-[90%] my-4"><code class="hljs p-4">${
        hljs.highlight(reverseEscapeHtml(p3), {
          language: hljs.getLanguage(p2) ? p2 : 'plaintext',
          ignoreIllegals: true,
        }).value
      }</code></pre>`,
    );
    return '%%CODE_BLOCK%%';
  });

  text = ApplyStrongMarkdown(text, '<strong>$2</strong>');
  text = ApplyItalicMarkdown(text, '<em>$2</em>');
  text = ApplyHiddenTextMarkdown(
    text,
    (match, p1, p2) =>
      `<div class="hidden-text bg-black rounded cursor-pointer select-none size-fit max-w-full"><span class="invisible">${p2.trim()}</span></div>`,
  );
  text = ApplyHeadingMarkdown(text, (match, p1, p2) => GetMarkdownSize(p1.length - 1, p2));
  text = ApplyLinkMarkdown(
    text,
    '<a href="$2" class="text-blue-800 hover:cursor-pointer hover:text-white hover:underline">$1</a>',
  );
  text = ApplyBlockQuoteMarkdown(text, (match) => GetBlockQuoteMarkDown(match));
  text = text.replaceAll('%%CODE_BLOCK%%', () => codeBlocks.shift() || '%%CODE_BLOCK%%');

  return text;
}

function parseMarkdownReply(text) {
  let codeBlocks = [];
  text = ApplyCodeMarkdown(text, (match, p1, p2, p3) => {
    codeBlocks.push(
      `<pre class="border border-blackrounded "><code class="hljs">${
        hljs.highlight(reverseEscapeHtml(p3), {
          language: hljs.getLanguage(p2) ? p2 : 'plaintext',
          ignoreIllegals: true,
        }).value
      }</code></pre>`,
    );
    return '%%CODE_BLOCK%%';
  });

  text = ApplyStrongMarkdown(text, '<strong>$2</strong>');
  text = ApplyItalicMarkdown(text, '<em>$2</em>');
  text = ApplyHiddenTextMarkdown(
    text,
    (match, p1, p2) =>
      `<div class="hidden-text bg-black rounded cursor-pointer select-none size-fit max-w-full"><span class="invisible">${p2.trim()}</span></div>`,
  );
  text = ApplyHeadingMarkdown(text, (match, p1, p2) => GetMarkdownSize(p1.length - 1, p2));
  text = ApplyLinkMarkdown(
    text,
    '<a href="$2" class="text-blue-800 hover:cursor-pointer hover:text-white hover:underline">$1</a>',
  );
  text = ApplyBlockQuoteMarkdown(text, (match) => GetBlockQuoteMarkDown(match));
  text = text.replaceAll('%%CODE_BLOCK%%', () => codeBlocks.shift() || '%%CODE_BLOCK%%');

  return text;
}

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
  sendMessageStore.EditMessage(props.message);
  let chatInput = document.querySelector('#chat-input');
  if (chatInput) {
    chatInput.focus();
  }
}
</script>

<template>
  <li class="group/item relative flex flex-col w-full" :class="{ 'mt-2': !previousAlsoOwner }">
    <div class="pl-6 h-5 flex flex-row items-end truncate overflow-hidden w-full" v-if="reply">
      <div class="flex-none h-3 w-8 rounded-tl border border-b-0 border-r-0 border-black"></div>
      <img
        :src="userStore.GetUserById(reply.senderId)?.profilePicture"
        alt="profile picture"
        class="mr-1 size-4 flex-none rounded-full" />
      <div
        class="flex w-full hover:cursor-pointer hover:text-white hover:underline"
        @click="$emit('scroll-reply', reply.messageId)">
        <span class="block mr-0.5 w-fit text-sm">{{
          userStore.GetUserById(reply.senderId)?.userName
        }}</span>
        <span class="block text-xs grow" v-html="finalReply.replaceAll('\n', '')"></span>
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
        v-if="allowedFunctions.allowReply"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700">
        <i class="fa-solid fa-reply"></i>
      </button>
      <button
        @click="EditMessage"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === userStore.myId && allowedFunctions.allowEdit">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button
        @click="RemoveChatMessage"
        class="h-fit bg-gray-800 px-1 py-1 text-white first:rounded-l-lg last:rounded-r-lg hover:bg-gray-700"
        v-if="props.message.senderId === userStore.myId && allowedFunctions.allowDelete">
        <i class="fa-solid fa-delete-left"></i>
      </button>
    </div>
  </li>
</template>
