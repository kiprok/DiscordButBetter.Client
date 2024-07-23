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
