<script setup>
import { useUserStore } from '@/stores/user.js';
import { computed, defineAsyncComponent, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useConversationStore } from '@/stores/conversation.js';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { IsLoadingCompleted } from '@/composables/utility.js';
import { useServerStore } from '@/stores/server.js';
import SkellyLoading from '@/components/Skeletons/SkellyLoading.vue';

const route = useRoute();

const MessageListItem = defineAsyncComponent(() => import('@/components/MessageListItem.vue'));

const props = defineProps(['conversation']);
const amountToLoad = 25;

const userStore = useUserStore();
const serverStore = useServerStore();
const conversationStore = useConversationStore();
const sendingMessageStore = useSendingMessageStore();

const messageListContainer = ref();
const messageListDom = ref();

const oldScrollHeight = ref(0);

const chatIsLoading = ref(true);
const waitingMessagesAbove = reactive([]);
const waitingMessagesBelow = reactive([]);
const waitingMessagesJump = reactive({ focus: null, messages: [] });

LoadFirstMessages();

onMounted(() => {
  conversationStore.RegisterJumpCallback((messages, focus) => {
    if (messages.length !== 0) {
      waitingMessagesJump.messages.push(...messages);
      waitingMessagesJump.focus = focus;
    } else {
      let msgElement = document.querySelector(`#message-list [data-msg-id="${focus.messageId}"]`);
      if (msgElement) {
        msgElement.scrollIntoView({
          block: 'center',
          behavior: 'smooth',
        });
      }
    }
  });
});

onUnmounted(() => {
  conversationStore.UnRegisterJumpCallback();
});

function ScrollToMessage(messageId) {
  let msgElement = document.querySelector(`#message-list [data-msg-id="${messageId}"]`);
  if (!msgElement) {
    conversationStore.TriggerJumpToMessage(props.conversation.conversationId, messageId);
    return;
  }

  msgElement.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  });
}

function ScrollToSavedLocation() {
  if (messageListContainer.value) {
    console.log(
      'Getting scroll position',
      conversationStore.GetScrollPosition(props.conversation.conversationId),
    );
    messageListContainer.value.scrollTo({
      top: conversationStore.GetScrollPosition(props.conversation.conversationId),
      behavior: 'instant',
    });
  }
}

async function LoadFirstMessages() {
  if (conversationStore.GetVisibleMessages(props.conversation.conversationId).length === 0) {
    await LoadOlderMessages(null);
  } else {
    waitingMessagesAbove.push(...conversationStore.GetVisibleMessages(props.conversationId));
  }
}

async function LoadOlderMessages(startPointId) {
  if (props.conversation.isLoadingMessages) return;
  props.conversation.isLoadingMessages = true;
  const newMessages =
    startPointId == null
      ? await serverStore.GetMessagesAsync(props.conversation.conversationId)
      : await serverStore.GetOlderMessagesAsync(
          props.conversation.conversationId,
          userStore.GetMessageById(startPointId).sentAt,
        );

  if (newMessages.length === 0) props.conversation.isLoadingMessages = false;

  userStore.AddMessages(newMessages);

  waitingMessagesAbove.push(...newMessages);

  conversationStore.AddMessages(props.conversation.conversationId, newMessages);
  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;

  // if (conversationStore.GetVisibleMessages(props.conversation.conversationId).length >= 80) {
  //   waitingMessagesAbove.push(
  //     ...conversationStore.RemoveNewerMessages(
  //       props.conversation.conversationId,
  //       conversationStore.GetVisibleMessages(props.conversation.conversationId).length - 80,
  //     ),
  //   );
  //   props.conversation.viewingOlderMessages = true;
  // }
}

async function LoadNewerMessages(startPointId) {
  if (props.conversation.isLoadingMessages) return;
  if (!props.conversation.viewingOlderMessages) return;
  props.conversation.isLoadingMessages = true;

  const newMessages = await serverStore.GetNewerMessagesAsync(
    props.conversation.conversationId,
    userStore.GetMessageById(startPointId).sentAt,
  );

  if (newMessages.length === 0) {
    props.conversation.isLoadingMessages = false;
    props.conversation.viewingOlderMessages = false;
    return;
  }

  userStore.AddMessages(newMessages);

  waitingMessagesBelow.push(...newMessages);

  conversationStore.AddMessages(props.conversation.conversationId, newMessages);

  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;
  // if (conversationStore.GetVisibleMessages(props.conversation.conversationId).length >= 80) {
  //   waitingMessagesBelow.push(
  //     ...conversationStore.RemoveOlderMessages(
  //       props.conversation.conversationId,
  //       conversationStore.GetVisibleMessages(props.conversation.conversationId).length - 80,
  //     ),
  //   );
  // }
  if (newMessages.length === 0) props.conversation.isLoadingMessages = false;
}

