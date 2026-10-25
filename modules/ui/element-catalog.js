/* Temporary inspector navigation. No project, selection or camera ownership. */
(()=>{
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(p){
    const panel=document.getElementById('workspaceInspector'),body=panel.querySelector('.inspector-body');
    const screen=document.createElement('section');screen.className='element-catalog';screen.hidden=true;screen.setAttribute('aria-label',p.t('catalog93.title'));body.append(screen);
    const L=(ko,en)=>p.language()==='ko'?ko:en;
    let origin=null,current='all',query='',open=false;
    const groups=()=>[['all',L('전체 요소','All elements')],['doors',L('문','Doors')],['windows',L('창','Windows')],['bathroom',L('위생설비','Sanitary fixtures')],['kitchen',L('주방설비','Kitchen')],['equipment',L('가전·기기','Appliances')],['furniture',L('가구','Furniture')],['other',L('기타','Other')]];
    function button(label,run){const b=document.createElement('button');b.type='button';b.className='small-button';b.textContent=label;b.onclick=run;return b;}
    function close({restore=true}={}){if(!open)return;open=false;screen.hidden=true;panel.classList.remove('catalog-open');if(restore)(origin?.isConnected?origin:p.host).focus({preventScroll:true});p.chrome()?.scheduleClose();}
    function cards(){const components=root.componentLibrary.list().map(asset=>({id:asset.id,category:['laundry'].includes(asset.category)?'equipment':asset.category,name:root.componentLibrary.label(asset,p.language()),size:`${Math.round(asset.width)} × ${Math.round(asset.depth)} mm`,svg:p.componentThumbnail(asset),pick:()=>{p.state.activeComponentAssetId=asset.id;p.pick('component');}}));
      const doors=p.doors().map(item=>({id:item.id,category:'doors',name:p.t(item.labelKey),size:L('벽 개구부 · 폭 편집 가능','Wall opening · adjustable width'),svg:p.doorThumbnail(item.id),pick:()=>p.pick('door',item.id)}));
      return [...doors,{id:'window',category:'windows',name:p.t('tool.window'),size:L('벽 부착 · 폭 편집 가능','Wall attached · adjustable width'),svg:p.doorThumbnail('window'),pick:()=>p.pick('window')},...components];}
    function render(){screen.replaceChildren();const header=document.createElement('header'),title=document.createElement('strong');title.textContent=L('요소 카탈로그','Element catalog');header.append(button(L('뒤로','Back'),()=>{if(current!=='all'||query){current='all';query='';render();}else close();}),title,button(L('닫기','Close'),()=>close()));
      const search=document.createElement('input');search.className='text-input';search.type='search';search.placeholder=L('문·구성품 검색','Search doors and components');search.setAttribute('aria-label',search.placeholder);search.value=query;
      const categories=document.createElement('select');categories.className='select-input';categories.setAttribute('aria-label',L('요소 분류','Element category'));for(const [value,label]of groups()){const o=document.createElement('option');o.value=value;o.textContent=label;categories.append(o);}categories.value=current;
      const list=document.createElement('div');list.className='element-catalog-grid';list.setAttribute('role','list');
      function results(){list.replaceChildren();const q=query.trim().toLocaleLowerCase();for(const item of cards()){if(current!=='all'&&item.category!==current||q&&!item.name.toLocaleLowerCase().includes(q))continue;const card=button('',()=>{close({restore:false});item.pick();p.host.focus({preventScroll:true});});card.className='element-catalog-card';card.dataset.elementId=item.id;card.setAttribute('aria-label',item.name+' · '+item.size);card.setAttribute('aria-pressed',String(p.selected(item.id)));const image=document.createElement('span');image.className='element-catalog-preview';image.innerHTML=item.svg;const name=document.createElement('strong');name.textContent=item.name;const size=document.createElement('small');size.textContent=item.size;card.append(image,name,size);list.append(card);}if(!list.children.length){const empty=document.createElement('p');empty.textContent=L('검색 결과가 없습니다.','No matching elements.');list.append(empty);}}
      search.oninput=()=>{query=search.value;results();};categories.onchange=()=>{current=categories.value;results();};screen.append(header,search,categories,list);results();}
    function show(category='all'){if(!open)origin=document.activeElement;current=category;query='';open=true;panel.classList.add('catalog-open');screen.hidden=false;p.chrome()?.reveal({explicit:true});render();screen.querySelector('input').focus({preventScroll:true});}
    document.addEventListener('keydown',e=>{if(open&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();close();}},true);
    panel.querySelector('.inspector-tabs').addEventListener('click',()=>close({restore:false}));
    return Object.freeze({open:show,close,get isOpen(){return open;}});
  }
  root.elementCatalog=Object.freeze({create});
})();
