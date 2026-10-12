/**
 * materials.js - Interactive Learning Materials Module
 * Renders curriculum chapters, subtopics, syntax highlighting, and progress markers.
 */

import { INITIAL_MATERIALS } from './data-store.js';
import { Storage } from './storage.js';
import { JavaHighlighter } from './highlighter.js';

export const MaterialsManager = {
  materials: [...INITIAL_MATERIALS],
  activeSubtopicId: null,

  getAllMaterials() {
    return this.materials;
  },

  /** Flat, ordered list of every subtopic across all chapters. */
  getFlatOutline() {
    const outline = [];
    this.materials.forEach((chapter, chapterIndex) => {
      chapter.subtopics.forEach((sub, subIndex) => {
        outline.push({
          chapter,
          sub,
          chapterIndex,
          subIndex,
          flatIndex: outline.length,
          label: `${subIndex + 1}. ${sub.title}`
        });
      });
    });
    return outline;
  },

  getOutlineIndex() {
    if (!this.activeSubtopicId) return -1;
    return this.getFlatOutline().findIndex(o => o.sub.id === this.activeSubtopicId);
  },

  /**
   * Java syntax highlighting (read-only blocks).
   * Tokenizing happens once in the shared highlighter, so generated markup is
   * never re-scanned.
   */
  highlightJavaCode(code) {
    return JavaHighlighter.highlight(code);
  },

  /**
   * Renders the complete materials view into container element.
   */
  renderMaterials(container, { searchTerm = '', onPracticeTopic = null, onOpenSubtopic = null } = {}) {
    if (!container) return;
    container.innerHTML = '';

    const term = searchTerm.toLowerCase().trim();
    const outline = this.getFlatOutline();

    const filtered = this.materials.filter(chapter => {
      if (!term) return true;
      const matchChapter = chapter.title.toLowerCase().includes(term) ||
                            chapter.shortDescription.toLowerCase().includes(term);
      const matchSub = chapter.subtopics.some(s =>
        s.title.toLowerCase().includes(term) ||
        s.definition.toLowerCase().includes(term) ||
        s.content.toLowerCase().includes(term)
      );
      return matchChapter || matchSub;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <span class="empty-state-icon" aria-hidden="true">⌕</span>
          <strong>Tidak ada materi yang cocok</strong>
          Tidak ada subtopik yang cocok dengan pencarian &ldquo;${this.escapeText(searchTerm)}&rdquo;.
        </div>
      `;
      return;
    }

    const accordion = document.createElement('div');
    accordion.className = 'chapter-accordion';

    filtered.forEach((chapter) => {
      const chapterIndex = this.materials.indexOf(chapter);
      const studiedCount = chapter.subtopics.filter(s => Storage.isTopicStudied(s.id)).length;
      const pct = chapter.subtopics.length ? Math.round((studiedCount / chapter.subtopics.length) * 100) : 0;
      const isOpen = Boolean(term);

      const chapterCard = document.createElement('section');
      chapterCard.className = 'chapter-card';
      chapterCard.id = `chapter-card-${chapter.id}`;

      // Chapter header (a real button for keyboard users)
      const header = document.createElement('button');
      header.type = 'button';
      header.className = `chapter-header ${isOpen ? 'expanded' : ''}`;
      header.setAttribute('aria-expanded', String(isOpen));
      header.innerHTML = `
        <span class="chapter-title-area">
          <span class="chapter-title-area">
            <h3><span aria-hidden="true">▤</span> ${this.escapeText(chapter.title)}</h3>
            <span class="chapter-desc">${this.escapeText(chapter.shortDescription)}</span>
          </span>
        </span>
        <span class="chapter-header-right">
          <span class="chapter-progress" title="${studiedCount} dari ${chapter.subtopics.length} subtopik selesai">
            <span class="chapter-progress-bar"><span style="width: ${pct}%"></span></span>
            <span>${studiedCount}/${chapter.subtopics.length}</span>
          </span>
          <button class="btn btn-sm btn-outline practice-chapter-btn" data-chapter="${this.escapeAttr(chapter.title)}">
            Latihan Bab Ini
          </button>
          <span class="toggle-icon" aria-hidden="true">${isOpen ? '▼' : '▶'}</span>
        </span>
      `;
      // The nested practice button must not toggle the accordion
      header.querySelector('.practice-chapter-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof onPracticeTopic === 'function') onPracticeTopic(chapter.title);
      });

      const subContainer = document.createElement('div');
      subContainer.className = 'subtopics-container';
      subContainer.style.display = isOpen ? 'flex' : 'none';
      subContainer.id = `subtopics-${chapter.id}`;

      chapter.subtopics.forEach(sub => {
        const isStudied = Storage.isTopicStudied(sub.id);
        const flat = outline.find(o => o.sub.id === sub.id);

        const subCard = document.createElement('article');
        subCard.className = 'subtopic-item';
        subCard.id = `subtopic-${sub.id}`;

        subCard.innerHTML = `
          <div class="subtopic-header">
            <h4 class="subtopic-title">${this.escapeText(sub.title)}</h4>
            <div>
              <span class="badge badge-source" title="Sumber materi slide kuliah">
                ${this.escapeText(sub.sourceLocation || 'Materi Slide PBO')}
              </span>
              <button class="btn btn-sm ${isStudied ? 'btn-success' : 'btn-outline'} toggle-studied-btn" data-id="${sub.id}"
                aria-pressed="${isStudied}">
                ${isStudied ? '✓ Selesai' : '○ Tandai Selesai'}
              </button>
            </div>
          </div>

          <p style="margin-bottom: var(--sp-3); color: var(--text-primary);">
            <strong>Definisi.</strong> ${this.escapeText(sub.definition)}
          </p>

          <p style="margin-bottom: var(--sp-4); color: var(--text-secondary);">
            ${this.escapeText(sub.content)}
          </p>

          ${sub.syntax ? `
            <div class="code-container">
              <div class="code-header">
                <span>Java — ${this.escapeText(sub.title)}</span>
                <span style="display: flex; align-items: center; gap: var(--sp-2);">
                  <button class="copy-code-btn" data-code="${encodeURIComponent(sub.syntax)}" aria-label="Salin kode contoh">Salin</button>
                </span>
              </div>
              <pre class="code-block"><code>${this.highlightJavaCode(sub.syntax)}</code></pre>
            </div>
          ` : ''}

          ${sub.explanation ? `
            <div style="background: var(--accent-soft); border-left: 3px solid var(--accent); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); margin: var(--sp-3) 0; font-size: var(--fs-base);">
              <strong>Penjelasan Kode.</strong> ${this.escapeText(sub.explanation)}
            </div>
          ` : ''}

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--sp-3); margin-top: var(--sp-4);">
            ${sub.examSummary ? `
              <div style="background: var(--success-soft); border-left: 3px solid var(--success); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); font-size: var(--fs-sm);">
                <strong style="color: var(--success);">Poin Penting Ujian</strong><br>
                ${this.escapeText(sub.examSummary)}
              </div>
            ` : ''}
            ${sub.commonMistakes ? `
              <div style="background: var(--danger-soft); border-left: 3px solid var(--danger); padding: var(--sp-3) var(--sp-4); border-radius: var(--r-sm); font-size: var(--fs-sm);">
                <strong style="color: var(--danger);">Kesalahan Umum Mahasiswa</strong><br>
                ${this.escapeText(sub.commonMistakes)}
              </div>
            ` : ''}
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--sp-3); margin-top: var(--sp-4); padding-top: var(--sp-3); border-top: 1px solid var(--border-subtle); flex-wrap: wrap;">
            <span style="font-size: var(--fs-xs); color: var(--text-muted);">
              ${flat ? this.escapeText(`${flat.chapter.title} · Subtopik ${flat.subIndex + 1} dari ${flat.chapter.subtopics.length}`) : ''}
            </span>
            <button class="btn btn-sm btn-primary practice-subtopic-btn" data-topic="${this.escapeAttr(chapter.title)}"
              data-subtopic="${sub.id}">
              Latihan Topik Ini
            </button>
          </div>
        `;

        // Study toggle
        const studyBtn = subCard.querySelector('.toggle-studied-btn');
        studyBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const newState = Storage.toggleTopicStudied(sub.id);
          studyBtn.className = `btn btn-sm ${newState ? 'btn-success' : 'btn-outline'} toggle-studied-btn`;
          studyBtn.textContent = newState ? '✓ Selesai' : '○ Tandai Selesai';
          studyBtn.setAttribute('aria-pressed', String(newState));

          // Refresh the chapter progress meter in place
          const cc = document.getElementById(`chapter-card-${chapter.id}`);
          const done = chapter.subtopics.filter(s => Storage.isTopicStudied(s.id)).length;
          const p = chapter.subtopics.length ? Math.round((done / chapter.subtopics.length) * 100) : 0;
          const meter = cc && cc.querySelector('.chapter-progress');
          if (meter) {
            meter.querySelector('.chapter-progress-bar > span').style.width = `${p}%`;
            meter.querySelector('span:last-child').textContent = `${done}/${chapter.subtopics.length}`;
          }

          window.dispatchEvent(new CustomEvent('study-progress-updated'));
        });

        // Per-subtopic practice shortcut
        subCard.querySelector('.practice-subtopic-btn').addEventListener('click', (e) => {
          e.stopPropagation();
          if (typeof onPracticeTopic === 'function') {
            onPracticeTopic(chapter.title);
          }
        });

        // Track the subtopic as "recently opened"
        if (typeof onOpenSubtopic === 'function') {
          const openBtn = subCard.querySelector('.practice-subtopic-btn');
          subCard.addEventListener('focusin', () => {
            onOpenSubtopic({ id: sub.id, chapter: chapter.title, title: sub.title });
          });
          openBtn.addEventListener('click', () => {
            onOpenSubtopic({ id: sub.id, chapter: chapter.title, title: sub.title });
          });
        }

        subContainer.appendChild(subCard);
      });

      // Expand / collapse
      header.addEventListener('click', () => {
        const isExpanded = subContainer.style.display === 'flex';
        subContainer.style.display = isExpanded ? 'none' : 'flex';
        header.classList.toggle('expanded', !isExpanded);
        header.setAttribute('aria-expanded', String(!isExpanded));
        const icon = header.querySelector('.toggle-icon');
        if (icon) icon.textContent = isExpanded ? '▶' : '▼';
        if (!isExpanded) {
          onOpenSubtopic && onOpenSubtopic(null, chapter);
        }
      });

      chapterCard.appendChild(header);
      chapterCard.appendChild(subContainer);
      accordion.appendChild(chapterCard);
    });

    // Delegated copy button handler
    accordion.querySelectorAll('.copy-code-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = decodeURIComponent(btn.getAttribute('data-code') || '');
        const oldText = btn.innerHTML;
        const restore = (label) => {
          btn.innerHTML = label;
          setTimeout(() => { btn.innerHTML = oldText; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code)
            .then(() => restore('✓ Tersalin'))
            .catch(() => restore('Gagal'));
        }
      });
    });

    container.appendChild(accordion);
  },

  escapeText(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  escapeAttr(str) {
    return this.escapeText(str).replace(/"/g, '&quot;');
  }
};