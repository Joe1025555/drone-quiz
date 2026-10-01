const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const quiz = require('../site/quiz.js');
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(require.resolve('../site/questions.js'), 'utf8'), sandbox);
const bank = sandbox.window.QUESTION_BANK;

test('question bank has 388 valid questions across four chapters', () => {
  assert.equal(bank.length, 388);
  assert.equal(new Set(bank.map(q => q.id)).size, 388);
  assert.equal(new Set(bank.map(q => q.chapter)).size, 4);
  for (const q of bank) {
    assert.ok(q.question.length > 0);
    assert.equal(q.options.map(o => o.label).join(''), 'ABCD');
    assert.ok(q.options.every(o => o.text && !o.text.includes('✅')));
    assert.ok(q.options.some(o => o.label === q.answer));
  }
});
test('sampling returns 20 unique source questions without changing the bank', () => {
  const before = JSON.stringify(bank);
  for (let i = 0; i < 100; i++) {
    const selected = quiz.sample(bank);
    assert.equal(selected.length, 20);
    assert.equal(new Set(selected.map(q => q.id)).size, 20);
    assert.ok(selected.every(q => bank.includes(q)));
    const chapters = Array.from(new Set(bank.map(q => q.chapter)));
    assert.deepEqual(chapters.map(chapter => selected.filter(q => q.chapter === chapter).length), [5, 9, 4, 2]);
  }
  assert.equal(JSON.stringify(bank), before);
});
test('chapter allocation is independent of question ordering', () => {
  const selected = quiz.sample(bank.slice().reverse());
  for (const [chapter, expected] of [['第一章 民用航空法及相關法規', 5], ['第二章 基礎飛行原理', 9], ['第三章 氣象', 4], ['第四章 緊急處置與飛行決策', 2]]) {
    assert.equal(selected.filter(q => q.chapter === chapter).length, expected);
  }
});
test('scores award five points only for correct answers', () => {
  const selected = quiz.sample(bank);
  assert.equal(quiz.grade(selected, selected.map(q => q.answer)).score, 100);
  const mixed = selected.map((q, i) => i < 10 ? q.answer : i < 15 ? q.options.find(o => o.label !== q.answer).label : null);
  const result = quiz.grade(selected, mixed);
  assert.equal(result.score, 50);
  assert.equal(result.correct, 10);
  assert.equal(result.wrong, 5);
  assert.equal(result.unanswered, 5);
  assert.equal(quiz.grade(selected, Array(20).fill(null)).score, 0);
});
test('deadline stays at 30 minutes and expires even after a delayed tick', () => {
  const start = 123000;
  const deadline = start + quiz.DURATION;
  assert.equal(quiz.remaining(deadline, start), 1800);
  assert.equal(quiz.remaining(deadline, deadline - 1), 1);
  assert.equal(quiz.remaining(deadline, deadline), 0);
  assert.equal(quiz.remaining(deadline, deadline + 60000), 0);
});
test('practice handles small mistake banks and caps large banks at 20', () => {
  const small = bank.slice(0, 3);
  const selected = quiz.practice(small);
  assert.equal(selected.length, 3);
  assert.equal(new Set(selected.map(q => q.id)).size, 3);
  assert.ok(selected.every(q => small.includes(q)));
  assert.equal(quiz.grade(selected, selected.map(q => q.answer)).score, 15);
  assert.equal(quiz.practice(bank).length, 20);
  assert.equal(quiz.practice([]).length, 0);
});
test('full chapter practice includes every question exactly once without altering the bank', () => {
  for (const chapter of new Set(bank.map(q => q.chapter))) {
    const pool = bank.filter(q => q.chapter === chapter);
    const before = JSON.stringify(pool);
    const selected = quiz.practice(pool, pool.length);
    assert.equal(selected.length, pool.length);
    assert.equal(new Set(selected.map(q => q.id)).size, pool.length);
    assert.ok(selected.every(q => q.chapter === chapter));
    assert.equal(JSON.stringify(pool), before);
    assert.equal(quiz.grade(selected, selected.map(q => q.answer)).score, pool.length * 5);
  }
});
test('each question has an explanation with HTTPS reference sources', () => {
  const context = { window: {} };
  vm.runInNewContext(fs.readFileSync(require.resolve('../site/explanations-data.js'), 'utf8'), context);
  const explanations = context.window.QUESTION_EXPLANATIONS;
  assert.equal(Object.keys(explanations).length, bank.length);
  for (const question of bank) {
    const explanation = explanations[question.id];
    assert.ok(typeof explanation.text === 'string' && explanation.text.length > 10);
    assert.ok(explanation.sources.length > 0);
    assert.ok(explanation.sources.every(source => source.title && source.url.startsWith('https://')));
  }
});
