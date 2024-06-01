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

export function ApplyStrongMarkdown(text, callback) {
  return text.replace(/(\*\*|__)(.*?)\1/g, callback);
}

export function ApplyItalicMarkdown(text, callback) {
  return text.replace(/([*_])(.*?)\1/g, callback);
}

export function ApplyHiddenTextMarkdown(text, callback) {
  return text.replace(/(\|\|)([\s\S]*?)\1/g, callback);
}

export function ApplyHeadingMarkdown(text, callback) {
  return text.replace(/(#{1,6}\s)(.+)/g, callback);
}

export function ApplyLinkMarkdown(text, callback) {
  return text.replace(/\[(.*?)]\((.*?)\)/g, callback);
}

export function ApplyBlockQuoteMarkdown(text, callback) {
  return text.replace(/(?:^(?:&gt;)+.*\n?)+/gm, callback);
}

export function ApplyCodeMarkdown(text, callback) {
  return text.replace(/(`{3,})(.*?)\n([\s\S]*?)\1/g, callback);
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
    '<blockquote class="border-l-[10px] border-gray-600 bg-black/10 pl-2 py-2 pr-1 shadow ">';
  const QuoteParagraph = '<p class="py-1">';
  let result = '<blockquote class=" xl:w-[90%] my-1">';

  const blockQuoteLines = text.split('\n');
  let blockQuoteList = [];

  //map out each line of the blockquote and how many indents it has
  blockQuoteLines.forEach((line) => {
    let info = /((?:&gt;){1,5})(.*)/.exec(line);
    if (info) blockQuoteList.push({ indentLength: info[1].match(/&gt;/g).length, text: info[2] });
  });

  //build the string based on the indents
  for (let i = 0; i < blockQuoteList.length; i++) {
    //get the difference between the current line and the line above and below
    //if it's out of bounds, we set the difference to the current indent
    let differenceUp =
      i - 1 < 0
        ? blockQuoteList[i].indentLength
        : blockQuoteList[i].indentLength - blockQuoteList[i - 1].indentLength;
    let differenceDown =
      i + 1 >= blockQuoteList.length
        ? blockQuoteList[i].indentLength
        : blockQuoteList[i].indentLength - blockQuoteList[i + 1].indentLength;

    //result is build based on the indentation difference
    //if the difference with the upper is higher than 0, it means we need to add a blockquote tag with the difference as the number of tags
    result += differenceUp > 0 ? blockQuote.repeat(Math.abs(differenceUp)) : '';
    //if the difference with the upper is 0 we don't need to add a paragraph tag
    result += differenceUp !== 0 ? QuoteParagraph : '';
    //add the line of text
    result += `${blockQuoteList[i].text}\n`;
    //if the difference with the lower is 0 we don't need to add a paragraph closing tag
    result += differenceDown !== 0 ? '</p>' : '';
    //if the difference with the lower is higher than 0, it means we need to close the blockquote tag with the difference as the number of tags
    result += differenceDown > 0 ? '</blockquote>'.repeat(Math.abs(differenceDown)) : '';
  }

  result += '</blockquote>';

  return result;
}
