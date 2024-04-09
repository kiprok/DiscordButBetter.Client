import {defineStore} from "pinia";
import {reactive} from "vue";

export const useUserStore = defineStore("user", () => {

    const conversations = reactive([])

    for (let i = 0; i < 10; i++) {
        conversations.push({
            otherName: `person ${i}`,
            messages: []
        });
        for (let j = 0; j < 100; j++) {
            conversations[i].messages.push(`person ${i} says random message ${j}`);
        }
    }

    return {
        conversations
    };
})