<script setup>
import ChatTopBar from '@/components/ChatTopBar.vue';
import { useUserStore } from '@/stores/user.js';
import SimpleButton from '@/components/SimpleButton.vue';
import { computed, ref, watch } from 'vue';
import {
  GenerateUser,
  GenerateConversation,
  GenerateConversationMessages,
} from '@/composables/mock/MockDataGeneration.js';
import { useConversationStore } from '@/stores/conversation.js';
import ChatLeftSideMenuButton from '@/components/ChatLeftSideMenuButton.vue';
import FriendSortButton from '@/components/FriendSortButton.vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import FriendListItemButton from '@/components/FriendListItemButton.vue';
import NotificationBadge from '@/components/NotificationBadge.vue';
import { useRouter } from 'vue-router';
import AddFriendModal from '@/components/modals/AddFriendModal.vue';
import DefaultListAnimation from '@/components/animations/DefaultListAnimation.vue';
import PaginationAnimation from '@/components/animations/PaginationAnimation.vue';

document.title = 'Friends';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const router = useRouter();

const radioSortMethodSelected = ref('online');
const searchText = ref('');
const showAddFriendModal = ref(false);

const sortMethodSelected = computed(() => {
  if (searchText.value !== '') return 'search';
  return radioSortMethodSelected.value;
});

const _addingUsers = ref(false);
const _addingFriends = ref(false);
const _sendingRandomMessage = ref(false);

const sidePanelView = ref(false);

const sortingMethods = {
  online: () => userStore.GetFriendList().filter((friend) => friend.status > 0),
  all: () => userStore.GetFriendList(),
  offline: () => userStore.GetFriendList().filter((friend) => friend.status === 0),
  pending: () => userStore.GetFriendRequests(),
  search: () =>
    userStore
      .GetFriendList()
      .filter((friend) => friend.userName.toLowerCase().includes(searchText.value.toLowerCase())),
};

const sortMethodAliases = {
  online: 'Online',
  all: 'Friends',
  offline: 'Offline',
  pending: 'Pending',
  search: 'Found',
};

async function OpenConversation(userId) {
  let conversation = conversationStore
    .GetVisibleConversations()
    .find((convo) => convo.participants.includes(userId) && convo.convoType === 0);

  if (conversation) {
    router.push({ name: 'chat', params: { id: conversation.convoId } });
  } else {
    let conversationId = Object.keys(conversationStore.GetALLConversations()).find(
      (convoId) =>
        conversationStore.GetConversationById(convoId).participants.includes(userId) &&
        conversationStore.GetConversationById(convoId).convoType === 0,
    );
    if (conversationId) {
      conversationStore.AddVisibleConversation(conversationId);
      await router.push({ name: 'chat', params: { id: conversationId } });
    } else {
      let user = userStore.GetUserById(userId);
      let newConvo = await GenerateConversation(
        user.userName,
        user.profilePicture,
        userStore.myId,
        userId,
      );
      conversationStore.conversations[newConvo.convoId] = newConvo;
      await GenerateConversationMessages(newConvo.convoId, userId, 1000);
      conversationStore.UpdateLastMessageTime(newConvo.convoId, Date.now());
      conversationStore.AddVisibleConversation(newConvo.convoId);
      await router.push({ name: 'chat', params: { id: newConvo.convoId } });
    }
  }
}

