/**
 * test-suite.js - Comprehensive Automated Verification Test
 * Tests Question Bank integrity, Grading Engine logic, and Data Store.
 */

import { INITIAL_MATERIALS, INITIAL_QUESTIONS } from '../src/js/data-store.js';
import { GradingEngine } from '../src/js/grading.js';
import { QuestionBank } from '../src/js/question-bank.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('1. TESTING QUESTION BANK & SOURCE REFERENCES');
console.log('====================================================');

assert(INITIAL_QUESTIONS.length >= 20, `Question count is sufficient: ${INITIAL_QUESTIONS.length}`);
assert(INITIAL_MATERIALS.length === 6, `Materials chapters count is 6: ${INITIAL_MATERIALS.length}`);

let allPlaceholdersValid = true;
let totalBlanksCount = 0;

INITIAL_QUESTIONS.forEach(q => {
  // Check required fields
  assert(!!q.id, `Question has valid ID: ${q.id}`);
  assert(!!q.topic, `Question ${q.id} has topic: ${q.topic}`);
  assert(!!q.sourceFile, `Question ${q.id} has source file reference: ${q.sourceFile}`);
  assert(!!q.sourceLocation, `Question ${q.id} has source slide reference: ${q.sourceLocation}`);
  assert(q.blankDefinitions && q.blankDefinitions.length > 0, `Question ${q.id} has blank definitions`);

  // Verify that every blank definition matches a placeholder in codeTemplate
  q.blankDefinitions.forEach(b => {
    totalBlanksCount++;
    const placeholder = `/* ${b.id} */`;
    const found = q.codeTemplate.includes(placeholder);
    if (!found) {
      console.error(`Mismatch in ${q.id}: placeholder ${placeholder} not found in codeTemplate!`);
      allPlaceholdersValid = false;
    }
    assert(!!b.expectedAnswer, `Blank ${b.id} in ${q.id} has expected answer: "${b.expectedAnswer}"`);
    assert(b.points > 0, `Blank ${b.id} has positive points: ${b.points}`);
  });
});

assert(allPlaceholdersValid, `All ${totalBlanksCount} blanks across all questions match /* BLANK_X */ in code template`);

console.log('\n====================================================');
console.log('2. TESTING GRADING ENGINE & NORMALIZATION');
console.log('====================================================');

// Test 1: Normalization & exact match
const blankSample1 = {
  id: 'BLANK_1',
  label: 'Return type',
  expectedAnswer: 'void',
  acceptedAnswers: ['void'],
  points: 5
};

const resExact = GradingEngine.evaluateBlank('void', blankSample1);
assert(resExact.status === 'CORRECT' && resExact.pointsEarned === 5, 'Exact match returns CORRECT with full points');

const resSpaces = GradingEngine.evaluateBlank('   void   ', blankSample1);
assert(resSpaces.status === 'CORRECT' && resSpaces.pointsEarned === 5, 'Trims edge whitespace properly');

const resEmpty = GradingEngine.evaluateBlank('', blankSample1);
assert(resEmpty.status === 'EMPTY' && resEmpty.pointsEarned === 0, 'Empty string returns EMPTY with 0 points');

const resWrong = GradingEngine.evaluateBlank('int', blankSample1);
assert(resWrong.status === 'INCORRECT' && resWrong.pointsEarned === 0, 'Wrong string returns INCORRECT with 0 points');

// Test 2: Multi-blank question & Partial credit
const testQuestion = {
  id: 'TEST-Q',
  title: 'Test Title',
  topic: 'Bab 1: Pengantar PBO & Bahasa Java',
  codeTemplate: 'class Test { /* BLANK_1 */ /* BLANK_2 */ }',
  blankDefinitions: [
    { id: 'BLANK_1', expectedAnswer: 'public', points: 5 },
    { id: 'BLANK_2', expectedAnswer: 'static', points: 5 }
  ],
  explanation: 'Test Explanation',
  points: 10
};

// 1 correct, 1 wrong -> PARTIAL (5/10)
const partialEval = GradingEngine.evaluateQuestion(testQuestion, {
  BLANK_1: 'public',
  BLANK_2: 'final' // wrong
});
assert(partialEval.status === 'PARTIAL', 'Status is PARTIAL when 1 of 2 blanks is correct');
assert(partialEval.pointsEarned === 5, `Points earned is 5 of 10: ${partialEval.pointsEarned}`);

// 2 correct -> CORRECT (10/10)
const fullEval = GradingEngine.evaluateQuestion(testQuestion, {
  BLANK_1: 'public',
  BLANK_2: 'static'
});
assert(fullEval.status === 'CORRECT' && fullEval.pointsEarned === 10, 'Status is CORRECT when all blanks correct');

// Exam evaluation with multiple questions & topic breakdown
const examEval = GradingEngine.evaluateExam([testQuestion], {
  'TEST-Q': { BLANK_1: 'public', BLANK_2: 'static' }
});
assert(examEval.totalScore === 10, `Exam total score is 10: ${examEval.totalScore}`);
assert(examEval.percentage === 100, `Exam percentage is 100%: ${examEval.percentage}`);
assert(!!examEval.topicScores['Bab 1: Pengantar PBO & Bahasa Java'], 'Topic breakdown contains Bab 1');

console.log('\n====================================================');
console.log('3. TESTING QUESTION BANK FILTERING & SHUFFLING');
console.log('====================================================');

const bab1Questions = QuestionBank.filterQuestions({ topics: ['Bab 1: Pengantar PBO & Bahasa Java'] });
assert(bab1Questions.length > 0, `Filter by Bab 1 returns questions: ${bab1Questions.length}`);

const easyQuestions = QuestionBank.filterQuestions({ difficulties: ['Mudah'] });
assert(easyQuestions.length > 0, `Filter by Mudah returns questions: ${easyQuestions.length}`);

const examSet = QuestionBank.generateExamSet({ questionCount: 5, shuffle: true });
assert(examSet.length === 5, `Generated exam set has requested count: ${examSet.length}`);

console.log('\n====================================================');
console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All automated tests passed with 100% success!');
}
