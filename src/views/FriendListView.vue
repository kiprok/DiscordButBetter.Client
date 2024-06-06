<script setup>
import ChatTopBar from '@/components/ChatTopBar.vue';
import { useUserStore } from '@/stores/user.js';
import SimpleButton from '@/components/SimpleButton.vue';
import { ref } from 'vue';
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

document.title = 'Friends';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const router = useRouter();

const sortMethodSelected = ref('online');

const _addingFriend = ref(false);

const sidePanelView = ref(false);

const sortingMethods = {
  online: () => userStore.GetFriendList().filter((friend) => friend.status > 0),
  all: () => userStore.GetFriendList(),
  offline: () => userStore.GetFriendList().filter((friend) => friend.status === 0),
  pending: () => userStore.GetFriendRequests(),
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
      conversationStore.AddVisibleConversation(newConvo.convoId);
      await router.push({ name: 'chat', params: { id: newConvo.convoId } });
    }
  }
}

async function GenFriend() {
  _addingFriend.value = true;
  let userId = await GenerateUser();
  userStore.friendRequests.push(userId);

  _addingFriend.value = false;
}
</script>

<template>
  <div class="flex w-full flex-col flex-nowrap">
    <ChatTopBar>
      <chat-left-side-menu-button />
      <h1 class="block text-3xl font-bold text-white">Friends</h1>
      <button
        @click="sidePanelView = !sidePanelView"
        class="ml-auto block text-lg text-white hover:text-gray-200 lg:hidden">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </ChatTopBar>
    <div class="flex grow min-h-0 min-w-0">
      <div
        class="size-full overflow-auto bg-gray-300 px-4 sm:px-8 pt-8 lg:block"
        :class="{ hidden: sidePanelView }">
        <div class="flex flex-row min-w-0 mb-1 capitalize">
          <div class="min-w-0">
            <span v-if="sortingMethods[sortMethodSelected]().length > 0">
              {{ sortingMethods[sortMethodSelected]().length }}
            </span>
            <span v-else>no</span>
            <span v-if="sortMethodSelected !== 'all'">&nbsp;{{ sortMethodSelected }}</span>
            <span v-if="sortMethodSelected === 'all'">&nbsp;friends</span>
          </div>
          <div class="min-w-0 ml-auto flex flex-row">
            <friend-sort-button radioValue="online" v-model="sortMethodSelected">
              <span>online</span>
            </friend-sort-button>
            <friend-sort-button radioValue="all" v-model="sortMethodSelected">
              <span>all</span>
            </friend-sort-button>
            <friend-sort-button radioValue="offline" v-model="sortMethodSelected">
              <span>offline</span>
            </friend-sort-button>
            <friend-sort-button class="relative" radioValue="pending" v-model="sortMethodSelected">
              <span>pending</span>
              <notification-badge
                class="-top-2 -right-2 absolute text-[10px] size-4"
                :notifications="userStore.friendRequests.length" />
            </friend-sort-button>
          </div>
        </div>
        <div class="flex grow min-w-0 min-h-0 pb-4 flex-col">
          <div
            v-for="(listItem, index) in sortingMethods[sortMethodSelected]()"
            :key="index"
            class="border-t-2 py-1 border-gray-400 min-w-0">
            <friend-list-user-item :user="listItem">
              <div
                v-if="['online', 'all', 'offline'].includes(sortMethodSelected)"
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
        </div>
      </div>
      <div
        class="w-full flex-none bg-gray-600 lg:flex lg:w-[22rem]"
        :class="{ hidden: !sidePanelView, flex: sidePanelView }">
        <div>
          <simple-button :disabled="_addingFriend" @click="GenFriend">add friend</simple-button>
        </div>
      </div>
    </div>
  </div>
</template>
