<script setup>
import { useUserStore } from '@/stores/user.js';
import { computed, defineAsyncComponent, onMounted, onUnmounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useConversationStore } from '@/stores/conversation.js';
import { useSendingMessageStore } from '@/stores/sendingMessage.js';
import { IsLoadingCompleted } from '@/composables/utility.js';

const route = useRoute();

const MessageListItem = defineAsyncComponent(() => import('@/components/MessageListItem.vue'));

const props = defineProps(['conversationId']);
const amountToLoad = 25;

const userStore = useUserStore();
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
    conversationStore.TriggerJumpToMessage(props.conversationId, messageId);
    return;
  }

  msgElement.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  });
}

function ScrollToSavedLocation() {
  if (messageListContainer.value) {
    messageListContainer.value.scrollTo({
      top: conversationStore.GetScrollPosition(props.conversationId),
      behavior: 'instant',
    });
  }
}

function LoadFirstMessages() {
  if (conversationStore.GetVisibleMessages(props.conversationId).length === 0) {
    LoadOlderMessages(null);
  } else {
    waitingMessagesAbove.push(...conversationStore.GetVisibleMessages(props.conversationId));
  }
}

function LoadOlderMessages(startPointId) {
  if (waitingMessagesAbove.length > 0 && waitingMessagesBelow.length > 0) return;
  const newMessages = userStore.GetOlderMessages(props.conversationId, startPointId, amountToLoad);
  waitingMessagesAbove.push(...newMessages);

  conversationStore.AddMessages(props.conversationId, newMessages);
  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;

  if (conversationStore.GetVisibleMessages(props.conversationId).length >= 100) {
    waitingMessagesAbove.push(...conversationStore.RemoveNewerMessages(props.conversationId, 25));
    conversationStore.GetConversationById(props.conversationId).viewingOlderMessages = true;
  }
}

function LoadNewerMessages(startPointId) {
  if (!conversationStore.GetConversationById(props.conversationId).viewingOlderMessages) return;
  if (waitingMessagesAbove.length > 0 && waitingMessagesBelow.length > 0) return;

  const newMessages = userStore.GetNewerMessages(props.conversationId, startPointId, amountToLoad);

  if (newMessages.length < amountToLoad) {
    conversationStore.GetConversationById(props.conversationId).viewingOlderMessages = false;
    return;
  }

  waitingMessagesBelow.push(...newMessages);

  conversationStore.AddMessages(props.conversationId, newMessages);
  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;

  if (conversationStore.GetVisibleMessages(props.conversationId).length >= 100) {
    waitingMessagesBelow.push(...conversationStore.RemoveOlderMessages(props.conversationId, 25));
  }
}

function OnScrolling(event) {
  const { scrollTop, offsetHeight, scrollHeight } = event.target;
  if (scrollTop === 0) {
    const lastMessage = conversationStore.GetLastMessage(props.conversationId);
    LoadNewerMessages(lastMessage.messageId);
  } else if (scrollHeight - (-scrollTop + offsetHeight) <= 2) {
    const firstMessage = conversationStore.GetFirstMessage(props.conversationId);
    LoadOlderMessages(firstMessage.messageId);
  }
  conversationStore.SetScrollPosition(props.conversationId, scrollTop);
}

function OnMessageMountChange(message, eventType) {
  if (
    eventType === 1 &&
    conversationStore
      .GetConversationById(props.conversationId)
      .newUnseenMessages.includes(message.messageId)
  ) {
    conversationStore.RemoveNewUnseenMessage(props.conversationId, message.messageId);
  }

  if (IsLoadingCompleted(waitingMessagesAbove, message)) {
    HandleNewAboveMessages();
    return;
  } else if (IsLoadingCompleted(waitingMessagesBelow, message)) {
    HandleNewBelowMessages();
    return;
  } else if (IsLoadingCompleted(waitingMessagesJump.messages, message)) {
    HandleNewJumpMessages();
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
    // if (conversationStore.GetVisibleMessages(props.conversationId).length >= 100) {
    //   conversationStore.RemoveNewerMessages(props.conversationId, 25);
    //   conversationStore.GetConversationById(props.conversationId).viewingOlderMessages = true;
    // }
  } else {
    ScrollToSavedLocation();
    chatIsLoading.value = false;
  }
}

function HandleNewBelowMessages() {
  if (!messageListContainer.value) return;
  let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
  if (!chatIsLoading.value) {
    messageListContainer.value.scrollTop += dif;

    // if (conversationStore.GetVisibleMessages(props.conversationId).length >= 100) {
    //   conversationStore.RemoveOlderMessages(props.conversationId, 25);
    // }
  } else {
    ScrollToSavedLocation();
    chatIsLoading.value = false;
  }
}

function HandleNewJumpMessages() {
  if (!messageListContainer.value) return;
  if (!waitingMessagesJump.focus) {
    messageListContainer.value.scrollTop = 0;

    conversationStore.GetConversationById(props.conversationId).viewingOlderMessages = false;
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
    !message.meta.edited &&
    !userStore.GetMessageById(message.meta.reply?.messageId) &&
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
      <ul class="p-4" id="message-list" ref="messageListDom">
        <transition-group name="message-list">
          <message-list-item
            class="hover:bg-gray-400"
            tag="li"
            :key="message.messageId"
            :data-msg-id="message.messageId"
            :data-msg-list-index="index"
            :data-msg-sender-id="message.senderId"
            v-for="(message, index) in conversationStore.GetVisibleMessages(props.conversationId)"
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
