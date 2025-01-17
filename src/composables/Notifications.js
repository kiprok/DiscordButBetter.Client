import { useServerStore } from '@/stores/server.js';
import { useConversationStore } from '@/stores/conversation.js';
import { useUserStore } from '@/stores/user.js';
import { useRouter } from 'vue-router';

const serverStore = useServerStore();
const conversationStore = useConversationStore();
const userStore = useUserStore();

let _route;
let _router;

export async function RegisterNotificationAsync(connection, route, router) {
  _route = route;
  _router = router;
  connection.on('NewMessage', NewMessageAsync);
  connection.on('MessageEdited', MessageEditedAsync);
  connection.on('MessageDeleted', MessageDeletedAsync);

  connection.on('FriendRequest', GetFriendRequestAsync);
  connection.on('FriendRequestAccepted', FriendRequestAcceptedAsync);
  connection.on('FriendRequestDeclined', FriendRequestDeclinedAsync);
  connection.on('FriendRequestCanceled', FriendRequestCanceledAsync);

  connection.on('CreatedNewConversation', CreatedNewConversationAsync);
  connection.on('AddedToConversation', AddedToConversationAsync);
  connection.on('RemovedFromConversation', RemovedFromConversationAsync);
  connection.on('ConversationInfoChanged', ConversationInfoChangedAsync);

  connection.on('FriendRemoved', FriendRemovedAsync);
  connection.on('UserInfoChanged', UserInfoChangedAsync);
}

async function NewMessageAsync(message) {
  userStore.SendMessage(message);
  const conversation = conversationStore.GetConversationById(message.conversationId);

  if (!conversationStore.GetVisibleConversations().includes(message.conversationId)) {
    conversationStore.AddVisibleConversation(message.conversationId);
  }

  if (
    (!conversation.viewingOlderMessages &&
      conversationStore.GetVisibleMessages(message.conversationId).length !== 0) ||
    _route.params.id === message.conversationId
  ) {
    conversationStore.AddMessage(message.conversationId, message);
  }
  conversationStore.UpdateLastMessageTime(message.conversationId, Date.now());

  if (_route.params.id !== message.conversationId && message.senderId !== serverStore.user.userId) {
    conversation.newUnseenMessages.push(message.messageId);
  }
}

async function MessageEditedAsync(message) {
  if (userStore.messages[message.messageId]) {
    userStore.messages[message.messageId].content = message.content;
    userStore.messages[message.messageId].metadata = message.metadata;
  }
}
async function MessageDeletedAsync(messageId) {
  const message = userStore.messages[messageId];
  if (message) {
    userStore.DeleteMessage(messageId);
    conversationStore.DeleteMessage(message.conversationId, messageId);
  }
}

async function GetFriendRequestAsync(friendRequest) {
  console.log('Friend request received', friendRequest);
  if (friendRequest.senderId === serverStore.user.userId) {
    const user = await serverStore.GetUserByIdAsync(friendRequest.receiverId);
    userStore.AddFriendRequestSent(friendRequest, user);
  } else {
    const user = await serverStore.GetUserByIdAsync(friendRequest.senderId);
    userStore.AddFriendRequest(friendRequest, user);
  }
}

async function FriendRequestAcceptedAsync(friendRequest) {
  console.log('Friend request accepted', friendRequest);
  if (friendRequest.senderId === serverStore.user.userId) {
    userStore.RemoveFriendRequestSent(friendRequest);
    const user = await serverStore.GetUserByIdAsync(friendRequest.receiverId);
    userStore.AddFriend(user);
  } else {
    userStore.AcceptFriendRequest(friendRequest);
    const user = await serverStore.GetUserByIdAsync(friendRequest.senderId);
    userStore.AddFriend(user);
  }
}

async function FriendRequestDeclinedAsync(friendRequest) {
  console.log('Friend request declined', friendRequest);
  console.log('mine', friendRequest.senderId === serverStore.user.userId);
  if (friendRequest.senderId === serverStore.user.userId) {
    userStore.RemoveFriendRequestSent(friendRequest);
  } else {
    userStore.RejectFriendRequest(friendRequest);
  }
}

