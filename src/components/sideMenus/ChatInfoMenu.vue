<script setup>
import PaginationButtons from '@/components/PaginationButtons.vue';
import MessageListItem from '@/components/MessageListItem.vue';
import { useSearchStore } from '@/stores/search.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useUserStore } from '@/stores/user.js';
import UserProfilePicture from '@/components/user/UserProfilePicture.vue';
import PaginationAnimation from '@/components/animations/PaginationAnimation.vue';
import UserProfile from '@/components/user/UserProfile.vue';
import { useServerStore } from '@/stores/server.js';

const userStore = useUserStore();
const conversationStore = useConversationStore();
const searchStore = useSearchStore();
const serverStore = useServerStore();

const props = defineProps(['conversationId']);
</script>

<template>
  <div
    class="overflow-hidden w-full bg-gray-600 transition-[width] ease-out duration-200"
    :class="{
      'lg:w-[18rem]': !searchStore.GetShowingStatus(conversationId),
      'lg:w-[26rem]': searchStore.GetShowingStatus(conversationId),
    }">
    <div
      class="size-full pt-4 px-4 pb-[0.37rem] text-white"
      :class="{ hidden: !searchStore.GetShowingStatus(conversationId) }">
      <div class="flex size-full flex-col">
        <div class="flex">
          <span class="h-fit flex-none text-lg font-bold">
            search results:
            {{ searchStore.GetTotalSearchResults(conversationId) }} found
          </span>
          <div class="ml-auto flex-none">
            <button
              @click="
                () => {
                  searchStore.GetSearchDataById(conversationId).searchIsShowing = false;
                  searchStore.GetSearchDataById(conversationId).searchQuery = '';
                }
              "
              class="text-lg text-white hover:text-gray-300">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>
        <div class="flex-grow overflow-y-scroll overflow-x-hidden">
          <pagination-animation :page="searchStore.GetSearchPagePlace(props.conversationId)">
            <ul
              :key="searchStore.GetSearchPagePlace(conversationId)"
              class="flex grow min-w-0 flex-col p-2">
              <li
                v-for="result in searchStore.GetSearchResults(conversationId)"
                key="result.messageId"
                class="group/item relative mt-2 flex flex-col rounded-md bg-black/20 p-3 transition-colors ease-in-out
                  hover:cursor-pointer hover:bg-black/10"
                @click="
                  () => {
                    conversationStore.TriggerJumpToMessage(conversationId, result.messageId);
                  }
                ">
                <message-list-item
                  :message="result"
                  :conversationId="conversationId"
                  :key="result.messageId"
                  :allowed-functions="{ allowReply: true }" />
              </li>
            </ul>
          </pagination-animation>
        </div>
        <pagination-buttons
          class="h-12 mt-auto"
          :first-page-boundary="searchStore.GetFirstPageBoundary(conversationId)"
          :last-page-boundary="searchStore.GetLastPageBoundary(conversationId)"
          :last-page-number="searchStore.GetLastPageNumber(conversationId)"
          :current-place="searchStore.GetSearchPagePlace(conversationId)"
          @set-search-page-place="
            (place) => {
              searchStore.SetSearchPagePlace(conversationId, place);
            }
          " />
      </div>
    </div>
    <div class="size-full" :class="{ hidden: searchStore.GetShowingStatus(conversationId) }">
      <div
        class="pt-4 px-4 pb-[0.37rem]"
        v-if="conversationStore.GetConversationById(conversationId)?.conversationType !== 0">
        <span class="p-2 font-bold text-white">Members</span>
        <ul class="flex flex-col overflow-auto">
          <li
            v-for="participant in conversationStore.GetConversationById(conversationId)
              ?.participants"
            :key="participant"
            class="rounded-lg p-2 text-xl text-white transition-colors ease-in-out hover:bg-black/30">
            <div class="flex flex-row flex-nowrap items-center gap-2">
              <img
                :src="userStore.GetUserById(participant).profilePicture"
                alt="pfp"
                class="size-10 flex-none rounded-full" />
              <span> {{ userStore.GetUserById(participant).username }} </span>
            </div>
          </li>
        </ul>
      </div>
      <div
        class="size-full"
        v-else-if="conversationStore.GetConversationById(conversationId).conversationType === 0">
        <user-profile
          :conversation="conversationStore.GetConversationById(conversationId)"
          :user="
            userStore.GetUserById(
              conversationStore
                .GetConversationById(conversationId)
                ?.participants.find((x) => x !== serverStore.user.userId),
            )
          "
          class="size-full" />
      </div>
    </div>
  </div>
</template>
