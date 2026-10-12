/**
 * grading.js - Independent Java Fill-in-the-Blanks Evaluation Engine
 * Handles normalization, whitespace handling, exact & flexible semantic matching,
 * partial credit calculation, and topic analysis.
 */

export const GradingEngine = {
  /**
   * Normalizes code snippet for safe semantic comparison without losing significant meaning.
   * - Trims edge whitespace
   * - Normalizes multiple spaces/tabs into single space
   * - Preserves symbols and keywords
   */
  normalizeAnswer(input) {
    if (typeof input !== 'string') return '';
    let val = input.trim();
    // Normalize consecutive whitespace
    val = val.replace(/\s+/g, ' ');
    // Handle specific token spacing (e.g. "this . nama" -> "this.nama", "[] []" -> "[][]")
    val = val.replace(/\s*\.\s*/g, '.');
    val = val.replace(/\[\s*\]\s*\[\s*\]/g, '[][]');
    return val;
  },

  /**
   * Evaluates a single blank input.
   * @param {string} userAnswer - The user's input string for this blank
   * @param {Object} blankDef - The blank definition object from questions.json
   * @returns {Object} result containing status ('CORRECT'|'INCORRECT'|'EMPTY'), score, feedback
   */
  evaluateBlank(userAnswer, blankDef) {
    const rawAnswer = (userAnswer || '').trim();
    const normalizedUser = this.normalizeAnswer(rawAnswer);
    const maxPoints = blankDef.points || 5;

    // Check if unanswered
    if (!rawAnswer) {
      return {
        blankId: blankDef.id,
        label: blankDef.label,
        status: 'EMPTY',
        userAnswer: '',
        expectedAnswer: blankDef.expectedAnswer,
        pointsEarned: 0,
        maxPoints: maxPoints,
        explanation: blankDef.explanation || 'Bagian ini belum dijawab.'
      };
    }

    // List of all accepted representations
    const normalizedExpected = this.normalizeAnswer(blankDef.expectedAnswer);
    const normalizedAccepted = (blankDef.acceptedAnswers || []).map(a => this.normalizeAnswer(a));

    const isMatch = (normalizedUser === normalizedExpected) || normalizedAccepted.includes(normalizedUser);

    if (isMatch) {
      return {
        blankId: blankDef.id,
        label: blankDef.label,
        status: 'CORRECT',
        userAnswer: rawAnswer,
        expectedAnswer: blankDef.expectedAnswer,
        pointsEarned: maxPoints,
        maxPoints: maxPoints,
        explanation: blankDef.explanation || 'Jawaban tepat!'
      };
    }

    return {
      blankId: blankDef.id,
      label: blankDef.label,
      status: 'INCORRECT',
      userAnswer: rawAnswer,
      expectedAnswer: blankDef.expectedAnswer,
      pointsEarned: 0,
      maxPoints: maxPoints,
      explanation: blankDef.explanation || `Jawaban yang diharapkan: "${blankDef.expectedAnswer}"`
    };
  },

  /**
   * Evaluates an entire question containing one or more blanks.
   * Computes partial score if only some blanks are correct.
   * @param {Object} question - Question object from question bank
   * @param {Object} userAnswersForQuestion - Map of blankId -> userAnswer
   */
  evaluateQuestion(question, userAnswersForQuestion = {}) {
    const blankResults = [];
    let questionPointsEarned = 0;
    let questionMaxPoints = 0;
    let hasIncorrect = false;
    let hasEmpty = false;

    question.blankDefinitions.forEach(blankDef => {
      const userAnswer = userAnswersForQuestion[blankDef.id] || '';
      const result = this.evaluateBlank(userAnswer, blankDef);
      blankResults.push(result);
      
      questionPointsEarned += result.pointsEarned;
      questionMaxPoints += result.maxPoints;

      if (result.status === 'INCORRECT') hasIncorrect = true;
      if (result.status === 'EMPTY') hasEmpty = true;
    });

    // Question overall status
    let questionStatus = 'CORRECT';
    if (questionPointsEarned === 0 && hasEmpty && !hasIncorrect) {
      questionStatus = 'EMPTY';
    } else if (questionPointsEarned < questionMaxPoints) {
      questionStatus = questionPointsEarned > 0 ? 'PARTIAL' : 'INCORRECT';
    }

    return {
      questionId: question.id,
      title: question.title,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      status: questionStatus,
      pointsEarned: questionPointsEarned,
      maxPoints: questionMaxPoints,
      blankResults: blankResults,
      explanation: question.explanation,
      commonMistakes: question.commonMistakes,
      sourceFile: question.sourceFile,
      sourceLocation: question.sourceLocation
    };
  },

  /**
   * Evaluates an entire exam or practice session.
   * @param {Array} questions - Array of questions evaluated
   * @param {Object} allUserAnswers - Map of questionId -> { blankId: answer }
   */
  evaluateExam(questions, allUserAnswers = {}) {
    let totalScore = 0;
    let maxScore = 0;
    let totalCorrectBlanks = 0;
    let totalIncorrectBlanks = 0;
    let totalEmptyBlanks = 0;
    let totalBlanks = 0;

    const topicScores = {};
    const questionEvaluations = [];

    questions.forEach(q => {
      const qAnswers = allUserAnswers[q.id] || {};
      const evalResult = this.evaluateQuestion(q, qAnswers);
      questionEvaluations.push(evalResult);

      totalScore += evalResult.pointsEarned;
      maxScore += evalResult.maxPoints;

      // Track blank counts
      evalResult.blankResults.forEach(br => {
        totalBlanks++;
        if (br.status === 'CORRECT') totalCorrectBlanks++;
        else if (br.status === 'INCORRECT') totalIncorrectBlanks++;
        else totalEmptyBlanks++;
      });

      // Track by topic
      const topic = q.topic || 'Umum';
      if (!topicScores[topic]) {
        topicScores[topic] = { earned: 0, possible: 0, correctQuestions: 0, totalQuestions: 0 };
      }
      topicScores[topic].earned += evalResult.pointsEarned;
      topicScores[topic].possible += evalResult.maxPoints;
      topicScores[topic].totalQuestions += 1;
      if (evalResult.status === 'CORRECT') {
        topicScores[topic].correctQuestions += 1;
      }
    });

    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    // Identify weak topics (topics with score < 70%)
    const weakTopics = [];
    for (const [topic, data] of Object.entries(topicScores)) {
      const topicPct = data.possible > 0 ? Math.round((data.earned / data.possible) * 100) : 0;
      if (topicPct < 70) {
        weakTopics.push({ topic, percentage: topicPct, details: data });
      }
    }

    return {
      totalScore,
      maxScore,
      percentage,
      totalBlanks,
      totalCorrectBlanks,
      totalIncorrectBlanks,
      totalEmptyBlanks,
      questionEvaluations,
      topicScores,
      weakTopics
    };
  }
};
