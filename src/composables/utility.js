export function IsLoadingCompleted(messageList, message) {
  if (messageList.length > 0) {
    const index = messageList.findIndex((x) => x.messageId === message.messageId);
    if (index !== -1) {
      messageList.splice(index, 1);

      if (messageList.length === 0) {
        return true;
      }
    }
  }
  return false;
}

export function insertAtCursor(text) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0);
  range.deleteContents();

  const node = document.createTextNode(text);
  range.insertNode(node);

  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export async function UploadFileToS3(file, signedRequest) {
  const response = await fetch(signedRequest, {
    method: 'PUT',
    body: file,
  });

  return response;
}

export function GetProfilePictureUrl(fileName) {
  return `https://avatars.quinnsserver.com/${fileName !== '' ? fileName : 'default.png'}`;
}

export function IsSameDay(message1, message2) {
  const date1 = new Date(message1?.sentAt) ?? new Date(Date.now());
  const date2 = new Date(message2?.sentAt) ?? new Date(Date.now());
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export function FormatMessageDateToStringLong(date) {
  const now = new Date(Date.now());
  const messageDate = new Date(date);
  if (now.getFullYear() === messageDate.getFullYear()) {
    if (now.getMonth() === messageDate.getMonth() && now.getDate() === messageDate.getDate()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { month: 'long', day: 'numeric' });
  }
  return messageDate.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
}

export function FormatMessageDateToStringShort(date) {
  const now = new Date(Date.now());
  const messageDate = new Date(date);
  if (now.getFullYear() === messageDate.getFullYear()) {
    if (now.getMonth() === messageDate.getMonth() && now.getDate() === messageDate.getDate()) {
      return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
  return messageDate.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
}
