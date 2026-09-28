/* PieniPlan Build35 Starter Components.
 * Geometry is a normalized PieniPlan redraw from CADdillo CC0 published plan footprints,
 * not a verbatim copy of source DXF geometry. See assets/components/ASSET_PROVENANCE.md.
 */
(() => {
  'use strict';
  const root = globalThis.PieniPlanModules = globalThis.PieniPlanModules || {};
  const IN = 25.4;
  const mm = inches => inches * IN;
  const A = (id, nameKo, nameEn, category, wIn, dIn, datum, symbol, sourceName, sourceUrl) => ({
    id, nameKo, nameEn, category, width:mm(wIn), depth:mm(dIn), datum, symbol,
    source:'CADdillo', license:'CC0-1.0', sourceName, sourceUrl, sourceUnit:'in',
    normalized:true
  });

  // A deliberately compact starter set: ordinary plan fixtures/furniture only.
  // Published footprints are used so placement scale is useful from the first build.
  const assets = [
    A('fixture.toilet','변기','Toilet','bathroom',20,29,'back-center','toilet','Toilet','https://caddillo.com/blocks/toilets-and-urinals/'),
    A('fixture.urinal','소변기','Wall-Hung Urinal','bathroom',18,14,'back-center','urinal','Wall-Hung Urinal','https://caddillo.com/blocks/toilets-and-urinals/'),
    A('fixture.lavatory.rect','사각 세면대','Rectangular Lavatory','bathroom',31,22,'back-center','lavatory-rect','Rectangular Bathroom Lavatory','https://caddillo.com/blocks/sinks/'),
    A('fixture.lavatory.round','원형 세면대','Round Lavatory','bathroom',29,22,'back-center','lavatory-round','Round Bathroom Lavatory','https://caddillo.com/blocks/sinks/'),
    A('fixture.handwash','손세정대','Hand-Wash Sink','bathroom',17,15,'back-left','sink','Hand-Wash Sink','https://caddillo.com/blocks/sinks/'),
    A('fixture.kitchen-sink.single','싱글 싱크','Single-Bowl Kitchen Sink','kitchen',30,22,'back-center','sink','Single-Bowl Kitchen Sink','https://caddillo.com/blocks/sinks/'),
    A('fixture.kitchen-sink.double','더블 싱크','Double-Bowl Kitchen Sink','kitchen',33,22,'back-center','double-sink','Double-Bowl Kitchen Sink','https://caddillo.com/blocks/sinks/'),
    A('fixture.bathtub','욕조','Bathtub','bathroom',60,30,'back-center','bathtub','Bathtub','https://caddillo.com/blocks/bathtubs-and-showers/'),
    A('fixture.shower','샤워부스','Shower Stall','bathroom',36,36,'back-center','shower','Shower Stall','https://caddillo.com/blocks/bathtubs-and-showers/'),
    A('fixture.floor-drain','바닥 배수구','Floor Drain','bathroom',6,6,'center','drain','Floor Drain','https://caddillo.com/blocks/floor-and-trench-drains/'),
    A('appliance.range','레인지','30-inch Kitchen Range','kitchen',30,25,'back-center','range','30-inch Kitchen Range','https://caddillo.com/blocks/kitchen-appliances/'),
    A('appliance.refrigerator','냉장고','36-inch Refrigerator','kitchen',36,30,'back-center','appliance','36-inch Refrigerator','https://caddillo.com/blocks/kitchen-appliances/'),
    A('appliance.dishwasher','식기세척기','24-inch Dishwasher','kitchen',24,24,'back-center','appliance','24-inch Dishwasher','https://caddillo.com/blocks/kitchen-appliances/'),
    A('appliance.washer','세탁기','27-inch Washing Machine','laundry',27,27,'back-center','washer','27-inch Washing Machine','https://caddillo.com/blocks/laundry-appliances/'),
    A('appliance.dryer','건조기','27-inch Clothes Dryer','laundry',27,27,'back-center','dryer','27-inch Clothes Dryer','https://caddillo.com/blocks/laundry-appliances/'),
    A('appliance.washer-dryer','세탁건조기','Stacked Washer and Dryer','laundry',27,31,'back-center','washer-dryer','Stacked Washer and Dryer','https://caddillo.com/blocks/laundry-appliances/'),
    A('furniture.desk48','책상','48-inch Desk','furniture',48,24,'back-left','desk','48-inch Desk','https://caddillo.com/blocks/tables-and-desks/'),
    A('furniture.chair.dining','의자','Dining Chair','furniture',18,20,'near-left','chair','Dining Chair','https://caddillo.com/blocks/seating/'),
    A('furniture.sofa84','소파','84-inch Sofa','furniture',84,36,'near-left','sofa','84-inch Sofa','https://caddillo.com/blocks/seating/'),
    A('furniture.loveseat58','2인 소파','58-inch Loveseat','furniture',58,34,'near-left','sofa','58-inch Loveseat','https://caddillo.com/blocks/seating/'),
    A('furniture.bed.queen','퀸 침대','Queen Bed','furniture',60,83,'back-left','bed','Bed (Queen)','https://caddillo.com/blocks/storage-furniture/'),
    A('furniture.nightstand','협탁','Nightstand','furniture',24,18,'back-left','cabinet','Nightstand 24x18','https://caddillo.com/blocks/storage-furniture/'),
    A('furniture.bookshelf36','책장','36-inch Bookshelf','furniture',36,12,'back-left','cabinet','36-inch Bookshelf','https://caddillo.com/blocks/storage-furniture/'),
    A('furniture.dining-table','식탁','Dining Table','furniture',110,78,'near-left','dining-table','Dining Table','https://caddillo.com/blocks/tables-and-desks/')
  ];
  const byId = new Map(assets.map(a=>[a.id,Object.freeze(a)]));

  function localBounds(asset){
    const w=asset.width,d=asset.depth;
    switch(asset.datum){
      case 'back-center': return {minx:-w/2,miny:0,maxx:w/2,maxy:d};
      case 'center': return {minx:-w/2,miny:-d/2,maxx:w/2,maxy:d/2};
      default: return {minx:0,miny:0,maxx:w,maxy:d};
    }
  }
  function localPoint(instance,p){
    const asset=byId.get(instance.assetId); if(!asset||!instance.point)return null;
    const dx=p.x-instance.point.x,dy=p.y-instance.point.y,a=-(Number(instance.rotation)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a);
    let x=dx*c-dy*s,y=dx*s+dy*c;
    const sx=(Number(instance.scaleX)||1)*(instance.mirrorX?-1:1),sy=(Number(instance.scaleY)||1)*(instance.mirrorY?-1:1);
    if(Math.abs(sx)<1e-9||Math.abs(sy)<1e-9)return null;
    return {x:x/sx,y:y/sy};
  }
  function worldPoint(instance,p){
    const sx=(Number(instance.scaleX)||1)*(instance.mirrorX?-1:1),sy=(Number(instance.scaleY)||1)*(instance.mirrorY?-1:1),a=(Number(instance.rotation)||0)*Math.PI/180,c=Math.cos(a),s=Math.sin(a),x=p.x*sx,y=p.y*sy;
    return {x:instance.point.x+x*c-y*s,y:instance.point.y+x*s+y*c};
  }
  function bounds(instance){
    const asset=byId.get(instance.assetId); if(!asset||!instance.point)return null;const b=localBounds(asset),pts=[{x:b.minx,y:b.miny},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy},{x:b.minx,y:b.maxy}].map(p=>worldPoint(instance,p));
    return pts.reduce((r,p)=>({minx:Math.min(r.minx,p.x),miny:Math.min(r.miny,p.y),maxx:Math.max(r.maxx,p.x),maxy:Math.max(r.maxy,p.y)}),{minx:Infinity,miny:Infinity,maxx:-Infinity,maxy:-Infinity});
  }
  function hitDistance(instance,p){
    const asset=byId.get(instance.assetId),q=localPoint(instance,p);if(!asset||!q)return Infinity;const b=localBounds(asset);
    if(q.x>=b.minx&&q.x<=b.maxx&&q.y>=b.miny&&q.y<=b.maxy)return 0;
    const dx=Math.max(b.minx-q.x,0,q.x-b.maxx),dy=Math.max(b.miny-q.y,0,q.y-b.maxy);return Math.hypot(dx,dy);
  }
  function snapPoints(instance){
    const asset=byId.get(instance.assetId);if(!asset||!instance.point)return[];const b=localBounds(asset),local=[{x:0,y:0},{x:(b.minx+b.maxx)/2,y:(b.miny+b.maxy)/2},{x:b.minx,y:b.miny},{x:b.maxx,y:b.miny},{x:b.maxx,y:b.maxy},{x:b.minx,y:b.maxy}];return local.map(p=>worldPoint(instance,p));
  }
  function label(asset,language='ko'){return language==='en'?asset.nameEn:asset.nameKo;}
  function categoryLabel(category,language='ko'){const m={bathroom:['욕실·위생','Bathroom'],kitchen:['주방','Kitchen'],laundry:['세탁','Laundry'],furniture:['가구','Furniture']};return (m[category]||[category,category])[language==='en'?1:0];}
  root.componentLibrary=Object.freeze({assets:Object.freeze(assets.slice()),get:id=>byId.get(id)||null,list:()=>assets.slice(),label,categoryLabel,localBounds,localPoint,worldPoint,bounds,hitDistance,snapPoints});
})();
