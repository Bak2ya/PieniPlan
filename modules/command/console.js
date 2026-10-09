(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function create({ input, status, history, suggestions, getPlanMode, readyText, bar=null, expandButton=null, pinButton=null, maxLog = 80 }) {
    const log = [];
    let expanded=false,pinned=false;

    function matches() {
      return root.commandCore.matches(input?.value, { plan: Boolean(getPlanMode?.()) });
    }

    function renderSuggestions() {
      if (!suggestions || !input) return;
      const query = input.value.trim();
      const items = query ? matches() : [];
      suggestions.innerHTML = '';
      suggestions.hidden = !query || !items.length;
      if (suggestions.hidden) return;
      for (const command of items) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'command-suggestion';
        button.innerHTML = `<strong>${escapeHtml(command.id)}</strong><span>${escapeHtml(command.name)}</span>`;
        button.addEventListener('pointerdown', event => event.preventDefault());
        button.addEventListener('click', () => {
          input.value = command.id;
          suggestions.hidden = true;
          input.focus();
        });
        suggestions.appendChild(button);
      }
    }

    function render() {
      const current = log[log.length - 1] || { text: readyText(), kind: '' };
      const previous = log.slice(0, Math.max(0, log.length - 1));
      if (history) {
        history.innerHTML = previous.map(item => `<div class="command-history-line ${escapeHtml(item.kind || '')}">${escapeHtml(item.text)}</div>`).join('');
        history.hidden = !expanded;
        history.scrollTop=history.scrollHeight;
      }
      if (status) {
        status.className = `command-status ${current.kind || ''}`.trim();
        status.textContent = current.text;
      }
      bar?.classList.toggle('log-expanded',expanded);
      bar?.closest('#canvasHost')?.classList.toggle('command-log-open',expanded);
      expandButton?.setAttribute('aria-expanded',String(expanded));
      if(pinButton){pinButton.hidden=!expanded;pinButton.setAttribute('aria-pressed',String(pinned));}
      renderSuggestions();
    }

    function push(text, kind = '') {
      const value = String(text ?? '').trim() || readyText();
      const last = log[log.length - 1];
      if (!last || last.text !== value || last.kind !== kind) log.push({ text: value, kind, at: Date.now() });
      if (log.length > maxLog) log.splice(0, log.length - maxLog);
      render();
    }

    function hideSuggestions() {
      if (suggestions) suggestions.hidden = true;
    }

    function completeFirst() {
      const first = matches()[0];
      if (!first || !input) return false;
      input.value = first.id;
      renderSuggestions();
      return true;
    }

    input?.addEventListener('input', event=>{if(!event.isComposing)renderSuggestions();});
    expandButton?.addEventListener('click',()=>{expanded=!expanded;if(!expanded)pinned=false;render();});
    pinButton?.addEventListener('click',()=>{pinned=!pinned;expanded=true;render();});
    document.addEventListener('pointerdown',e=>{if(expanded&&!pinned&&bar&&!bar.contains(e.target)){expanded=false;render();}});
    bar?.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.isComposing&&expanded&&!pinned){expanded=false;render();}});

    return Object.freeze({ push, render, renderSuggestions, hideSuggestions, completeFirst, getLog: () => log.slice(), get expanded(){return expanded;}, get pinned(){return pinned;} });
  }

  root.commandConsole = Object.freeze({ create });
})();
