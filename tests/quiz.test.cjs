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
  }
  assert.equal(JSON.stringify(bank), before);
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
