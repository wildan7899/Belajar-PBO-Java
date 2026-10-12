/**
 * storage.js - Local Storage Management & Session Persistence
 * Manages study progress, settings, exam history, active exam sessions, and backup (export/import).
 */

const STORAGE_KEYS = {
  THEME: 'pbo_app_theme',
  STUDIED_TOPICS: 'pbo_studied_topics',
  EXAM_HISTORY: 'pbo_exam_history',
  ACTIVE_SESSION: 'pbo_active_session',
  TOPIC_MASTERY: 'pbo_topic_mastery',
  RECENT_TOPICS: 'pbo_recent_topics'
};

const RECENT_TOPICS_LIMIT = 6;

export const Storage = {
  // Theme management
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'dark';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  // Studied topics progress
  getStudiedTopics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDIED_TOPICS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading studied topics:', e);
      return [];
    }
  },

  toggleTopicStudied(topicId) {
    const list = this.getStudiedTopics();
    const index = list.indexOf(topicId);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(topicId);
    }
    localStorage.setItem(STORAGE_KEYS.STUDIED_TOPICS, JSON.stringify(list));
    return list.includes(topicId);
  },

  isTopicStudied(topicId) {
    return this.getStudiedTopics().includes(topicId);
  },

  // Recently opened materials (for the dashboard "Materi Terakhir Dibuka" list)
  getRecentTopics() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECENT_TOPICS);
      const parsed = data ? JSON.parse(data) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },

  /**
   * @param {{ id: string, chapter: string, title: string }} topic
   */
  pushRecentTopic(topic) {
    if (!topic || !topic.id) return;
    const list = this.getRecentTopics().filter(t => t.id !== topic.id);
    list.unshift({ id: topic.id, chapter: topic.chapter || '', title: topic.title || topic.id });
    const trimmed = list.slice(0, RECENT_TOPICS_LIMIT);
    try {
      localStorage.setItem(STORAGE_KEYS.RECENT_TOPICS, JSON.stringify(trimmed));
    } catch (e) {
      // Storage full or unavailable - recent list is non-critical
    }
    return trimmed;
  },

  clearRecentTopics() {
    localStorage.removeItem(STORAGE_KEYS.RECENT_TOPICS);
  },

  // Exam History
  getExamHistory() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXAM_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error reading exam history:', e);
      return [];
    }
  },

  saveExamResult(result) {
    const history = this.getExamHistory();
    const entry = {
      id: 'EXAM-' + Date.now(),
      date: new Date().toISOString(),
      ...result
    };
    history.unshift(entry); // newest first
    // Limit to last 50 exams to prevent storage overflow
    if (history.length > 50) history.pop();
    localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(history));

    // Update topic mastery
    this.updateTopicMastery(result.topicScores);

    // Clear active session once completed
    this.clearActiveSession();
    return entry;
  },

  // Active exam session (to survive browser refresh)
  getActiveSession() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading active session:', e);
      return null;
    }
  },

  saveActiveSession(sessionData) {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(sessionData));
    } catch (e) {
      console.error('Error saving active session:', e);
    }
  },

  clearActiveSession() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // Topic mastery tracking
  getTopicMastery() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOPIC_MASTERY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  updateTopicMastery(topicScores) {
    if (!topicScores) return;
    const mastery = this.getTopicMastery();

    for (const [topic, scoreData] of Object.entries(topicScores)) {
      if (!mastery[topic]) {
        mastery[topic] = { totalAttempts: 0, totalCorrect: 0, totalPossible: 0 };
      }
      mastery[topic].totalAttempts += 1;
      mastery[topic].totalCorrect += scoreData.earned;
      mastery[topic].totalPossible += scoreData.possible;
    }

    localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(mastery));
  },

  // Export all application data as downloadable JSON
  exportData() {
    const dump = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      theme: this.getTheme(),
      studiedTopics: this.getStudiedTopics(),
      examHistory: this.getExamHistory(),
      topicMastery: this.getTopicMastery(),
      recentTopics: this.getRecentTopics()
    };
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pbo-simulator-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import data with validation
  importData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Format JSON tidak valid.');
      }
      if (parsed.theme) this.setTheme(parsed.theme);
      if (Array.isArray(parsed.studiedTopics)) {
        localStorage.setItem(STORAGE_KEYS.STUDIED_TOPICS, JSON.stringify(parsed.studiedTopics));
      }
      if (Array.isArray(parsed.examHistory)) {
        localStorage.setItem(STORAGE_KEYS.EXAM_HISTORY, JSON.stringify(parsed.examHistory));
      }
      if (parsed.topicMastery && typeof parsed.topicMastery === 'object') {
        localStorage.setItem(STORAGE_KEYS.TOPIC_MASTERY, JSON.stringify(parsed.topicMastery));
      }
      if (Array.isArray(parsed.recentTopics)) {
        localStorage.setItem(STORAGE_KEYS.RECENT_TOPICS, JSON.stringify(parsed.recentTopics.slice(0, RECENT_TOPICS_LIMIT)));
      }
      return { success: true, message: 'Data berhasil diimpor sepenuhnya!' };
    } catch (e) {
      return { success: false, message: 'Gagal mengimpor data: ' + e.message };
    }
  },

  // Reset all application data
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.STUDIED_TOPICS);
    localStorage.removeItem(STORAGE_KEYS.EXAM_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    localStorage.removeItem(STORAGE_KEYS.TOPIC_MASTERY);
    localStorage.removeItem(STORAGE_KEYS.RECENT_TOPICS);
  }
};
