<script setup>
import ChatTopBar from "@/components/ChatTopBar.vue";
import {useUserStore} from "@/stores/user.js";
import SimpleButton from "@/components/SimpleButton.vue";
import {reactive, ref} from "vue";

const userStore = useUserStore();

const friends = reactive(userStore.users);
const _addingFriend = ref(false);

async function getFriends() {

  _addingFriend.value = true;
  let getUserResponse = await fetch("https://randomuser.me/api/");
  let newUser = await getUserResponse.json();
  let name = `${newUser.results[0].name.first} ${newUser.results[0].name.last}`;
  let picture = newUser.results[0].picture.thumbnail;
  let newUID = userStore.AddUser(name, picture);

  userStore.AddFriend(newUID);

  let newConvoId = crypto.randomUUID();

  userStore.conversations[newConvoId] = {
    convoId: newConvoId,
    convoName: name,
    convoType: 0,
    convoPicture: picture,
    participants: [userStore.myId, newUID],
    messages: []
  };

  for (let i = 0; i < 100; i++) {
    userStore.SendMessage(newConvoId, {
      senderId: newUID,
      convoId: newConvoId,
      messageText: `person ${name} says random message ${i}`,
      timeSend: Date.now(),
      meta: {}
    });
  }

  //await new Promise((resolve) => setTimeout(resolve, 2000));
  _addingFriend.value = false;

}

</script>

<template>
  <div class="w-full flex flex-col flex-nowrap">
    <ChatTopBar>
      <h1 class="text-white text-3xl font-bold">
        Friends
      </h1>
    </ChatTopBar>
    <div>
      <span v-if="userStore.friends.length > 0">
        {{ userStore.friends.length }} friends
      </span>
      <span v-else>
        no friends
      </span>
      <simple-button :disabled="_addingFriend" @click="getFriends">add friend</simple-button>
    </div>
  </div>
</template>