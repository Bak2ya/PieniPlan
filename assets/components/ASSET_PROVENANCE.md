# PieniPlan Starter Components — Asset provenance

Build35의 기본 구성품은 **CADdillo**의 공개 CAD block catalogue를 단일 출처로 삼는다.

- Source: CADdillo block library — https://caddillo.com/blocks/
- License: Creative Commons CC0 1.0 Universal
- License page checked: 2026-09-28 — https://caddillo.com/license/
- Source catalogue units: inches; PieniPlan runtime geometry: millimetres

## 중요한 구현 메모

이 Build35 패키지에는 CADdillo 원본 DXF 파일을 그대로 복제해 포함하지 않았다. 현재 실행 환경에서 원본 DXF 바이너리를 안정적으로 내려받아 검증할 수 없었기 때문에, **CADdillo가 각 family page에 공개한 block 이름·plan footprint·insertion datum을 기준으로 PieniPlan용 단순 벡터 심볼을 새로 정규화/재작성**했다. 따라서 아래 구성품은 CADdillo의 CC0 block catalogue를 provenance와 치수 기준으로 사용하지만, 원본 DXF geometry와 byte/vertex 수준으로 동일하다고 주장하지 않는다.

PieniPlan의 구성품은 `ComponentInstance`로 저장되며 `assetId + transform`만 프로젝트에 영속화한다. Starter asset definition은 앱에 포함된 공유 정의다.

| Asset ID | PieniPlan 이름 | CADdillo source block | Source family | License | Source unit | PieniPlan normalization |
|---|---|---|---|---|---|---|
| fixture.toilet | 변기 | Toilet | Toilets and Urinals | CC0-1.0 | in | 20×29in footprint → mm, simplified plan symbol |
| fixture.urinal | 소변기 | Wall-Hung Urinal | Toilets and Urinals | CC0-1.0 | in | 18×14in footprint → mm, simplified plan symbol |
| fixture.lavatory.rect | 사각 세면대 | Rectangular Bathroom Lavatory | Sinks | CC0-1.0 | in | 31×22in footprint → mm, simplified basin/counter |
| fixture.lavatory.round | 원형 세면대 | Round Bathroom Lavatory | Sinks | CC0-1.0 | in | 29×22in footprint → mm, simplified basin/counter |
| fixture.handwash | 손세정대 | Hand-Wash Sink | Sinks | CC0-1.0 | in | 17×15in footprint → mm |
| fixture.kitchen-sink.single | 싱글 싱크 | Single-Bowl Kitchen Sink | Sinks | CC0-1.0 | in | 30×22in footprint → mm |
| fixture.kitchen-sink.double | 더블 싱크 | Double-Bowl Kitchen Sink | Sinks | CC0-1.0 | in | 33×22in footprint → mm |
| fixture.bathtub | 욕조 | Bathtub | Bathtubs and Showers | CC0-1.0 | in | 60×30in footprint → mm |
| fixture.shower | 샤워부스 | Shower Stall | Bathtubs and Showers | CC0-1.0 | in | 36×36in footprint → mm |
| fixture.floor-drain | 바닥 배수구 | Floor Drain | Floor and Trench Drains | CC0-1.0 | in | 6×6in published footprint → mm, simplified drain symbol |
| appliance.range | 레인지 | 30-inch Kitchen Range | Kitchen Appliances | CC0-1.0 | in | 30×25in footprint → mm |
| appliance.refrigerator | 냉장고 | 36-inch Refrigerator | Kitchen Appliances | CC0-1.0 | in | 36×30in footprint → mm |
| appliance.dishwasher | 식기세척기 | 24-inch Dishwasher | Kitchen Appliances | CC0-1.0 | in | 24×24in footprint → mm |
| appliance.washer | 세탁기 | 27-inch Washing Machine | Laundry Appliances | CC0-1.0 | in | 27×27in footprint → mm |
| appliance.dryer | 건조기 | 27-inch Clothes Dryer | Laundry Appliances | CC0-1.0 | in | 27×27in footprint → mm |
| appliance.washer-dryer | 세탁건조기 | Stacked Washer and Dryer | Laundry Appliances | CC0-1.0 | in | 27×31in footprint → mm |
| furniture.desk48 | 책상 | 48-inch Desk | Tables and Desks | CC0-1.0 | in | 48×24in footprint → mm |
| furniture.chair.dining | 의자 | Dining Chair | Seating | CC0-1.0 | in | 18×20in footprint → mm |
| furniture.sofa84 | 소파 | 84-inch Sofa | Seating | CC0-1.0 | in | 84×36in footprint → mm |
| furniture.loveseat58 | 2인 소파 | 58-inch Loveseat | Seating | CC0-1.0 | in | 58×34in published footprint → mm |
| furniture.bed.queen | 퀸 침대 | Bed (queen) | Storage Furniture | CC0-1.0 | in | 60×83in footprint → mm |
| furniture.nightstand | 협탁 | Nightstand 24x18 | Storage Furniture | CC0-1.0 | in | 24×18in published footprint → mm |
| furniture.bookshelf36 | 책장 | 36-inch Bookshelf | Storage Furniture | CC0-1.0 | in | 36×12in footprint → mm |
| furniture.dining-table | 식탁 | Dining Table | Tables and Desks | CC0-1.0 | in | published 110×78in chair-envelope footprint → mm |

## License note

CADdillo states that the block library geometry and DXF files are released under CC0 1.0 and may be modified, redistributed, and built into another library without attribution. PieniPlan nevertheless keeps this provenance file so later maintainers can trace the origin, unit assumptions, and normalization decisions.