async function GenUsers() {
  _addingUsers.value = true;

  for (let i = 0; i < 50; i++) {
    await GenerateUser();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  _addingUsers.value = false;
}

async function GenFriend() {
  _addingFriends.value = true;
  let userId = Object.values(userStore.users)[
    Math.floor(Math.random() * Object.keys(userStore.users).length)
  ]?.userId;

  if (
    userId &&
    userId !== userStore.myId &&
    !userStore.GetFriendList().find((user) => user.userId === userId) &&
    !userStore.GetFriendRequests().find((user) => user.userId === userId)
  ) {
    userStore.friendRequests.push(userId);
    await new Promise((resolve) => setTimeout(resolve, 100));
  } else {
    userId = await GenerateUser();
    console.log(userStore.users[userStore.myId]);
    console.log({
      ...userStore.users[userStore.myId],
    });
    userStore.AddFriend(userId);
  }
  _addingFriends.value = false;
}

async function GenRandomMessage() {
  _sendingRandomMessage.value = true;
  let conversation = Object.keys(conversationStore.GetALLConversations()).map((convoId) =>
    conversationStore.GetConversationById(convoId),
  )[Math.floor(Math.random() * Object.keys(conversationStore.GetALLConversations()).length)];
  if (!conversation) {
    _sendingRandomMessage.value = false;
    return;
  }
  let userid =
    conversation.participants[Math.floor(Math.random() * conversation.participants.length)];

  if (conversation) {
    let newMessageId = crypto.randomUUID();
    userStore.messages[newMessageId] = {
      messageId: newMessageId,
      senderId: userid,
      convoId: conversation.convoId,
      messageText: `A new Random Message`,
      timeSend: Date.now(),
      meta: {},
    };

    if (!conversationStore.GetVisibleConversations().includes(conversation.convoId)) {
      conversationStore.AddVisibleConversation(conversation.convoId);
    }

    if (!conversationStore.GetConversationById(conversation.convoId).viewingOlderMessages)
      conversationStore.AddMessage(conversation.convoId, userStore.messages[newMessageId]);
    conversationStore.UpdateLastMessageTime(conversation.convoId, Date.now());
    conversation.newUnseenMessages.push(newMessageId);
  }
  _sendingRandomMessage.value = false;
}
</script>

<template>
  <div class="flex w-full flex-col flex-nowrap">
    <ChatTopBar>
      <chat-left-side-menu-button />
      <h1 class="block text-3xl font-bold text-white">Friends</h1>
      <button
        @click="showAddFriendModal = true"
        class="flex text-lg px-1 text-white bg-green-600 hover:bg-green-700 items-center gap-1">
        <i class="fa-solid fa-user-large"></i>
        <span class="hidden sm:inline-block">Add Friend</span>
        <span class="sm:hidden">
          <i class="fa-solid fa-plus"></i>
        </span>
      </button>
      <AddFriendModal v-model="showAddFriendModal" />
      <button
        @click="sidePanelView = !sidePanelView"
        class="ml-auto block text-lg text-white hover:text-gray-200 lg:hidden">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </ChatTopBar>
    <div class="flex grow min-h-0 min-w-0">
      <div
        class="grow min-w-0 overflow-y-scroll bg-gray-300 px-4 sm:px-8 pt-8 lg:block"
        :class="{ hidden: sidePanelView }">
        <div class="size-full flex flex-col">
          <div class="w-full h-14 flex-none">
            <input
              type="text"
              name="friendSearch"
              id="friendSearch"
              class="w-full outline outline-2 pl-1"
              v-model="searchText"
              placeholder="Search Friends" />
          </div>
          <div class="flex flex-row min-w-0 mb-1">
            <span class="min-w-0">
              {{ sortingMethods[sortMethodSelected]().length }}
              {{ sortMethodAliases[sortMethodSelected] }}
            </span>
            <div class="min-w-0 ml-auto flex flex-row capitalize">
              <friend-sort-button radioValue="online" v-model="radioSortMethodSelected">
                <span>online</span>
              </friend-sort-button>
              <friend-sort-button radioValue="all" v-model="radioSortMethodSelected">
                <span>all</span>
              </friend-sort-button>
              <friend-sort-button radioValue="offline" v-model="radioSortMethodSelected">
                <span>offline</span>
              </friend-sort-button>
              <friend-sort-button
                class="relative"
                radioValue="pending"
                v-model="radioSortMethodSelected">
                <span>pending</span>
                <notification-badge
                  class="-top-2 -right-2 absolute text-[10px] size-4"
                  :notifications="userStore.friendRequests.length" />
              </friend-sort-button>
            </div>
          </div>
          <pagination-animation :page="Object.keys(sortingMethods).indexOf(sortMethodSelected)">
            <div :key="sortMethodSelected" class="relative grow w-full min-w-0 pb-4">
              <default-list-animation>
                <div
                  v-for="(listItem, index) in sortingMethods[sortMethodSelected]()"
                  :key="listItem.userId"
                  class="border-t-2 py-1 border-gray-400 min-w-0 w-full">
                  <friend-list-user-item :user="listItem">
                    <div
                      v-if="['online', 'all', 'offline', 'search'].includes(sortMethodSelected)"
                      class="ml-auto h-full flex flex-row gap-2">
                      <friend-list-item-button
                        @click="OpenConversation(listItem.userId)"
                        class="hover:text-white">
                        <i class="fa-solid fa-comment"></i>
                      </friend-list-item-button>
                      <friend-list-item-button
                        @click="userStore.RemoveFriend(listItem.userId)"
                        class="hover:text-red-500">
                        <i class="fa-solid fa-xmark"></i>
                      </friend-list-item-button>
                    </div>
                    <div
                      v-if="sortMethodSelected === 'pending'"
                      class="ml-auto h-full flex flex-row gap-2">
                      <friend-list-item-button
                        class="hover:text-green-500"
                        @click="userStore.AcceptFriendRequest(listItem.userId)">
                        <i class="fa-solid fa-check"></i>
                      </friend-list-item-button>
                      <friend-list-item-button
                        class="hover:text-red-500"
                        @click="userStore.RejectFriendRequest(listItem.userId)">
                        <i class="fa-solid fa-xmark"></i>
                      </friend-list-item-button>
                    </div>
                  </friend-list-user-item>
                </div>
              </default-list-animation>
            </div>
          </pagination-animation>
        </div>
      </div>
      <div
        class="w-full flex-none bg-gray-600 lg:flex lg:w-[22rem]"
        :class="{ hidden: !sidePanelView, flex: sidePanelView }">
        <div>
          <simple-button :disabled="_addingUsers" @click="GenUsers">add users</simple-button>
          <simple-button :disabled="_sendingRandomMessage" @click="GenRandomMessage">
            send a random message
          </simple-button>
          <simple-button :disabled="_addingFriends" @click="GenFriend">add friend</simple-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
