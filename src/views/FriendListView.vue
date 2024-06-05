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
import FriendListFriendItem from '@/components/FriendListFriendItem.vue';
import FriendListRequestItem from '@/components/FriendListRequestItem.vue';

document.title = 'Friends';

const userStore = useUserStore();
const conversationStore = useConversationStore();

const sortMethodSelected = ref(1);

const _addingFriend = ref(false);

const sidePanelView = ref(false);

const sortingMethods = {
  1: {
    type: 'friendList',
    data: () => userStore.GetFriendList().filter((friend) => friend.status > 0),
  },
  2: { type: 'friendList', data: () => userStore.GetFriendList() },
  3: {
    type: 'friendList',
    data: () => userStore.GetFriendList().filter((friend) => friend.status === 0),
  },
  4: {
    type: 'requestList',
    data: () => userStore.GetFriendRequests(),
  },
};

async function GenFriend() {
  _addingFriend.value = true;
  let userId = await GenerateUser();
  userStore.friendRequests.push(userId);
  //userStore.AddFriend(userId);
  //let user = userStore.GetUserById(userId);
  // let newConvo = await GenerateConversation(
  //   user.userName,
  //   user.profilePicture,
  //   userStore.myId,
  //   userId,
  // );
  //conversationStore.conversations[newConvo.convoId] = newConvo;
  //await GenerateConversationMessages(newConvo.convoId, userId, 1000);

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
        <div class="flex flex-row min-w-0 mb-1">
          <div class="min-w-0">
            <span v-if="userStore.friends.length > 0">
              {{ userStore.friends.length }} friends
            </span>
            <span v-else> no friends </span>
          </div>
          <div class="min-w-0 ml-auto flex flex-row gap-1">
            <input
              type="radio"
              id="sortOnline"
              value="1"
              class="hidden peer/online"
              v-model="sortMethodSelected" />
            <label
              for="sortOnline"
              class="text-sm flex items-center bg-blue-300 p-1 rounded-md border border-blue-900 hover:bg-blue-400
                peer-checked/online:bg-blue-500 select-none">
              <span class="hidden sm:block">online</span>
              <span class="sm:hidden">on</span>
            </label>
            <input
              type="radio"
              id="sortAll"
              value="2"
              class="hidden peer/all"
              v-model="sortMethodSelected" />
            <label
              for="sortAll"
              class="text-sm flex items-center bg-blue-300 p-1 rounded-md border border-blue-900 hover:bg-blue-400
                peer-checked/all:bg-blue-500 select-none">
              all
            </label>
            <input
              type="radio"
              id="sortOffline"
              value="3"
              class="hidden peer/offline"
              v-model="sortMethodSelected" />
            <label
              for="sortOffline"
              class="text-sm flex items-center bg-blue-300 p-1 rounded-md border border-blue-900 hover:bg-blue-400
                peer-checked/offline:bg-blue-500 select-none">
              <span class="hidden sm:block">offline</span>
              <span class="sm:hidden">off</span>
            </label>
            <input
              type="radio"
              id="sortPending"
              value="4"
              class="hidden peer/pending"
              v-model="sortMethodSelected" />
            <label
              for="sortPending"
              class="text-sm flex items-center bg-blue-300 p-1 rounded-md border border-blue-900 hover:bg-blue-400
                peer-checked/pending:bg-blue-500 select-none">
              <span class="hidden sm:block">pending</span>
              <span class="sm:hidden">pend</span>
            </label>
          </div>
        </div>

        <div class="flex grow min-w-0 min-h-0 pb-4 flex-col">
          <div
            v-for="(listItem, index) in sortingMethods[sortMethodSelected].data()"
            :key="index"
            class="border-t-2 py-1 border-gray-400 min-w-0">
            <friend-list-friend-item
              v-if="sortingMethods[sortMethodSelected].type === 'friendList'"
              :friend="listItem" />
            <friend-list-request-item
              v-else-if="sortingMethods[sortMethodSelected].type === 'requestList'"
              :request="listItem" />
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
