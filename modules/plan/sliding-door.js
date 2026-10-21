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
    const depth=Math.min(thickness*.28,width*.032),face=dir*half*.7,out=[];
    const point=(along,across)=>({x:g.p1.x+ux*along+nx*across,y:g.p1.y+uy*along+ny*across});
    const line=(a,b,role,weight=1.2)=>out.push({a,b,role,weight});
    const edge=(x1,y1,x2,y2,role,weight)=>line(point(x1,y1),point(x2,y2),role,weight);
    const leaf=(start,end)=>{
      const low=face-depth/2,high=face+depth/2;
      edge(start,low,end,low,'leaf',1.6);edge(end,low,end,high,'leaf',1.6);
      edge(end,high,start,high,'leaf',1.6);edge(start,high,start,low,'leaf',1.6);
    };
    // The host wall owns the short jambs and surrounding walls. No extended rail
    // or extra frame implies a fixed glazing bay beyond the actual opening.
    const double=obj.doorType==='slidingDouble';
    if(double){const gap=Math.min(depth*.35,width*.012);leaf(0,width/2-gap/2);leaf(width/2+gap/2,width);}
    else leaf(0,width);
    const arrowY=face+dir*depth*.85;
    const arrow=(start,end)=>{
      const sign=Math.sign(end-start),head=Math.min(width*.025,depth*.75,Math.abs(end-start)*.24),wing=head*.5;
      edge(start,arrowY,end,arrowY,'arrow',1.2);
      edge(end-sign*head,arrowY-wing,end,arrowY,'arrow',1.2);
      edge(end-sign*head,arrowY+wing,end,arrowY,'arrow',1.2);
    };
    if(double){arrow(width*.41,width*.15);arrow(width*.59,width*.85);}
    else arrow(width*(dir===1?.36:.64),width*(dir===1?.75:.25));
    return out;
  }
  root.slidingDoor=Object.freeze({segments});
})();
