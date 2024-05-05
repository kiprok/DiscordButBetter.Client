<script setup>
import ChatTopBar from "@/components/ChatTopBar.vue";
import { useUserStore } from "@/stores/user.js";
import SimpleButton from "@/components/SimpleButton.vue";
import { ref } from "vue";
import {
  GenerateUser,
  GenerateConversation,
  GenerateConversationMessages,
} from "@/composables/mock/MockDataGeneration.js";
import { useConversationStore } from "@/stores/conversation.js";

document.title = "Friends";

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
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar class="flex-none">
      <h1 class="text-white text-3xl font-bold block">Friends</h1>
      <button
        @click="sidePanelView = !sidePanelView"
        class="block text-white ml-auto text-lg hover:text-gray-200 lg:hidden"
      >
        <i class="fa-solid fa-circle-info"></i>
      </button>
    </ChatTopBar>
    <div class="flex size-full">
      <div
        class="bg-gray-300 size-full px-8 pt-8 overflow-auto lg:block"
        :class="{ hidden: sidePanelView }"
      >
        <div>
          <span v-if="userStore.friends.length > 0">
            {{ userStore.friends.length }} friends
          </span>
          <span v-else> no friends </span>
        </div>
        <div class="w-full bg-gray-400 flex flex-col gap-2">
          <div
            v-for="(friend, index) in userStore.GetFriendList()"
            :key="index"
            class="flex items-center hover:bg-gray-600/30"
          >
            <div class="inline-block mr-2">
              <img
                :src="friend.profilePicture"
                :alt="friend.userName"
                class="rounded-full"
              />
            </div>
            <span>
              {{ friend.userName }}
            </span>
          </div>
        </div>
      </div>
      <div
        class="flex-none w-full lg:flex lg:w-[22rem] bg-gray-600"
        :class="{ hidden: !sidePanelView, flex: sidePanelView }"
      >
        <div>
          <simple-button :disabled="_addingFriend" @click="GenFriend"
            >add friend</simple-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
