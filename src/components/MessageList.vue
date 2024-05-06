<script setup>
import { useUserStore } from "@/stores/user.js";
import { defineAsyncComponent, onMounted, ref, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { useConversationStore } from "@/stores/conversation.js";
import { useSendingMessageStore } from "@/stores/sendingMessage.js";

//TODO add message jumping state
//TODO add switching between jumping or original lists

const route = useRoute();

const MessageListItem = defineAsyncComponent(
  () => import("@/components/MessageListItem.vue"),
);

const props = defineProps(["convoId"]);

const userStore = useUserStore();
const conversationStore = useConversationStore();
const sendingMessageStore = useSendingMessageStore();

const messageListContainer = ref(null);
const messageListDom = ref(null);
const oldScrollHeight = ref(0);
const oldScrollWidth = ref(0);
const chatIsLoading = ref(true);

const observer = new MutationObserver(function (mutationList, observer) {
  for (const mutation of mutationList) {
    if (mutation.type === "childList") {
      // let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
      // if (oldScrollHeight.value !== 0) {
      //   if (
      //     dif !== 0 &&
      //     sendingMessageStore.sendingMessage !==
      //       mutation.addedNodes[0]?.dataset.msgId
      //   ) {
      //     if (!loadingChat.value) {
      //       messageListContainer.value.scrollTop -= dif;
      //     } else {
      //       messageListContainer.value.scrollTop =
      //         conversationStore.GetScrollPosition(props.convoId);
      //       loadingChat.value = false;
      //     }
      //   }
      // }
      // oldScrollHeight.value = messageListContainer.value.scrollHeight;
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

function ScrollToSavedLocation() {
  // let msgList = document.querySelector("#list-container");
  // if (msgList)
  //   msgList.scroll({
  //     top: 0,
  //   });

  if (messageListContainer.value) {
    console.log("scrolling");
    console.log(
      ` scrollposition: ${conversationStore.GetScrollPosition(props.convoId)}`,
    );
    console.log(`scrollheight: ${messageListContainer.value.scrollHeight}`);
    // messageListContainer.value.scrollTop = conversationStore.GetScrollPosition(
    //   props.convoId,
    // );
    messageListContainer.value.scrollTo(
      0,
      Math.min(
        Math.max(conversationStore.GetScrollPosition(props.convoId), 0),
        messageListContainer.value.scrollHeight,
      ),
    );
    console.log(`scrollTop: ${messageListContainer.value.scrollTop}`);
  }
}

function LoadFirstMessages() {
  if (conversationStore.GetVisibleMessages(props.convoId).length === 0) {
    conversationStore.AddMessages(
      props.convoId,
      userStore.GetOlderMessages(props.convoId, null),
    );
  }
}

function LoadOlderMessages() {
  const lastMessage = conversationStore.GetFirstMessage(props.convoId);
  console.log(lastMessage);
  conversationStore.AddMessages(
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

  conversationStore.SetScrollPosition(props.convoId, scrollTop);
}

watch(
  () => route.params.id,
  () => {
    LoadFirstMessages();
    ScrollToSavedLocation();
    chatIsLoading.value = true;
  },
  { immediate: true },
);

function OnHeightUpdate() {
  if (!messageListContainer.value) return;
  if (sendingMessageStore.sendingMessage) {
    messageListDom.value.lastElementChild.scrollIntoView({
      behavior: "smooth",
    });
    sendingMessageStore.sendingMessage = null;
    return;
  }
  let dif = oldScrollHeight.value - messageListContainer.value.scrollHeight;
  let difWidth = oldScrollWidth.value - messageListContainer.value.scrollWidth;
  if (oldScrollHeight.value !== 0) {
    if (dif !== 0 && difWidth === 0) {
      if (!chatIsLoading.value) {
        messageListContainer.value.scrollTop -= dif;
      } else {
        ScrollToSavedLocation();
        chatIsLoading.value = false;
      }
    }
  }
  oldScrollHeight.value = messageListContainer.value.scrollHeight;
  oldScrollWidth.value = messageListContainer.value.scrollWidth;
}

onMounted(() => {
  let resizeObserver = new ResizeObserver(OnHeightUpdate);
  resizeObserver.observe(messageListDom.value);
  observer.observe(messageListDom.value, {
    childList: true,
  });
});
</script>

<template>
  <div class="flex flex-col flex-nowrap h-full">
    <div
      class="flex flex-col grow h-16 overflow-auto"
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
          v-for="(message, index) in conversationStore
            .GetVisibleMessages(props.convoId)
            .toSorted((a, b) => a.timeSend - b.timeSend)"
          :message="message"
          @scroll-reply="ScrollToMessage"
        />
      </ul>
    </div>
  </div>
</template>
