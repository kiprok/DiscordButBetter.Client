import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useUserStore } from '@/stores/user.js';

export const useSearchStore = defineStore('search', () => {
  const searchData = reactive({
    id: {
      searchId: 'convoId',
      searchQuery: '',
      searchIsShowing: false,
      searchResults: [],
      searchPagePlace: 1,
    },
  });

  function GetSearchDataById(searchId) {
    if (!searchData[searchId]) {
      searchData[searchId] = {
        searchId: searchId,
        searchQuery: '',
        searchIsShowing: false,
        searchResults: [],
        searchPagePlace: 1,
      };
      return searchData[searchId];
    }

    return searchData[searchId];
  }

  function GetShowingStatus(searchId) {
    return GetSearchDataById(searchId).searchIsShowing;
  }

  function SearchMessages(searchId) {
    const userStore = useUserStore();
    const results = Object.keys(userStore.messages)
      .filter((message) => {
        return (
          userStore.messages[message].messageText.includes(GetSearchDataById(searchId).searchQuery) &&
          userStore.messages[message].convoId === searchId
        );
      })
      .map((message) => userStore.messages[message]);
    GetSearchDataById(searchId).searchResults = results;
  }

  function GetSearchResults(searchId) {
    return GetSearchDataById(searchId).searchResults;
  }

  return {
    searchData,
    GetSearchDataById,
    GetShowingStatus,
    GetSearchResults,
    SearchMessages,
  };
});
