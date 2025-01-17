<script setup>
import ChatTopBar from '@/components/ChatTopBar.vue';
import { useUserStore } from '@/stores/user.js';
import { computed, ref } from 'vue';
import { useConversationStore } from '@/stores/conversation.js';
import ChatLeftSideMenuButton from '@/components/ChatLeftSideMenuButton.vue';
import FriendSortButton from '@/components/FriendSortButton.vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import FriendListItemButton from '@/components/FriendListItemButton.vue';
import NotificationBadge from '@/components/NotificationBadge.vue';
import { useRouter } from 'vue-router';
import DefaultListAnimation from '@/components/animations/DefaultListAnimation.vue';
import PaginationAnimation from '@/components/animations/PaginationAnimation.vue';
import { useModalStore } from '@/stores/modalStore.js';
import { useServerStore } from '@/stores/server.js';

document.title = 'Friends';

const userStore = useUserStore();
const serverStore = useServerStore();
const conversationStore = useConversationStore();
const modalStore = useModalStore();

const router = useRouter();

const radioSortMethodSelected = ref('online');
const searchText = ref('');

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
      .filter((friend) => friend.username.toLowerCase().includes(searchText.value.toLowerCase())),
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
    .find((convo) => convo.participants.includes(userId) && convo.conversationType === 0);

  if (conversation) {
    await router.push({ name: 'chat', params: { id: conversation.conversationId } });
  } else {
    let conversationId = Object.keys(conversationStore.GetALLConversations()).find(
      (id) =>
        conversationStore.GetConversationById(id)?.participants?.includes(userId) &&
        conversationStore.GetConversationById(id)?.conversationType === 0,
    );
    if (conversationId) {
      await serverStore.CreateConversationAsync('', 0, [userId]);
      conversationStore.AddVisibleConversation(conversationId);
      await router.push({ name: 'chat', params: { id: conversationId } });
    } else {
      let user = userStore.GetUserById(userId);
      let newConvo = await serverStore.CreateConversationAsync('', 0, [userId]);
      conversationStore.AddConversation(newConvo);
      conversationStore.UpdateLastMessageTime(newConvo.conversationId, Date.now());
      conversationStore.AddVisibleConversation(newConvo.conversationId);
      await router.push({ name: 'chat', params: { id: newConvo.conversationId } });
    }
  }
}

async function RemoveFriend(user) {
  //userStore.RemoveFriend(user.userId);
  await serverStore.DeleteFriendAsync(user.userId);
}

async function AcceptFriendRequest(request) {
  //userStore.AcceptFriendRequest(request);
  const success = await serverStore.AcceptFriendRequestAsync(request.requestId, request.userId);
  if (success) {
    //userStore.AddFriend(userStore.GetUserById(request.userId));
  }
}

async function RejectFriendRequest(request) {
  //userStore.RejectFriendRequest(request);
  console.log(request);
  await serverStore.DeclineFriendRequestAsync(request.requestId, request.userId);
}
</script>

<template>
  <div class="flex w-full flex-col flex-nowrap">
    <ChatTopBar>
      <chat-left-side-menu-button />
      <h1 class="block text-3xl font-bold text-white">Friends</h1>
      <button
        @click="modalStore.OpenModal('addFriend')"
        class="flex text-lg px-1 text-white bg-green-600 hover:bg-green-700 items-center gap-1">
        <i class="fa-solid fa-user-large"></i>
        <span class="hidden sm:inline-block">Add Friend</span>
        <span class="sm:hidden">
          <i class="fa-solid fa-plus"></i>
        </span>
      </button>
      <button
        @click="sidePanelView = !sidePanelView"
        class="ml-auto block text-lg text-white hover:text-gray-200 lg:hidden">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </ChatTopBar>
    <div class="relative flex grow min-h-0 min-w-0">
      <div class="grow min-w-0 overflow-y-scroll bg-gray-300 px-4 sm:px-8 pt-8 lg:block">
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
                  :notifications="userStore.friendRequestsReceived.size" />
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
                  <friend-list-user-item
                    :user="listItem"
                    @click="modalStore.OpenModal('userProfile', { user: listItem })"
                    class="hover:cursor-pointer">
                    <div
                      v-if="['online', 'all', 'offline', 'search'].includes(sortMethodSelected)"
                      class="ml-auto h-full flex flex-row gap-2">
                      <friend-list-item-button
                        @click.stop="OpenConversation(listItem.userId)"
                        class="hover:text-white">
                        <i class="fa-solid fa-comment"></i>
                      </friend-list-item-button>
                      <friend-list-item-button
                        @click.stop="RemoveFriend(listItem)"
                        class="hover:text-red-500">
                        <i class="fa-solid fa-xmark"></i>
                      </friend-list-item-button>
                    </div>
                    <div
                      v-if="sortMethodSelected === 'pending'"
                      class="ml-auto h-full flex flex-row gap-2">
                      <friend-list-item-button
                        class="hover:text-green-500"
                        @click.stop="AcceptFriendRequest(listItem)">
                        <i class="fa-solid fa-check"></i>
                      </friend-list-item-button>
                      <friend-list-item-button
                        class="hover:text-red-500"
                        @click.stop="RejectFriendRequest(listItem)">
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
        class="w-full h-full absolute transition-transform ease-out lg:static lg:transition-none lg:translate-x-0
          lg:flex-none bg-gray-600 lg:flex lg:w-[22rem]"
        :class="{ 'translate-x-full': !sidePanelView }">
        <div></div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
