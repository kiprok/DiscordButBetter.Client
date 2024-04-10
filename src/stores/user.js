import {defineStore} from "pinia";
import {reactive, ref} from "vue";
import {i} from "vite/dist/node/types.d-aGj9QkWt.js";

export const useUserStore = defineStore("user", () => {

    const userName = ref('kiprok');
    const userId = ref(0)


    const users = reactive({
        0: {
            userId: userId,
            userName: userName,
            profilePicture: ""
        }

    })

    const conversations = reactive([])

    for (let i = 1; i < 20; i++) {

        // let getUser = fetch("https://randomuser.me/api/",
        //     {
        //         method: "GET",
        //         headers: {
        //             "Accept": "application/json"
        //         }
        //     })
        //     .then(response => response.json())
        //     .then(response => response);


        users[i] = {
            userId: i,
            userName: `person ${i}`,
            profilePicture: ""
        }

        conversations.push({
            otherName: `person ${i}`,
            messages: []
        });
        for (let j = 0; j < 100; j++) {
            conversations[i].messages.push(`person ${i} says random message ${j}`);
        }
    }

    return {
        userName,
        userId,
        conversations
    };
})