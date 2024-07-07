import { useUserStore } from '@/stores/user.js';
import { useServerStore } from '@/stores/server.js';

export async function GenerateUser() {
  const userStore = useUserStore();

  let getUserResponse = await fetch('https://randomuser.me/api/');
  let newUser = await getUserResponse.json();
  let name = `${newUser.results[0].name.first} ${newUser.results[0].name.last}`;
  let picture = newUser.results[0].picture.thumbnail;

  return userStore.AddUser(name, picture);
}

export async function GenerateConversation(
  conversationName,
  conversationPicture,
  userId1,
  userId2,
) {
  let newConvoId = crypto.randomUUID();

  return {
    conversationId: newConvoId,
    conversationName: conversationName,
    conversationType: 0, // 0 = private, 1 = group
    conversationPicture: conversationPicture,
    visibleMessages: [],
    participants: [userId1, userId2],
    scrollPosition: 0,
    viewingOlderMessages: false,
    lastMessageTime: 0,
    lastSeenMessage: '',
    newUnseenMessages: [],
  };
}

export async function GenerateConversationMessages(conversationId, otherId, amount) {
  const userStore = useUserStore();
  const serverStore = useServerStore();

  let lastMsgId = null;
  let startTimeOffset = 100000000;
  let messageToJumpTo = null;
  let userToJumpTo = null;
  for (let i = 0; i < amount; i++) {
    let timeOffset = startTimeOffset - (startTimeOffset / amount) * i;
    let newMessageId = crypto.randomUUID();

    if (i === 40) {
      messageToJumpTo = newMessageId;
      userToJumpTo = i % 2 === 0 ? otherId : serverStore.user.userId;
    }

    userStore.messages[newMessageId] = {
      messageId: newMessageId,
      senderId: i % 2 === 0 ? otherId : serverStore.user.userId,
      conversationId: conversationId,
      messageText: `Random message ${i}`,
      timeSend: Date.now() - timeOffset,
      meta: lastMsgId !== null ? { reply: { messageId: lastMsgId, userId: otherId } } : {},
    };
    lastMsgId = newMessageId;
  }
  let newMessageId = crypto.randomUUID();
  userStore.messages[newMessageId] = {
    messageId: newMessageId,
    senderId: serverStore.user.userId,
    conversationId: conversationId,
    messageText: `I replied to the 40th message`,
    timeSend: Date.now(),
    meta: { reply: { messageId: messageToJumpTo, userId: userToJumpTo } },
  };
}
