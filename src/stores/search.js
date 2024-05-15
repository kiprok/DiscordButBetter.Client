import { defineStore } from "pinia";
import { reactive } from "vue";

export const useSearchStore = defineStore("search", () => {
  const searchData = reactive({
    id: {
      searchId: "convoId",
      searchQuery: "",
      searchIsShowing: false,
      searchResults: [],
      searchPagePlace: 1,
    },
  });

  function GetSearchDataById(searchId) {
    if (!searchData[searchId]) {
      searchData[searchId] = {
        searchId: searchId,
        searchQuery: "",
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

  return {
    searchData,
    GetSearchDataById,
    GetShowingStatus,
  };
});
