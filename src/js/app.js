/**
 * app.js - Main Application Coordinator & View Controller
 * Integrates dashboard stats, materials, quiz engine, results, and local persistence.
 */

import { Storage } from './storage.js';
import { MaterialsManager } from './materials.js';
import { QuestionBank } from './question-bank.js';
import { QuizEngine } from './quiz-engine.js';
import { ResultsManager } from './results.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.quizActive = false;
    this.activeMode = null;
    this.init();
  }

  init() {
    // 1. Initialize Theme
    const savedTheme = Storage.getTheme();
    Storage.setTheme(savedTheme);
    this.updateThemeIcon(savedTheme);

    // 2. Setup DOM Listeners
    this.setupSidebar();
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupDataBackupControls();
    this.setupPracticeAndExamForms();

    // 3. Render Dashboard Stats
    this.updateDashboard();

    // 4. Render Materials
    this.setupMaterialsView();

    // 5. Check if there is an unfinished exam session
    this.checkUnfinishedSession();

    // 6. Global event listeners
    window.addEventListener('study-progress-updated', () => {
      this.updateDashboard();
    });
  }

  /** Mobile drawer behaviour for the sidebar. */
  setupSidebar() {
    const toggleBtn = document.getElementById('sidebar-toggle-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    const setOpen = (open) => {
      document.body.classList.toggle('sidebar-open', open);
      toggleBtn?.setAttribute('aria-expanded', String(open));
      backdrop?.classList.toggle('visible', open);
    };

    toggleBtn?.addEventListener('click', () => {
      setOpen(!document.body.classList.contains('sidebar-open'));
    });

    backdrop?.addEventListener('click', () => setOpen(false));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && document.body.classList.contains('sidebar-open')) setOpen(false);
    });

    // Reset drawer state when leaving mobile widths
    window.addEventListener('resize', () => {
      if (window.innerWidth > 820) setOpen(false);
    });
  }

  /** Per-view header title so the topbar always reflects the current page. */
  applyPageHeading(viewName) {
    const map = {
      dashboard: ['Dashboard', 'Ringkasan progres belajar dan hasil ujian kamu'],
      materials: ['Materi', 'Modul kuliah PBO diringkas dari slide resmi UNRAM'],
      practice: ['Mode Latihan', 'Belajar tanpa batas waktu, dengan pembahasan langsung'],
      exam: ['Simulasi Ujian', 'Ujian dengan timer dan soal yang diacak'],
      results: ['Hasil & Pembahasan', 'Evaluasi jawaban per blank beserta pembahasannya'],
      history: ['Riwayat & Data', 'Nilai tersimpan, ekspor, impor, dan reset data lokal']
    };
    const [title, subtitle] = map[viewName] || ['Java PBO', ''];
    const t = document.getElementById('page-title');
    const s = document.getElementById('page-subtitle');
    if (t) t.textContent = title;
    if (s) s.textContent = subtitle;

    document.querySelectorAll('.nav-btn').forEach(btn => {
      const on = btn.getAttribute('data-view') === viewName;
      btn.classList.toggle('active', on);
      if (on) btn.setAttribute('aria-current', 'page');
      else btn.removeAttribute('aria-current');
    });
  }

  // View Navigation
  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.view-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `view-${viewName}`);
    });

    this.applyPageHeading(viewName);

    if (viewName === 'practice' || viewName === 'exam') {
      this.syncQuizArea(viewName);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName === 'dashboard') {
      this.updateDashboard();
    } else if (viewName === 'history') {
      this.renderHistoryView();
    }
  }

  /**
   * Keeps the shared #quiz-active-area element inside the panel that owns the
   * currently running session (practice or exam) and syncs setup/quiz visibility.
   * Without this, starting Practice Mode renders the quiz into the hidden exam
   * panel and the user stays on the practice setup screen.
   *
   * When the requested panel is NOT the one running a session, that panel shows
   * its own setup form so the user never lands on an empty page.
   */
  syncQuizArea(requestedView = null) {
    const view = requestedView || this.activeMode || 'exam';
    const quizArea = document.getElementById('quiz-active-area');
    const examSetup = document.getElementById('quiz-setup-area');
    const practiceSetup = document.getElementById('practice-setup-area');

    const sessionRunning = this.quizActive && !QuizEngine.isSubmitted;
    const showsSession = sessionRunning && view === this.activeMode;

    const panel = showsSession ? document.getElementById(`view-${view}`) : null;
    if (panel && quizArea && quizArea.parentElement !== panel) {
      panel.appendChild(quizArea);
    }

    if (examSetup) examSetup.style.display = (view === 'exam' && !showsSession) ? '' : 'none';
    if (practiceSetup) practiceSetup.style.display = (view === 'practice' && !showsSession) ? '' : 'none';
    if (quizArea) quizArea.style.display = showsSession ? 'block' : 'none';
  }

  /**
   * Asks before leaving a running session. Shared by the nav tabs and the
   * header logo so both paths are guarded.
   */
  confirmLeaveQuiz() {
    if (!this.quizActive || QuizEngine.isSubmitted || QuizEngine.questions.length === 0) return true;

    const modeName = QuizEngine.mode === 'exam' ? 'ujian' : 'latihan';
    const timeNote = QuizEngine.mode === 'exam'
      ? 'Timer tetap berjalan. Sesi akan tersimpan otomatis di browser.'
      : 'Sesi akan tersimpan otomatis di browser.';

    return confirm(`Sesi ${modeName} sedang berjalan! Apakah Anda yakin ingin berpindah halaman?\n${timeNote}`);
  }

  /**
   * Guarded navigation entry point for links outside the nav tabs (header logo).
   */
  requestView(viewName) {
    if (!this.confirmLeaveQuiz()) return;
    this.switchView(viewName);
  }

  setupNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetView = btn.getAttribute('data-view');
        // Prevent leaving a running session without confirmation
        if (targetView !== this.currentView && !this.confirmLeaveQuiz()) {
          return;
        }
        this.switchView(targetView);
      });
    });

    // Dashboard quick action buttons
    document.getElementById('dash-start-study-btn')?.addEventListener('click', () => {
      this.switchView('materials');
    });

    document.getElementById('dash-start-practice-btn')?.addEventListener('click', () => {
      this.switchView('practice');
    });

    document.getElementById('dash-start-exam-btn')?.addEventListener('click', () => {
      this.switchView('exam');
    });

    // Topbar shortcut buttons
    document.querySelectorAll('[data-view-shortcut]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-view-shortcut');
        if (target !== this.currentView && !this.confirmLeaveQuiz()) return;
        this.switchView(target);
      });
    });
  }

  setupThemeToggle() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', () => {
      const current = Storage.getTheme();
      const next = current === 'dark' ? 'light' : 'dark';
      Storage.setTheme(next);
      this.updateThemeIcon(next);
      this.showToast(`Mode tema diubah ke ${next === 'dark' ? 'Gelap 🌙' : 'Terang ☀️'}`);
    });

    // Quick Guide modal toggle
    this.setupQuickGuide();
  }

  setupQuickGuide() {
    const guideBtn = document.getElementById('quick-guide-btn');
    const modal = document.getElementById('quick-guide-modal');
    const closeBtn = document.getElementById('guide-modal-close-btn');
    const okBtn = document.getElementById('guide-modal-ok-btn');

    const open = () => modal?.classList.add('active');
    const close = () => modal?.classList.remove('active');

    guideBtn?.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    okBtn?.addEventListener('click', close);
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) close();
    });
  }

  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠️' : type === 'danger' ? '✗' : 'ℹ️';
    toast.innerHTML = `<span aria-hidden="true">${icon}</span> <span>${this.escapeHtml(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(6px)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  escapeAttr(str) {
    return this.escapeHtml(str).replace(/"/g, '&quot;');
  }

  updateThemeIcon(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // Dashboard Statistics
  updateDashboard() {
    const materials = MaterialsManager.getAllMaterials();
    const questions = QuestionBank.getAllQuestions();
    const history = Storage.getExamHistory();
    const studiedList = Storage.getStudiedTopics();

    const totalSubtopics = materials.reduce((n, m) => n + m.subtopics.length, 0);

    const elChapters = document.getElementById('stat-total-chapters');
    const elSubtopics = document.getElementById('stat-total-subtopics');
    const elQuestions = document.getElementById('stat-total-questions');
    const elStudyProgress = document.getElementById('stat-study-progress');
    const elStudyBar = document.getElementById('stat-study-progress-bar');
    const elLastScore = document.getElementById('stat-last-score');
    const elHighestScore = document.getElementById('stat-highest-score');

    if (elChapters) elChapters.textContent = materials.length;
    if (elSubtopics) elSubtopics.textContent = totalSubtopics;
    if (elQuestions) elQuestions.textContent = questions.length;

    // Study progress percentage (capped so it can never exceed 100 on stale data)
    const validStudied = studiedList.filter(id =>
      materials.some(m => m.subtopics.some(s => s.id === id))
    ).length;
    const studyPct = totalSubtopics > 0
      ? Math.min(100, Math.round((validStudied / totalSubtopics) * 100))
      : 0;
    if (elStudyProgress) elStudyProgress.textContent = `${studyPct}%`;
    if (elStudyBar) elStudyBar.style.width = `${studyPct}%`;

    // Exam scores
    if (history.length > 0) {
      const last = history[0];
      const highest = Math.max(...history.map(h => h.percentage || 0));
      if (elLastScore) elLastScore.textContent = `${last.percentage}%`;
      if (elHighestScore) elHighestScore.textContent = `${highest}%`;
    } else {
      if (elLastScore) elLastScore.textContent = '-';
      if (elHighestScore) elHighestScore.textContent = '-';
    }

    this.renderDashboardWeakTopics();
    this.renderRecentExamsList();
    this.renderDashboardRecentMaterials();
    this.renderDashboardSyllabus();
  }

  renderDashboardSyllabus() {
    const list = document.getElementById('dash-syllabus-list');
    if (!list) return;

    const materials = MaterialsManager.getAllMaterials();
    const studied = Storage.getStudiedTopics();

    list.innerHTML = materials.map(m => {
      const done = m.subtopics.filter(s => studied.includes(s.id)).length;
      return `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--sp-3); padding: var(--sp-2) 0; border-bottom: 1px solid var(--border-subtle);">
          <span style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${this.escapeHtml(m.title)}</span>
          <span class="badge badge-info" style="flex-shrink: 0;">${done}/${m.subtopics.length}</span>
        </div>
      `;
    }).join('');
  }

  renderDashboardRecentMaterials() {
    const container = document.getElementById('dash-recent-materials');
    if (!container) return;

    const recent = Storage.getRecentTopics();

    if (!recent.length) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon" aria-hidden="true">▤</span>
          <strong>Belum ada materi dibuka</strong>
          Buka halaman Materi dan mulai menandai subtopik yang sudah kamu pelajari.
        </div>
      `;
      return;
    }

    container.innerHTML = `<ul class="recent-list">${
      recent.map(t => `
        <li>
          <button class="recent-item" data-subtopic-id="${this.escapeAttr(t.id)}">
            <span class="recent-item-main">
              <span class="recent-item-title">${this.escapeHtml(t.title)}</span>
              <span class="recent-item-meta">${this.escapeHtml(t.chapter || 'Materi PBO')}</span>
            </span>
            <span aria-hidden="true" style="color: var(--text-muted);">→</span>
          </button>
        </li>
      `).join('')
    }</ul>`;

    container.querySelectorAll('.recent-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-subtopic-id');
        this.switchView('materials');
        this.focusSubtopic(id);
      });
    });
  }

  renderDashboardWeakTopics() {
    const container = document.getElementById('dash-weak-topics-container');
    if (!container) return;

    const topicMastery = Storage.getTopicMastery();
    const weakList = [];

    for (const [topic, stats] of Object.entries(topicMastery)) {
      const pct = stats.totalPossible > 0 ? Math.round((stats.totalCorrect / stats.totalPossible) * 100) : 0;
      weakList.push({ topic, pct, attempts: stats.totalAttempts });
    }

    // Sort by lowest percentage
    weakList.sort((a, b) => a.pct - b.pct);

    if (weakList.length === 0) {
      container.innerHTML = `
        <div style="padding: 1rem; text-align: center; color: var(--text-muted); font-size: 0.9rem;">
          Belum ada riwayat ujian. Mulai latihan atau simulasi ujian untuk mendeteksi topik yang perlu dipelajari!
        </div>
      `;
      return;
    }

    container.innerHTML = weakList.map(item => `
      <div class="topic-pill-item ${item.pct >= 75 ? 'good' : ''}">
        <div>
          <div class="topic-pill-title">${item.topic}</div>
          <div class="topic-pill-stats">Tingkat Ketepatan: ${item.pct}% (${item.attempts}x diuji)</div>
        </div>
        <button class="btn btn-sm btn-outline practice-weak-topic-btn" data-topic="${item.topic}">
          Latih Topik
        </button>
      </div>
    `).join('');

    container.querySelectorAll('.practice-weak-topic-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = btn.getAttribute('data-topic');
        this.startPracticeWithTopic(t);
      });
    });
  }

  renderRecentExamsList() {
    const container = document.getElementById('dash-recent-history-table');
    if (!container) return;

    const history = Storage.getExamHistory().slice(0, 5); // top 5
    if (history.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">
            Belum ada riwayat latihan atau simulasi ujian.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = history.map(h => {
      const dateStr = new Date(h.date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
      });
      const modeLabel = h.mode === 'exam' ? 'Simulasi Ujian' : 'Latihan Mandiri';
      return `
        <tr>
          <td>${dateStr}</td>
          <td><span class="badge ${h.mode === 'exam' ? 'badge-info' : 'badge-warning'}">${modeLabel}</span></td>
          <td><strong>${h.percentage}%</strong> (${h.totalScore}/${h.maxScore} Poin)</td>
          <td>
            <button class="btn btn-sm btn-outline view-history-detail-btn" data-exam-id="${h.id}">
              Lihat Evaluasi
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.view-history-detail-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-exam-id');
        this.viewExamHistoryDetail(id);
      });
    });
  }

  // Materials View
  setupMaterialsView() {
    const container = document.getElementById('materials-list-container');
    const searchInput = document.getElementById('materials-search-input');

    const render = () => {
      MaterialsManager.renderMaterials(container, {
        searchTerm: searchInput ? searchInput.value : '',
        onPracticeTopic: (chapterTitle) => {
          this.startPracticeWithTopic(chapterTitle);
        },
        onOpenSubtopic: (topic) => {
          if (!topic) return;
          Storage.pushRecentTopic(topic);
          MaterialsManager.activeSubtopicId = topic.id;
          this.updateMaterialsNav();
        }
      });
    };

    render();

    if (searchInput) {
      searchInput.addEventListener('input', render);
    }

    // Previous / next subtopic navigation
    document.getElementById('materials-prev-btn')?.addEventListener('click', () => {
      const outline = MaterialsManager.getFlatOutline();
      const i = MaterialsManager.getOutlineIndex();
      const target = i > 0 ? outline[i - 1] : outline[outline.length - 1];
      if (target) this.focusSubtopic(target.sub.id);
    });

    document.getElementById('materials-next-btn')?.addEventListener('click', () => {
      const outline = MaterialsManager.getFlatOutline();
      const i = MaterialsManager.getOutlineIndex();
      const target = (i >= 0 && i < outline.length - 1) ? outline[i + 1] : outline[0];
      if (target) this.focusSubtopic(target.sub.id);
    });

    // Default to the most recently opened subtopic so the nav strip is never dead
    const recent = Storage.getRecentTopics();
    if (recent.length) {
      MaterialsManager.activeSubtopicId = recent[0].id;
    }
    this.updateMaterialsNav();
  }

  updateMaterialsNav() {
    const kicker = document.getElementById('materials-nav-kicker');
    const title = document.getElementById('materials-nav-title');
    const prevBtn = document.getElementById('materials-prev-btn');
    const nextBtn = document.getElementById('materials-next-btn');
    if (!kicker || !title) return;

    const outline = MaterialsManager.getFlatOutline();
    const i = MaterialsManager.getOutlineIndex();

    if (i < 0) {
      kicker.textContent = `Ada ${outline.length} subtopik`;
      title.textContent = 'Pilih subtopik di bawah untuk mulai membaca';
    } else {
      const item = outline[i];
      kicker.textContent = `Subtopik ${i + 1} dari ${outline.length} · ${item.chapter.title}`;
      title.textContent = item.sub.title;
    }

    if (prevBtn) prevBtn.disabled = outline.length === 0;
    if (nextBtn) nextBtn.disabled = outline.length === 0;
  }

  /** Expands the owning chapter, scrolls to the subtopic and marks it recent. */
  focusSubtopic(subtopicId) {
    const outline = MaterialsManager.getFlatOutline();
    const index = outline.findIndex(o => o.sub.id === subtopicId);
    if (index < 0) return;

    const item = outline[index];
    MaterialsManager.activeSubtopicId = subtopicId;
    Storage.pushRecentTopic({ id: item.sub.id, chapter: item.chapter.title, title: item.sub.title });

    // Make sure the chapter containing it is expanded
    const header = document.querySelector(`#chapter-card-${item.chapter.id} > .chapter-header`);
    const body = document.querySelector(`#chapter-card-${item.chapter.id} > .subtopics-container`);
    if (header && body && body.style.display !== 'flex') {
      body.style.display = 'flex';
      header.classList.add('expanded');
      header.setAttribute('aria-expanded', 'true');
      const icon = header.querySelector('.toggle-icon');
      if (icon) icon.textContent = '▼';
    }

    const target = document.getElementById(`subtopic-${subtopicId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      target.style.transition = 'border-color .3s ease';
      target.style.borderColor = 'var(--accent)';
      setTimeout(() => { target.style.borderColor = ''; }, 1400);
    }

    this.updateMaterialsNav();
  }

  startPracticeWithTopic(topicTitle) {
    this.switchView('practice');
    // Pre-select topic
    const checkboxes = document.querySelectorAll('.practice-topic-checkbox');
    checkboxes.forEach(cb => {
      cb.checked = (cb.value === topicTitle);
    });
  }

  // Setup Forms (Practice and Exam)
  setupPracticeAndExamForms() {
    // Populate topic checkboxes in Practice & Exam setup
    const topics = QuestionBank.getTopics();

    const practiceTopicsContainer = document.getElementById('practice-topics-selection');
    const examTopicsContainer = document.getElementById('exam-topics-selection');

    if (practiceTopicsContainer) {
      practiceTopicsContainer.innerHTML = topics.map(t => `
        <label class="topic-option">
          <input type="checkbox" class="practice-topic-checkbox" value="${this.escapeAttr(t)}" checked />
          <span>${this.escapeHtml(t)}</span>
        </label>
      `).join('');
    }

    if (examTopicsContainer) {
      examTopicsContainer.innerHTML = topics.map(t => `
        <label class="topic-option">
          <input type="checkbox" class="exam-topic-checkbox" value="${this.escapeAttr(t)}" checked />
          <span>${this.escapeHtml(t)}</span>
        </label>
      `).join('');
    }

    // Start Practice Form
    document.getElementById('start-practice-form-btn')?.addEventListener('click', () => {
      const selectedTopics = Array.from(document.querySelectorAll('.practice-topic-checkbox:checked')).map(cb => cb.value);
      const selectedDiffs = Array.from(document.querySelectorAll('.practice-diff-checkbox:checked')).map(cb => cb.value);
      const count = parseInt(document.getElementById('practice-count-select')?.value || '5', 10);

      if (selectedTopics.length === 0) {
        alert('Silakan pilih minimal satu bab topik materi!');
        return;
      }

      // Filter by topic AND difficulty, then shuffle that filtered pool so the
      // difficulty selection is actually respected (generateExamSet has no
      // difficulty filter, so it must not be used to rebuild the list here).
      let questions = QuestionBank.filterQuestions({
        topics: selectedTopics,
        difficulties: selectedDiffs
      });

      if (questions.length === 0) {
        alert(selectedDiffs.length === 0
          ? 'Pilih minimal satu tingkat kesulitan terlebih dahulu!'
          : 'Tidak ada soal yang sesuai dengan kombinasi filter Anda.');
        return;
      }

      if (selectedDiffs.length === 0) {
        alert('Pilih minimal satu tingkat kesulitan (Mudah / Sedang / Sulit)!');
        return;
      }

      // Fisher-Yates shuffle of the already-filtered pool
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
      questions = questions.slice(0, Math.min(count, questions.length));

      this.launchQuizSession({
        mode: 'practice',
        questions: questions,
        durationMinutes: 0
      });
    });

    // Start Exam Form
    document.getElementById('start-exam-form-btn')?.addEventListener('click', () => {
      const selectedTopics = Array.from(document.querySelectorAll('.exam-topic-checkbox:checked')).map(cb => cb.value);
      const count = parseInt(document.getElementById('exam-count-select')?.value || '10', 10);
      const duration = parseInt(document.getElementById('exam-duration-select')?.value || '15', 10);

      if (selectedTopics.length === 0) {
        alert('Pilih minimal satu bab materi untuk simulasi ujian!');
        return;
      }

      const questions = QuestionBank.generateExamSet({
        topics: selectedTopics,
        questionCount: count,
        shuffle: true
      });

      if (questions.length === 0) {
        alert('Tidak ditemukan soal untuk topik yang dipilih.');
        return;
      }

      this.launchQuizSession({
        mode: 'exam',
        questions: questions,
        durationMinutes: duration
      });
    });
  }

  launchQuizSession({ mode, questions, durationMinutes, savedSession = null }) {
    this.quizActive = true;
    this.activeMode = mode === 'exam' ? 'exam' : 'practice';

    // Mount the shared quiz area into the correct panel before rendering
    this.syncQuizArea(this.activeMode);

    const timerBanner = document.getElementById('exam-timer-banner');
    if (timerBanner) {
      timerBanner.style.display = mode === 'exam' ? 'flex' : 'none';
    }

    QuizEngine.startQuiz({
      mode: mode,
      questions: questions,
      durationMinutes: durationMinutes,
      savedSession: savedSession,
      onComplete: (examResult) => {
        this.displayExamResults(examResult);
      }
    });

    this.switchView(mode === 'exam' ? 'exam' : 'practice');
  }

  displayExamResults(examResult) {
    const resultsContainer = document.getElementById('results-content-area');
    this.quizActive = false;
    this.activeMode = null;
    this.syncQuizArea();
    this.switchView('results');

    ResultsManager.renderResults(resultsContainer, examResult, {
      onRetryMistakes: (mistakenIds) => {
        const retryQuestions = QuestionBank.getQuestionsByIds(mistakenIds);
        if (retryQuestions.length > 0) {
          this.launchQuizSession({
            mode: 'practice',
            questions: retryQuestions,
            durationMinutes: 0
          });
        }
      },
      onNewExam: () => {
        this.quizActive = false;
        this.activeMode = null;
        this.syncQuizArea('exam');
        this.switchView('exam');
      },
      onGoDashboard: () => {
        this.switchView('dashboard');
      }
    });
  }

  viewExamHistoryDetail(examId) {
    const history = Storage.getExamHistory();
    const found = history.find(h => h.id === examId);
    if (found) {
      this.displayExamResults(found);
    }
  }

  checkUnfinishedSession() {
    const active = Storage.getActiveSession();
    if (active && active.questions && active.questions.length > 0) {
      const banner = document.getElementById('resume-session-banner');
      if (banner) {
        banner.style.display = 'block';
        const resumeBtn = document.getElementById('resume-session-btn');
        const discardBtn = document.getElementById('discard-session-btn');

        resumeBtn.onclick = () => {
          banner.style.display = 'none';
          this.launchQuizSession({
            mode: active.mode,
            questions: active.questions,
            savedSession: active
          });
        };

        discardBtn.onclick = () => {
          Storage.clearActiveSession();
          banner.style.display = 'none';
        };
      }
    }
  }

  // History & Data Backup View
  renderHistoryView() {
    const container = document.getElementById('full-history-table-body');
    if (!container) return;

    const history = Storage.getExamHistory();
    if (history.length === 0) {
      container.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">
            Belum ada riwayat ujian yang tersimpan di browser Anda.
          </td>
        </tr>
      `;
      return;
    }

    container.innerHTML = history.map((h, idx) => {
      const dateStr = new Date(h.date).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
      const modeLabel = h.mode === 'exam' ? 'Simulasi Ujian' : 'Latihan Mandiri';
      return `
        <tr>
          <td>#${history.length - idx}</td>
          <td>${dateStr}</td>
          <td><span class="badge ${h.mode === 'exam' ? 'badge-info' : 'badge-warning'}">${modeLabel}</span></td>
          <td><strong>${h.percentage}%</strong> (${h.totalScore}/${h.maxScore} Poin)</td>
          <td>
            <button class="btn btn-sm btn-primary view-hist-btn" data-id="${h.id}">
              Buka Review
            </button>
          </td>
        </tr>
      `;
    }).join('');

    container.querySelectorAll('.view-hist-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.viewExamHistoryDetail(id);
      });
    });
  }

  setupDataBackupControls() {
    // Export Data
    document.getElementById('export-data-btn')?.addEventListener('click', () => {
      Storage.exportData();
    });

    // Import Data
    const importInput = document.getElementById('import-file-input');
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
      importInput?.click();
    });

    importInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
        const res = Storage.importData(evt.target.result);
        alert(res.message);
        if (res.success) {
          this.updateDashboard();
          this.renderHistoryView();
        }
      };
      reader.readAsText(file);
      importInput.value = '';
    });

    // Reset Data
    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
      if (confirm('PERINGATAN: Seluruh riwayat ujian, nilai, dan progres belajar akan dihapus permanen dari browser ini. Apakah Anda yakin?')) {
        Storage.resetAllData();
        alert('Semua data lokal berhasil direset.');
        this.updateDashboard();
        this.renderHistoryView();
      }
    });
  }
}

// Instantiate on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  window.PBOApp = new App();
});
