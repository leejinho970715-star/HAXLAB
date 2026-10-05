export function satellitePosition(lat,lng,zoom){
 const level=Math.max(1,Math.min(18,Math.round(zoom))),tiles=2**level;
 const latitude=Math.max(-85.05112878,Math.min(85.05112878,lat))*Math.PI/180;
 return {x:((lng+180)/360*tiles%tiles+tiles)%tiles,y:(1-Math.asinh(Math.tan(latitude))/Math.PI)/2*tiles,level,tiles};
}

export function mountGeoViews(canvas,context,requestDraw){
 let disposed=false,land=null,loadingLand=false,landError=false,levelOffset=0;
 const tiles=new Map();
 function loadLand(){if(loadingLand||land||landError)return;loadingLand=true;fetch(new URL('./maps/world-land.json',import.meta.url)).then(r=>{if(!r.ok)throw Error('지도 데이터 오류');return r.json();}).then(data=>{if(!disposed){land=data;requestDraw();}}).catch(()=>{landError=true;requestDraw();});}
 function satelliteTile(z,x,y){
  const count=2**z;if(y<0||y>=count)return null;x=(x%count+count)%count;
  const key=z+'/'+y+'/'+x;if(tiles.has(key))return tiles.get(key);
  const image=new Image(),tile={image,ready:false,error:false};image.crossOrigin='anonymous';image.referrerPolicy='no-referrer';image.onload=()=>{if(disposed)return;tile.ready=true;requestDraw();};image.onerror=()=>{if(disposed)return;tile.error=true;requestDraw();};image.src='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/'+key;tiles.set(key,tile);
  if(tiles.size>64){const first=tiles.keys().next().value;const old=tiles.get(first);old.image.onload=old.image.onerror=null;tiles.delete(first);}return tile;
 }
 function marker(x,y,time,label){context.strokeStyle='#7affa6';context.fillStyle='#d6ffe6';context.lineWidth=1;context.beginPath();context.arc(x,y,4,0,Math.PI*2);context.fill();context.beginPath();context.arc(x,y,11+(time%1500)/180,0,Math.PI*2);context.stroke();context.font='9px monospace';context.fillStyle='#a5ffca';context.fillText(label,x+12,y-12);}
 function drawWorld({w,h,coordinate,step,time,active}){
  loadLand();context.fillStyle='#020d0a';context.fillRect(0,0,w,h);
  const zoom=Math.max(.8,Math.min(3,[1,1.08,1.18,1.35][step%4]+levelOffset*.2));
  const project=([lng,lat])=>[w/2+lng/360*(w-24)*zoom,h/2-lat/180*(h-38)*zoom];
  context.strokeStyle='#2dff861d';context.lineWidth=.6;for(let longitude=-180;longitude<=180;longitude+=30){const a=project([longitude,-90]),b=project([longitude,90]);context.beginPath();context.moveTo(...a);context.lineTo(...b);context.stroke();}for(let latitude=-90;latitude<=90;latitude+=30){const a=project([-180,latitude]),b=project([180,latitude]);context.beginPath();context.moveTo(...a);context.lineTo(...b);context.stroke();}
  if(land){context.fillStyle='#0b422e';context.strokeStyle='#58ffa088';context.lineWidth=.75;for(const feature of land.features){const polygons=feature.geometry.type==='Polygon'?[feature.geometry.coordinates]:feature.geometry.coordinates;for(const polygon of polygons){context.beginPath();for(const ring of polygon){ring.forEach((coordinate,index)=>{const p=project(coordinate);if(index===0)context.moveTo(...p);else context.lineTo(...p);});context.closePath();}context.fill('evenodd');context.stroke();}}}
  else{context.fillStyle='#74b98e';context.font='11px monospace';context.fillText(landError?'세계 지도 연결 오류 · 다시 접속하세요.':'LOADING / WORLD COASTLINES',20,h/2);}
  const locations=[['SEOUL',126.978,37.5665],['TOKYO',139.69,35.68],['LONDON',-.127,51.507],['NEW YORK',-74.006,40.7128],['SYDNEY',151.209,-33.869],['CAPE TOWN',18.424,-33.925]];
  for(const [name,lng,lat]of locations){const p=project([lng,lat]);context.fillStyle='#74bd95';context.fillRect(p[0]-1,p[1]-1,2,2);context.font='7px monospace';context.fillText(name,p[0]+4,p[1]+10);}
  if(active){const p=project([coordinate.lng,coordinate.lat]);marker(...p,time,'TARGET');context.beginPath();const origin=project([126.978,37.5665]);context.moveTo(...origin);context.quadraticCurveTo((origin[0]+p[0])/2,Math.min(origin[1],p[1])-35,...p);context.strokeStyle='#8cffb18c';context.setLineDash([4,5]);context.lineDashOffset=-time/110;context.stroke();context.setLineDash([]);}
  context.fillStyle='#4aff8920';context.fillRect(0,(time/55)%h,w,1);
 }
 function drawSatellite({w,h,coordinate,step,time,active}){
  context.fillStyle='#03120d';context.fillRect(0,0,w,h);
  const position=satellitePosition(coordinate.lat,coordinate.lng,6+step%3+levelOffset),cx=position.x*256,cy=position.y*256;
  const minX=Math.floor((cx-w/2)/256),maxX=Math.floor((cx+w/2)/256),minY=Math.floor((cy-h/2)/256),maxY=Math.floor((cy+h/2)/256);let ready=0,failed=0;
  for(let tx=minX;tx<=maxX;tx++)for(let ty=minY;ty<=maxY;ty++){const tile=satelliteTile(position.level,tx,ty);if(!tile)continue;if(tile.ready){context.drawImage(tile.image,tx*256-cx+w/2,ty*256-cy+h/2,256,256);ready++;}else if(tile.error)failed++;}
  context.fillStyle='#00240b30';context.fillRect(0,0,w,h);context.strokeStyle='#80ff9e26';context.lineWidth=.5;for(let n=0;n<w;n+=50){context.beginPath();context.moveTo(n,0);context.lineTo(n,h);context.stroke();}for(let n=0;n<h;n+=50){context.beginPath();context.moveTo(0,n);context.lineTo(w,n);context.stroke();}
  if(!ready){context.fillStyle='#b5e6c3';context.font='11px monospace';context.fillText(failed?'위성 지도 연결 오류 · 네트워크를 확인하세요.':'LOADING / SATELLITE IMAGERY',18,h/2);}
  if(active)marker(w/2,h/2,time,'COORDINATE');context.fillStyle='#b4ebc6';context.font='8px monospace';context.fillText('SATELLITE / ZOOM '+position.level+' / '+coordinate.lat.toFixed(4)+', '+coordinate.lng.toFixed(4),12,h-14);
 }
 return {draw(mode,settings){if(disposed)return;if(mode==='world')drawWorld(settings);else drawSatellite(settings);},zoom(amount){levelOffset=Math.max(-4,Math.min(8,levelOffset+amount));requestDraw();},dispose(){disposed=true;for(const tile of tiles.values()){tile.image.onload=tile.image.onerror=null;}tiles.clear();}};
}
