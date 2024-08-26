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
const conversationNameBox = ref();
const searchQuery = ref('');
const newConversationName = ref('');
const friendsAddedToConversation = ref([]);
const currentParticipants = ref([]);
const participantsToRemove = ref([]);
const participantsToAdd = ref([]);

const _isLoading = ref(false);

const modalName = 'editConversation';

const addingFriends = ref(false);

modalStore.RegisterModal(modalName);

watch(
  () => modalStore.GetModalShowStatus(modalName),
  (status) => {
    if (status) {
      const conversation = modalStore.GetModalArguments(modalName).conversation;
      const participants = conversation.participants.filter((u) => u !== serverStore.user.userId);
      searchQuery.value = '';
      newConversationName.value = conversation.conversationName;
      currentParticipants.value = participants;
      friendsAddedToConversation.value = participants;
      participantsToAdd.value = [];
      participantsToRemove.value = [];
      addingFriends.value = false;
    } else {
      searchQuery.value = '';
      newConversationName.value = '';
      currentParticipants.value = [];
      friendsAddedToConversation.value = [];
      participantsToAdd.value = [];
      participantsToRemove.value = [];
      addingFriends.value = false;
    }
  },
);

function AddFriendToConversation(userId) {
  //friendsAddedToConversation.value.push(userId);
  if (participantsToRemove.value.find((newFriendId) => newFriendId === userId)) {
    participantsToRemove.value = participantsToRemove.value.filter(
      (newFriendId) => newFriendId !== userId,
    );
  } else {
    participantsToAdd.value.push(userId);
  }
}

function RemoveFriendFromConversation(userId) {
  /*friendsAddedToConversation.value = friendsAddedToConversation.value.filter(
    (newFriendId) => newFriendId !== userId,
  );*/
  if (participantsToRemove.value.find((newFriendId) => newFriendId === userId)) {
    participantsToRemove.value = participantsToRemove.value.filter(
      (newFriendId) => newFriendId !== userId,
    );
  } else {
    if (participantsToAdd.value.find((newFriendId) => newFriendId === userId)) {
      participantsToAdd.value = participantsToAdd.value.filter(
        (newFriendId) => newFriendId !== userId,
      );
    } else {
      participantsToRemove.value.push(userId);
    }
  }
}

async function SaveChanges() {
  _isLoading.value = true;
  const conversation = modalStore.GetModalArguments(modalName).conversation;
  const request = {};
  if (newConversationName.value !== conversation.conversationName) {
    request.conversationName = newConversationName.value;
  }
  if (participantsToAdd.value.length > 0) {
    request.participantsToAdd = participantsToAdd.value;
  }
  if (participantsToRemove.value.length > 0) {
    request.participantsToRemove = participantsToRemove.value;
  }
  const response = await serverStore.UpdateConversationAsync(conversation.conversationId, request);
  if (response) {
    modalStore.CloseModal(modalName);
  }
  _isLoading.value = false;
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
            h-[34rem] max-h-full md:mx-4"
          @click.stop>
          <button
            @click="modalStore.CloseModal(modalName)"
            class="absolute top-0 right-2 hover:text-gray-500">
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
          <label for="conversationNameBox" class="">Name for conversation:</label>
          <input
            type="text"
            ref="conversationNameBox"
            id="conversationNameBox"
            placeholder="Conversation Name"
            v-model="newConversationName"
            class="border-2 bg-gray-500 border-gray-700 mb-4 flex-none" />
          <label for="inputBox" class="">Search for friend to add:</label>
          <div class="flex items-center min-w-0 gap-2">
            <button
              class="border border-green-500 hover:bg-green-500 text-white w-24 flex-none py-1"
              :class="{ 'bg-green-600': addingFriends }"
              @click="addingFriends = !addingFriends">
              {{ addingFriends ? 'Done' : 'Add new' }}
            </button>
            <input
              type="text"
              ref="inputBox"
              id="inputBox"
              v-model="searchQuery"
              placeholder="friend name"
              class="border-2 bg-gray-500 grow min-w-0 border-gray-700" />
          </div>
          <div class="flex-none border-b-2 border-gray-700 my-4" />

          <ul class="relative grow min-h-0 min-w-0 overflow-y-scroll">
            <default-list-animation>
              <li
                v-for="user in !addingFriends
                  ? [...currentParticipants, ...participantsToAdd].map((userId) =>
                      userStore.GetUserById(userId),
                    )
                  : userStore
                      .GetFriendList()
                      .filter(
                        (friend) =>
                          friend.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
                          !currentParticipants.find((newFriendId) => newFriendId === friend.userId),
                      )"
                :key="user.userId"
                class="w-full">
                <FriendListUserItem
                  :user
                  :class="{
                    '!bg-red-500/40': participantsToRemove.find(
                      (newFriendId) => newFriendId === user.userId,
                    ),
                    '!bg-green-500/40': participantsToAdd.find(
                      (newFriendId) => newFriendId === user.userId,
                    ),
                  }">
                  <div
                    class="ml-auto text-black"
                    v-if="
                      !currentParticipants.find((newFriendId) => newFriendId === user.userId) &&
                      !(
                        participantsToRemove.find((newFriendId) => newFriendId === user.userId) ||
                        participantsToAdd.find((newFriendId) => newFriendId === user.userId)
                      )
                    ">
                    <friend-list-item-button
                      class="hover:text-green-500"
                      @click="AddFriendToConversation(user.userId)">
                      <i class="fa-solid fa-plus" />
                    </friend-list-item-button>
                  </div>
                  <div v-else class="ml-auto text-black">
                    <friend-list-item-button
                      class="hover:text-red-700"
                      @click="RemoveFriendFromConversation(user.userId)">
                      <i class="fa-solid fa-xmark" />
                    </friend-list-item-button>
                  </div>
                </FriendListUserItem>
              </li>
            </default-list-animation>
          </ul>
          <div class="mt-2 flex flex-none gap-2">
            <button
              class="bg-green-500 hover:bg-green-400 text-white px-4 py-2 disabled:bg-green-300"
              @click="SaveChanges"
              :disabled="
                (newConversationName ===
                  modalStore.GetModalArguments(modalName).conversation.conversationName &&
                  participantsToAdd.length === 0 &&
                  participantsToRemove.length === 0) ||
                _isLoading
              ">
              Save
            </button>
            <button
              class="border border-red-700 hover:bg-red-700 text-white px-4 py-2"
              @click="modalStore.CloseModal(modalName)">
              Cancel
            </button>
          </div>
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
