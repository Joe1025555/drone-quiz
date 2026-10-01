(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const bank = window.QUESTION_BANK;
  const rules = window.Quiz;
  const storageKey = 'drone-quiz-1150202-v1';
  let state = null;
  let interval = null;
  const mistakeKey = 'drone-quiz-mistakes-1150202';
  let mistakes = new Set();
  try {
    const ids = JSON.parse(localStorage.getItem(mistakeKey));
    if (Array.isArray(ids)) mistakes = new Set(ids.filter(id => bank.some(q => q.id === id)));
  } catch { $('storage-notice').hidden = false; }
  function updatePracticeControls() {
    for (const id of ['start-mistakes', 'result-mistakes']) {
      if ($(id)) { $(id).disabled = mistakes.size === 0; $(id).textContent = `錯題重練（${mistakes.size} 題）`; }
    }
    $('mistake-count').textContent = mistakes.size ? `目前累積 ${mistakes.size} 題。答對會移出錯題本，進度保存在此瀏覽器。` : '完成測驗後，答錯與未作答的題目會自動存到這裡。';
  }
  function recordMistakes() {
    for (const item of rules.grade(questions(), state.answers).items) {
      if (item.isCorrect) mistakes.delete(item.question.id);
      else mistakes.add(item.question.id);
    }
    try { localStorage.setItem(mistakeKey, JSON.stringify([...mistakes])); }
    catch { $('storage-notice').hidden = false; }
    updatePracticeControls();
  }

  function save() {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); }
    catch { $('storage-notice').hidden = false; }
  }
  function questions() { return state.ids.map(id => bank.find(q => q.id === id)); }
  function showScreen(id) {
    for (const screen of ['welcome', 'exam', 'results']) $(screen).hidden = screen !== id;
  }
  function focusQuestion() { $('question-text').focus({ preventScroll: true }); }
  function start(mode = 'exam') {
    const pool = mode === 'mistakes' ? bank.filter(q => mistakes.has(q.id)) : mode === 'chapter' ? bank.filter(q => q.chapter === $('practice-chapter').value) : bank;
    if (!pool.length) return;
    const selected = mode === 'exam' ? rules.sample(pool) : rules.practice(pool);
    clearInterval(interval);
    const now = Date.now();
    state = { ids: selected.map(q => q.id), answers: Array(selected.length).fill(null), flags: Array(selected.length).fill(false), mode, current: 0, startedAt: now, deadline: now + rules.DURATION, finishedAt: null, reason: null };
    save();
    showScreen('exam');
    $('time-alert').textContent = '';
    renderQuestion();
    tick();
    interval = setInterval(tick, 1000);
    window.scrollTo(0, 0);
    focusQuestion();
  }
  function renderQuestion() {
    const current = state.current;
    const question = questions()[current];
    $('exam-mode').textContent = state.mode === 'chapter' ? '章節練習' : state.mode === 'mistakes' ? '錯題重練' : '模擬測驗';
    $('answer-progress').max = state.ids.length;
    $('answer-progress').value = state.answers.filter(Boolean).length;
    $('progress').textContent = `已作答 ${state.answers.filter(Boolean).length} / ${state.ids.length} 題`;
    $('question-nav').replaceChildren(...state.ids.map((id, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = (index + 1) + (state.answers[index] ? ' ✓' : '') + (state.flags[index] ? ' ☆' : '');
      button.className = 'number' + (state.answers[index] ? ' answered' : '') + (index === current ? ' current' : '');
      button.setAttribute('aria-label', `第 ${index + 1} 題，${state.answers[index] ? '已作答' : '未作答'}${state.flags[index] ? '，待確認' : ''}`);
      if (index === current) button.setAttribute('aria-current', 'step');
      button.addEventListener('click', () => navigate(index));
      return button;
    }));
    $('question-position').textContent = `${state.mode === 'chapter' ? '章節練習' : state.mode === 'mistakes' ? '錯題重練' : '模擬測驗'} · 第 ${current + 1} 題 / ${state.ids.length} · 5 分`;
    $('flag-question').setAttribute('aria-pressed', String(state.flags[current]));
    $('flag-question').textContent = state.flags[current] ? '★ 已標記待確認' : '☆ 標記待確認';
    $('next-flagged').disabled = !state.flags.some(Boolean);
    $('flag-count').textContent = `${state.flags.filter(Boolean).length} 題待確認`;
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
        nav.setAttribute('aria-label', `第 ${current + 1} 題，已作答${state.flags[current] ? '，待確認' : ''}`);
        nav.textContent = (current + 1) + ' ✓' + (state.flags[current] ? ' ☆' : '');
        $('answer-progress').value = state.answers.filter(Boolean).length;
        $('progress').textContent = `已作答 ${state.answers.filter(Boolean).length} / ${state.ids.length} 題`;
      });
      label.append(input, letter, text);
      return label;
    }));
    $('previous').disabled = current === 0;
    $('next').textContent = current === state.ids.length - 1 ? '檢查並交卷 →' : '下一題 →';
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
    if (seconds > 0 && seconds <= 300 && !$('time-alert').textContent) $('time-alert').textContent = '剩餘時間少於 5 分鐘，請檢查未作答與待確認題目。';
    if (seconds === 0) finish('timeout');
  }
  function requestSubmit() {
    if (!ensureActive()) return;
    const missing = state.answers.filter(a => !a).length;
    $('submit-message').textContent = (missing ? `還有 ${missing} 題未作答，未作答以 0 分計算。` : `已完成全部 ${state.ids.length} 題。`) + `還有 ${state.flags.filter(Boolean).length} 題標記待確認。交卷後無法修改答案。`;
    $('submit-dialog').showModal();
  }
  function finish(reason) {
    if (!state || state.finishedAt !== null) return;
    state.finishedAt = Math.min(Date.now(), state.deadline);
    state.reason = reason;
    clearInterval(interval);
    if ($('submit-dialog').open) $('submit-dialog').close();
    recordMistakes(); save(); renderResults();
    window.scrollTo(0, 0);
    $('result-heading').tabIndex = -1;
    $('result-heading').focus({ preventScroll: true });
  }
  function renderResults() {
    showScreen('results');
    const result = rules.grade(questions(), state.answers);
    $('score').textContent = result.score;
    $('score').nextElementSibling.textContent = `/ ${state.ids.length * rules.POINTS} 分`;
    $('chapter-stats').replaceChildren(...[...new Set(questions().map(q => q.chapter))].map(chapter => {
      const items = result.items.filter(item => item.question.chapter === chapter);
      const correct = items.filter(item => item.isCorrect).length;
      const row = document.createElement('div'); row.className = 'chapter-stat-row';
      const p = document.createElement('p'); p.textContent = `${chapter}：${correct} / ${items.length} 題答對（${Math.round(correct / items.length * 100)}%）`;
      const progress = document.createElement('progress'); progress.max = items.length; progress.value = correct; progress.setAttribute('aria-label', chapter + '正確率');
      row.append(p, progress); return row;
    }));
    updatePracticeControls();
    $('result-stats').textContent = `答對 ${result.correct} 題 · 答錯 ${result.wrong} 題 · 未作答 ${result.unanswered} 題`;
    const elapsed = Math.floor((state.finishedAt - state.startedAt) / 1000);
    $('finish-reason').textContent = `${state.reason === 'timeout' ? '時間到，已自動交卷' : '已交卷'} · 用時 ${Math.floor(elapsed / 60)} 分 ${elapsed % 60} 秒`;
    $('review-list').replaceChildren(...result.items.map((item, index) => {
      const card = document.createElement('article');
      card.className = 'card review-card';
      card.dataset.correct = String(item.isCorrect);
      const header = document.createElement('div'); header.className = 'review-meta';
      const source = document.createElement('span'); source.textContent = `第 ${index + 1} 題 · ${item.question.chapter} · 原題 ${item.question.number}${state.flags[index] ? ' · ☆ 待確認' : ''}`;
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
    filterReview(false);
  }
  function filterReview(wrongOnly) {
    let visible = 0;
    for (const card of $('review-list').children) {
      card.hidden = wrongOnly && card.dataset.correct === 'true';
      if (!card.hidden) visible++;
    }
    $('review-all').setAttribute('aria-pressed', String(!wrongOnly));
    $('review-wrong').setAttribute('aria-pressed', String(wrongOnly));
    $('review-description').textContent = wrongOnly
      ? `顯示 ${visible} 題錯題（含未作答），保留原測驗題號。`
      : `顯示全部 ${visible} 題的作答與正確答案。`;
    $('review-empty').hidden = !wrongOnly || visible !== 0;
  }
  function restore() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (!stored) return;
      const valid = Array.isArray(stored.ids) && stored.ids.length > 0 && stored.ids.length <= 20 && new Set(stored.ids).size === stored.ids.length && stored.ids.every(id => bank.some(q => q.id === id)) && Array.isArray(stored.answers) && stored.answers.length === stored.ids.length && stored.answers.every(a => a === null || /^[A-D]$/.test(a)) && Number.isInteger(stored.current) && stored.current >= 0 && stored.current < stored.ids.length && Number.isFinite(stored.startedAt) && stored.deadline === stored.startedAt + rules.DURATION && (stored.finishedAt === null || (Number.isFinite(stored.finishedAt) && stored.finishedAt >= stored.startedAt && stored.finishedAt <= stored.deadline && ['manual', 'timeout'].includes(stored.reason)));
      if (!valid) { localStorage.removeItem(storageKey); return; }
      state = stored;
      if (!Array.isArray(state.flags) || state.flags.length !== state.ids.length) state.flags = Array(state.ids.length).fill(false);
      if (state.finishedAt !== null) { renderResults(); return; }
      showScreen('exam'); renderQuestion(); tick();
      if (state.finishedAt === null) interval = setInterval(tick, 1000);
    } catch { $('storage-notice').hidden = false; }
  }
  $('start').addEventListener('click', () => start());
  $('restart').addEventListener('click', () => start());
  $('start-chapter').addEventListener('click', () => start('chapter'));
  $('start-mistakes').addEventListener('click', () => start('mistakes'));
  $('result-mistakes').addEventListener('click', () => start('mistakes'));
  $('practice-home').addEventListener('click', () => { showScreen('welcome'); updatePracticeControls(); window.scrollTo(0, 0); $('practice-chapter').focus({ preventScroll: true }); });
  $('flag-question').addEventListener('click', () => {
    if (!ensureActive()) return;
    state.flags[state.current] = !state.flags[state.current]; save(); renderQuestion();
  });
  $('next-flagged').addEventListener('click', () => {
    for (let step = 1; step <= state.ids.length; step++) {
      const index = (state.current + step) % state.ids.length;
      if (state.flags[index]) { navigate(index); break; }
    }
  });
  $('review-all').addEventListener('click', () => filterReview(false));
  $('review-wrong').addEventListener('click', () => filterReview(true));
  $('previous').addEventListener('click', () => navigate(Math.max(0, state.current - 1)));
  $('next').addEventListener('click', () => state.current === state.ids.length - 1 ? requestSubmit() : navigate(state.current + 1));
  $('submit').addEventListener('click', requestSubmit);
  $('cancel-submit').addEventListener('click', () => $('submit-dialog').close());
  $('confirm-submit').addEventListener('click', () => { if (ensureActive()) finish('manual'); });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
  window.addEventListener('pageshow', tick);
  for (const chapter of new Set(bank.map(q => q.chapter))) {
    const option = document.createElement('option'); option.value = chapter; option.textContent = chapter;
    $('practice-chapter').append(option);
  }
  updatePracticeControls(); restore();
})();
