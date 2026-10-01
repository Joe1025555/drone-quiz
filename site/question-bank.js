(() => {
  'use strict';
  // Render the source Markdown's headings, lists and bold text without HTML injection.
  const content = document.getElementById('markdown-content');
  const links = document.getElementById('chapter-links');
  const fragment = document.createDocumentFragment();
  let list = null;
  let chapter = 0;
  function inline(element, text) {
    const pieces = text.split(/(\*\*[^*]+\*\*)/g);
    for (const piece of pieces) {
      if (piece.startsWith('**') && piece.endsWith('**')) {
        const strong = document.createElement('strong');
        strong.textContent = piece.slice(2, -2);
        element.append(strong);
      } else element.append(document.createTextNode(piece));
    }
  }
  for (const line of window.QUESTION_MARKDOWN.split(/\r?\n/)) {
    if (!line.trim()) { list = null; continue; }
    const heading = line.match(/^(#{1,3}) (.+)$/);
    if (heading) {
      list = null;
      const element = document.createElement('h' + heading[1].length);
      element.textContent = heading[2];
      if (heading[1].length === 2) {
        element.id = 'chapter-' + ++chapter;
        const link = document.createElement('a');
        link.href = '#' + element.id;
        link.textContent = heading[2];
        links.append(link);
      }
      fragment.append(element);
    } else if (line.startsWith('- ')) {
      if (!list) { list = document.createElement('ul'); fragment.append(list); }
      const item = document.createElement('li');
      inline(item, line.slice(2));
      if (line.endsWith('✅')) item.className = 'right-answer';
      list.append(item);
    } else {
      list = null;
      const paragraph = document.createElement('p');
      inline(paragraph, line);
      fragment.append(paragraph);
    }
  }
  content.replaceChildren(fragment);
})();
