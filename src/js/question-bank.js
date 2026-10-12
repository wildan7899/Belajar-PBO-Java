/**
 * question-bank.js - Question Repository & Filtering
 * Manages access to all authentic PBO exam questions, filtering, and randomization.
 */

import { INITIAL_QUESTIONS } from './data-store.js';

export const QuestionBank = {
  questions: [...INITIAL_QUESTIONS],

  getAllQuestions() {
    return this.questions;
  },

  getQuestionById(id) {
    return this.questions.find(q => q.id === id) || null;
  },

  getTopics() {
    const topicSet = new Set();
    this.questions.forEach(q => {
      if (q.topic) topicSet.add(q.topic);
    });
    return Array.from(topicSet);
  },

  filterQuestions({ topics = [], difficulties = [], limit = null } = {}) {
    let result = this.questions;

    if (topics && topics.length > 0) {
      result = result.filter(q => topics.includes(q.topic));
    }

    if (difficulties && difficulties.length > 0) {
      result = result.filter(q => difficulties.includes(q.difficulty));
    }

    if (limit && limit > 0) {
      result = result.slice(0, limit);
    }

    return result;
  },

  /**
   * Generates a randomized exam paper.
   */
  generateExamSet({ topics = [], questionCount = 10, shuffle = true } = {}) {
    let pool = [...this.questions];

    if (topics && topics.length > 0) {
      pool = pool.filter(q => topics.includes(q.topic));
    }

    if (shuffle) {
      // Fisher-Yates shuffle algorithm
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
    }

    const count = Math.min(questionCount, pool.length);
    return pool.slice(0, count);
  },

  /**
   * Retrieves specific questions by ID list (useful for re-taking missed questions).
   */
  getQuestionsByIds(ids = []) {
    return this.questions.filter(q => ids.includes(q.id));
  }
};
