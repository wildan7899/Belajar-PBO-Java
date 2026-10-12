/**
 * results.js - Exam & Practice Evaluation Report Module
 * Visualizes scores, topic mastery, blank-by-blank review, and lets the user
 * retry incorrect questions. Status is always carried by an icon + label as
 * well as colour, so the report stays readable without colour perception.
 */

export const ResultsManager = {
  escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  renderResults(container, examResult, { onRetryMistakes = null, onNewExam = null, onGoDashboard = null } = {}) {
    if (!container) return;

    const {
      totalScore,
      maxScore,
      percentage,
      totalBlanks,
      totalCorrectBlanks,
      totalIncorrectBlanks,
      totalEmptyBlanks,
      questionEvaluations,
      topicScores,
      weakTopics,
      isTimeout,
      mode
    } = examResult;

    // Grade calculation
    let letterGrade = 'E';
    if (percentage >= 85) letterGrade = 'A';
    else if (percentage >= 75) letterGrade = 'B';
    else if (percentage >= 60) letterGrade = 'C';
    else if (percentage >= 50) letterGrade = 'D';

    const modeLabel = mode === 'exam' ? 'Simulasi Ujian' : 'Latihan Mandiri';

    const mistakenQuestionIds = questionEvaluations
      .filter(qe => qe.status !== 'CORRECT')
      .map(qe => qe.questionId);

    const headline = percentage >= 75
      ? { text: 'Hasil sangat baik', icon: '✓' }
      : percentage >= 60
        ? { text: 'Cukup baik, teruskan', icon: '◐' }
        : { text: 'Perlu pendalaman lagi', icon: '○' };

    container.innerHTML = `
      <div class="results-header-banner">
        ${isTimeout ? `
          <div class="status-chip bad" style="margin-bottom: var(--sp-4);">
            Waktu habis — jawaban dikumpulkan otomatis
          </div>
        ` : ''}

        <div class="score-circle">
          <span class="big-number">${percentage}</span>
          <span class="score-label">Nilai Akhir · ${letterGrade}</span>
        </div>

        <h2 style="font-size: var(--fs-xl); font-weight: 650; margin-bottom: var(--sp-2);">
          <span aria-hidden="true">${headline.icon}</span> ${headline.text}
        </h2>
        <p style="color: var(--text-secondary); max-width: 60ch; margin: 0 auto var(--sp-6);">
          ${modeLabel} · Total poin diperoleh <strong>${totalScore}</strong> dari maksimal <strong>${maxScore}</strong> poin.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: var(--sp-3); margin-bottom: var(--sp-6);">
          <div class="stat-card compact">
            <div class="stat-info">
              <div class="stat-label">Total Blank</div>
              <div class="stat-value">${totalBlanks}</div>
            </div>
          </div>
          <div class="stat-card compact" style="border-color: var(--success-border);">
            <div class="stat-info">
              <div class="stat-label" style="color: var(--success);">✓ Benar</div>
              <div class="stat-value" style="color: var(--success);">${totalCorrectBlanks}</div>
            </div>
          </div>
          <div class="stat-card compact" style="border-color: var(--danger-border);">
            <div class="stat-info">
              <div class="stat-label" style="color: var(--danger);">✗ Salah</div>
              <div class="stat-value" style="color: var(--danger);">${totalIncorrectBlanks}</div>
            </div>
          </div>
          <div class="stat-card compact" style="border-color: var(--warning-border);">
            <div class="stat-info">
              <div class="stat-label" style="color: var(--warning);">○ Kosong</div>
              <div class="stat-value" style="color: var(--warning);">${totalEmptyBlanks}</div>
            </div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: var(--sp-2);">
          ${mistakenQuestionIds.length > 0 ? `
            <button id="retry-mistakes-btn" class="btn btn-primary">
              Ulangi ${mistakenQuestionIds.length} Soal yang Salah
            </button>
          ` : ''}
          <button id="new-exam-btn" class="btn btn-secondary">Mulai Ujian Baru</button>
          <button id="back-dashboard-btn" class="btn btn-outline">Kembali ke Dashboard</button>
        </div>
      </div>

      <!-- Topic mastery -->
      <div class="card" style="margin-bottom: var(--sp-5);">
        <h3 class="card-title">Performa per Topik</h3>
        <div style="display: flex; flex-direction: column; gap: var(--sp-4);">
          ${Object.entries(topicScores).map(([topic, data]) => {
            const topicPct = data.possible > 0 ? Math.round((data.earned / data.possible) * 100) : 0;
            const barColor = topicPct >= 75 ? 'var(--success)' : topicPct >= 60 ? 'var(--warning)' : 'var(--danger)';
            const chipCls = topicPct >= 75 ? 'ok' : topicPct >= 60 ? 'partial' : 'bad';
            const chipIcon = topicPct >= 75 ? '✓' : topicPct >= 60 ? '◐' : '✗';
            return `
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--sp-3); font-size: var(--fs-base); margin-bottom: var(--sp-2); flex-wrap: wrap;">
                  <strong>${this.escapeHtml(topic)}</strong>
                  <span class="status-chip ${chipCls}">${chipIcon} ${data.earned}/${data.possible} poin · ${topicPct}%</span>
                </div>
                <div style="height: 6px; background: var(--bg-inset); border-radius: var(--r-pill); overflow: hidden;">
                  <div style="height: 100%; width: ${topicPct}%; background: ${barColor}; border-radius: var(--r-pill);"></div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        ${weakTopics.length > 0 ? `
          <div style="margin-top: var(--sp-5); padding: var(--sp-4); background: var(--danger-soft); border-left: 3px solid var(--danger); border-radius: var(--r-sm); font-size: var(--fs-base);">
            <strong>Rekomendasi Belajar</strong>
            <p style="margin-top: var(--sp-1); color: var(--text-secondary);">
              Baca ulang materi slide pada topik berikut:
              <strong>${weakTopics.map(w => this.escapeHtml(w.topic)).join(', ')}</strong>.
            </p>
          </div>
        ` : ''}
      </div>

      <!-- Question by question review -->
      <div class="card">
        <h3 class="card-title">Pembahasan per Soal &amp; per Blank</h3>
        <div style="display: flex; flex-direction: column; gap: var(--sp-4);">
          ${questionEvaluations.map((qe, qIdx) => {
            const statusMap = {
              CORRECT:    { cls: 'correct',   chip: 'ok',      icon: '✓', text: 'Benar Penuh' },
              PARTIAL:    { cls: 'partial',   chip: 'partial', icon: '◐', text: 'Benar Sebagian' },
              EMPTY:      { cls: 'empty',     chip: 'muted',   icon: '○', text: 'Tidak Dijawab' },
              INCORRECT:  { cls: 'incorrect', chip: 'bad',     icon: '✗', text: 'Salah' }
            };
            const st = statusMap[qe.status] || statusMap.INCORRECT;

            return `
              <div class="review-item status-${st.cls}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: var(--sp-3); margin-bottom: var(--sp-3); flex-wrap: wrap;">
                  <div style="min-width: 0;">
                    <strong style="font-size: var(--fs-md);">Soal ${qIdx + 1}: ${this.escapeHtml(qe.title)}</strong>
                    <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-top: 2px;">
                      ${this.escapeHtml(qe.topic)} · Tingkat: ${this.escapeHtml(qe.difficulty)}
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; gap: var(--sp-2);">
                    <span class="status-chip ${st.chip}">${st.icon} ${st.text}</span>
                    <strong style="font-variant-numeric: tabular-nums;">${qe.pointsEarned}/${qe.maxPoints} poin</strong>
                  </div>
                </div>

                <div style="display: flex; flex-direction: column; gap: var(--sp-2); margin-bottom: var(--sp-3);">
                  ${qe.blankResults.map(br => {
                    const brMap = {
                      CORRECT:   { chip: 'ok',    icon: '✓', text: 'Benar' },
                      EMPTY:     { chip: 'muted', icon: '○', text: 'Kosong' },
                      INCORRECT: { chip: 'bad',   icon: '✗', text: 'Salah' }
                    };
                    const b = brMap[br.status] || brMap.INCORRECT;

                    return `
                      <div class="blank-review">
                        <div class="blank-review-head">
                          <strong>${br.blankId} — ${this.escapeHtml(br.label)}</strong>
                          <span class="status-chip ${b.chip}">${b.icon} ${b.text} · ${br.pointsEarned}/${br.maxPoints}</span>
                        </div>
                        <div class="answer-compare">
                          <span style="color: var(--text-muted);">Jawaban Anda</span>
                          <span class="answer-pill user-${br.status === 'CORRECT' ? 'ok' : 'bad'}">${br.userAnswer ? this.escapeHtml(br.userAnswer) : '(kosong)'}</span>
                          <span style="color: var(--text-muted);">Kunci</span>
                          <span class="answer-pill key">${this.escapeHtml(br.expectedAnswer)}</span>
                        </div>
                        <p style="color: var(--text-secondary); font-size: var(--fs-xs); margin-top: var(--sp-2);">${br.explanation}</p>
                      </div>
                    `;
                  }).join('')}
                </div>

                <div style="font-size: var(--fs-sm); color: var(--text-secondary); border-top: 1px dashed var(--border); padding-top: var(--sp-3);">
                  <strong style="color: var(--text-primary);">Pembahasan Konsep.</strong> ${this.escapeHtml(qe.explanation)}
                </div>
                ${qe.commonMistakes ? `
                  <div style="font-size: var(--fs-sm); color: var(--danger); margin-top: var(--sp-2);">
                    <strong>Jebakan / Kesalahan Umum.</strong> ${this.escapeHtml(qe.commonMistakes)}
                  </div>
                ` : ''}
                <div style="margin-top: var(--sp-3);">
                  <span class="badge badge-source">Sumber: ${this.escapeHtml(qe.sourceFile)} (${this.escapeHtml(qe.sourceLocation)})</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const retryBtn = document.getElementById('retry-mistakes-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        if (typeof onRetryMistakes === 'function') onRetryMistakes(mistakenQuestionIds);
      });
    }

    const newExamBtn = document.getElementById('new-exam-btn');
    if (newExamBtn) {
      newExamBtn.addEventListener('click', () => {
        if (typeof onNewExam === 'function') onNewExam();
      });
    }

    const backDashBtn = document.getElementById('back-dashboard-btn');
    if (backDashBtn) {
      backDashBtn.addEventListener('click', () => {
        if (typeof onGoDashboard === 'function') onGoDashboard();
      });
    }
  }
};