async function FriendRequestCanceledAsync(friendRequest) {
  console.log('Friend request canceled', friendRequest);
  if (friendRequest.senderId === serverStore.user.userId) {
    userStore.RejectFriendRequest(friendRequest);
  } else {
    userStore.RemoveFriendRequestSent(friendRequest);
  }
}

async function FriendRemovedAsync(userId) {
  console.log('Friend removed', userId);
  userStore.RemoveFriend(userId);
}

async function CreatedNewConversationAsync(conversation) {
  conversationStore.AddVisibleConversation(conversation.conversationId);
  for (const paId of conversation.participants) {
    if (paId !== serverStore.user.userId) {
      if (!userStore.GetUserById(paId)) {
        const user = await serverStore.GetUserByIdAsync(paId);
        userStore.users[user.userId] = user;
      }
    }
  }
  console.log('conversation', conversation);
  conversationStore.AddConversation(conversation);
}

async function AddedToConversationAsync(conversation) {
  if (serverStore.user.userId === conversation.userId) {
    conversationStore.AddVisibleConversation(conversation.conversationId);
    for (const paId of conversation.participants) {
      if (paId !== serverStore.user.userId) {
        if (!userStore.GetUserById(paId)) {
          const user = await serverStore.GetUserByIdAsync(paId);
          userStore.users[user.userId] = user;
        }
      }
    }
    delete conversation.userId;
    conversationStore.AddConversation(conversation);
  } else {
    if (!userStore.GetUserById(userId)) {
      const user = await serverStore.GetUserByIdAsync(userId);
      userStore.users[user.userId] = user;
    }

    conversationStore.conversations[conversation.conversationId].participants.push(userId);
  }
}

async function RemovedFromConversationAsync(conversationId, userId) {
  if (serverStore.user.userId === userId) {
    conversationStore.RemoveVisibleConversation(conversationId);
  } else {
    conversationStore.conversations[conversationId].participants = conversationStore.conversations[
      conversationId
    ].participants.filter((paId) => paId !== userId);
  }
}

async function ConversationInfoChangedAsync(updatedConversation) {
  console.log('conversation info changed', updatedConversation);

  if (updatedConversation.participantsToRemove?.includes(serverStore.user.userId)) {
    conversationStore.RemoveVisibleConversation(updatedConversation.conversationId);
    if (_route.params.id === updatedConversation.conversationId) {
      await _router.push({ name: 'friendList' });
    }
    delete conversationStore.conversations[updatedConversation.conversationId];
    return;
  }
  let conversation = conversationStore.GetConversationById(updatedConversation.conversationId);

  if (!conversation) {
    const newConversation = await serverStore.GetConversationByIdAsync(
      updatedConversation.conversationId,
    );
    conversation = conversationStore.AddConversation(newConversation);
  }

  if (!conversationStore.GetVisibleConversations().includes(updatedConversation.conversationId)) {
    conversationStore.AddVisibleConversation(updatedConversation.conversationId);
  }

  if (updatedConversation.conversationName !== undefined)
    conversation.conversationName = updatedConversation.conversationName;
  if (updatedConversation.conversationPicture !== undefined)
    conversation.conversationPicture = updatedConversation.conversationPicture;
  if (updatedConversation.ownerId !== undefined) conversation.ownerId = updatedConversation.ownerId;

  for (const paId of updatedConversation.participants) {
    if (!userStore.GetUserById(paId)) {
      const user = await serverStore.GetUserByIdAsync(paId);
      userStore.users[user.userId] = user;
    }
  }

  conversation.participants = updatedConversation.participants;
}

async function UserInfoChangedAsync(updateUser) {
  const user = userStore.GetUserById(updateUser.userId);
  if (user === undefined) return;
  if (updateUser.username !== undefined) user.username = updateUser.username;
  if (updateUser.profilePicture !== undefined) user.profilePicture = updateUser.profilePicture;
  if (updateUser.status !== undefined) user.status = updateUser.status;
  if (updateUser.statusMessage !== undefined) user.statusMessage = updateUser.statusMessage;
  if (updateUser.biography !== undefined) user.biography = updateUser.biography;
}
