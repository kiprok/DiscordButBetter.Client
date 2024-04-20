import {defineStore} from "pinia";
import {reactive, ref} from "vue";

export const useUserStore = defineStore("user", () => {

        const myUserName = ref('kiprok');
        const myId = crypto.randomUUID();
        const myProfilePicture = ref("https://i.imgur.com/Y86bvSa.jpeg");


        const users = reactive({
            [myId]: {
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

        const messages = reactive({
            /*
            "": {
                messageId: "",
                senderId: "",
                convoId: "",
                messageText: "",
                timeSend: 0,
                meta: {}
            }
             */
        });

        function SendMessage(convoId, message) {
            let newId = message.hasOwnProperty('messageId') ? message.messageId : crypto.randomUUID();
            messages[newId] = {
                messageId: newId,
                senderId: message.senderId,
                convoId: message.convoId,
                messageText: message.messageText,
                timeSend: message.timeSend,
                meta: message.meta
            };
            if (!message.hasOwnProperty('messageId'))
                conversations[message.convoId].messages.push(newId);
            return newId;
        }

        function GetUserById(id) {
            return users[id];
        }

        function GetMessageById(id) {
            return messages[id];
        }

        function GetConversationById(id) {
            return conversations[id];
        }

        function GetFriendList() {
            console.log("Getting friends list");
            return friends.map((friend) => users[friend]);
        }

        function GetALLConversations() {
            console.log("Getting conversations");
            return conversations;
        }

        function DeleteMessage(messageId) {
            //this is insane
            conversations[messages[messageId].convoId].messages.splice(conversations[messages[messageId].convoId].messages.indexOf(messageId), 1);

            delete messages[messageId];
        }

        function DeleteAllMessages(convoId) {
            for (let messageId in conversations[convoId].messages) {
                delete messages[messageId];
            }
            conversations[convoId].messages.splice(0, conversations[convoId].messages.length);
        }

        function GetMessagesFromConversation(id) {
            console.log("Getting messages")
            if (id in conversations)
                return conversations[id].messages.map(messageId => messages[messageId]);

            return [];

        }

        function AddUser(name, pfp) {
            let id = crypto.randomUUID()
            users[id] = {
                userId: id,
                userName: name,
                profilePicture: pfp
            };

            return id;
        }

        function AddFriend(userId) {
            friends.push(userId);
        }


        return {
            myUserName,
            myId,
            myProfilePicture,
            users,
            friends,
            conversations,
            messages,
            AddUser,
            AddFriend,
            SendMessage,
            DeleteMessage,
            DeleteAllMessages,
            GetMessagesFromConversation,
            GetUserById,
            GetConversationById,
            GetMessageById,
            GetALLConversations,
            GetFriendList,
        };
    }
)