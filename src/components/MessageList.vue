<script setup>
import { useUserStore } from "@/stores/user.js";
import { defineAsyncComponent, onMounted, reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { useConversationStore } from "@/stores/conversation.js";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";
import { IsLoadingCompleted } from "@/composables/utility.js";

const route = useRoute();

const MessageListItem = defineAsyncComponent(
  () => import("@/components/MessageListItem.vue"),
);

const props = defineProps(["convoId"]);
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

conversationStore.RegisterJumpCallback((messages, focus) => {
  if (!focus) {
    waitingMessagesJump.messages.push(...messages);
    waitingMessagesJump.focus = null;
  } else {
    waitingMessagesJump.messages.push(...messages);
    waitingMessagesJump.focus = focus;
  }
});

function ScrollToMessage(messageId) {
  let msgElement = document.querySelector(
    `#message-list [data-msg-id="${messageId}"]`,
  );
  if (!msgElement) {
    conversationStore.TriggerJumpToMessage(props.convoId, messageId);
    return;
  }

  msgElement.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
}

function ScrollToSavedLocation() {
  if (messageListContainer.value) {
    messageListContainer.value.scrollTo({
      top: conversationStore.GetScrollPosition(props.convoId),
      behavior: "instant",
    });
  }
}

function LoadFirstMessages() {
  if (conversationStore.GetVisibleMessages(props.convoId).length === 0) {
    LoadOlderMessages(null);
  } else {
    waitingMessagesAbove.push(
      ...conversationStore.GetVisibleMessages(props.convoId),
    );
  }
}

function LoadOlderMessages(startPointId) {
  if (waitingMessagesAbove.length > 0 && waitingMessagesBelow.length > 0)
    return;
  const newMessages = userStore.GetOlderMessages(
    props.convoId,
    startPointId,
    amountToLoad,
  );
  waitingMessagesAbove.push(...newMessages);

  conversationStore.AddMessages(props.convoId, newMessages);
  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;
}

function LoadNewerMessages(startPointId) {
  if (
    !conversationStore.GetConversationById(props.convoId).viewingOlderMessages
  )
    return;
  if (waitingMessagesAbove.length > 0 && waitingMessagesBelow.length > 0)
    return;

  const newMessages = userStore.GetNewerMessages(
    props.convoId,
    startPointId,
    amountToLoad,
  );

  if (newMessages.length < amountToLoad) {
    conversationStore.GetConversationById(props.convoId).viewingOlderMessages =
      false;
    return;
  }

  waitingMessagesBelow.push(...newMessages);

  conversationStore.AddMessages(props.convoId, newMessages);
  oldScrollHeight.value = messageListContainer.value?.scrollHeight ?? 0;
}

function OnScrolling(event) {
  const { scrollTop, offsetHeight, scrollHeight } = event.target;
  if (scrollTop === 0) {
    console.log("bottom");
    const lastMessage = conversationStore.GetLastMessage(props.convoId);
    LoadNewerMessages(lastMessage.messageId);
  } else if (scrollHeight - (-scrollTop + offsetHeight) <= 2) {
    console.log("top");
    const firstMessage = conversationStore.GetFirstMessage(props.convoId);
    LoadOlderMessages(firstMessage.messageId);
  }
  conversationStore.SetScrollPosition(props.convoId, scrollTop);
}

function OnMessageMountChange(message, eventType) {
  console.log(eventType);
  if (IsLoadingCompleted(waitingMessagesAbove, message)) {
    HandleNewAboveMesssages();
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
        behavior: "smooth",
      });
    }
  }
}

function HandleNewAboveMesssages() {
  if (!chatIsLoading.value) {
    if (conversationStore.GetVisibleMessages(props.convoId).length >= 100) {
      conversationStore.RemoveNewerMessages(props.convoId, 25);
      conversationStore.GetConversationById(
        props.convoId,
      ).viewingOlderMessages = true;
    }
  } else {
    ScrollToSavedLocation();
    chatIsLoading.value = false;
  }
}

function HandleNewBelowMessages() {
  let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
  if (!chatIsLoading.value) {
    messageListContainer.value.scrollTop += dif;

    if (conversationStore.GetVisibleMessages(props.convoId).length >= 100) {
      conversationStore.RemoveOlderMessages(props.convoId, 25);
    }
  } else {
    ScrollToSavedLocation();
    chatIsLoading.value = false;
  }
}

function HandleNewJumpMessages() {
  if (!waitingMessagesJump.focus) {
    messageListContainer.value.scrollTop = 0;

    conversationStore.GetConversationById(props.convoId).viewingOlderMessages =
      false;
  } else {
    const focusElement = document.querySelector(
      `#message-list [data-msg-id="${waitingMessagesJump.focus.messageId}"]`,
    );
    focusElement.scrollIntoView({
      behavior: "instant",
      block: "center",
    });

    waitingMessagesJump.focus = null;
  }
}
</script>

<template>
  <div class="flex flex-col flex-nowrap h-full">
    <div
      class="flex flex-col-reverse grow h-16 overflow-auto"
      id="list-container"
      @scroll="OnScrolling"
      ref="messageListContainer"
    >
      <ul class="flex flex-col p-4" id="message-list" ref="messageListDom">
        <message-list-item
          :key="message.messageId"
          :data-msg-id="message.messageId"
          :data-msg-list-index="index"
          :data-msg-sender-id="message.senderId"
          :index="index"
          v-for="(message, index) in conversationStore.GetVisibleMessages(
            props.convoId,
          )"
          :message="message"
          @scroll-reply="ScrollToMessage"
          @on-mount-change="OnMessageMountChange"
        />
      </ul>
    </div>
  </div>
</template>
