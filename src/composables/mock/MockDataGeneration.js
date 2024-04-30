import { useUserStore } from "@/stores/user.js";

export async function GenerateUser() {
  const userStore = useUserStore();

  let getUserResponse = await fetch("https://randomuser.me/api/");
  let newUser = await getUserResponse.json();
  let name = `${newUser.results[0].name.first} ${newUser.results[0].name.last}`;
  let picture = newUser.results[0].picture.thumbnail;

  return userStore.AddUser(name, picture);
}

export async function GenerateConversation(
  convoName,
  convoPicture,
  userId1,
  userId2,
) {
  let newConvoId = crypto.randomUUID();

  return {
    convoId: newConvoId,
    convoName: convoName,

    convoType: 0,
    convoPicture: convoPicture,
    participants: [userId1, userId2],
    messages: [],
  };
}

export async function GenerateConversationMessages(convoId, otherId) {
  const userStore = useUserStore();

  let lastMsgId = null;
  for (let i = 0; i < 100; i++) {
    lastMsgId = userStore.SendMessage(convoId, {
      senderId: i % 2 === 0 ? otherId : userStore.myId,
      convoId: convoId,
      messageText: `Random message ${i}`,
      timeSend: Date.now(),
      meta:
        lastMsgId !== null
          ? { reply: { messageId: lastMsgId, userId: otherId } }
          : {},
    });
  }
}
