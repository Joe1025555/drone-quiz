/* Shared exam rules, also used by the automated checks. */
(function (root) {
  'use strict';
  const COUNT = 20;
  const POINTS = 5;
  const DURATION = 30 * 60 * 1000;
  function shuffle(items, random) {
    const pool = items.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }
  function sample(bank, random = Math.random) {
    if (bank.length < COUNT) throw new Error('題庫不足 20 題');
    const groups = new Map();
    for (const question of bank) {
      if (!groups.has(question.chapter)) groups.set(question.chapter, []);
      groups.get(question.chapter).push(question);
    }
    // Largest remainder allocation: chapter sizes 91/172/82/43 become 5/9/4/2.
    const allocations = Array.from(groups.values(), questions => {
      const quota = questions.length / bank.length * COUNT;
      return { questions, count: Math.floor(quota), remainder: quota - Math.floor(quota) };
    });
    const extra = COUNT - allocations.reduce((sum, group) => sum + group.count, 0);
    const ranked = allocations.slice().sort((a, b) => b.remainder - a.remainder);
    for (let i = 0; i < extra; i++) ranked[i].count++;
    const selected = allocations.flatMap(group => shuffle(group.questions, random).slice(0, group.count));
    return shuffle(selected, random);
  }
  function remaining(deadline, now = Date.now()) {
    return Math.max(0, Math.ceil((deadline - now) / 1000));
  }
  function grade(questions, answers) {
    let correct = 0;
    let unanswered = 0;
    const items = questions.map((question, i) => {
      const selected = answers[i] || null;
      const isCorrect = selected === question.answer;
      if (isCorrect) correct++;
      if (!selected) unanswered++;
      return { question, selected, isCorrect };
    });
    return { score: correct * POINTS, correct, unanswered, wrong: questions.length - correct - unanswered, items };
  }
  function practice(bank, count = COUNT, random = Math.random) {
    if (!Number.isInteger(count) || count < 0) throw new Error('練習題數必須為非負整數');
    return shuffle(bank, random).slice(0, count);
  }
  const api = { COUNT, POINTS, DURATION, sample, practice, remaining, grade };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Quiz = api;
})(typeof window !== 'undefined' ? window : globalThis);
