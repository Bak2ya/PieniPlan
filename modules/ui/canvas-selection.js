/* Transient rectangle/point selection. Only apply invokes the caller's mutation. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function create(){let current=null;return{
    get current(){return current;},
    start(options){if(current)this.cancel();current={...options,rect:options.rect?{...options.rect}:null,drag:null,points:[],phase:options.rect?'preview':'select'};return current;},
    down(p,tolerance=0){const s=current;if(!s)return false;if(s.mode==='points'){if(s.phase==='result')return true;s.points.push({...p});s.onPoint?.({...p},s);return true;}let grip=null;if(s.rect){for(const [x,y] of [['minx','miny'],['minx','maxy'],['maxx','miny'],['maxx','maxy']])if(Math.hypot(p.x-s.rect[x],p.y-s.rect[y])<=tolerance){grip={x,y};break;}if(!grip&&p.x>=s.rect.minx&&p.x<=s.rect.maxx&&p.y>=s.rect.miny&&p.y<=s.rect.maxy)grip={move:true};}s.drag={start:{...p},before:s.rect?{...s.rect}:null,grip};s.phase='select';return true;},
    move(p){const s=current,d=s?.drag;if(!d)return false;if(d.grip?.move){const dx=p.x-d.start.x,dy=p.y-d.start.y;s.rect={minx:d.before.minx+dx,maxx:d.before.maxx+dx,miny:d.before.miny+dy,maxy:d.before.maxy+dy};}else if(d.grip){const r={...d.before,[d.grip.x]:p.x,[d.grip.y]:p.y};s.rect=root.sheetLayout.drag({x:r.minx,y:r.miny},{x:r.maxx,y:r.maxy},s.aspect);}else s.rect=root.sheetLayout.drag(d.start,p,s.aspect);return true;},
    up(){if(!current)return false;if(current.mode==='points')return true;current.drag=null;current.phase='preview';return true;},
    apply(){const s=current;if(!s)return false;if(s.mode==='points'&&s.phase!=='result')return false;if(s.mode!=='points')root.sheetLayout.rect(s.rect);current=null;s.onApply?.(s.rect,s);return true;},
    retry(){if(current){current.rect=null;current.points=[];current.drag=null;current.phase='select';}},
    cancel(){const s=current;current=null;s?.onCancel?.();return Boolean(s);}
  };}
  root.canvasSelection=Object.freeze({create});
})();