function OnScrolling(event) {
  const { scrollTop, offsetHeight, scrollHeight } = event.target;
  console.log(scrollTop);
  if (Math.floor(scrollTop) === 0) {
    console.log('hit bottom', props.conversation.isLoadingMessages);
    const lastMessage = conversationStore.GetLastMessage(props.conversation.conversationId);
    if (!lastMessage) return;
    LoadNewerMessages(lastMessage.messageId);
  } else if (scrollHeight - (-scrollTop + offsetHeight) <= 2) {
    console.log('hit top', props.conversation.isLoadingMessages);

    const firstMessage = conversationStore.GetFirstMessage(props.conversation.conversationId);
    if (!firstMessage) return;
    LoadOlderMessages(firstMessage.messageId);
  }
  conversationStore.SetScrollPosition(props.conversation.conversationId, scrollTop);
}

function OnMessageMountChange(message, eventType) {
  if (eventType === 1 && props.conversation.newUnseenMessages.includes(message.messageId)) {
    conversationStore.RemoveNewUnseenMessage(props.conversation.conversationId, message.messageId);
  }

  if (IsLoadingCompleted(waitingMessagesAbove, message)) {
    HandleNewAboveMessages();
    props.conversation.isLoadingMessages = false;
    return;
  } else if (IsLoadingCompleted(waitingMessagesBelow, message)) {
    HandleNewBelowMessages();
    props.conversation.isLoadingMessages = false;
    return;
  } else if (IsLoadingCompleted(waitingMessagesJump.messages, message)) {
    HandleNewJumpMessages();
    props.conversation.isLoadingMessages = false;
    return;
  }

  if (messageListContainer.value) {
    if (message.messageId === sendingMessageStore.sendingMessage) {
      messageListContainer.value.scroll({
        top: 0,
        behavior: 'smooth',
      });
    }
    sendingMessageStore.sendingMessage = null;
  }
}

function HandleNewAboveMessages() {
  if (!chatIsLoading.value) {
    let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
    console.log('above dif', dif);
    console.log('scroll top above', messageListContainer.value.scrollTop);
    return;
  }

  ScrollToSavedLocation();
  chatIsLoading.value = false;
}

function HandleNewBelowMessages() {
  if (!messageListContainer.value) return;
  let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
  if (!chatIsLoading.value) {
    console.log('below dif', dif);
    messageListContainer.value.scrollTop += dif;
    messageListContainer.value.scrollTop = Math.min(-5, messageListContainer.value.scrollTop);
    messageListContainer.value.scrollTop = Math.max(
      -(messageListContainer.value.scrollHeight - messageListContainer.value.offsetHeight) + 5,
      messageListContainer.value.scrollTop,
    );
  } else {
    ScrollToSavedLocation();
    chatIsLoading.value = false;
  }
}

function HandleNewJumpMessages() {
  if (!messageListContainer.value) return;
  if (!waitingMessagesJump.focus) {
    messageListContainer.value.scrollTop = 0;

    props.conversation.viewingOlderMessages = false;
  } else {
    const focusElement = document.querySelector(
      `#message-list [data-msg-id="${waitingMessagesJump.focus.messageId}"]`,
    );
    focusElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    waitingMessagesJump.focus = null;
  }
}

function previousAlsoOwner(message, index) {
  const prevMsg = conversationStore.GetVisibleMessages(message.conversationId)[index - 1];

  return (
    !message.metadata.edited &&
    !message.metadata.reply &&
    prevMsg &&
    prevMsg.senderId === message.senderId
  );
}
</script>

<template>
  <div class="flex size-full flex-col flex-nowrap">
    <div
      class="flex h-16 grow flex-col-reverse overflow-y-auto overflow-x-hidden touch:select-none"
      id="list-container"
      @scroll="OnScrolling"
      ref="messageListContainer">
      <ul
        v-if="
          conversationStore.GetVisibleMessages(props.conversation.conversationId).length > 0 ||
          !props.conversation.isLoadingMessages
        "
        class="p-4"
        id="message-list"
        ref="messageListDom">
        <transition-group name="message-list">
          <message-list-item
            class="hover:bg-gray-400"
            tag="li"
            :key="message.messageId"
            :data-msg-id="message.messageId"
            :data-msg-list-index="index"
            :data-msg-sender-id="message.senderId"
            v-for="(message, index) in conversationStore.GetVisibleMessages(
              props.conversation.conversationId,
            )"
            :message="message"
            @scroll-reply="ScrollToMessage"
            @on-mount-change="OnMessageMountChange"
            :previous-also-owner="previousAlsoOwner(message, index)"
            :allowedFunctions="{
              allowReply: true,
              allowEdit: true,
              allowDelete: true,
            }" />
        </transition-group>
      </ul>
      <skelly-loading v-else class="size-full text-[8rem]" />
    </div>
  </div>
</template>

<style scoped>
.message-list-enter-active {
  transition: all 0.5s ease;
}

.message-list-enter-from {
  opacity: 0;
  transform: translateX(5rem);
}
</style>
