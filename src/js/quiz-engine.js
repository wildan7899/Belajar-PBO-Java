/**
 * quiz-engine.js - Fill-in-the-Blanks Interactive Quiz & Exam Engine
 * Handles code rendering with embedded inputs, state management,
 * keyboard navigation, real-time persistence, timer, and palettes.
 */

import { GradingEngine } from './grading.js';
import { Storage } from './storage.js';
import { JavaHighlighter } from './highlighter.js';

export const QuizEngine = {
  mode: 'exam', // 'exam' | 'practice'
  questions: [],
  currentIndex: 0,
  userAnswers: {}, // { [questionId]: { [blankId]: string } }
  flaggedQuestions: new Set(),
  timerInterval: null,
  timeRemainingSeconds: 0,
  initialDurationSeconds: 0,
  isSubmitted: false,
  onExamComplete: null,

  /**
   * Initializes a quiz session.
   */
  startQuiz({
    mode = 'exam',
    questions = [],
    durationMinutes = 15,
    savedSession = null,
    onComplete = null
  } = {}) {
    this.mode = mode;
    this.questions = questions;
    this.currentIndex = 0;
    this.userAnswers = {};
    this.flaggedQuestions = new Set();
    this.isSubmitted = false;
    this.onExamComplete = onComplete;

    if (savedSession && savedSession.questions && savedSession.questions.length > 0) {
      // Resume saved session
      this.mode = savedSession.mode;
      this.questions = savedSession.questions;
      this.currentIndex = savedSession.currentIndex || 0;
      this.userAnswers = savedSession.userAnswers || {};
      this.flaggedQuestions = new Set(savedSession.flaggedQuestions || []);
      this.timeRemainingSeconds = savedSession.timeRemainingSeconds;
      this.initialDurationSeconds = savedSession.initialDurationSeconds;
    } else {
      // Fresh session
      this.initialDurationSeconds = durationMinutes * 60;
      this.timeRemainingSeconds = this.initialDurationSeconds;
      this.questions.forEach(q => {
        this.userAnswers[q.id] = {};
        q.blankDefinitions.forEach(b => {
          this.userAnswers[q.id][b.id] = '';
        });
      });
    }

    this.startTimer();
    this.renderCurrentQuestion();
    this.updatePalette();
    this.saveState();
  },

  /**
   * Timer management
   */
  startTimer() {
    clearInterval(this.timerInterval);
    if (this.mode !== 'exam' && this.timeRemainingSeconds <= 0) return;

    this.updateTimerDisplay();

    this.timerInterval = setInterval(() => {
      this.timeRemainingSeconds--;
      this.updateTimerDisplay();
      
      // Auto-save state every 5 seconds
      if (this.timeRemainingSeconds % 5 === 0) {
        this.saveState();
      }

      if (this.timeRemainingSeconds <= 0) {
        clearInterval(this.timerInterval);
        this.submitQuiz(true); // force submit due to timeout
      }
    }, 1000);
  },

  updateTimerDisplay() {
    const timerElem = document.getElementById('exam-timer-digits');
    if (!timerElem) return;

    const mins = Math.floor(Math.max(0, this.timeRemainingSeconds) / 60);
    const secs = Math.max(0, this.timeRemainingSeconds) % 60;
    const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    timerElem.textContent = formatted;

    if (mins < 3) {
      timerElem.classList.add('timer-warning');
    } else {
      timerElem.classList.remove('timer-warning');
    }
  },

  /**
   * Saves active session to storage so accidental refresh doesn't lose work.
   */
  saveState() {
    if (this.isSubmitted) return;
    Storage.saveActiveSession({
      mode: this.mode,
      questions: this.questions,
      currentIndex: this.currentIndex,
      userAnswers: this.userAnswers,
      flaggedQuestions: Array.from(this.flaggedQuestions),
      timeRemainingSeconds: this.timeRemainingSeconds,
      initialDurationSeconds: this.initialDurationSeconds
    });
  },

  /**
   * Renders the question code with the blanks replaced by real inputs that sit
   * exactly where the blank was, with the rest of the source syntax-highlighted.
   *
   * A blank id may legitimately appear more than once in a template (e.g. "private"
   * on two attributes), so every occurrence is replaced. Each occurrence gets a
   * unique element id while keeping the same data-blank-id, so grading still
   * treats them as one answer.
   */
renderInteractiveCode(question) {
    const qAnswers = this.userAnswers[question.id] || {};
    const blanksById = new Map(question.blankDefinitions.map((b, idx) => [b.id, { def: b, idx }]));
    let seq = 0;

    return JavaHighlighter.render(question.codeTemplate, (token) => {
      if (token.type !== 'blank') return null;

      const blankId = token.text.match(/BLANK_\d+/)[0];
      const entry = blanksById.get(blankId);
      if (!entry) return null;

      const { def: b, idx } = entry;
      const currentVal = qAnswers[b.id] || '';
      const placeholder = b.placeholder || `Blank ${idx + 1}`;
      const widthCh = Math.max(8, Math.min(30, (b.expectedAnswer ? b.expectedAnswer.length : 12) + 3));

      const safeValue = JavaHighlighter.escapeHtml(currentVal);
      const safePlaceholder = JavaHighlighter.escapeHtml(placeholder).replace(/"/g, '&quot;');
      seq++;

      return `<input type="text"
        id="blank-input-${b.id}-${seq}"
        class="code-blank-input${currentVal ? ' filled' : ''}"
        data-blank-id="${b.id}"
        data-question-id="${question.id}"
        placeholder="${safePlaceholder}"
        value="${safeValue}"
        title="${b.label}"
        aria-label="${b.label}"
        style="width: ${widthCh}ch"
        autocomplete="off"
        autocapitalize="off"
        autocorrect="off"
        spellcheck="false" />`;
    });
  },

  /**
   * Renders the question UI in the container.
   */
  renderCurrentQuestion() {
    const container = document.getElementById('quiz-question-area');
    if (!container || !this.questions[this.currentIndex]) return;

    const q = this.questions[this.currentIndex];
    const totalQ = this.questions.length;
    const isFlagged = this.flaggedQuestions.has(q.id);
    const diffBadge = q.difficulty === 'Mudah' ? 'badge-success' : q.difficulty === 'Sedang' ? 'badge-warning' : 'badge-danger';

    container.innerHTML = `
      <section class="card">
        <div class="quiz-question-head">
          <div class="quiz-question-badges">
            <span class="badge badge-info">${q.topic}</span>
            <span class="badge ${diffBadge}">Tingkat: ${q.difficulty}</span>
          </div>
          <div style="display: flex; align-items: center; gap: var(--sp-3);">
            <span class="quiz-question-index">Soal ${this.currentIndex + 1} / ${totalQ}</span>
            <button id="flag-btn" class="btn btn-sm ${isFlagged ? 'btn-danger' : 'btn-outline'}"
              aria-pressed="${isFlagged}" title="Tandai soal ini untuk ditinjau ulang">
              ${isFlagged ? 'Ditandai' : 'Tandai Ragu'}
            </button>
          </div>
        </div>

        <h3 style="font-size: var(--fs-lg); font-weight: 650; margin-bottom: var(--sp-2);">${q.title}</h3>
        <p style="color: var(--text-secondary); font-size: var(--fs-base); margin-bottom: var(--sp-4);">
          ${q.learningObjective}
        </p>

        <!-- Interactive Java Code Block with Fill in the Blanks Inputs -->
        <div class="code-container">
          <div class="code-header">
            <span>Java — lengkapi setiap kotak kosong</span>
            <span class="badge badge-source">${q.sourceLocation}</span>
          </div>
          <div class="interactive-code-block" role="group"
            aria-label="Kode Java dengan ${q.blankDefinitions.length} kolom kosong">${this.renderInteractiveCode(q)}</div>
        </div>

        <div class="blank-guide-container">
          <div style="font-size: var(--fs-xs); color: var(--text-muted);">
            Tekan <kbd>Tab</kbd> atau <kbd>Enter</kbd> untuk berpindah ke kotak kosong berikutnya.
          </div>
          ${q.blankDefinitions.map(b => `
            <div class="blank-guide-item">
              <span class="blank-number-tag">${b.id}</span>
              <span style="flex: 1; color: var(--text-secondary);">${b.label}</span>
              <span style="font-size: var(--fs-xs); color: var(--text-muted); white-space: nowrap;">${b.points} poin</span>
            </div>
          `).join('')}
        </div>

        ${this.mode === 'practice' ? `
          <div style="margin-top: var(--sp-4);">
            <button id="check-practice-btn" class="btn btn-secondary">Periksa Jawaban</button>
          </div>
          <div id="practice-feedback-area" style="margin-top: var(--sp-4); display: none;" role="status" aria-live="polite"></div>
        ` : ''}
      </section>

      <!-- Navigation buttons -->
      <div class="quiz-nav-actions">
        <button id="prev-btn" class="btn btn-secondary" ${this.currentIndex === 0 ? 'disabled' : ''}>
          ← Soal Sebelumnya
        </button>

        <div>
          ${this.currentIndex < totalQ - 1 ? `
            <button id="next-btn" class="btn btn-primary">
              Soal Selanjutnya →
            </button>
          ` : `
            <button id="submit-exam-btn" class="btn btn-success">
              ${this.mode === 'practice' ? 'Selesaikan Latihan' : 'Kumpulkan Ujian'}
            </button>
          `}
        </div>
      </div>
    `;

    this.attachQuestionEventListeners(q);
  },

  /**
   * Attaches listeners for input fields, navigation, flag, and check answer in practice.
   */
  attachQuestionEventListeners(question) {
    const inputs = document.querySelectorAll('.code-blank-input');
    
    inputs.forEach((input, idx) => {
      // Dynamic input resizing based on text
      const resize = () => {
        const len = Math.max(8, input.value.length + 3);
        input.style.width = `${len}ch`;
        input.classList.toggle('filled', input.value.trim().length > 0);
      };

      input.addEventListener('input', (e) => {
        const blankId = input.getAttribute('data-blank-id');
        if (!this.userAnswers[question.id]) this.userAnswers[question.id] = {};
        this.userAnswers[question.id][blankId] = input.value;
        resize();
        this.updatePalette();
        this.saveState();
      });

      // Keyboard navigation: Enter or Tab moves to next blank or next button
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (idx < inputs.length - 1) {
            inputs[idx + 1].focus();
            inputs[idx + 1].select();
          } else {
            const nextBtn = document.getElementById('next-btn') || document.getElementById('submit-exam-btn');
            if (nextBtn) nextBtn.focus();
          }
        }
      });
    });

    // Auto focus first blank
    if (inputs.length > 0) {
      setTimeout(() => inputs[0].focus(), 50);
    }

    // Flag button
    const flagBtn = document.getElementById('flag-btn');
    if (flagBtn) {
      flagBtn.addEventListener('click', () => {
        if (this.flaggedQuestions.has(question.id)) {
          this.flaggedQuestions.delete(question.id);
        } else {
          this.flaggedQuestions.add(question.id);
        }
        this.renderCurrentQuestion();
        this.updatePalette();
        this.saveState();
      });
    }

    // Prev / Next buttons
    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this.currentIndex > 0) {
          this.currentIndex--;
          this.renderCurrentQuestion();
          this.updatePalette();
          this.saveState();
        }
      });
    }

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (this.currentIndex < this.questions.length - 1) {
          this.currentIndex++;
          this.renderCurrentQuestion();
          this.updatePalette();
          this.saveState();
        }
      });
    }

    // Submit button
    const submitBtn = document.getElementById('submit-exam-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        this.promptSubmitConfirmation();
      });
    }

    // Practice check button
    const checkBtn = document.getElementById('check-practice-btn');
    if (checkBtn) {
      checkBtn.addEventListener('click', () => {
        this.evaluatePracticeQuestion(question);
      });
    }
  },

  /**
   * Practice mode immediate evaluation and feedback.
   */
  evaluatePracticeQuestion(question) {
    const evalResult = GradingEngine.evaluateQuestion(question, this.userAnswers[question.id]);
    const feedbackArea = document.getElementById('practice-feedback-area');
    if (!feedbackArea) return;

    // Apply colored visual styles directly to the blanks (a blank id may appear
    // more than once in the template, so update every matching input)
    evalResult.blankResults.forEach(br => {
      const inputs = Array.from(document.querySelectorAll('.code-blank-input'))
        .filter(el => el.getAttribute('data-blank-id') === br.blankId);

      inputs.forEach(input => {
        input.classList.remove('correct', 'incorrect');
        if (br.status === 'CORRECT') {
          input.classList.add('correct');
        } else {
          input.classList.add('incorrect');
        }
      });
    });

    feedbackArea.style.display = 'block';
    const overall = evalResult.status === 'CORRECT'
      ? { cls: 'ok', icon: '✓', text: 'Jawaban Anda benar' }
      : evalResult.status === 'PARTIAL'
        ? { cls: 'partial', icon: '◐', text: 'Jawaban sebagian benar' }
        : evalResult.status === 'EMPTY'
          ? { cls: 'muted', icon: '○', text: 'Belum dijawab' }
          : { cls: 'bad', icon: '✗', text: 'Jawaban belum tepat' };

    feedbackArea.innerHTML = `
      <div class="review-item status-${evalResult.status === 'CORRECT' ? 'correct' : evalResult.status === 'PARTIAL' ? 'partial' : 'incorrect'}">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); flex-wrap: wrap; margin-bottom: var(--sp-3);">
          <span class="status-chip ${overall.cls}">${overall.icon} ${overall.text}</span>
          <strong style="font-variant-numeric: tabular-nums;">${evalResult.pointsEarned} / ${evalResult.maxPoints} poin</strong>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--sp-2);">
          ${evalResult.blankResults.map(br => `
            <div class="blank-review">
              <div class="blank-review-head">
                <strong>${br.blankId} — ${br.label}</strong>
                <span class="status-chip ${br.status === 'CORRECT' ? 'ok' : br.status === 'EMPTY' ? 'muted' : 'bad'}">
                  ${br.status === 'CORRECT' ? '✓ Benar' : br.status === 'EMPTY' ? '○ Kosong' : '✗ Salah'} · ${br.pointsEarned}/${br.maxPoints}
                </span>
              </div>
              <div class="answer-compare">
                <span style="color: var(--text-muted);">Jawaban Anda</span>
                <span class="answer-pill user-${br.status === 'CORRECT' ? 'ok' : 'bad'}">${br.userAnswer ? this.escapeHtml(br.userAnswer) : '(kosong)'}</span>
                <span style="color: var(--text-muted);">Kunci</span>
                <span class="answer-pill key">${this.escapeHtml(br.expectedAnswer)}</span>
              </div>
              <p style="color: var(--text-secondary); font-size: var(--fs-xs); margin-top: var(--sp-2);">${br.explanation}</p>
            </div>
          `).join('')}
        </div>

        <div style="margin-top: var(--sp-3); font-size: var(--fs-sm); color: var(--text-secondary);">
          <strong style="color: var(--text-primary);">Pembahasan.</strong> ${evalResult.explanation}
        </div>
        ${evalResult.commonMistakes ? `
          <div style="margin-top: var(--sp-2); font-size: var(--fs-sm); color: var(--danger);">
            <strong>Kesalahan umum.</strong> ${evalResult.commonMistakes}
          </div>
        ` : ''}
      </div>
    `;
  },

  escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /**
   * Question Palette rendering with live status indicators.
   */
  updatePalette() {
    const container = document.getElementById('palette-grid-container');
    if (!container) return;

    container.innerHTML = '';

    this.questions.forEach((q, idx) => {
      const btn = document.createElement('button');
      btn.className = 'palette-btn';
      btn.textContent = idx + 1;
      btn.type = 'button';

      // Status calculation
      const qAns = this.userAnswers[q.id] || {};
      const answeredCount = Object.values(qAns).filter(v => (v || '').trim().length > 0).length;
      const isAnswered = answeredCount > 0;
      const isFlagged = this.flaggedQuestions.has(q.id);

      if (idx === this.currentIndex) btn.classList.add('current');
      if (isAnswered) btn.classList.add('answered');
      if (isFlagged) btn.classList.add('flagged');

      // Status is expressed in words too, not only by colour
      const state = idx === this.currentIndex
        ? `Soal ${idx + 1}, sedang dikerjakan${isAnswered ? ', sudah dijawab' : ', belum dijawab'}`
        : `Soal ${idx + 1}, ${isAnswered ? 'sudah dijawab' : 'belum dijawab'}${isFlagged ? ', ditandai untuk ditinjau' : ''}`;
      btn.setAttribute('aria-label', state);
      if (idx === this.currentIndex) btn.setAttribute('aria-current', 'true');

      btn.addEventListener('click', () => {
        this.currentIndex = idx;
        this.renderCurrentQuestion();
        this.updatePalette();
        this.saveState();
      });

      container.appendChild(btn);
    });

    // Summary counts & live progress bar
    const totalQ = this.questions.length;
    let answeredTotal = 0;
    this.questions.forEach(q => {
      const qAns = this.userAnswers[q.id] || {};
      if (Object.values(qAns).some(v => (v || '').trim().length > 0)) answeredTotal++;
    });

    const statusText = document.getElementById('palette-summary-text');
    if (statusText) {
      statusText.textContent = `${answeredTotal} dari ${totalQ} soal telah diisi`;
    }

    const progressFill = document.getElementById('exam-progress-bar-fill');
    if (progressFill && totalQ > 0) {
      const pct = Math.round((answeredTotal / totalQ) * 100);
      progressFill.style.width = `${pct}%`;
    }
  },

  /**
   * Confirmation modal before submit.
   */
  promptSubmitConfirmation() {
    let unansweredCount = 0;
    this.questions.forEach(q => {
      const qAns = this.userAnswers[q.id] || {};
      const filled = Object.values(qAns).filter(v => (v || '').trim().length > 0).length;
      if (filled < q.blankDefinitions.length) unansweredCount++;
    });

    const modal = document.getElementById('submit-confirm-modal');
    const modalBody = document.getElementById('submit-modal-body');
    const modalTitle = modal?.querySelector('.modal-title');
    const modeName = this.mode === 'practice' ? 'latihan' : 'ujian';

    if (modalTitle) {
      modalTitle.textContent = this.mode === 'practice' ? 'Konfirmasi Penyelesaian Latihan' : 'Konfirmasi Pengumpulan Ujian';
    }

    if (!modal) {
      if (confirm(`Apakah Anda yakin ingin menyelesaikan ${modeName}? Masih ada ${unansweredCount} soal yang belum lengkap.`)) {
        this.submitQuiz(false);
      }
      return;
    }

    modalBody.innerHTML = `
      <p style="margin-bottom: var(--sp-3);">Yakin ingin menyelesaikan dan mengumpulkan ${modeName} ini sekarang?</p>
      ${unansweredCount > 0 ? `
        <div style="background: var(--warning-soft); color: var(--warning); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); font-size: var(--fs-base); border: 1px solid var(--warning-border);">
          <strong>Perhatian:</strong> masih ada <strong>${unansweredCount} soal</strong> yang belum diisi atau belum lengkap.
        </div>
      ` : `
        <div style="background: var(--success-soft); color: var(--success); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); font-size: var(--fs-base); border: 1px solid var(--success-border);">
          <strong>✓</strong> Seluruh soal telah dijawab.
        </div>
      `}
    `;

    modal.classList.add('active');

    const confirmBtn = document.getElementById('modal-confirm-submit-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');

    confirmBtn.onclick = () => {
      modal.classList.remove('active');
      this.submitQuiz(false);
    };

    cancelBtn.onclick = () => {
      modal.classList.remove('active');
    };
  },

  /**
   * Submits the quiz, evaluates results, and triggers callback.
   */
  submitQuiz(isTimeout = false) {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    clearInterval(this.timerInterval);

    // Evaluate complete exam via GradingEngine
    const examResult = GradingEngine.evaluateExam(this.questions, this.userAnswers);
    examResult.mode = this.mode;
    examResult.isTimeout = isTimeout;
    examResult.durationUsedSeconds = this.initialDurationSeconds - Math.max(0, this.timeRemainingSeconds);

    // Save to storage
    Storage.saveExamResult(examResult);

    if (typeof this.onExamComplete === 'function') {
      this.onExamComplete(examResult);
    }
  }
};
