/* One transient, world-anchored text draft. Browser editing undo stays inside the text field. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(p){
    let session=null,composing=false,lastComposition=-Infinity,blurPending=false;
    const L=(ko,en)=>p.language()==='ko'?ko:en;
    const element=document.createElement('div');element.className='inline-text-editor';element.hidden=true;p.host.append(element);
    const frame=document.createElement('div');frame.className='inline-text-frame';
    const area=document.createElement('textarea');area.className='inline-text-input';area.spellcheck=false;area.setAttribute('aria-label',L('도면 문자 직접 편집','Edit drawing text in place'));frame.append(area);
    const tools=document.createElement('div');tools.className='inline-text-tools';tools.setAttribute('role','group');element.append(frame,tools);
    const field=(name,input)=>{const label=document.createElement('label'),span=document.createElement('span');span.textContent=name;label.append(span,input);tools.append(label);return input;};
    const height=field(L('문자 높이','Text height'),document.createElement('input'));height.type='text';height.inputMode='decimal';
    const align=field(L('정렬','Alignment'),document.createElement('select'));for(const [value,ko,en] of [['left','왼쪽','Left'],['center','가운데','Center'],['right','오른쪽','Right']]){const o=document.createElement('option');o.value=value;o.textContent=L(ko,en);align.append(o);}
    const rotation=field(L('회전 °','Rotation °'),document.createElement('input'));rotation.type='number';rotation.step='any';
    const width=field(L('줄 폭','Line width'),document.createElement('input'));width.type='text';width.inputMode='decimal';
    const hint=document.createElement('span');hint.className='inline-text-hint';hint.setAttribute('role','status');
    const done=document.createElement('button');done.type='button';done.textContent=L('완료','Done');const cancel=document.createElement('button');cancel.type='button';cancel.textContent=L('취소','Cancel');tools.append(hint,done,cancel);
    function read(){if(!session)return false;const h=height.value===session.inputDefaults?.heightText?{ok:true,mm:session.inputDefaults.height}:p.parseLength(height.value),w=width.value===session.inputDefaults?.widthText?{ok:true,mm:session.inputDefaults.width}:p.parseLength(width.value),a=Number(rotation.value);if(!h.ok||h.mm<=0||!w.ok||w.mm<0||!Number.isFinite(a)){hint.textContent=L('높이·폭·회전 값을 확인하세요.','Check height, width and rotation.');return false;}
      let text=area.value;if(!session.multiline&&/[\r\n]/.test(text)){text=text.replace(/[\r\n]+/g,' ');area.value=text;}
      Object.assign(session.object,{text,height:h.mm,width:session.multiline?w.mm:0,rotation:a,alignment:align.value});hint.textContent=session.multiline?L('줄바꿈 Enter · 완료 ⌘/Ctrl+Enter','Enter: new line · ⌘/Ctrl+Enter: done'):L('완료 Enter · 취소 Esc','Enter: done · Esc: cancel');return true;
    }
    function sync(){if(!session)return;const o=session.object,q=p.screen(o.point),zoom=p.zoom(),layout=p.layout(o),font=Math.min(900,Math.max(.5,o.height*zoom)),w=Math.max(font*2,(o.width>0?o.width:Math.max(o.height*2,layout.maxx-layout.minx)+12/zoom)*zoom),lines=Math.max(1,layout.lines.length),lineHeight=o.height*(o.lineSpacing||1.25)*zoom,ascent=Math.max(font*.8,layout.maxy*zoom),lead=Math.max(0,(lineHeight-font)/2),shift=o.alignment==='center'?w/2:o.alignment==='right'?w:0;
      frame.style.left=q.x+'px';frame.style.top=q.y+'px';frame.style.transform=`rotate(${-((Number(o.rotation)||0)+p.viewAngle())}deg)`;
      area.style.cssText=`left:${-shift}px;top:${-ascent-lead}px;width:${w}px;height:${Math.max(lineHeight,lines*lineHeight+2)}px;font-size:${font}px;line-height:${lineHeight}px;text-align:${o.alignment||'left'};white-space:${o.width>0?'pre-wrap':'pre'};overflow-wrap:break-word;`;
      area.wrap=o.width>0?'soft':'off';element.dataset.worldX=String(o.point.x);element.dataset.worldY=String(o.point.y);
      const size=p.host.getBoundingClientRect();tools.style.left=Math.max(4,Math.min(Math.max(4,size.width-tools.offsetWidth-4),q.x-shift))+'px';tools.style.top=Math.max(4,Math.min(Math.max(4,size.height-tools.offsetHeight-4),q.y-ascent-lead-tools.offsetHeight-8))+'px';
    }
    function close(reason,notify=true){if(!session)return;const previous=session;session=null;composing=false;blurPending=false;element.hidden=true;area.value='';if(notify)p.end(reason,previous);p.render();}
    function finish(){if(!session||composing)return false;if(!read())return false;if(!session.object.text.trim()){close('cancel');return false;}try{if(p.commit(session)===false){hint.textContent=L('문자를 저장할 수 없습니다. 작업 상태를 확인하세요.','Cannot save text. Check the current drawing context.');return false;}close('commit');return true;}catch(e){hint.textContent=p.error(e);return false;}}
    function open(data){area.setAttribute('aria-label',L('도면 문자 직접 편집','Edit drawing text in place'));height.previousSibling.textContent=L('문자 높이','Text height');align.previousSibling.textContent=L('정렬','Alignment');rotation.previousSibling.textContent=L('회전 °','Rotation °');width.previousSibling.textContent=L('줄 폭','Line width');done.textContent=L('완료','Done');cancel.textContent=L('취소','Cancel');for(const o of align.options)o.textContent=L(({left:'왼쪽',center:'가운데',right:'오른쪽'})[o.value],({left:'Left',center:'Center',right:'Right'})[o.value]);close('cancel',false);session={...data,object:JSON.parse(JSON.stringify(data.object))};height.value=p.formatLength(session.object.height);width.value=p.formatLength(session.object.width||0);rotation.value=String(session.object.rotation||0);align.value=session.object.alignment||'left';area.value=session.object.text||'';session.inputDefaults={heightText:height.value,height:Number(session.object.height)||180,widthText:width.value,width:Number(session.object.width)||0};element.hidden=false;read();sync();p.render();area.focus();if(session.editingId)area.select();return true;}
    area.addEventListener('input',()=>{if(read())sync();});for(const input of [height,width,rotation,align])input.addEventListener('input',()=>{if(read())sync();});
    area.addEventListener('compositionstart',()=>{composing=true;});area.addEventListener('compositionend',()=>{composing=false;lastComposition=performance.now();read();sync();if(blurPending){blurPending=false;setTimeout(()=>{if(session&&!element.contains(document.activeElement))finish();},0);}});
    element.addEventListener('focusout',()=>{queueMicrotask(()=>{if(!session||element.contains(document.activeElement))return;if(composing)blurPending=true;else finish();});});
    document.addEventListener('keydown',e=>{if(!session)return;if(!element.contains(e.target)&&!['Escape'].includes(e.key))return;e.stopImmediatePropagation();if(e.isComposing||composing||e.keyCode===229||e.key==='Process')return;if(['Enter','Escape'].includes(e.key)&&performance.now()-lastComposition<50){e.preventDefault();return;}if(e.key==='Enter'&&['BUTTON','SELECT'].includes(e.target.tagName)&&!e.metaKey&&!e.ctrlKey)return;if((e.metaKey||e.ctrlKey)&&['s','p'].includes(e.key.toLowerCase())){e.preventDefault();if(finish()||!session)Promise.resolve(e.key.toLowerCase()==='s'?p.save?.():p.plot?.()).catch(error=>{hint.textContent=p.error(error);});return;}
      if(e.key==='Escape'){e.preventDefault();close('cancel');}else if(e.key==='Enter'&&(e.target!==area||!session.multiline||e.metaKey||e.ctrlKey)){e.preventDefault();finish();}
    },true);
    done.onclick=finish;cancel.onclick=()=>close('cancel');
    return Object.freeze({open,finish,cancel:({notify=true}={})=>close('cancel',notify),sync,get active(){return Boolean(session);},get draft(){return session;}});
  }
  root.inlineTextEditor=Object.freeze({create});
})();
