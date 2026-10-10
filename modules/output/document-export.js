/* Output-only adapters. No model mutation; all geometry stays vector except source rasters/PDF underlays. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  const base=new URL('../../vendor/output/',document.currentScript.src);
  let libraries=null,font=null,pdfLibrary=null;
  const rasterCache=new WeakMap(),imageCache=new WeakMap();
  const url=name=>new URL(name,base).href;
  async function script(src){await new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>{s.remove();reject(new Error('output-library-unavailable'));};document.head.append(s);});}
  async function ready(){
    if(!libraries)libraries=(async()=>{await script(url('jspdf/jspdf.umd.min.js'));await script(url('svg2pdf.js/svg2pdf.umd.min.js'));})().catch(e=>{libraries=null;throw e;});
    if(!font)font=(async()=>{const response=await fetch(url('PieniPlanOutputSans.ttf'));if(!response.ok)throw Error('output-font-unavailable');const bytes=new Uint8Array(await response.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));return btoa(binary);})().catch(e=>{font=null;throw e;});
    await libraries;await font;await document.fonts.load('16px PieniPlanOutputSans');
  }
  async function renderer(){if(!pdfLibrary)pdfLibrary=import(url('pdfjs-dist/pdf.mjs')).then(lib=>{lib.GlobalWorkerOptions.workerSrc=url('pdfjs-dist/pdf.worker.mjs');return lib;}).catch(e=>{pdfLibrary=null;throw e;});return pdfLibrary;}
  function dataBytes(data){if(!/^data:application\/pdf[;,]/i.test(data||''))throw Error('reference-pdf-data-missing');const comma=data.indexOf(','),raw=/;base64/i.test(data.slice(0,comma))?atob(data.slice(comma+1)):decodeURIComponent(data.slice(comma+1));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
  async function imageAsset(ref,modelScale){
    if(/^data:image\/(png|jpeg);base64,/i.test(ref.dataUrl||''))return{dataUrl:ref.dataUrl,rasterized:false};
    if(!/^data:image\//i.test(ref.dataUrl||''))throw Error('output-image-data-missing');
    const previous=imageCache.get(ref);if(previous?.source===ref.dataUrl&&previous.scale===modelScale)return previous.promise;
    const promise=(async()=>{let image=ref.image;if(!image?.naturalWidth)image=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('output-image-decode'));img.src=ref.dataUrl;});
      const vector=/^data:image\/svg/i.test(ref.dataUrl),desiredW=vector?ref.width*ref.scale/modelScale*300/25.4:image.naturalWidth,desiredH=vector?ref.height*ref.scale/modelScale*300/25.4:image.naturalHeight,limit=Math.min(1,8192/desiredW,8192/desiredH,Math.sqrt(16000000/(desiredW*desiredH))),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.floor(desiredW*limit));canvas.height=Math.max(1,Math.floor(desiredH*limit));try{canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);return{dataUrl:canvas.toDataURL('image/png'),rasterized:vector,converted:true,effectiveDpi:vector?300*limit:undefined};}finally{canvas.width=canvas.height=0;}
    })();imageCache.set(ref,{source:ref.dataUrl,scale:modelScale,promise});try{return await promise;}catch(e){imageCache.delete(ref);throw e;}
  }
  async function pdfRaster(ref,modelScale,{dpi=300}={}){
    if(!Number.isFinite(modelScale)||modelScale<=0)throw Error('sheet-scale');
    const desiredW=Math.max(1,ref.width*ref.scale/modelScale*dpi/25.4),desiredH=Math.max(1,ref.height*ref.scale/modelScale*dpi/25.4),limit=Math.min(1,8192/desiredW,8192/desiredH,Math.sqrt(16000000/(desiredW*desiredH))),width=Math.max(32,Math.round(desiredW*limit));
    const previous=rasterCache.get(ref),key=ref.dataUrl;
    if(previous?.key===key&&previous.width===width)return previous.promise;
    const promise=(async()=>{const lib=await renderer();let fontSubstituted=false;class LocalBinaryFactory{constructor(paths){Object.assign(this,paths);}async fetch({kind,filename}){if(!['cMapUrl','standardFontDataUrl','wasmUrl'].includes(kind)||!/^[\w.-]+$/.test(filename))throw Error('pdf-resource-invalid');let source=this[kind]+filename;if(kind==='standardFontDataUrl'&&filename.startsWith('Liberation')){source=url('PieniPlanOutputSans.ttf');fontSubstituted=true;}const response=await fetch(source);if(!response.ok)throw Error('pdf-resource-unavailable');return new Uint8Array(await response.arrayBuffer());}}const task=lib.getDocument({data:dataBytes(key),isEvalSupported:false,stopAtErrors:true,BinaryDataFactory:LocalBinaryFactory,useWorkerFetch:false,cMapUrl:url('pdfjs-dist/cmaps/'),cMapPacked:true,standardFontDataUrl:url('pdfjs-dist/standard_fonts/'),wasmUrl:url('pdfjs-dist/wasm/'),iccUrl:url('pdfjs-dist/iccs/'),canvasMaxAreaInBytes:64000000,useSystemFonts:false});let pdf=null;
      try{pdf=await task.promise;const page=await pdf.getPage(Number(ref.page)||1),viewport=page.getViewport({scale:1}),scale=Math.min(width/viewport.width,8192/viewport.width,8192/viewport.height,Math.sqrt(16000000/(viewport.width*viewport.height))),v=page.getViewport({scale}),canvas=document.createElement('canvas');canvas.width=Math.ceil(v.width);canvas.height=Math.ceil(v.height);const ctx=canvas.getContext('2d');await page.render({canvasContext:ctx,viewport:v,background:'rgb(255,255,255)'}).promise;const dataUrl=canvas.toDataURL('image/png');canvas.width=canvas.height=0;return{dataUrl,width,height:Math.ceil(v.height),effectiveDpi:dpi*limit,rasterized:true,fontSubstituted};}
      finally{await task.destroy();}
    })();rasterCache.set(ref,{key,width,promise});try{return await promise;}catch(e){rasterCache.delete(ref);throw e;}
  }
  async function generate(pages){
    if(!Array.isArray(pages)||!pages.length)throw Error('no-output-pages');await ready();
    const {jsPDF}=window.jspdf,first=pages[0],doc=new jsPDF({orientation:first.width>first.height?'landscape':'portrait',unit:'mm',format:[first.width,first.height],compress:true,putOnlyUsedFonts:true,floatPrecision:16});
    doc.addFileToVFS('PieniPlanOutputSans.ttf',await font);doc.addFont('PieniPlanOutputSans.ttf','PieniPlanOutputSans','normal');doc.setFont('PieniPlanOutputSans');doc.setProperties({title:first.name||'PieniPlan drawing',creator:'PieniPlan'});
    for(let i=0;i<pages.length;i++){
      const page=pages[i];if(!Number.isFinite(page.width)||!Number.isFinite(page.height)||page.width<=0||page.height<=0)throw Error('output-page-size');
      if(i)doc.addPage([page.width,page.height],page.width>page.height?'landscape':'portrait');
      const parsed=new DOMParser().parseFromString(page.svg,'image/svg+xml');if(parsed.querySelector('parsererror'))throw Error('output-scene-invalid');const svg=parsed.documentElement;
      if(svg.querySelector('script,foreignObject'))throw Error('output-scene-unsafe');
      for(const image of svg.querySelectorAll('image'))if(!/^data:image\/(png|jpeg|webp);base64,/i.test(image.getAttribute('href')||''))throw Error('output-image-data-missing');
      const ids=new Map([...svg.querySelectorAll('[id]')].map(e=>[e.id,`page${i}-${e.id}`]));for(const e of svg.querySelectorAll('*')){if(e.id)e.id=ids.get(e.id);for(const a of [...e.attributes]){if(!a.value.includes('url(#'))continue;let value=a.value;for(const [old,next]of ids)value=value.replaceAll(`url(#${old})`,`url(#${next})`);e.setAttribute(a.name,value);}}
      for(const text of svg.querySelectorAll('text')){text.setAttribute('font-family','PieniPlanOutputSans');text.setAttribute('font-weight','normal');}
      const holder=document.createElement('div');holder.style.cssText='position:fixed;left:-100000px;top:0;pointer-events:none';holder.append(document.importNode(svg,true));document.body.append(holder);
      try{await doc.svg(holder.firstElementChild,{x:0,y:0,width:page.width,height:page.height});}finally{holder.remove();}
    }
    return{blob:doc.output('blob'),pages:pages.map(p=>({width:p.width,height:p.height,name:p.name})),pageCount:pages.length};
  }
  root.outputDocument=Object.freeze({ready,renderer,pdfRaster,imageAsset,generate});
})();
