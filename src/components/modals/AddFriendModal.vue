<script setup>
import { nextTick, onMounted, ref, watch } from 'vue';
import FriendListUserItem from '@/components/FriendListUserItem.vue';
import { useUserStore } from '@/stores/user.js';
import FriendListItemButton from '@/components/FriendListItemButton.vue';
import DefaultListAnimation from '@/components/animations/DefaultListAnimation.vue';
import { useModalStore } from '@/stores/modalStore.js';
import { useServerStore } from '@/stores/server.js';

const userStore = useUserStore();
const serverStore = useServerStore();
const modalStore = useModalStore();

const inputBox = ref();
const searchQuery = ref('');

const modalName = 'addFriend';

const searchedUsers = ref([]);

modalStore.RegisterModal(modalName);

watch(
  () => modalStore.GetModalShowStatus(modalName),
  () => {
    nextTick(() => {
      searchQuery.value = '';
      if (modalStore.GetModalShowStatus(modalName)) {
        inputBox.value.focus();
      }
    });
  },
);

watch(searchQuery, async () => {
  if (searchQuery.value.length < 2) {
    searchedUsers.value = [];
    return;
  }
  searchedUsers.value = await serverStore.SearchUsersAsync(searchQuery.value);
  for (const user of searchedUsers.value) {
    userStore.users[user.userId] = user;
  }
});

async function SendFriendRequest(userId) {
  var request = await serverStore.SendFriendRequestAsync(userId);
  if (request) {
    //userStore.friendRequestsSend.add(request);
  }
}

async function AcceptFriendRequest(request) {
  console.log(request);
  //userStore.AcceptFriendRequest(request);

  const success = await serverStore.AcceptFriendRequestAsync(request.requestId, request.userId);
  if (success) {
    //userStore.AddFriend(userStore.GetUserById(request.userId));
  }
}

async function RejectFriendRequest(request) {
  userStore.RejectFriendRequest(request);
  await serverStore.DeclineFriendRequestAsync(request.requestId, request.userId);
}
</script>

<template>
  <teleport to="#modal">
    <transition name="show-modal">
      <div
        v-if="modalStore.GetModalShowStatus(modalName)"
        class="w-screen h-dvh bg-black/70 flex items-center justify-center overflow-hidden"
        @click="modalStore.CloseModal(modalName)">
        <div
          class="center relative text-white bg-gray-600 flex flex-col rounded-lg px-4 py-8 w-[40rem] min-h-0 min-w-0
            h-96 max-h-full md:mx-4"
          @click.stop>
          <button
            @click="modalStore.CloseModal(modalName)"
            class="absolute top-0 right-2 hover:text-gray-500">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          <input
            type="text"
            ref="inputBox"
            v-model="searchQuery"
            placeholder="search for someone to add"
            class="border-2 bg-gray-500 border-gray-700 flex-none" />
          <div class="flex-none border-b-2 border-gray-700 my-4" />
          <ul class="relative grow min-h-0 min-w-0 overflow-y-scroll">
            <default-list-animation>
              <li v-for="user in searchedUsers" :key="user.userId" class="w-full">
                <FriendListUserItem :user>
                  <div
                    class="ml-auto text-black"
                    v-if="
                      !userStore
                        .GetFriendRequests()
                        .find((otherUser) => otherUser.userId === user.userId) &&
                      !userStore
                        .GetFriendRequestsSend()
                        .find((otherUser) => otherUser.userId === user.userId) &&
                      !userStore
                        .GetFriendList()
                        .find((otherUser) => otherUser.userId === user.userId)
                    ">
                    <friend-list-item-button
                      class="hover:text-green-500"
                      @click="SendFriendRequest(user.userId)">
                      <i class="fa-solid fa-plus" />
                    </friend-list-item-button>
                  </div>

                  <div
                    v-else-if="
                      !userStore
                        .GetFriendRequestsSend()
                        .find((otherUser) => otherUser.userId === user.userId) &&
                      !userStore
                        .GetFriendList()
                        .find((otherUser) => otherUser.userId === user.userId)
                    "
                    class="ml-auto h-full flex flex-row gap-2 text-black">
                    <friend-list-item-button
                      class="hover:text-green-500"
                      @click="
                        AcceptFriendRequest(
                          userStore
                            .GetFriendRequests()
                            .find((otherUser) => otherUser.userId === user.userId),
                        )
                      ">
                      <i class="fa-solid fa-check"></i>
                    </friend-list-item-button>
                    <friend-list-item-button
                      class="hover:text-red-500"
                      @click="
                        RejectFriendRequest(
                          userStore
                            .GetFriendRequests()
                            .find((otherUser) => otherUser.userId === user.userId),
                        )
                      ">
                      <i class="fa-solid fa-xmark"></i>
                    </friend-list-item-button>
                  </div>
                </FriendListUserItem>
              </li>
            </default-list-animation>
          </ul>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped>
.show-modal-enter-active,
.show-modal-enter-active .center,
.show-modal-leave-active,
.show-modal-leave-active .center {
  transition: all 0.3s ease;
}

.show-modal-enter-from,
.show-modal-leave-to {
  opacity: 0;
}

.show-modal-enter-from .center,
.show-modal-leave-to .center {
  transform: scale(0.8);
}
</style>
