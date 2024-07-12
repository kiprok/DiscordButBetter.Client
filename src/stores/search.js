import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';

export const useSearchStore = defineStore('search', () => {
  const serverStore = useServerStore();
  const userStore = useUserStore();

  const _fullSearchData = reactive({
    searchId: {
      searchResults: [],
    },
  });

  const searchData = reactive({
    id: {
      searchId: 'conversationId',
      searchQuery: '',
      searchIsShowing: false,
      searchResults: [],
      searchPagePlace: 1,
      totalSearchResults: 0,
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
        totalSearchResults: 0,
      };
      return searchData[searchId];
    }

    return searchData[searchId];
  }

  function GetShowingStatus(searchId) {
    return GetSearchDataById(searchId).searchIsShowing;
  }

  function GetTotalSearchResults(searchId) {
    return GetSearchDataById(searchId).totalSearchResults;
  }

  function GetLastPageNumber(searchId) {
    return Math.ceil(GetSearchDataById(searchId).totalSearchResults / 25);
  }

  function GetFirstPageBoundary(searchId) {
    let firstPage = GetSearchPagePlace(searchId) - 2 > 0 ? GetSearchPagePlace(searchId) - 2 : 1;
    firstPage = Math.max(Math.min(firstPage, GetLastPageNumber(searchId) - 4), 1);

    return firstPage;
  }

  function GetLastPageBoundary(searchId) {
    return GetFirstPageBoundary(searchId) + 4;
  }

  function GetSearchPagePlace(searchId) {
    return GetSearchDataById(searchId).searchPagePlace;
  }

  function SetSearchPagePlace(searchId, page) {
    serverStore
      .SearchMessagesAsync(searchId, GetSearchDataById(searchId).searchQuery, page)
      .then((results) => {
        if (results == null) return;
        userStore.AddMessages(results.messages);
        GetSearchDataById(searchId).searchPagePlace = page;
        GetSearchDataById(searchId).searchResults = results.messages;
      });
  }

  // function SearchMessages(searchId) {
  //   const userStore = useUserStore();
  //   _fullSearchData[searchId] = Object.keys(userStore.messages)
  //     .filter((message) => {
  //       return (
  //         userStore.messages[message].content.includes(GetSearchDataById(searchId).searchQuery) &&
  //         userStore.messages[message].conversationId === searchId
  //       );
  //     })
  //     .map((message) => userStore.messages[message])
  //     .toReversed();
  //
  //   GetSearchDataById(searchId).searchPagePlace = 1;
  //   GetSearchDataById(searchId).totalSearchResults = _fullSearchData[searchId].length;
  //   GetSearchDataById(searchId).searchResults = _fullSearchData[searchId].slice(0, 25);
  // }

  function SearchMessages(searchId) {
    serverStore
      .SearchMessagesAsync(searchId, GetSearchDataById(searchId).searchQuery)
      .then((results) => {
        if (results == null) return;
        userStore.AddMessages(results.messages);
        GetSearchDataById(searchId).searchPagePlace = 1;
        GetSearchDataById(searchId).totalSearchResults = results.totalCount;
        GetSearchDataById(searchId).searchResults = results.messages;
      });
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
    GetTotalSearchResults,
    GetFirstPageBoundary,
    GetLastPageBoundary,
    GetLastPageNumber,
    GetSearchPagePlace,
    SetSearchPagePlace,
  };
});
