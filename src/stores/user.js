import {defineStore} from "pinia";
import {reactive, ref} from "vue";
import {createRouter as friends} from "vue-router";

export const useUserStore = defineStore("user", () => {

    const myUserName = ref('kiprok');
    const myId = crypto.randomUUID();
    const myProfilePicture = ref("https://i.imgur.com/Y86bvSa.jpeg");


    const users = reactive({
        0: {
            userId: myId,
            userName: myUserName,
            profilePicture: myProfilePicture
        }

    });

    const friends = reactive([]);
    const conversations = reactive({
        /*
        convoId: "",
        convoName: "",
        convoType: 0, // 0 = private, 1 = group
        convoPicture: "",
        participants: [],
        messages: []
         */
    });

    function AddUser(name, pfp){
        let id = crypto.randomUUID()
        users[id] = {
            userId: id,
            userName: name,
            profilePicture: pfp
        };

        return id;
    }

    function AddFriend (userId){
        friends.push(userId);
    }

    function GetFriends(){
        return friends.map(friend => users[friend])
    }



    return {
        myUserName,
        myId,
        myProfilePicture,
        users,
        friends,
        conversations,
        AddUser,
        AddFriend,
        GetFriends
    };
})