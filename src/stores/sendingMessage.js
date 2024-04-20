import {defineStore} from "pinia";
import {ref} from "vue";

export const useSendingMessageStore = defineStore('sendingMessage',()=> {

    const messageText = ref("");
    const replyTo = ref(null);
    const messageEditing = ref(null);

    function EditMessage(message, reply = null){
        console.log(reply);
        messageText.value = message.messageText;
        replyTo.value = reply;
        messageEditing.value = message;
    }

    function StopEditingMessage(){
        messageText.value = "";
        replyTo.value = null;
        messageEditing.value = null;
    }

    return {
        messageText,
        replyTo,
        messageEditing,
        EditMessage,
        StopEditingMessage,
    }

})