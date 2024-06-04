<script setup>
import PaginationButtons from '@/components/PaginationButtons.vue';
import MessageListItem from '@/components/MessageListItem.vue';
import { useSearchStore } from '@/stores/search.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useUserStore } from '@/stores/user.js';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();

const props = defineProps(['convoId']);
</script>

<template>
  <div
    class="pt-4 px-4 pb-[0.37rem] overflow-hidden bg-gray-600"
    :class="{
      'lg:w-[18rem]': !searchStore.GetShowingStatus(convoId),
      'lg:w-[26rem]': searchStore.GetShowingStatus(convoId),
    }">
    <div class="size-full text-white" :class="{ hidden: !searchStore.GetShowingStatus(convoId) }">
      <div class="flex size-full flex-col">
        <div class="flex">
          <span class="h-fit flex-none text-lg font-bold">
            search results:
            {{ searchStore.GetTotalSearchResults(convoId) }} found</span
          >
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
    <div :class="{ hidden: searchStore.GetShowingStatus(convoId) }">
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
  </div>
</template>
