/* Generic 2D mechanisms, not fabrication/shop drawings or a vendor hardware specification. */
(()=>{
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{},capability='plan.door.mechanism.v1';
  const types=['slidingSingle','slidingDouble','bypass','pocket','pocketDouble','folding'];
  function defaults(type){return type==='folding'?{version:1,hardware:'paired-guide',panelCount:4,stack:'start',foldSide:1,openAngle:75,trafficAngle:90,panelThickness:35}:{version:1,hardware:type,openRatio:.35,panelThickness:35,overlap:30};}
  function validate(o){const m=o.doorModel93;if(!m)return o;if(o.type!=='door'||!types.includes(o.doorType)||m.version!==1||!Number.isFinite(m.panelThickness)||m.panelThickness<10||m.panelThickness>100)throw Error('door-mechanism');
    if(o.doorType==='folding'){if(!Number.isInteger(m.panelCount)||m.panelCount<2||m.panelCount>8||!['paired-guide','paired-guide-traffic'].includes(m.hardware)||!['start','end','both'].includes(m.stack)||![1,-1].includes(m.foldSide)||!Number.isFinite(m.openAngle)||m.openAngle<0||m.openAngle>85||!Number.isFinite(m.trafficAngle)||m.trafficAngle<0||m.trafficAngle>100)throw Error('folding-configuration');
      if(m.panelCount%2===1?(m.hardware!=='paired-guide-traffic'||m.stack==='both'):(m.hardware!=='paired-guide'))throw Error('folding-hardware-parity');if(m.stack==='both'&&m.panelCount%4!==0)throw Error('folding-both-pairs');
    }else if(m.hardware!==o.doorType||!Number.isFinite(m.openRatio)||m.openRatio<0||m.openRatio>1||!Number.isFinite(m.overlap)||m.overlap<0||m.overlap>200)throw Error('sliding-configuration');return o;
  }
  function segments(o,g){if(!o.doorModel93||!g)return[];validate(o);const m=o.doorModel93,w=Math.hypot(g.p2.x-g.p1.x,g.p2.y-g.p1.y);if(w<1e-6)return[];const ux=(g.p2.x-g.p1.x)/w,uy=(g.p2.y-g.p1.y)/w,nx=-uy,ny=ux,out=[],t=m.panelThickness,wallHalf=(g.wall.thickness||150)/2;
    const pt=(x,y)=>{if(o.doorType==='bypass'&&o.slideDirection===-1)x=w-x;return{x:g.p1.x+ux*x+nx*y,y:g.p1.y+uy*x+ny*y};},edge=(a,b,role='leaf',dashed=false)=>out.push({a:pt(...a),b:pt(...b),role,dashed,weight:role==='leaf'?1.6:1});
    const panel=(a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy);if(l<1e-8)return;const ox=-dy/l*t/2,oy=dx/l*t/2,ps=[[a[0]+ox,a[1]+oy],[b[0]+ox,b[1]+oy],[b[0]-ox,b[1]-oy],[a[0]-ox,a[1]-oy]];for(let i=0;i<4;i++)edge(ps[i],ps[(i+1)%4]);};
    const pin=(a,role)=>{const r=Math.max(3,Math.min(8,t*.15)),n=12;for(let i=0;i<n;i++)edge([a[0]+r*Math.cos(i*2*Math.PI/n),a[1]+r*Math.sin(i*2*Math.PI/n)],[a[0]+r*Math.cos((i+1)*2*Math.PI/n),a[1]+r*Math.sin((i+1)*2*Math.PI/n)],role);};
    const arrow=(a,b)=>{edge(a,b,'arrow');const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy),h=Math.min(45,l*.18);if(l<1e-8)return;const x=dx/l,y=dy/l;edge([b[0]-h*x-h*.45*y,b[1]-h*y+h*.45*x],b,'arrow');edge([b[0]-h*x+h*.45*y,b[1]-h*y-h*.45*x],b,'arrow');};
    for(const x of[0,w])edge([x,-wallHalf],[x,wallHalf],'jamb');
    if(o.doorType==='folding'){
      edge([0,0],[w,0],'rail');const n=m.panelCount,side=m.foldSide,angle=m.openAngle*Math.PI/180,L=w/n;
      function chain(count,origin,sign,traffic){let a=[origin,0];pin(a,'pivot');for(let i=0;i<count;i++){let b;if(traffic&&i===count-1){const r=m.trafficAngle*Math.PI/180;b=[a[0]+sign*L*Math.cos(r),a[1]+side*L*Math.sin(r)];}else b=[a[0]+sign*L*Math.cos(angle),a[1]+side*(i%2===0?1:-1)*L*Math.sin(angle)];panel(a,b);pin(b,traffic&&i===count-1?'free-edge':i%2===1?'guide':'hinge');a=b;}}
      if(m.stack==='both'){chain(n/2,0,1,false);chain(n/2,w,-1,false);}else chain(n,m.stack==='end'?w:0,m.stack==='end'?-1:1,n%2===1);
    }else if(o.doorType==='bypass'){
      const overlap=Math.min(m.overlap,w*.25),L=(w+overlap)/2,y=wallHalf+t,travel=(w-L)*m.openRatio,sign=1;
      for(const yy of[y,y+t+8])edge([0,yy],[w,yy],'rail');panel([travel,y],[travel+L,y]);panel([w-L,y+t+8],[w,y+t+8]);arrow([L*.35,y+2*t+30],[L*.35+sign*Math.min(w*.2,L*.4),y+2*t+30]);
    }else{
      const pocket=o.doorType.startsWith('pocket'),double=o.doorType==='pocketDouble'||o.doorType==='slidingDouble',L=double?w/2:w,sign=o.slideDirection===-1?-1:1,y=pocket?0:sign*(wallHalf+t/2+10),travel=L*m.openRatio;
      const leaf=(start,dir)=>{const a=start+dir*travel,b=a+L;panel([a,y],[b,y]);arrow([a+L*.4,y+sign*(t+25)],[a+L*.4+dir*Math.min(150,L*.2),y+sign*(t+25)]);};
      const railMin=double?-L:sign===-1?-w:0,railMax=double?w+L:sign===1?2*w:w;edge([railMin,y],[railMax,y],'rail',pocket);
      if(double){leaf(0,-1);leaf(w/2,1);}else leaf(0,sign);
      if(pocket){const cavity=(a,b)=>{for(const yy of[-t/2-8,t/2+8])edge([a,yy],[b,yy],'pocket',true);edge([a,-t/2-8],[a,t/2+8],'pocket',true);edge([b,-t/2-8],[b,t/2+8],'pocket',true);};if(double){cavity(-L,0);cavity(w,w+L);}else cavity(sign===1?w:-w,sign===1?2*w:0);}
    }
    return out;
  }
  root.doorMechanisms=Object.freeze({capability,types,defaults,validate,segments});
})();
