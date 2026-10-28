(() => {
  'use strict';

  const root = window.PieniPlanModules = window.PieniPlanModules || {};

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch]));
  }

  function createJournal({maxBytes=8*1024*1024,maxRows=20000}={}){
    let active=false,rows=[],bytes=0,overflow=false,started=null,documentId=null;
    const status=()=>({active,rows:rows.length,bytes,overflow,started,documentId,maxBytes,maxRows});
    function append(text,kind='',owner=null){if(!active)return false;const line=(owner!==documentId?'[document '+String(owner||'untitled')+']\n':'')+(kind?'['+kind+'] ':'')+String(text)+'\n';if(rows.length>=maxRows||bytes+line.length*2>maxBytes){overflow=true;active=false;return false;}documentId=owner;rows.push(line);bytes+=line.length*2;return true;}
    return Object.freeze({status,start(owner=null){if(active)return false;rows=[];bytes=0;overflow=false;started=new Date().toISOString();documentId=owner;active=true;append('LOGFILEON '+started,'log',owner);return true;},append,stop(){active=false;return{...status(),text:'PieniPlan command log · '+started+'\n'+rows.join('')+(overflow?'[recording stopped: retention limit reached]\n':'')};}});
  }

  function create({ input, status, history, suggestions, getPlanMode, readyText, bar=null, expandButton=null, pinButton=null, maxLog = 80,allowSuggestions=()=>true,getDocumentId=()=>null }) {
    const log = [],archive=[];let archiveBytes=0,archiveDropped=0;
    const journal=createJournal();
    const read=key=>{try{return localStorage.getItem(key);}catch(_){return null;}};
    let expanded=read('pieniplan-command-expanded')==='true',pinned=read('pieniplan-command-pinned')==='true';
    function setLayout(patch,{persist=true}={}){
      if(Object.hasOwn(patch,'expanded'))expanded=Boolean(patch.expanded);
      if(Object.hasOwn(patch,'pinned')){pinned=Boolean(patch.pinned);if(pinned&&!Object.hasOwn(patch,'expanded'))expanded=true;}
      if(persist)try{localStorage.setItem('pieniplan-command-expanded',String(expanded));localStorage.setItem('pieniplan-command-pinned',String(pinned));}catch(_){}
      render();return{expanded,pinned};
    }

    function matches() {
      return root.commandCore.matches(input?.value, { plan: Boolean(getPlanMode?.()) });
    }

    function renderSuggestions() {
      if (!suggestions || !input) return;
      if(!allowSuggestions()){suggestions.hidden=true;return;}
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
      bar?.closest('.app-shell')?.classList.toggle('command-expanded',expanded);
      bar?.closest('#canvasHost')?.classList.toggle('command-log-open',expanded);
      expandButton?.setAttribute('aria-expanded',String(expanded));
      if(pinButton){pinButton.hidden=!expanded;pinButton.setAttribute('aria-pressed',String(pinned));}
      renderSuggestions();
    }

    function push(text, kind = '') {
      const value = String(text ?? '').trim() || readyText();
      journal.append(value,kind,getDocumentId());
      const last = log[log.length - 1];
      if (!last || last.text !== value || last.kind !== kind){const item={text:value,kind,at:Date.now()};log.push(item);const retained={...item,text:value.length>16000?value.slice(0,16000)+' … [truncated]':value};archive.push(retained);archiveBytes+=retained.text.length*2;while(archive.length>5000||archiveBytes>2*1024*1024){archiveBytes-=archive.shift().text.length*2;archiveDropped++;}}
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
    expandButton?.addEventListener('click',()=>setLayout({expanded:!expanded}));
    pinButton?.addEventListener('click',()=>setLayout({pinned:!pinned,expanded:true}));
    document.addEventListener('pointerdown',e=>{if(expanded&&!pinned&&bar&&!bar.contains(e.target)&&!e.target.closest('.workspace-action-menu')){expanded=false;render();}});
    bar?.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.isComposing&&expanded&&!pinned){expanded=false;render();}});

    return Object.freeze({ push, render, setLayout, renderSuggestions, hideSuggestions, completeFirst, journal,getLog: () => log.slice(),getHistory:()=>({rows:archive.map(r=>({...r})),dropped:archiveDropped,limit:5000,byteLimit:2*1024*1024,lineLimit:16000}), get expanded(){return expanded;}, get pinned(){return pinned;} });
  }

  root.commandConsole = Object.freeze({ create,createJournal });
})();
