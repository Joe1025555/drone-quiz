(() => {
  'use strict';
  // Render the source Markdown's headings, lists and bold text without HTML injection.
  const content = document.getElementById('markdown-content');
  const links = document.getElementById('chapter-links');
  const fragment = document.createDocumentFragment();
  let list = null;
  let chapter = 0;
  let container = fragment;
  let chapterSection = null;
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
      const element = document.createElement('h' + Math.max(2, heading[1].length));
      element.textContent = heading[2];
      if (heading[1].length === 3) {
        const question = document.createElement('section');
        question.className = 'bank-question';
        question.dataset.chapter = chapterSection.dataset.chapter;
        chapterSection.append(question);
        container = question;
      }
      if (heading[1].length === 2) {
        chapterSection = document.createElement('section');
        chapterSection.className = 'bank-chapter-section';
        chapterSection.dataset.chapter = heading[2];
        fragment.append(chapterSection);
        container = chapterSection;
        element.id = 'chapter-' + ++chapter;
        const link = document.createElement('a');
        link.href = '#' + element.id;
        link.textContent = heading[2];
        links.append(link);
        link.addEventListener('click', () => { clear(); });
        const option = document.createElement('option'); option.value = heading[2]; option.textContent = heading[2];
        document.getElementById('bank-chapter').append(option);
      }
      container.append(element);
    } else if (line.startsWith('- ')) {
      if (!list) { list = document.createElement('ul'); container.append(list); }
      const item = document.createElement('li');
      inline(item, line.slice(2));
      if (line.endsWith('✅')) item.className = 'right-answer';
      list.append(item);
    } else {
      list = null;
      const paragraph = document.createElement('p');
      inline(paragraph, line);
      container.append(paragraph);
    }
  }
  content.replaceChildren(fragment);
  // Question IDs follow the same chapter/question order as the source Markdown.
  for (const [index, node] of [...content.querySelectorAll('.bank-question')].entries()) {
    node.append(window.Explanations.createDetails(index + 1));
  }
  const query = document.getElementById('bank-query');
  const chapterFilter = document.getElementById('bank-chapter');
  const questionNodes = [...content.querySelectorAll('.bank-question')];
  const entries = questionNodes.map(node => ({ node, text: node.textContent.normalize('NFKC').toLocaleLowerCase() }));
  function filter() {
    const keywords = query.value.normalize('NFKC').trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    let visible = 0;
    for (const { node, text } of entries) {
      node.hidden = !!(chapterFilter.value && node.dataset.chapter !== chapterFilter.value) || !keywords.every(word => text.includes(word));
      if (!node.hidden) visible++;
    }
    for (const section of content.querySelectorAll('.bank-chapter-section')) {
      section.hidden = ![...section.querySelectorAll('.bank-question')].some(node => !node.hidden);
    }
    document.getElementById('search-count').textContent = `顯示 ${visible} / ${questionNodes.length} 題`;
    document.getElementById('search-empty').hidden = visible !== 0;
  }
  function clear() { query.value = ''; chapterFilter.value = ''; filter(); }
  query.addEventListener('input', filter);
  chapterFilter.addEventListener('change', filter);
  document.getElementById('clear-search').addEventListener('click', () => { clear(); query.focus(); });
  filter();
})();
