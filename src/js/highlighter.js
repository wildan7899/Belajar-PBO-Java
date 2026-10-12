/**
 * highlighter.js - Shared Java syntax tokenizer.
 *
 * Tokenizes the source ONCE and builds the HTML afterwards, so generated markup
 * is never fed back into the regexes (that bug leaked attribute values such as
 * "font-weight: 600" into rendered code blocks).
 *
 * Used by both the Materials reader (read-only blocks) and the Fill in the
 * Blanks quiz engine (where a "blank" token is swapped for a real <input> that
 * stays exactly at the position of the original blank).
 */

const KEYWORDS = [
  'abstract', 'assert', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
  'const', 'continue', 'default', 'do', 'double', 'else', 'enum', 'extends', 'final',
  'finally', 'float', 'for', 'goto', 'if', 'implements', 'import', 'instanceof', 'int',
  'interface', 'long', 'native', 'new', 'package', 'private', 'protected', 'public',
  'return', 'short', 'static', 'strictfp', 'super', 'switch', 'synchronized', 'this',
  'throw', 'throws', 'transient', 'try', 'void', 'volatile', 'while', 'true', 'false', 'null'
];

/**
 * Rule order matters: the first alternative that matches at a position wins.
 * - blank  : the /* BLANK_X * / placeholder used by the quiz engine
 * - comment: // ...   (must come before "division" style tokens)
 * - string : "..."
 * - char   : '...'
 * - annotation: @Override
 * - keyword / type / number
 */
const RULES = [
  { type: 'blank', re: /\/\*\s*BLANK_\d+\s*\*\// },
  { type: 'comment', re: /\/\/[^\n]*/ },
  { type: 'string', re: /"(?:\\.|[^"\\])*"/ },
  { type: 'char', re: /'(?:\\.|[^'\\])*'/ },
  { type: 'annotation', re: /@[A-Za-z_][A-Za-z0-9_]*/ },
  { type: 'number', re: /\b\d+(?:\.\d+)?\b/ },
  { type: 'keyword', re: new RegExp(`\\b(?:${KEYWORDS.join('|')})\\b`) },
  { type: 'type', re: /\b[A-Z][A-Za-z0-9_]*\b/ }
];

const COMBINED = new RegExp(RULES.map(r => `(${r.re.source})`).join('|'), 'g');

export const JavaHighlighter = {
  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  /**
   * Splits source into [{ type, text }]. `plain` segments keep their whitespace
   * so the original line/indent layout is reproduced byte-for-byte.
   */
  tokenize(code) {
    if (!code) return [];
    const tokens = [];
    let last = 0;
    let m;

    COMBINED.lastIndex = 0;
    while ((m = COMBINED.exec(code)) !== null) {
      if (m.index > last) {
        tokens.push({ type: 'plain', text: code.slice(last, m.index) });
      }
      const matched = m[0];
      const rule = RULES.find(r => new RegExp(`^(?:${r.re.source})$`).test(matched));
      tokens.push({ type: rule ? rule.type : 'plain', text: matched });
      last = m.index + matched.length;
    }
    if (last < code.length) {
      tokens.push({ type: 'plain', text: code.slice(last) });
    }
    return tokens;
  },

  /**
   * Renders tokens to HTML.
   * @param {string} code
   * @param {(token:{type:string,text:string}, index:number) => (string|null)} [replaceToken]
   *        Return HTML to inject instead of the token (e.g. a blank <input>), or null to keep default output.
   */
  render(code, replaceToken = null) {
    const tokens = this.tokenize(code);
    if (tokens.length === 0) return '';

    return tokens.reduce((html, token, index) => {
      const custom = replaceToken ? replaceToken(token, index) : null;
      if (custom !== null && custom !== undefined) return html + custom;
      return html + this.renderToken(token);
    }, '');
  },

  renderToken(token) {
    const safe = this.escapeHtml(token.text);
    if (token.type === 'plain') return safe;
    return `<span class="tok-${token.type}">${safe}</span>`;
  },

  /** Convenience wrapper for read-only code blocks. */
  highlight(code) {
    return this.render(code);
  }
};