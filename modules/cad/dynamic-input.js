/* Ephemeral dimensional/pointer field locks. Values never enter project settings. */
(() => {
 'use strict';const M=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},finite=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y);
 function create(){let scope=null,mode='polar',values=[null,null];
  const reset=()=>{scope=null;values=[null,null];};
  function sync(key,nextMode=mode){if(scope!==key||nextMode!==mode){scope=key;mode=nextMode;values=[null,null];}}
  function lock(i,n){if(![0,1].includes(i)||!Number.isFinite(n)||mode==='polar'&&i===0&&n<0)return false;values[i]=n;return true;}
  function constrain(base,p){if(!finite(p))return p;if(values.every(n=>n===null))return{...p};if(mode==='polar'){if(!finite(base))return{...p};const length=values[0]??Math.hypot(p.x-base.x,p.y-base.y),angle=values[1]??Math.atan2(p.y-base.y,p.x-base.x)*180/Math.PI,r=angle*Math.PI/180;return{x:base.x+length*Math.cos(r),y:base.y+length*Math.sin(r)};}
   const origin=mode==='relative'&&finite(base)?base:{x:0,y:0};return{x:values[0]===null?p.x:origin.x+values[0],y:values[1]===null?p.y:origin.y+values[1]};}
  return Object.freeze({reset,sync,lock,unlock:i=>{values[i]=null;},status:()=>({scope,mode,values:[...values]}),constrain});
 }
 M.cadDynamicInput=Object.freeze({create});
})();
