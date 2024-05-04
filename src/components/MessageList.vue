<script setup>
import { useUserStore } from "@/stores/user.js";
import { defineAsyncComponent, onMounted, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useMessageListStore } from "@/stores/messageList.js";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";

//TODO add message jumping state
//TODO add switching between jumping or original lists

const route = useRoute();

const MessageListItem = defineAsyncComponent(
  () => import("@/components/MessageListItem.vue"),
);

const props = defineProps(["convoId"]);

const userStore = useUserStore();
const messageListStore = useMessageListStore();
const sendingMessageStore = useSendingMessageStore();

const messageListContainer = ref(null);
const messageListDom = ref(null);
const oldScrollHeight = ref(0);
const loadingChat = ref(true);

const observer = new MutationObserver(function (mutationList, observer) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
      if (oldScrollHeight.value !== 0) {
        if (
          dif !== 0 &&
          sendingMessageStore.sendingMessage !==
            mutation.addedNodes[0]?.dataset.msgId
        ) {
          if (!loadingChat.value) {
            messageListContainer.value.scrollTop -= dif;
          } else {
            messageListContainer.value.scrollTop =
              messageListStore.GetScrollPosition(props.convoId);
            loadingChat.value = false;
          }
        }
      }
      oldScrollHeight.value = messageListContainer.value.scrollHeight;
    }
  }
});

function ScrollToMessage(messageId) {
  let msgElement = document.querySelector(
    `#message-list [data-msg-id="${messageId}"]`,
  );
  if (!msgElement) return;

  msgElement.scrollIntoView({
    block: "center",
    behavior: "smooth",
  });
}

function ScrollChatToBottomLocation() {
  // let msgList = document.querySelector("#list-container");
  // if (msgList)
  //   msgList.scroll({
  //     top: 0,
  //   });

  if (messageListContainer.value)
    messageListContainer.value.scrollTop = messageListStore.GetScrollPosition(
      props.convoId,
    );
}

function LoadFirstMessages() {
  if (messageListStore.GetVisibleMessages(props.convoId).length === 0) {
    messageListStore.AddMessages(
      props.convoId,
      userStore.GetOlderMessages(props.convoId, null),
    );
  }
}

function LoadOlderMessages() {
  const lastMessage = messageListStore.GetFirstMessage(props.convoId);
  console.log(lastMessage);
  messageListStore.AddMessages(
    props.convoId,
    userStore.GetOlderMessages(props.convoId, lastMessage.messageId),
  );
}

function OnScrolling(event) {
  const { scrollTop, offsetHeight, scrollHeight } = event.target;
  if (scrollTop - offsetHeight <= -scrollHeight) {
    LoadOlderMessages();
  } else if (scrollTop === 0) {
    console.log("bottom");
  }

  messageListStore.SetScrollPosition(props.convoId, scrollTop);
}

watch(
  () => route.params.id,
  () => {
    loadingChat.value = true;
    LoadFirstMessages();
    ScrollChatToBottomLocation();
  },
  { immediate: true },
);

onMounted(() => {
  observer.observe(messageListDom.value, {
    childList: true,
  });
});
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
          :key="index"
          :data-msg-id="message.messageId"
          :data-msg-list-index="index"
          :data-msg-sender-id="message.senderId"
          :index="index"
          v-for="(message, index) in messageListStore
            .GetVisibleMessages(props.convoId)
            .toSorted((a, b) => a.timeSend - b.timeSend)"
          :message="message"
          @scroll-reply="ScrollToMessage"
        />
      </ul>
    </div>
  </div>
</template>
