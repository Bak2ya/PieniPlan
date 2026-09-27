/* PieniPlan Build26 P1: canonical-mm parse/format boundary. */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const num=s=>Number(String(s).trim().replace(/,/g,''));
  const finite=n=>Number.isFinite(n);
  function parseMixedNumber(raw){
    const s=String(raw??'').trim();if(!s)return NaN;
    if(/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(s))return Number(s);
    const m=s.match(/^([+-]?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);if(!m)return NaN;
    const den=Number(m[4]);if(!den)return NaN;const value=(Number(m[2]||0)+Number(m[3])/den);return m[1]==='-'?-value:value;
  }
  function parseLength(raw,{defaultUnit='mm'}={}){
    const s=String(raw??'').trim();if(!s)return{ok:false,code:'empty-length'};
    // Architectural feet/inches: 4', 4'-6", 4' 6 1/2", -4'-6.5".
    const feet=s.match(/^([+-]?)(\d+(?:\.\d+)?)\s*'\s*(?:-?\s*([^"']+?)\s*(?:"|in)?)?$/i);
    if(feet){const fv=Number(feet[2]),iv=feet[3]==null||feet[3].trim()===''?0:parseMixedNumber(feet[3]);if(!finite(fv)||!finite(iv)||iv<0)return{ok:false,code:'invalid-length'};const sign=feet[1]==='-'?-1:1;return{ok:true,mm:sign*(fv*12+iv)*25.4,unit:'ft-in'};}
    // Inches-only mixed fractions: 6 1/2", 1/2", 6.5in.
    const inches=s.match(/^([+-]?(?:(?:\d+\s+)?\d+\s*\/\s*\d+|\d+\.?\d*|\.\d+))\s*(?:"|in|inch|inches)$/i);
    if(inches){const iv=parseMixedNumber(inches[1]);if(!finite(iv))return{ok:false,code:'invalid-length'};return{ok:true,mm:iv*25.4,unit:'in'};}
    const m=s.match(/^([+-]?(?:\d+\.?\d*|\.\d+))\s*(mm|cm|m|in|inch|inches|ft|feet|foot|')?$/i);if(!m)return{ok:false,code:'invalid-length'};
    const v=num(m[1]);if(!finite(v))return{ok:false,code:'invalid-length'};let u=(m[2]||defaultUnit).toLowerCase();if(u==="'")u='ft';const f={mm:1,cm:10,m:1000,in:25.4,inch:25.4,inches:25.4,ft:304.8,feet:304.8,foot:304.8}[u];if(!f)return{ok:false,code:'unknown-unit'};return{ok:true,mm:v*f,unit:u};
  }
  function formatLength(mm,{system='metric',precision=1}={}){if(system==='imperial'){const total=Math.abs(mm)/25.4,feet=Math.floor(total/12),inches=total-feet*12,sign=mm<0?'-':'';return`${sign}${feet}'-${inches.toFixed(Math.min(3,precision+1))}"`;}return`${Number(mm).toFixed(precision)} mm`;}
  function formatArea(mm2,{system='metric',precision=2}={}){if(system==='imperial')return`${(Number(mm2)/92903.04).toFixed(precision)} ft²`;return`${(Number(mm2)/1e6).toFixed(precision)} m²`;}
  function formatAngle(deg,{precision=1}={}){return`${Number(deg).toFixed(precision)}°`;}
  root.cadUnits=Object.freeze({parseLength,formatLength,formatArea,formatAngle});
})();
