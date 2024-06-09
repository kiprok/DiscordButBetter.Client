<script setup>
import PaginationButtons from '@/components/PaginationButtons.vue';
import MessageListItem from '@/components/MessageListItem.vue';
import { useSearchStore } from '@/stores/search.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useUserStore } from '@/stores/user.js';
import UserProfilePicture from '@/components/UserProfilePicture.vue';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();

const props = defineProps(['convoId']);
</script>

<template>
  <div
    class="overflow-hidden w-full bg-gray-600"
    :class="{
      'lg:w-[18rem]': !searchStore.GetShowingStatus(convoId),
      'lg:w-[26rem]': searchStore.GetShowingStatus(convoId),
    }">
    <div
      class="size-full pt-4 px-4 pb-[0.37rem] text-white"
      :class="{ hidden: !searchStore.GetShowingStatus(convoId) }">
      <div class="flex size-full flex-col">
        <div class="flex">
          <span class="h-fit flex-none text-lg font-bold">
            search results:
            {{ searchStore.GetTotalSearchResults(convoId) }} found
          </span>
          <div class="ml-auto flex-none">
            <button
              @click="
                () => {
                  searchStore.GetSearchDataById(convoId).searchIsShowing = false;
                  searchStore.GetSearchDataById(convoId).searchQuery = '';
                }
              "
              class="text-lg text-white hover:text-gray-300">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="flex-grow overflow-auto">
          <ul class="flex grow min-w-0 flex-col p-2">
            <li
              v-for="result in searchStore.GetSearchResults(convoId)"
              key="result.messageId"
              class="group/item relative mt-2 flex flex-col rounded-md bg-black/20 p-3 transition-colors ease-in-out
                hover:cursor-pointer hover:bg-black/10"
              @click="
                () => {
                  conversationStore.TriggerJumpToMessage(convoId, result.messageId);
                }
              ">
              <message-list-item
                :message="result"
                :convoId="convoId"
                :key="result.messageId"
                :allowed-functions="{ allowReply: true }" />
            </li>
          </ul>
        </div>
        <pagination-buttons
          class="h-12 mt-auto"
          :first-page-boundary="searchStore.GetFirstPageBoundary(convoId)"
          :last-page-boundary="searchStore.GetLastPageBoundary(convoId)"
          :last-page-number="searchStore.GetLastPageNumber(convoId)"
          :current-place="searchStore.GetSearchPagePlace(convoId)"
          @set-search-page-place="
            (place) => {
              searchStore.SetSearchPagePlace(convoId, place);
            }
          " />
      </div>
    </div>
    <div class="size-full" :class="{ hidden: searchStore.GetShowingStatus(convoId) }">
      <div
        class="pt-4 px-4 pb-[0.37rem]"
        v-if="conversationStore.GetConversationById(convoId)?.convoType !== 0">
        <span class="p-2 font-bold text-white">Members</span>
        <ul class="flex flex-col overflow-auto">
          <li
            v-for="participant in conversationStore.GetConversationById(convoId)?.participants"
            :key="participant"
            class="rounded-lg p-2 text-xl text-white transition-colors ease-in-out hover:bg-black/30">
            <div class="flex flex-row flex-nowrap items-center gap-2">
              <img
                :src="userStore.GetUserById(participant).profilePicture"
                alt="pfp"
                class="size-10 flex-none rounded-full" />
              <span> {{ userStore.GetUserById(participant).userName }} </span>
            </div>
          </li>
        </ul>
      </div>
      <div
        class="size-full flex flex-col"
        v-else-if="conversationStore.GetConversationById(convoId).convoType === 0">
        <div class="relative flex-none w-full min-h-28 bg-blue-200">
          <user-profile-picture
            :user="
              userStore.GetUserById(
                conversationStore
                  .GetConversationById(convoId)
                  ?.participants.find((x) => x !== userStore.myId),
              )
            "
            class="size-16 ml-4 absolute -bottom-4 left-0 rounded-full border-4 border-gray-700" />
        </div>
        <div class="overflow-y-auto mt-6 mx-2 p-2 text-white rounded-lg bg-gray-800">
          <h2 class="font-bold text-lg">
            {{
              userStore.GetUserById(
                conversationStore
                  .GetConversationById(convoId)
                  ?.participants.find((x) => x !== userStore.myId),
              )?.userName
            }}
          </h2>
          <span class="text-xs">{{
            userStore.GetUserById(
              conversationStore
                .GetConversationById(convoId)
                ?.participants.find((x) => x !== userStore.myId),
            )?.statusMessage
          }}</span>
          <div class="w-full h-0.5 bg-gray-700 my-2" />
          <h3 class="font-bold text-sm uppercase">about me</h3>
          <span class="whitespace-pre-wrap text-sm">
            {{
              userStore.GetUserById(
                conversationStore
                  .GetConversationById(convoId)
                  ?.participants.find((x) => x !== userStore.myId),
              )?.biography
            }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
