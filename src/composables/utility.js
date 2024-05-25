export function IsLoadingCompleted(messageList, message) {
  if (messageList.length > 0) {
    const index = messageList.findIndex(
      (x) => x.messageId === message.messageId,
    );
    if (index !== -1) {
      messageList.splice(index, 1);

      if (messageList.length === 0) {
        return true;
      }
    }
  }
  return false;
}

export function insertAtCursor(lines) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0);
  range.deleteContents();

  for (let i = 0; i < lines.length; i++) {
    const node = document.createTextNode(lines[i]);
    range.insertNode(node);
    if (i < lines.length - 1) {
      range.insertNode(document.createElement('br'));
    }
  }

  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}
