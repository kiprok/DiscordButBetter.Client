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
  const blockQuote =
    '<blockquote class="border-l-[10px] border-gray-600 bg-black/10 pl-2 mr-3 pr-1 shadow">';
  const QuoteParagraph = '<p class="py-2">';
  const blockQuoteLines = text.split('\n');
  let blockQuoteList = [];
  let result = '';

  //map out each line of the blockquote and how many indents it has
  blockQuoteLines.forEach((line) => {
    let info = /((?:&gt;)+)(.*)/.exec(line);
    if (info) blockQuoteList.push([info[1].match(/&gt;/g).length, info[2]]);
  });

  //build the string based on the indents
  for (let i = 0; i < blockQuoteList.length; i++) {
    //get the difference between the current line and the line above and below
    let differenceUp =
      i - 1 < 0 ? blockQuoteList[i][0] : blockQuoteList[i][0] - blockQuoteList[i - 1][0];
    let differenceDown =
      i + 1 >= blockQuoteList.length
        ? blockQuoteList[i][0]
        : blockQuoteList[i][0] - blockQuoteList[i + 1][0];

    //result is build based on the indentation difference
    //if the difference with the upper is higher than 0, it means we need to add a blockquote tag with the difference as the number of tags
    result += differenceUp > 0 ? blockQuote.repeat(Math.abs(differenceUp)) : '';
    //if the difference with the upper is 0 we don't need to add a paragraph tag
    result += differenceUp !== 0 ? QuoteParagraph : '';
    //add the line of text
    result += `${blockQuoteList[i][1]}\n`;
    //if the difference with the lower is 0 we don't need to add a paragraph closing tag
    result += differenceDown !== 0 ? '</p>' : '';
    //if the difference with the lower is higher than 0, it means we need to close the blockquote tag with the difference as the number of tags
    result += differenceDown > 0 ? '</blockquote>'.repeat(Math.abs(differenceDown)) : '';
  }

  return result;
}
