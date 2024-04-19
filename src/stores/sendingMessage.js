import {defineStore} from "pinia";
import {ref} from "vue";

export const useSendingMessageStore = defineStore('sendingMessage',()=> {

    const messageText = ref("");
    const replyTo = ref(null);
    const messageEditing = ref(null);

    function EditMessage(message){
        messageText.value = message.messageText;
        messageEditing.value = message;
    }

    return {
        messageText,
        replyTo,
        messageEditing,
        EditMessage
    }

})