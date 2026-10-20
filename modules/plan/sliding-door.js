/* Shared plan-symbol geometry; presentation only, with no persisted door fields. */
(() => {
  'use strict';
  const root=globalThis.PieniPlanModules=globalThis.PieniPlanModules||{};
  function segments(obj,g){
    if(!g||!['slidingSingle','slidingDouble'].includes(obj.doorType))return [];
    const dx=g.p2.x-g.p1.x,dy=g.p2.y-g.p1.y,width=Math.hypot(dx,dy);
    if(!Number.isFinite(width)||width<1e-6)return [];
    const ux=dx/width,uy=dy/width,nx=-uy,ny=ux,dir=obj.slideDirection===-1?-1:1;
    const thickness=Math.max(1,Number(g.wall.thickness)||150),half=thickness/2;
    const depth=Math.min(thickness*.24,width*.045),face=dir*(half-depth*.65),out=[];
    const point=(along,across)=>({x:g.p1.x+ux*along+nx*across,y:g.p1.y+uy*along+ny*across});
    const line=(a,b,role,weight=1.2)=>out.push({a,b,role,weight});
    const edge=(x1,y1,x2,y2,role,weight)=>line(point(x1,y1),point(x2,y2),role,weight);
    const leaf=(start,end)=>{
      const low=face-depth/2,high=face+depth/2;
      edge(start,low,end,low,'leaf',1.6);edge(end,low,end,high,'leaf',1.6);
      edge(end,high,start,high,'leaf',1.6);edge(start,high,start,low,'leaf',1.6);
    };
    // The host wall owns the jambs. These edges complete the opening frame.
    for(const side of [-1,1])edge(0,side*half,width,side*half,'frame',.85);
    const double=obj.doorType==='slidingDouble';
    const trackY=-dir*half*.35;
    edge(double?-width*.5:dir===1?0:-width,trackY,double?width*1.5:dir===1?width*2:width,trackY,'track',.85);
    if(double){const gap=Math.min(depth*.35,width*.008);leaf(0,width/2-gap/2);leaf(width/2+gap/2,width);}
    else leaf(0,width);
    const arrowY=dir*(half+Math.min(width*.12,Math.max(thickness*.65,width*.065)));
    const arrow=(start,end)=>{
      const sign=Math.sign(end-start),head=Math.min(width*.045,Math.abs(end-start)*.24),wing=head*.6;
      edge(start,arrowY,end,arrowY,'arrow',1.2);
      edge(end-sign*head,arrowY-wing,end,arrowY,'arrow',1.2);
      edge(end-sign*head,arrowY+wing,end,arrowY,'arrow',1.2);
    };
    if(double){arrow(width*.43,width*.1);arrow(width*.57,width*.9);}
    else arrow(width*(dir===1?.3:.7),width*(dir===1?.7:.3));
    return out;
  }
  root.slidingDoor=Object.freeze({segments});
})();
