/*
 * Sketch kit — hand-drawn ink + watercolour, generated as SVG strings.
 * Pure functions: no DOM access, so it can be imported anywhere.
 */
const INK = '#2b2721';
const f = n => (+n).toFixed(1);
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const circleD = (cx,cy,r) => `M${f(cx-r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2*r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2*r)} 0`;

function kit(seed){
  const R = mulberry(seed);
  const rand = (a,b) => a + R()*(b-a);
  const j = a => (R()-.5)*2*a;
  // a slightly bowed, overshooting pen stroke
  const line = (x1,y1,x2,y2,w=1.4,op=1) => {
    const dx=x2-x1, dy=y2-y1, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L;
    const o1=rand(-1,4), o2=rand(-1,5);
    const ax=x1-ux*o1+j(.7), ay=y1-uy*o1+j(.7), bx=x2+ux*o2+j(.7), by=y2+uy*o2+j(.7);
    const b=j(Math.min(L*.015,3)), mx=(ax+bx)/2-uy*b, my=(ay+by)/2+ux*b;
    return `<path d="M${f(ax)} ${f(ay)}Q${f(mx)} ${f(my)} ${f(bx)} ${f(by)}" stroke-width="${f(w)}"${op<1?` opacity="${op}"`:''}/>`;
  };
  const poly = (pts,closed,w) => { let s=''; for(let i=0;i<pts.length-1;i++) s+=line(...pts[i],...pts[i+1],w); if(closed) s+=line(...pts[pts.length-1],...pts[0],w); return s; };
  const rect = (x,y,w,h,sw) => poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],true,sw);
  const smooth = (pts,closed) => {
    const n=pts.length, m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
    if(closed){ const s=m(pts[n-1],pts[0]); let d=`M${f(s[0])} ${f(s[1])}`; for(let i=0;i<n;i++){const p=pts[i],q=m(p,pts[(i+1)%n]); d+=`Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`} return d+'Z'; }
    let d=`M${f(pts[0][0])} ${f(pts[0][1])}`; for(let i=1;i<n-1;i++){const p=pts[i],q=m(p,pts[i+1]); d+=`Q${f(p[0])} ${f(p[1])} ${f(q[0])} ${f(q[1])}`} const l=pts[n-1]; return d+`L${f(l[0])} ${f(l[1])}`;
  };
  const blob = (cx,cy,rx,ry,irr=.25,n=12) => { const pts=[], ph=R()*6; for(let i=0;i<n;i++){const a=i/n*Math.PI*2+ph, k=1+j(irr); pts.push([cx+Math.cos(a)*rx*k, cy+Math.sin(a)*ry*k])} return smooth(pts,true); };
  const rectD = (x,y,w,h) => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
  // watercolour: a glaze plus a darker pigment edge (all washes share one filter pass)
  const wash = (d,c,o=.5) => `<path d="${d}" fill="${c}" fill-opacity="${f(o)}" style="mix-blend-mode:multiply"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-opacity="${f(o*.7)}"/>`;
  const pathInk = (d,w=1.4,op=1) => `<path d="${d}" stroke-width="${f(w)}"${op<1?` opacity="${op}"`:''}/>`;
  return {R,rand,j,line,poly,rect,smooth,blob,rectD,wash,pathInk};
}

