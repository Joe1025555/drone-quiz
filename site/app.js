(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const bank = window.QUESTION_BANK;
  const rules = window.Quiz;
  const storageKey = 'drone-quiz-1150202-v1';
  let state = null;
  let interval = null;

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { $('storage-notice').hidden = false; }
  }
  function questions() { return state.ids.map(id => bank.find(q => q.id === id)); }
  function showScreen(id) {
    for (const screen of ['welcome', 'exam', 'results']) $(screen).hidden = screen !== id;
  }
  function focusQuestion() { $('question-text').focus({ preventScroll: true }); }
  function start() {
    clearInterval(interval);
    const now = Date.now();
    state = { ids: rules.sample(bank).map(q => q.id), answers: Array(rules.COUNT).fill(null), current: 0, startedAt: now, deadline: now + rules.DURATION, finishedAt: null, reason: null };
    save();
    showScreen('exam');
    renderQuestion();
    tick();
    interval = setInterval(tick, 1000);
    window.scrollTo(0, 0);
    focusQuestion();
  }
  function renderQuestion() {
    const current = state.current;
    const question = questions()[current];
    $('progress').textContent = `已作答 ${state.answers.filter(Boolean).length} / 20 題`;
    $('question-nav').replaceChildren(...state.ids.map((id, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = index + 1;
      button.className = 'number' + (state.answers[index] ? ' answered' : '') + (index === current ? ' current' : '');
      button.setAttribute('aria-label', `第 ${index + 1} 題，${state.answers[index] ? '已作答' : '未作答'}`);
      if (index === current) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => navigate(index));
      return button;
    }));
    $('question-position').textContent = `第 ${current + 1} 題 / 20 · 5 分`;
    $('chapter').textContent = question.chapter;
    $('question-text').textContent = question.question;
    const legend = document.createElement('legend');
    legend.className = 'sr-only';
    legend.textContent = '選擇答案';
    $('options').replaceChildren(legend, ...question.options.map(option => {
      const label = document.createElement('label');
      label.className = 'option';
      const input = document.createElement('input');
      input.type = 'radio'; input.name = 'answer'; input.value = option.label;
      input.checked = state.answers[current] === option.label;
      const letter = document.createElement('span');
      letter.className = 'option-letter'; letter.textContent = option.label;
      const text = document.createElement('span'); text.textContent = option.text;
      input.addEventListener('change', () => {
        if (!ensureActive()) return;
        state.answers[current] = option.label;
        save();
        // Keep the radio DOM intact so keyboard navigation and focus are preserved.
        const nav = $('question-nav').children[current];
        nav.classList.add('answered');
        nav.setAttribute('aria-label', `第 ${current + 1} 題，已作答`);
        $('progress').textContent = `已作答 ${state.answers.filter(Boolean).length} / 20 題`;
      });
      label.append(input, letter, text);
      return label;
    }));
    $('previous').disabled = current === 0;
    $('next').textContent = current === 19 ? '檢查並交卷 →' : '下一題 →';
  }
  function ensureActive() {
    if (!state || state.finishedAt !== null) return false;
    if (Date.now() >= state.deadline) { finish('timeout'); return false; }
    return true;
  }
  function navigate(index) {
    if (!ensureActive()) return;
    state.current = index;
    save(); renderQuestion(); focusQuestion();
  }
  function tick() {
    if (!state || state.finishedAt !== null) return;
    const seconds = rules.remaining(state.deadline);
    $('timer').textContent = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
    $('timer-box').classList.toggle('urgent', seconds <= 300);
    if (seconds === 0) finish('timeout');
  }
  function requestSubmit() {
    if (!ensureActive()) return;
    const missing = state.answers.filter(a => !a).length;
    $('submit-message').textContent = missing ? `還有 ${missing} 題未作答，未作答以 0 分計算。交卷後無法修改答案。` : '已完成全部 20 題。交卷後無法修改答案。';
    $('submit-dialog').showModal();
  }
  function finish(reason) {
    if (!state || state.finishedAt !== null) return;
    state.finishedAt = Math.min(Date.now(), state.deadline);
    state.reason = reason;
    clearInterval(interval);
    if ($('submit-dialog').open) $('submit-dialog').close();
    save(); renderResults();
    window.scrollTo(0, 0);
    $('result-heading').tabIndex = -1;
    $('result-heading').focus({ preventScroll: true });
  }
  function renderResults() {
    showScreen('results');
    const result = rules.grade(questions(), state.answers);
    $('score').textContent = result.score;
    $('result-stats').textContent = `答對 ${result.correct} 題 · 答錯 ${result.wrong} 題 · 未作答 ${result.unanswered} 題`;
    const elapsed = Math.floor((state.finishedAt - state.startedAt) / 1000);
    $('finish-reason').textContent = `${state.reason === 'timeout' ? '時間到，已自動交卷' : '已交卷'} · 用時 ${Math.floor(elapsed / 60)} 分 ${elapsed % 60} 秒`;
    $('review-list').replaceChildren(...result.items.map((item, index) => {
      const card = document.createElement('article');
      card.className = 'card review-card';
      const header = document.createElement('div'); header.className = 'review-meta';
      const source = document.createElement('span'); source.textContent = `第 ${index + 1} 題 · ${item.question.chapter} · 原題 ${item.question.number}`;
      const badge = document.createElement('strong'); badge.className = 'badge ' + (item.isCorrect ? 'correct' : 'incorrect');
      badge.textContent = item.isCorrect ? '✓ 正確 · 5 分' : item.selected ? '✕ 錯誤 · 0 分' : '未作答 · 0 分';
      header.append(source, badge);
      const title = document.createElement('h3'); title.textContent = item.question.question;
      const options = document.createElement('ul'); options.className = 'review-options';
      for (const option of item.question.options) {
        const li = document.createElement('li');
        li.textContent = `(${option.label}) ${option.text}`;
        if (option.label === item.question.answer) { li.classList.add('right-answer'); li.textContent += ' ✓ 正確答案'; }
        if (option.label === item.selected) { li.textContent += ' ← 你的答案'; if (!item.isCorrect) li.classList.add('wrong-answer'); }
        options.append(li);
      }
      const answer = document.createElement('p'); answer.className = 'answer-summary';
      answer.textContent = `你的答案：${item.selected || '未作答'}　／　正確答案：${item.question.answer}`;
      card.append(header, title, options, answer);
      return card;
    }));
  }
  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (!stored) return;
      const valid = Array.isArray(stored.ids) && stored.ids.length === 20 && new Set(stored.ids).size === 20 && stored.ids.every(id => bank.some(q => q.id === id)) && Array.isArray(stored.answers) && stored.answers.length === 20 && stored.answers.every(a => a === null || /^[A-D]$/.test(a)) && Number.isInteger(stored.current) && stored.current >= 0 && stored.current < 20 && Number.isFinite(stored.startedAt) && stored.deadline === stored.startedAt + rules.DURATION && (stored.finishedAt === null || (Number.isFinite(stored.finishedAt) && stored.finishedAt >= stored.startedAt && stored.finishedAt <= stored.deadline && ['manual', 'timeout'].includes(stored.reason)));
      if (!valid) { localStorage.removeItem(storageKey); return; }
      state = stored;
      if (state.finishedAt !== null) { renderResults(); return; }
      showScreen('exam'); renderQuestion(); tick();
      if (state.finishedAt === null) interval = setInterval(tick, 1000);
    } catch { $('storage-notice').hidden = false; }
  }
  $('start').addEventListener('click', start);
  $('restart').addEventListener('click', start);
  $('previous').addEventListener('click', () => navigate(Math.max(0, state.current - 1)));
  $('next').addEventListener('click', () => state.current === 19 ? requestSubmit() : navigate(state.current + 1));
  $('submit').addEventListener('click', requestSubmit);
  $('cancel-submit').addEventListener('click', () => $('submit-dialog').close());
  $('confirm-submit').addEventListener('click', () => { if (ensureActive()) finish('manual'); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.addEventListener('pageshow', tick);
  restore();
})();
