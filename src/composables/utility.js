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

export function reverseEscapeHtml(original) {
  const map = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
  };

  return original.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, (m) => map[m]);
}

export function escapeHtml(original) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return original.replace(/[&<>"']/g, (m) => map[m]);
}

export function GetMarkdownSize(length, text) {
  const sizes = [
    `<h1 class="text-4xl">${text}</h1>`,
    `<h2 class="text-3xl">${text}</h2>`,
    `<h3 class="text-2xl">${text}</h3>`,
    `<h4 class="text-xl">${text}</h4>`,
    `<h5 class="text-lg">${text}</h5>`,
    `<h6 class="text-base">${text}</h6>`,
  ];
  return sizes[length - 1];
}

export function GetBlockQuoteMarkDown(text) {
  const blockQuote = '<blockquote class="border-l-[10px] border-gray-600 bg-black/10 pl-2">';
  let blockQuoteLines = text.split('\n');
  let blockQuoteList = [];
  let result = blockQuote;
  blockQuoteLines.forEach((line) => {
    let info = /((?:&gt;)+)(.*)/.exec(line);
    blockQuoteList.push([info[1].match(/&gt;/g).length, info[2]]);
  });

  for (let i = 0; i < blockQuoteList.length; i++) {
    const comparer = (i, m) => {
      if (i + m < 0 || i + m >= blockQuoteList.length) return true;
      return blockQuoteList[i][0] !== blockQuoteList[i + m][0];
    };

    result += comparer(i, -1) ? blockQuote.repeat(blockQuoteList[i][0] - 1) : '';
    result += comparer(i, -1) ? '<p class="py-2">' : '';
    result += `${blockQuoteList[i][1]}\n`;
    result += comparer(i, +1) ? '</p>' : '';
    result += comparer(i, +1) ? '</blockquote>'.repeat(blockQuoteList[i][0] - 1) : '';
  }

  result += '</blockquote>';
  return result;
}
