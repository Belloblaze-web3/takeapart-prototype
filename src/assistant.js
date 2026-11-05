const $ = (selector) => document.querySelector(selector);
const API_ORIGIN = (import.meta.env.VITE_META_API_ORIGIN || '').trim().replace(/\/+$/, '');
const API_BASE = API_ORIGIN || (import.meta.env.DEV ? window.location.origin : '');
const MODE_COPY = {
  explain: 'Plain-language explanation grounded in the selected model notes.',
  engineer: 'Parts, relationships, assumptions, and one useful design trade-off.',
  code: 'A short JavaScript Canvas sketch. It is shown as text and never run.',
};

export function initAssistant() {
  const form = $('#assistant-form');
  if (!form) return { setModel() {} };
  const question = $('#assistant-question');
  const submit = $('#assistant-submit');
  const status = $('#assistant-status');
  const statusText = $('#assistant-status-text');
  const answer = $('#assistant-answer');
  let selectedMode = 'explain';
  let selectedModel = 'turtle';
  let ready = false;
  let busy = false;
  let lastAnswer = '';

  const setStatus = (state, text) => {
    status.dataset.state = state;
    statusText.textContent = text;
  };
  const updateSubmit = () => { submit.disabled = !ready || busy || !question.value.trim(); };
  const showError = (message) => {
    $('#assistant-error').hidden = !message;
    $('#assistant-error').textContent = message || '';
  };
  const clearResponse = () => {
    $('#assistant-result').hidden = true;
    $('#assistant-empty').hidden = false;
    $('#assistant-error').hidden = true;
    lastAnswer = '';
  };
  const appendPlain = (container, text) => {
    const clean = text.trim();
    if (!clean) return;
    const paragraph = document.createElement('p');
    paragraph.textContent = clean;
    container.append(paragraph);
  };
  const renderAnswer = (text) => {
    answer.replaceChildren();
    const fence = /```([\w.+-]*)\s*\n([\s\S]*?)```/g;
    let cursor = 0;
    for (const match of text.matchAll(fence)) {
      appendPlain(answer, text.slice(cursor, match.index));
      const pre = document.createElement('pre');
      const code = document.createElement('code');
      code.textContent = match[2].trim();
      pre.dataset.language = match[1] || 'code';
      pre.append(code);
      answer.append(pre);
      cursor = match.index + match[0].length;
    }
    appendPlain(answer, text.slice(cursor));
  };

  $$('.assistant-mode').forEach((button) => button.addEventListener('click', () => {
    selectedMode = button.dataset.mode;
    $$('.assistant-mode').forEach((item) => {
      const active = item === button;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
    });
    $('#assistant-mode-copy').textContent = MODE_COPY[selectedMode];
  }));
  $$('.assistant-prompt').forEach((button) => button.addEventListener('click', () => {
    question.value = button.dataset.prompt || '';
    question.focus();
    $('#assistant-char-count').textContent = `${question.value.length} / 640`;
    updateSubmit();
  }));
  question.addEventListener('input', () => {
    $('#assistant-char-count').textContent = `${question.value.length} / 640`;
    updateSubmit();
  });

  $('#assistant-copy').addEventListener('click', async () => {
    if (!lastAnswer) return;
    try {
      await navigator.clipboard.writeText(lastAnswer);
      $('#assistant-copy').textContent = 'Copied';
      setTimeout(() => { $('#assistant-copy').textContent = 'Copy answer'; }, 1400);
    } catch { showError('Clipboard access is unavailable in this browser.'); }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const text = question.value.trim();
    if (!ready || busy || !text || !API_BASE) return;
    busy = true;
    updateSubmit();
    showError('');
    $('#assistant-empty').hidden = true;
    $('#assistant-result').hidden = false;
    $('#assistant-result-mode').textContent = selectedMode.toUpperCase();
    $('#assistant-question-preview').textContent = text;
    answer.textContent = 'Sending this question and the selected model’s written notes to Meta…';
    setStatus('working', 'SENDING · USER-INITIATED TEXT REQUEST');
    try {
      const response = await fetch(`${API_BASE}/api/meta/ask`, {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId: selectedModel, mode: selectedMode, question: text }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Meta could not complete this request.');
      lastAnswer = typeof result.answer === 'string' ? result.answer : '';
      if (!lastAnswer) throw new Error('Meta returned an empty answer.');
      renderAnswer(lastAnswer);
      $('#assistant-copy').disabled = false;
      setStatus('ready', `CONNECTED · ${result.model || 'MUSE SPARK 1.3'}`);
    } catch (error) {
      $('#assistant-result').hidden = true;
      $('#assistant-empty').hidden = false;
      showError(error.message || 'The request could not be completed.');
      setStatus('inactive', 'REQUEST FAILED · NO ANSWER SAVED');
    } finally {
      busy = false;
      updateSubmit();
    }
  });

  const setModel = (id, title, type) => {
    selectedModel = id;
    $('#assistant-model-name').textContent = title;
    $('#assistant-model-type').textContent = type;
    $('#assistant-empty-model').textContent = title;
    clearResponse();
  };

  async function checkHealth() {
    if (!API_BASE) {
      setStatus('inactive', 'NOT CONNECTED · CODE-ONLY BUILD');
      updateSubmit();
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/health`, { credentials: 'omit', cache: 'no-store' });
      const data = await response.json();
      ready = response.ok && data.configured === true;
      setStatus(ready ? 'ready' : 'inactive', ready ? 'CONNECTED · MUSE SPARK 1.3' : 'SERVER READY · KEY NOT SET');
    } catch {
      ready = false;
      setStatus('inactive', 'API UNREACHABLE · NO REQUEST SENT');
    }
    updateSubmit();
  }

  $('#assistant-copy').disabled = true;
  updateSubmit();
  void checkHealth();
  return { setModel };
}

const $$ = (selector) => [...document.querySelectorAll(selector)];
