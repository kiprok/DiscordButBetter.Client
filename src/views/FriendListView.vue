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

document.title = 'Friends';

const userStore = useUserStore();
const conversationStore = useConversationStore();

const _addingFriend = ref(false);

const sidePanelView = ref(false);

async function GenFriend() {
  _addingFriend.value = true;
  let userId = await GenerateUser();
  userStore.AddFriend(userId);
  let user = userStore.GetUserById(userId);
  let newConvo = await GenerateConversation(
    user.userName,
    user.profilePicture,
    userStore.myId,
    userId,
  );
  conversationStore.conversations[newConvo.convoId] = newConvo;
  await GenerateConversationMessages(newConvo.convoId, userId, 1000);

  _addingFriend.value = false;
}
</script>

<template>
  <div class="flex w-full flex-col flex-nowrap">
    <ChatTopBar class="flex-none">
      <chat-left-side-menu-button />
      <h1 class="block text-3xl font-bold text-white">Friends</h1>
      <button
        @click="sidePanelView = !sidePanelView"
        class="ml-auto block text-lg text-white hover:text-gray-200 lg:hidden">
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </ChatTopBar>
    <div class="flex size-full">
      <div
        class="size-full overflow-auto bg-gray-300 px-8 pt-8 lg:block"
        :class="{ hidden: sidePanelView }">
        <div>
          <span v-if="userStore.friends.length > 0">
            {{ userStore.friends.length }} friends
          </span>
          <span v-else> no friends </span>
        </div>
        <div class="flex w-full flex-col gap-2 bg-gray-400">
          <div
            v-for="(friend, index) in userStore.GetFriendList()"
            :key="index"
            class="flex items-center hover:bg-gray-600/30">
            <div class="mr-2 inline-block">
              <img
                :src="friend.profilePicture"
                :alt="friend.userName"
                class="rounded-full" />
            </div>
            <span>
              {{ friend.userName }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="w-full flex-none bg-gray-600 lg:flex lg:w-[22rem]"
        :class="{ hidden: !sidePanelView, flex: sidePanelView }">
        <div>
          <simple-button :disabled="_addingFriend" @click="GenFriend"
            >add friend</simple-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
