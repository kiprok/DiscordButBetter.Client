import { defineStore } from 'pinia';
import { reactive } from 'vue';
import { useUserStore } from '@/stores/user.js';

export const useSearchStore = defineStore('search', () => {
  const _fullSearchData = reactive({
    searchId: {
      searchResults: [],
    },
  });

  const searchData = reactive({
    id: {
      searchId: 'convoId',
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
    firstPage = Math.min(firstPage, GetLastPageNumber(searchId) - 4);

    return firstPage;
  }

  function GetLastPageBoundary(searchId) {
    return GetFirstPageBoundary(searchId) + 4;
  }

  function GetSearchPagePlace(searchId) {
    return GetSearchDataById(searchId).searchPagePlace;
  }

  function SetSearchPagePlace(searchId, page) {
    GetSearchDataById(searchId).searchPagePlace = page;
    GetSearchDataById(searchId).searchResults = _fullSearchData[searchId].slice(
      (page - 1) * 25,
      page * 25,
    );
  }

  function SearchMessages(searchId) {
    const userStore = useUserStore();
    _fullSearchData[searchId] = Object.keys(userStore.messages)
      .filter((message) => {
        return (
          userStore.messages[message].messageText.includes(
            GetSearchDataById(searchId).searchQuery,
          ) && userStore.messages[message].convoId === searchId
        );
      })
      .map((message) => userStore.messages[message]);

    GetSearchDataById(searchId).searchPagePlace = 1;
    GetSearchDataById(searchId).totalSearchResults = _fullSearchData[searchId].length;
    GetSearchDataById(searchId).searchResults = _fullSearchData[searchId].slice(0, 25);
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
