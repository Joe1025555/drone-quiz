(() => {
  'use strict';
  function createDetails(id) {
    const data = window.QUESTION_EXPLANATIONS?.[id];
    const details = document.createElement('details');
    details.className = 'explanation';
    const summary = document.createElement('summary');
    summary.textContent = data?.note ? '答案解析與來源 · 閱讀提醒' : '答案解析與來源';
    details.append(summary);
    if (!data) {
      const paragraph = document.createElement('p');
      paragraph.textContent = '解析資料未能載入，請重新整理頁面後再試。';
      details.append(paragraph);
      return details;
    }
    const body = document.createElement('div'); body.className = 'explanation-body';
    const paragraph = document.createElement('p'); paragraph.textContent = data.text; body.append(paragraph);
    if (data.sources?.length) {
      const label = document.createElement('p'); label.className = 'source-label'; label.textContent = '參考來源';
      const sources = document.createElement('ul'); sources.className = 'explanation-sources';
      for (const source of data.sources) {
        if (!/^https:\/\//.test(source.url)) continue;
        const li = document.createElement('li'); const link = document.createElement('a');
        link.textContent = source.title + ' ↗'; link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer';
        li.append(link); sources.append(li);
      }
      body.append(label, sources);
    }
    details.append(body);
    if (data.note) {
      // Keep corrections visible even when the optional explanation is collapsed.
      const wrapper = document.createElement('div');
      const note = document.createElement('p'); note.className = 'explanation-note'; note.textContent = '閱讀提醒：' + data.note;
      wrapper.append(note, details);
      return wrapper;
    }
    return details;
  }
  window.Explanations = { createDetails };
})();