function svgDoc(seed, washes, inks, extra='', w=1400, h=760){
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>
<filter id="ink" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="wash" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="${seed+3}" result="n"/>
<feDisplacementMap in="SourceGraphic" in2="n" scale="30" xChannelSelector="R" yChannelSelector="G" result="d"/>
<feGaussianBlur in="d" stdDeviation="1.3" result="b"/>
<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="${seed+9}" result="g"/>
<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.45 0 0 0 1.0" result="ga"/>
<feComposite in="b" in2="ga" operator="in"/>
</filter></defs>
<g filter="url(#wash)">${washes}</g>
<g filter="url(#ink)" stroke="${INK}" fill="none" stroke-linecap="round" stroke-linejoin="round">${inks}</g>${extra}</svg>`;
}

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function notes(note,date){
  return `<g fill="${INK}"><text x="96" y="712" font-family="Georgia,serif" font-size="17" font-style="italic" opacity=".6">${esc(note)}</text>
<text x="1258" y="712" font-size="13" letter-spacing="2.5" text-anchor="end" font-family="'Courier New',monospace" opacity=".68">${esc(date)}</text></g>
<g transform="translate(1272 690) rotate(-4)"><rect width="30" height="30" rx="3" fill="#b5462f" opacity=".82"/>
<path d="M8 8h14M15 8v14M9 15h12M8 22h14" stroke="#f6efe2" stroke-width="2" fill="none" stroke-linecap="round"/></g>`;
}

/* ---------------- Plate I — Harbour ---------------- */
function plateHarbour(p){
  const k=kit(11), {R,rand,line,rect,wash,blob,rectD,pathInk}=k;
  let W='', I='';
  W+=wash(blob(700,250,600,150,.15,18),'#ecc68f',.38);
  W+=wash(blob(380,200,240,60,.35,12),'#a7b4c8',.32);
  W+=wash(blob(1000,170,200,55,.35,12),'#c4b2a0',.3);
  const base=478;
  // observation wheel
  const fx=1170, fy=330, fr=105;
  W+=wash(circleD(fx,fy,fr),'#c9d3df',.22);
  I+=pathInk(circleD(fx,fy,fr),1.3)+pathInk(circleD(fx,fy,fr-8),.8);
  for(let a=0;a<24;a++){const t=a/24*Math.PI*2; I+=line(fx,fy,fx+Math.cos(t)*fr,fy+Math.sin(t)*fr,.55,.7); I+=pathInk(circleD(fx+Math.cos(t)*(fr+6),fy+Math.sin(t)*(fr+6),3.5),.8);}
  I+=line(fx,fy,fx-55,base,1.4)+line(fx,fy,fx+55,base,1.4)+line(fx-32,fy+75,fx+32,fy+75,1);
  // skyline
  const cols=['#8d9bb1','#c99e66','#b5a897','#9aa7a0','#d8b98a','#a6b3c4'];
  let x=130, refl='';
  while(x<1040){
    const w=rand(30,72), cen=Math.max(0,1-Math.abs(x-560)/520), h=rand(70,140)+cen*rand(80,200), top=base-h, c=cols[(R()*cols.length)|0];
    W+=wash(rectD(x,top,w,h),c,rand(.38,.6));
    refl+=wash(rectD(x+3,base+10,w-6,h*rand(.35,.5)),c,.18);
    I+=rect(x,top,w,h,1.4);
    const t=R();
    if(t<.22) I+=line(x+w/2,top,x+w/2,top-rand(18,46),1.1);
    else if(t<.42){const s=w*rand(.45,.7),sx=x+(w-s)/2,sh=rand(12,26); W+=wash(rectD(sx,top-sh,s,sh),c,.45); I+=rect(sx,top-sh,s,sh,1.2);}
    else if(t<.52) I+=pathInk(`M${f(x+2)} ${f(top)}A${f(w/2-2)} ${f(w/2.4)} 0 0 1 ${f(x+w-2)} ${f(top)}`,1.2);
    if(R()<.55) for(let yy=top+9;yy<base-6;yy+=rand(8,12)) I+=line(x+4,yy,x+w-4,yy,.6,.75);
    else for(let xx=x+5;xx<x+w-3;xx+=rand(5,8)) I+=line(xx,top+7,xx,base-5,.6,.7);
    x+=w+rand(-8,6);
  }
  // low waterfront pavilion with a wave roof
  const pv=`M600 ${base}L600 ${base-42}Q700 ${base-74} 800 ${base-42}Q900 ${base-74} 1000 ${base-42}L1000 ${base}`;
  W+=wash(pv+'Z','#bca78a',.5); I+=pathInk(pv,1.4);
  for(let xx=612;xx<1000;xx+=rand(10,16)) I+=line(xx,base-40,xx,base-3,.6,.6);
  // water
  W+=wash(`M110 ${base+4}L1290 ${base+4}L1290 ${base+150}Q700 ${base+190} 110 ${base+160}Z`,'#7c90b9',.34);
  W+=refl;
  for(let i=0;i<90;i++){const y=rand(base+12,base+165),xx=rand(130,1260),l=rand(10,55); I+=line(xx,y,xx+l,y,.7,.55);}
  I+=line(110,base,1290,base,1.6)+line(110,base+6,1290,base+6,.8);
  for(let xx=130;xx<1280;xx+=rand(14,30)){ if(R()<.5) continue; const d=blob(xx,base-9,rand(6,11),rand(6,9),.3,9); W+=wash(d,'#7f9a68',.5); I+=pathInk(d,.8); }
  [[250,base+72,1],[840,base+110,.8]].forEach(([bx,by,s])=>{
    const hd=`M${bx} ${by}l${110*s} 0l${-16*s} ${18*s}l${-80*s} 0Z`;
    W+=wash(hd,'#c4694c',.55); I+=pathInk(hd,1.3);
    W+=wash(rectD(bx+30*s,by-22*s,40*s,22*s),'#efe3c8',.45); I+=rect(bx+30*s,by-22*s,40*s,22*s,1.1);
    W+=wash(rectD(bx+10*s,by+22*s,90*s,14*s),'#c4694c',.16);
  });
  return svgDoc(11,W,I,notes(p.note,p.date));
}

/* ---------------- Plate II — Hills ---------------- */
function plateHills(p){
  const k=kit(23), {R,rand,j,wash,smooth,pathInk,line,blob,rect,rectD}=k;
  let W='', I='';
  W+=wash(blob(700,230,640,120,.2,16),'#eed7ae',.32);
  W+=wash(blob(1010,180,46,46,.05,16),'#e9b45e',.6); I+=pathInk(circleD(1010,180,46),.9,.7);
  const layers=[[300,90,'#b9c5d6',.38,.6],[380,70,'#98acbf',.42,.8],[455,55,'#7f9a88',.48,1.1],[540,36,'#5e7b5a',.5,1.4]];
  let front;
  layers.forEach(([y0,amp,c,o,w],li)=>{
    const p1=R()*6,p2=R()*6,f1=rand(.004,.007),f2=rand(.012,.02),pts=[];
    for(let i=0;i<=40;i++){const x=70+1260*i/40; pts.push([x,y0-(Math.sin(x*f1+p1)*.6+Math.sin(x*f2+p2)*.3)*amp+j(amp*.06)]);}
    const d=smooth(pts,false);
    W+=wash(`${d}L1330 680L70 680Z`,c,o);
    I+=pathInk(d,w,li<2?.5:1);
    if(li===2) for(let r=1;r<6;r++) I+=pathInk(smooth(pts.slice(6,30).map(([x,y])=>[x,y+r*13+Math.sin(x*.02+r)*3]),false),.7,.42);
    front=pts;
  });
  const yAt=x=>{const i=Math.min(39,Math.max(0,Math.floor((x-70)/1260*40)));const a=front[i],b=front[i+1];return a[1]+(b[1]-a[1])*((x-a[0])/(b[0]-a[0]));};
  // hut
  const hx=1080, hy=yAt(1080)+48;
  W+=wash(rectD(hx,hy-34,60,34),'#efe3c8',.5); I+=rect(hx,hy-34,60,34,1.1);
  W+=wash(`M${hx-8} ${hy-34}L${hx+30} ${hy-60}L${hx+68} ${hy-34}Z`,'#a2533b',.6); I+=k.poly([[hx-8,hy-34],[hx+30,hy-60],[hx+68,hy-34]],false,1.2);
  I+=rect(hx+24,hy-20,12,20,.8);
  // pines
  const trees=[]; for(let i=0;i<36;i++){const x=rand(90,1310); trees.push([x,yAt(x)+rand(15,120)]);}
  trees.sort((a,b)=>a[1]-b[1]).forEach(([x,y])=>{
    if(y>670 || Math.abs(x-hx-30)<45) return;
    const h=rand(34,70)*(.7+(y-500)/300), w=h*.3;
    W+=wash(`M${f(x)} ${f(y-h)}L${f(x+w)} ${f(y)}L${f(x-w)} ${f(y)}Z`,'#45603f',.5);
    I+=line(x,y-h,x,y+6,.9);
    for(let s=.15;s<1;s+=.14){const yy=y-h+h*s, ww=w*s; I+=line(x,yy-3,x-ww,yy+4,.8)+line(x,yy-3,x+ww,yy+4,.8);}
  });
  for(let i=0;i<6;i++){const bx=rand(260,720), by=rand(130,230), s=rand(.7,1.2); I+=pathInk(`M${f(bx)} ${f(by)}q${f(6*s)} ${f(-7*s)} ${f(12*s)} 0q${f(6*s)} ${f(-7*s)} ${f(12*s)} 0`,1.1);}
  return svgDoc(23,W,I,notes(p.note,p.date));
}

/* ---------------- Plate III — Shophouses ---------------- */
function plateShophouses(p){
  const k=kit(37), {R,rand,line,rect,wash,rectD,pathInk,blob}=k;
  let W='', I='';
  W+=wash(blob(700,150,640,70,.25,14),'#c7d3e0',.25);
  const n=7, x0=90, HW=1220/n, top=210, base=600;
  const cols=['#a9c9b4','#e3b4a5','#ecd08f','#a9bed8','#d9c2e0','#f0c6a0','#b9d0c4'], sh=['#5f8a73','#5d7aa0','#8a5a4a','#3f6a6a'];
  for(let i=0;i<n;i++){
    const x=x0+i*HW, c=cols[i], s=sh[(i*3)%sh.length];
    W+=wash(rectD(x,top,HW,base-top),c,.5);
    I+=rect(x,top,HW,base-top,1.4);
    const roof=`M${f(x-6)} ${top}L${f(x+12)} 172L${f(x+HW-12)} 172L${f(x+HW+6)} ${top}Z`;
    W+=wash(roof,'#c2704e',.55); I+=pathInk(roof,1.3);
    for(let tx=x+6;tx<x+HW-4;tx+=7) I+=line(tx,175,tx-3,top-3,.6,.55);
    I+=line(x,232,x+HW,232,1.1)+line(x,240,x+HW,240,.7);
    const ww=HW*.19;
    for(let w=0;w<3;w++){
      const wx=x+HW*(.11+.3*w), wy=275, wh=95;
      const d=`M${f(wx)} ${wy+wh}L${f(wx)} ${wy}A${f(ww/2)} ${f(ww/2)} 0 0 1 ${f(wx+ww)} ${wy}L${f(wx+ww)} ${wy+wh}Z`;
      W+=wash(d,s,.5); I+=pathInk(d,1.2); I+=line(wx+ww/2,wy-ww/2+3,wx+ww/2,wy+wh,.8);
      for(let yy=wy+6;yy<wy+wh;yy+=7) I+=line(wx+2,yy,wx+ww-2,yy,.5,.55);
      I+=line(wx-4,wy+wh+3,wx+ww+4,wy+wh+3,1.1);
    }
    I+=line(x,400,x+HW,400,1.3)+line(x,411,x+HW,411,.8);
    const sx=x+HW*.2, sw=HW*.6; W+=wash(rectD(sx,418,sw,22),'#2f4a3f',.6); I+=rect(sx,418,sw,22,1);
    for(let c2=0;c2<4;c2++) I+=line(sx+8+c2*sw/4.4,429,sx+8+c2*sw/4.4+sw/7,429,1.2,.4);
    const ax=x+18, aw=HW-36, ar=aw/2, at=490;
    const ad=`M${f(ax)} ${base}L${f(ax)} ${at}A${f(ar)} ${f(ar*.6)} 0 0 1 ${f(ax+aw)} ${at}L${f(ax+aw)} ${base}`;
    W+=wash(ad+'Z','#4a4038',.26); I+=pathInk(ad,1.3);
    const dx=x+HW*.35, dw=HW*.3; W+=wash(rectD(dx,505,dw,95),s,.55); I+=rect(dx,505,dw,95,1); I+=line(dx+dw/2,505,dx+dw/2,600,.8);
    if(i%2===0){const lx=x+HW/2, ly=470; W+=wash(blob(lx,ly,9,12,.1,10),'#c8463a',.8); I+=line(lx,454,lx,459,.8)+pathInk(blob(lx,ly,9,12,.05,10),.8);}
  }
  W+=wash(rectD(70,600,1260,62),'#cdbb9b',.32);
  I+=line(70,600,1330,600,1.6)+line(70,616,1330,616,.9);
  [170,520,900,1150].forEach(px=>{
    const pd=`M${px-13} 576L${px+13} 576L${px+9} 600L${px-9} 600Z`; W+=wash(pd,'#b8643f',.6); I+=pathInk(pd,1);
    for(let l=0;l<4;l++){const d=blob(px+rand(-14,14),560-rand(0,26),rand(9,14),rand(8,12),.35,9); W+=wash(d,'#6d8f55',.55); I+=pathInk(d,.7,.8);}
  });
  I+=line(1290,600,1290,370,1.5)+rect(1278,344,24,26,1.1)+pathInk('M1274 344L1290 330L1306 344',1.1);
  W+=wash(rectD(1278,344,24,26),'#efc96a',.6);
  return svgDoc(37,W,I,notes(p.note,p.date));
}

/* ---------------- Plate IV — Banyan ---------------- */
function plateBanyan(p){
  const k=kit(51), {R,rand,line,rect,wash,rectD,pathInk,blob,smooth}=k;
  let W='', I='';
  W+=wash(blob(700,250,620,130,.2,14),'#efe0b8',.25);
  W+=wash(blob(700,600,630,70,.2,14),'#c1b98a',.3);
  for(let i=0;i<9;i++) W+=wash(blob(rand(100,1300),rand(440,510),rand(40,90),rand(30,60),.3,12),'#b7c39b',.3);
  const greens=['#6f8f5a','#8aa86b','#5b7a4e','#9fb37a'];
  for(let i=0;i<28;i++){const cx=rand(240,1160), dx=(cx-700)/460, cy=150+dx*dx*170+rand(0,120), r=rand(55,110); W+=wash(blob(cx,cy,r,r*.72,.3,12),greens[i%4],rand(.3,.48));}
  for(let i=0;i<80;i++){
    const cx=rand(230,1150), dx=(cx-700)/460, cy=130+dx*dx*170+rand(-10,200);
    let d=`M${f(cx)} ${f(cy)}`; const nn=(rand(3,7))|0;
    for(let s=0;s<nn;s++){const sx=rand(7,12); d+=`a${f(sx/2)} ${f(sx/2.2)} 0 0 1 ${f(sx)} ${f(rand(-3,3))}`;}
    I+=pathInk(d,.8,.85);
  }
  W+=wash('M600 655Q645 500 598 360L802 360Q756 500 806 655Z','#86674a',.45);
  for(let i=0;i<8;i++){
    const bx=rand(605,795), tx=rand(560,840);
    I+=pathInk(smooth([[bx,655],[bx+rand(-18,18),560],[(bx+tx)/2+rand(-28,28),450],[tx,360],[tx+rand(-70,70),290]],false),i<2?1.8:1.15);
  }
  for(let i=0;i<36;i++){
    const x=rand(320,1080), y0=rand(260,340), y1=rand(430,640);
    I+=pathInk(smooth([[x,y0],[x+rand(-6,6),(y0*2+y1)/3],[x+rand(-8,8),(y0+y1*2)/3],[x+rand(-5,5),y1]],false),.8,.65);
  }
  W+=wash(blob(700,658,330,24,.2,14),'#5e5a46',.26);
  for(let i=0;i<130;i++){const x=rand(90,1310), y=rand(640,690); I+=line(x,y,x+rand(-3,3),y-rand(4,10),.6,.6);}
  // bench
  W+=wash(rectD(200,556,160,52),'#9b6b44',.42);
  I+=line(200,600,360,600,1.4)+line(200,607,360,607,1)+line(205,560,355,560,1.2)+line(205,573,355,573,1.2);
  I+=line(212,607,210,642,1.2)+line(348,607,350,642,1.2)+line(212,560,212,600,1)+line(348,560,348,600,1);
  // lamp
  I+=line(1180,652,1180,470,1.4)+rect(1166,440,28,30,1.1)+pathInk('M1162 440L1180 426L1198 440',1.1);
  W+=wash(rectD(1166,440,28,30),'#efc96a',.6);
  return svgDoc(51,W,I,notes(p.note,p.date));
}

/* ---------------- Plate V — Lighthouse ---------------- */
function plateLighthouse(p){
  const k=kit(67), {R,rand,line,rect,wash,rectD,pathInk,blob,poly}=k;
  let W='', I='';
  const hz=470;
  W+=wash(blob(700,350,640,130,.18,16),'#efcf9c',.36);
  W+=wash(blob(480,170,380,70,.3,12),'#aebfd6',.34);
  W+=wash(blob(1100,140,200,50,.3,12),'#c3cad6',.28);
  const cx=1030, base=450, top=190, bw=48, tw=32;
  W+=wash(`M${cx-20} ${top-42}L520 80L600 300Z`,'#f2d57d',.28);
  W+=wash(`M80 ${hz}L1320 ${hz}L1320 668Q700 692 80 668Z`,'#6f8cb5',.4);
  I+=line(80,hz,1320,hz,1.1);
  for(let i=0;i<120;i++){const x=rand(100,1300), y=rand(hz+12,660), s=rand(6,14)*(.5+(y-hz)/200); I+=pathInk(`M${f(x)} ${f(y)}q${f(s/2)} ${f(-s/3)} ${f(s)} 0`,.7,.7);}
  const rocks=[]; for(let i=0;i<10;i++) rocks.push([rand(860,1290),rand(445,565),rand(40,90),rand(25,48)]);
  rocks.sort((a,b)=>a[1]-b[1]).forEach(([rx,ry,a,b],i)=>{
    const d=blob(rx,ry,a,b,.3,9); W+=wash(d,i%2?'#8d8a84':'#a59b8b',.5); I+=pathInk(d,1.1);
    for(let h=0;h<5;h++) I+=line(rx-a*.5+h*9,ry+2,rx-a*.5+h*9+10,ry+b*.55,.6,.6);
  });
  // tower
  const hw=y=>tw+(bw-tw)*(y-top)/(base-top);
  const body=`M${cx-bw} ${base}L${cx-tw} ${top}L${cx+tw} ${top}L${cx+bw} ${base}Z`;
  W+=wash(body,'#f3ead8',.4);
  for(const s of [0,2,4]){
    const y1=top+(base-top)*s/6, y2=top+(base-top)*(s+1)/6;
    W+=wash(`M${f(cx-hw(y1))} ${f(y1)}L${f(cx+hw(y1))} ${f(y1)}L${f(cx+hw(y2))} ${f(y2)}L${f(cx-hw(y2))} ${f(y2)}Z`,'#c4513c',.62);
    I+=line(cx-hw(y1),y1,cx+hw(y1),y1,.9)+line(cx-hw(y2),y2,cx+hw(y2),y2,.9);
  }
  I+=pathInk(body,1.4);
  for(const wy of [255,335,405]) I+=rect(cx-5,wy,10,16,.9);
  W+=wash(rectD(cx-44,top-10,88,10),'#3b3a38',.5); I+=rect(cx-44,top-10,88,10,1.2);
  I+=line(cx-44,top-28,cx+44,top-28,1);
  for(let x=cx-42;x<=cx+42;x+=8) I+=line(x,top-28,x,top-10,.6,.8);
  W+=wash(rectD(cx-24,top-62,48,52),'#f2cf63',.72); I+=rect(cx-24,top-62,48,52,1.2)+line(cx-8,top-62,cx-8,top-10,.8)+line(cx+8,top-62,cx+8,top-10,.8);
  const dome=`M${cx-28} ${top-62}Q${cx} ${top-100} ${cx+28} ${top-62}Z`; W+=wash(dome,'#c4513c',.6); I+=pathInk(dome,1.2)+line(cx,top-84,cx,top-108,1);
  // keeper's cottage
  const hx=1128, hy=430;
  W+=wash(rectD(hx,hy-50,100,50),'#efe6d2',.45); I+=rect(hx,hy-50,100,50,1.2);
  W+=wash(`M${hx-8} ${hy-50}L${hx+50} ${hy-86}L${hx+108} ${hy-50}Z`,'#c4513c',.55); I+=poly([[hx-8,hy-50],[hx+50,hy-86],[hx+108,hy-50]],false,1.2);
  I+=rect(hx+16,hy-36,18,16,.9)+rect(hx+62,hy-34,16,34,.9);
  // sailboat
  const sx=330, sy=hz+18;
  const hull=`M${sx-50} ${sy}L${sx+55} ${sy}L${sx+40} ${sy+14}L${sx-38} ${sy+14}Z`;
  W+=wash(hull,'#7a5a46',.55); I+=pathInk(hull,1.2)+line(sx,sy,sx,sy-122,1.2);
  const s1=`M${sx+4} ${sy-115}L${sx+4} ${sy-6}L${sx+70} ${sy-6}Z`, s2=`M${sx-4} ${sy-104}L${sx-4} ${sy-6}L${sx-56} ${sy-6}Z`;
  W+=wash(s1,'#f4ead6',.5)+wash(s2,'#e3c6a4',.5); I+=pathInk(s1,1.1)+pathInk(s2,1.1);
  W+=wash(rectD(sx-40,sy+18,90,30),'#7a5a46',.15);
  for(let i=0;i<7;i++){const bx=rand(150,900), by=rand(120,330), s=rand(.7,1.3); I+=pathInk(`M${f(bx)} ${f(by)}q${f(7*s)} ${f(-8*s)} ${f(14*s)} 0q${f(7*s)} ${f(-8*s)} ${f(14*s)} 0`,1.1);}
  return svgDoc(67,W,I,notes(p.note,p.date));
}

/* ---------------- Plate VI — Bicycle ---------------- */
function plateBicycle(p){
  const k=kit(83), {R,rand,line,rect,wash,rectD,pathInk,blob}=k;
  let W='', I='';
  W+=wash(blob(700,330,640,250,.12,18),'#e2c48f',.36);
  const clear=[[160,200,420,580],[870,140,1230,335],[740,290,1220,580],[420,320,530,580]];
  for(let i=0;i<60;i++){const bx=rand(100,1260), by=rand(110,520); if(clear.some(([a,b,c,d])=>bx>a-46&&bx<c&&by>b-16&&by<d)) continue; I+=rect(bx,by,rand(34,46),15,.7).replace(/stroke-width/g,'opacity=".45" stroke-width');}
  // arched door
  const d0=200, dw=180, dt=300, gb=572;
  const door=`M${d0} ${gb}L${d0} ${dt}A${dw/2} ${dw/2} 0 0 1 ${d0+dw} ${dt}L${d0+dw} ${gb}`;
  W+=wash(door+'Z','#4f7f80',.55); I+=pathInk(door,1.5)+pathInk(`M${d0-14} ${gb}L${d0-14} ${dt}A${dw/2+14} ${dw/2+14} 0 0 1 ${d0+dw+14} ${dt}L${d0+dw+14} ${gb}`,1);
  I+=line(d0+dw/2,dt-dw/2,d0+dw/2,gb,1);
  for(const [px,py] of [[d0+16,330],[d0+dw/2+12,330],[d0+16,440],[d0+dw/2+12,440]]) I+=rect(px,py,dw/2-28,90,.8);
  I+=pathInk(circleD(d0+dw/2-12,460,4),1);
  I+=rect(d0-30,gb,dw+60,10,1)+rect(d0-50,gb+10,dw+100,10,1);
  // tall potted plant
  const px=470;
  const pot=`M${px-30} 520L${px+30} 520L${px+22} ${gb}L${px-22} ${gb}Z`; W+=wash(pot,'#b8643f',.6); I+=pathInk(pot,1.2);
  for(let i=0;i<9;i++){
    const a=-Math.PI/2+rand(-.9,.9), L=rand(90,200), ex=px+Math.cos(a)*L, ey=520+Math.sin(a)*L;
    const mx=(px+ex)/2, my=(520+ey)/2, nx=-Math.sin(a)*L*.14, ny=Math.cos(a)*L*.14;
    const d=`M${f(px)} 520Q${f(mx+nx)} ${f(my+ny)} ${f(ex)} ${f(ey)}Q${f(mx-nx)} ${f(my-ny)} ${f(px)} 520Z`;
    W+=wash(d,i%2?'#5f8650':'#7ea063',.5); I+=pathInk(d,.8)+pathInk(`M${f(px)} 520Q${f(mx)} ${f(my)} ${f(ex)} ${f(ey)}`,.5,.6);
  }
  // window + flower box
  const wx=920, wy=150;
  W+=wash(rectD(wx,wy,180,150),'#9db3c9',.45); I+=rect(wx,wy,180,150,1.3)+line(wx+90,wy,wx+90,wy+150,1)+line(wx,wy+75,wx+180,wy+75,1);
  W+=wash(rectD(wx-34,wy,34,150),'#4f7f80',.55)+wash(rectD(wx+180,wy,34,150),'#4f7f80',.55);
  I+=rect(wx-34,wy,34,150,1)+rect(wx+180,wy,34,150,1);
  for(let yy=wy+8;yy<wy+150;yy+=8) I+=line(wx-30,yy,wx-4,yy,.5,.6)+line(wx+184,yy,wx+210,yy,.5,.6);
  W+=wash(rectD(wx-10,wy+150,200,26),'#a8643c',.55); I+=rect(wx-10,wy+150,200,26,1.1);
  for(let i=0;i<14;i++){const d=blob(wx+rand(0,180),wy+rand(132,152),rand(7,12),rand(6,10),.3,8); W+=wash(d,['#d0605a','#e6a2a6','#f0c75e'][i%3],.65); I+=pathInk(d,.6,.7);}
  // bicycle
  const rw=[835,500], fw=[1125,500], r=72, bb=[960,505], st=[922,385], ht=[1078,385], hb=[1090,425];
  W+=wash(blob(985,575,190,14,.2,12),'#6d6a63',.24);
  const frame=`M${rw} L${bb} L${st} Z M${st} L${ht} L${hb} L${bb} M${ht} L${fw}`;
  W+=`<path d="${frame}" fill="none" stroke="#b2463a" stroke-width="9" stroke-opacity=".55" stroke-linejoin="round" style="mix-blend-mode:multiply"/>`;
  for(const [cx,cy] of [rw,fw]){
    I+=pathInk(circleD(cx,cy,r),1.8)+pathInk(circleD(cx,cy,r-7),.9)+pathInk(circleD(cx,cy,6),1);
    for(let s=0;s<18;s++){const a=s/18*Math.PI*2; I+=line(cx,cy,cx+Math.cos(a)*(r-7),cy+Math.sin(a)*(r-7),.45,.7);}
  }
  I+=line(...rw,...bb,1.3)+line(...rw,...st,1.3)+line(...bb,...st,1.5)+line(...st,...ht,1.5)+line(...bb,...hb,1.5)+line(...ht,...fw,1.4)+line(...ht,...hb,1.6);
  I+=pathInk(circleD(...bb,17),1.1)+line(bb[0]-14,bb[1]+20,bb[0]+14,bb[1]-20,1.2);
  I+=line(st[0],st[1],st[0]-6,st[1]-16,1.3)+pathInk(`M${st[0]-30} ${st[1]-18}Q${st[0]-4} ${st[1]-26} ${st[0]+16} ${st[1]-18}L${st[0]-6} ${st[1]-12}Z`,1.2);
  I+=line(ht[0],ht[1],ht[0]-6,ht[1]-26,1.3)+pathInk(`M${ht[0]-6} ${ht[1]-26}Q${ht[0]-34} ${ht[1]-34} ${ht[0]-44} ${ht[1]-20}`,1.4);
  const bk=[1092,330,74,46];
  W+=wash(rectD(...bk),'#c9a46a',.5); I+=rect(...bk,1.1);
  for(let x=bk[0]+8;x<bk[0]+bk[2];x+=9) I+=line(x,bk[1],x,bk[1]+bk[3],.5,.7);
  for(let y=bk[1]+9;y<bk[1]+bk[3];y+=9) I+=line(bk[0],y,bk[0]+bk[2],y,.5,.7);
  for(let i=0;i<9;i++){const d=blob(bk[0]+rand(6,68),bk[1]-rand(2,22),rand(8,13),rand(7,11),.3,8); W+=wash(d,['#d0605a','#f0c75e','#e6a2a6','#6d8f55'][i%4],.65); I+=pathInk(d,.6,.75);}
  // pavement + canal
  W+=wash(rectD(80,gb,1240,40),'#c9b79a',.4);
  I+=line(80,gb,1320,gb,1.6)+line(80,gb+40,1320,gb+40,1.2);
  for(let x=90;x<1310;x+=rand(28,40)) I+=line(x,gb+3,x+rand(-2,2),gb+38,.5,.5);
  W+=wash(`M80 ${gb+42}L1320 ${gb+42}L1320 670Q700 690 80 670Z`,'#6f8cb5',.42);
  for(let i=0;i<70;i++){const y=rand(gb+50,665), x=rand(100,1290), l=rand(12,48); I+=line(x,y,x+l,y,.7,.55);}
  return svgDoc(83,W,I,notes(p.note,p.date));
}

/* ---------------- Botanical background ---------------- */
function fernSVG(seed){
  const k=kit(seed); let W='', I='';
  const stem=t=>[60+270*t+Math.sin(t*3)*34, 740-660*t];
  const pts=[]; for(let i=0;i<=20;i++) pts.push(stem(i/20));
  I+=k.pathInk(k.smooth(pts,false),1.2,.5);
  for(let i=1;i<28;i++){
    const t=i/28, [x,y]=stem(t), [x2,y2]=stem(t+.01), ang=Math.atan2(y2-y,x2-x), len=(1-t)*120+16;
    for(const side of [-1,1]){
      const a=ang+side*1.15, ex=x+Math.cos(a)*len, ey=y+Math.sin(a)*len, mx=(x+ex)/2, my=(y+ey)/2, nx=-Math.sin(a)*len*.15, ny=Math.cos(a)*len*.15;
      const d=`M${f(x)} ${f(y)}Q${f(mx+nx)} ${f(my+ny)} ${f(ex)} ${f(ey)}Q${f(mx-nx)} ${f(my-ny)} ${f(x)} ${f(y)}Z`;
      W+=k.wash(d,'#8d9a6e',.55); I+=k.pathInk(d,.6,.35);
    }
  }
  return svgDoc(seed,W,I,'',440,780);
}
function orchidSVG(seed){
  const k=kit(seed); let W='', I='';
  const stem=t=>[380-250*t+Math.sin(t*4)*24, 760-640*t];
  const pts=[]; for(let i=0;i<=20;i++) pts.push(stem(i/20));
  I+=k.pathInk(k.smooth(pts,false),1.4,.6);
  W+=`<path d="${k.smooth(pts,false)}" fill="none" stroke="#7d8a5a" stroke-width="4" stroke-opacity=".5"/>`;
  for(const s of [-1,1]){const d=`M380 760Q${380+s*140} 640 ${380+s*190} 560Q${380+s*60} 660 380 760Z`; W+=k.wash(d,'#7f9160',.5); I+=k.pathInk(d,.8,.4);}
  [.5,.62,.74,.84].forEach((t,fi)=>{
    const [x,y]=stem(t), sz=30-fi*3;
    for(let q=0;q<5;q++){
      const a=q/5*Math.PI*2-Math.PI/2+fi, ex=x+Math.cos(a)*sz, ey=y+Math.sin(a)*sz, nx=-Math.sin(a)*sz*.38, ny=Math.cos(a)*sz*.38, mx=(x+ex)/2, my=(y+ey)/2;
      const d=`M${f(x)} ${f(y)}Q${f(mx+nx)} ${f(my+ny)} ${f(ex)} ${f(ey)}Q${f(mx-nx)} ${f(my-ny)} ${f(x)} ${f(y)}Z`;
      W+=k.wash(d,'#dba0a0',.6); I+=k.pathInk(d,.7,.45);
    }
    W+=k.wash(k.blob(x,y,6,6,.1,8),'#b5563f',.8);
  });
  for(const t of [.92,.97]){const [x,y]=stem(t); const d=k.blob(x,y,9,6,.15,8); W+=k.wash(d,'#d9a3a0',.6); I+=k.pathInk(d,.7,.5);}
  return svgDoc(seed,W,I,'',460,780);
}

export const plates=[
  {n:'I',  title:'Harbour at Dusk',      place:'Waterfront promenade', date:'14 · II · 2025',  medium:'Fineliner & watercolour', note:'the wheel lit up just as I finished', fn:plateHarbour},
  {n:'II', title:'The Hill Station',     place:'Tea country, up north', date:'02 · IV · 2025', medium:'Fineliner & watercolour', note:'mist burned off by ten', fn:plateHills},
  {n:'III',title:'Shophouse Row',        place:'The old quarter',       date:'19 · V · 2025',  medium:'Sepia ink & watercolour', note:'seven facades, seven colours of shutter', fn:plateShophouses},
  {n:'IV', title:'Under the Banyan',     place:'Botanic gardens',       date:'08 · VI · 2025', medium:'Fineliner & watercolour', note:'sat on this bench for two hours', fn:plateBanyan},
  {n:'V',  title:'Lighthouse Point',     place:'Eastern headland',      date:'27 · VII · 2025',medium:'Ink & wet-in-wet wash',   note:'wind too strong — the washes ran', fn:plateLighthouse},
  {n:'VI', title:'Canal Street, Morning',place:'Canal district',        date:'11 · IX · 2025', medium:'Fineliner & watercolour', note:'someone’s bicycle, someone’s flowers', fn:plateBicycle},
];

export { esc, fernSVG, orchidSVG };
