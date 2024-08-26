import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import csharp from 'highlight.js/lib/languages/csharp';
import css from 'highlight.js/lib/languages/css';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('css', css);
hljs.registerLanguage('csharp', csharp);

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

export function ApplyEmojiMarkdown(text, callback) {
  return text.replace(
    /^(?:\p{Emoji_Presentation}|\p{Emoji_Presentation}\u200D|\n\p{Emoji_Presentation})+$/u,
    callback,
  );
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

export function parseMarkdownMessage(text) {
  let codeBlocks = [];

  text = ApplyEmojiMarkdown(text, (match) => {
    return `<span class="text-4xl">${match}</span>`;
  });

  text = ApplyCodeMarkdown(text, (match, p1, p2, p3) => {
    codeBlocks.push(
      `<pre class="border border-black rounded overflow-x-auto xl:max-w-[90%] my-4 bg-[#2b2b2b] text-white"><code class="hljs p-4 block">${
        hljs.highlight(reverseEscapeHtml(p3), {
          language: hljs.getLanguage(p2) ? p2 : 'plaintext',
          ignoreIllegals: true,
        }).value
      }</code></pre>`,
    );
    return '%%CODE_BLOCK%%';
  });

  text = ApplyStrongMarkdown(text, '<strong>$2</strong>');
  text = ApplyItalicMarkdown(text, '<em>$2</em>');
  text = ApplyHiddenTextMarkdown(
    text,
    (match, p1, p2) =>
      `<div class="hidden-text bg-black rounded cursor-pointer select-none size-fit max-w-full"><span class="invisible">${p2.trim()}</span></div>`,
  );
  text = ApplyHeadingMarkdown(text, (match, p1, p2) => GetMarkdownSize(p1.length - 1, p2));
  text = ApplyLinkMarkdown(
    text,
    '<a href="$2" class="text-blue-800 hover:cursor-pointer hover:text-white hover:underline">$1</a>',
  );
  text = ApplyBlockQuoteMarkdown(text, (match) => GetBlockQuoteMarkDown(match));
  text = text.replaceAll('%%CODE_BLOCK%%', () => codeBlocks.shift() || '%%CODE_BLOCK%%');

  return text;
}

export function parseMarkdownReply(text) {
  let codeBlocks = [];
  text = ApplyCodeMarkdown(text, (match, p1, p2, p3) => {
    codeBlocks.push(
      `<pre class="border border-black rounded inline bg-[#2b2b2b] text-white"><code class="hljs inline">${
        hljs.highlight(reverseEscapeHtml(p3), {
          language: hljs.getLanguage(p2) ? p2 : 'plaintext',
          ignoreIllegals: true,
        }).value
      }</code></pre>`,
    );
    return '%%CODE_BLOCK%%';
  });

  text = ApplyStrongMarkdown(text, '<strong>$2</strong>');
  text = ApplyItalicMarkdown(text, '<em>$2</em>');
  text = ApplyHiddenTextMarkdown(
    text,
    (match, p1, p2) =>
      `<div class=" bg-black rounded cursor-pointer select-none size-fit max-w-full"><span class="invisible">${p2.trim()}</span></div>`,
  );
  text = ApplyHeadingMarkdown(text, (match, p1, p2) => {
    return p2;
  });
  text = ApplyLinkMarkdown(
    text,
    '<a href="$2" class="text-blue-800 hover:cursor-pointer hover:text-white hover:underline">$1</a>',
  );
  text = ApplyBlockQuoteMarkdown(text, (match) => {
    return match.replaceAll('&gt;', '');
  });
  text = text.replaceAll('%%CODE_BLOCK%%', () => codeBlocks.shift() || '%%CODE_BLOCK%%');

  return text;
}
