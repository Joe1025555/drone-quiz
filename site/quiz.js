/* Shared exam rules, also used by the automated checks. */
(function (root) {
  'use strict';
  const COUNT = 20;
  const POINTS = 5;
  const DURATION = 30 * 60 * 1000;
  function sample(bank, random = Math.random) {
    if (bank.length < COUNT) throw new Error('題庫不足 20 題');
    const pool = bank.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, COUNT);
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
  const api = { COUNT, POINTS, DURATION, sample, remaining, grade };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Quiz = api;
})(typeof window !== 'undefined' ? window : globalThis);
