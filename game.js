'use strict';
const $=id=>document.getElementById(id),cv=$('cv'),cx=cv.getContext('2d'),bgc=$('bg'),bx=bgc.getContext('2d'),lc=$('lc'),lx=lc.getContext('2d');
const W=960,H=540,GY=440,SW=340,CHAIN=350,rnd=Math.random,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const LS={get:(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let opt=LS.get('hp_opt',{m:.8,s:1}),user=null,mode='boot',paused=false,optBack='s_menu',bgOn=false;
const NAMES=['TREACHERY','FRAUD','VIOLENCE','HERESY','ANGER','GREED','GLUTTONY','LUST','LIMBO'];
const TH=[['#08122b','#1e3b5a','#7fb3d9'],['#1a0f24','#4a1d3d','#d96fa0'],['#2a0606','#7a1410','#ff5030'],['#1a1a1a','#4a2a14','#ffa040'],['#1c0a02','#6a2208','#ff7a18'],['#1a1405','#5a4408','#ffd23a'],['#0e1f0a','#34521a','#9be04a'],['#240a1e','#6a1a4a','#ff5fa8'],['#0a0a12','#26263a','#a0a8d0'],['#7fc6ff','#fff3c8','#ffd76a']];

/* ---------- AUDIO (synthesised, no files) ---------- */
let AC,mg,sg,cur=null,step=0,nextT=0;
const SONGS={hell:{bpm:112,root:55,bass:[0,0,3,0,5,3,2,0],lead:[12,15,19,15,17,15,14,12],bt:'sawtooth',lt:'square'},cred:{bpm:76,root:65.4,bass:[0,5,3,7],lead:[12,16,19,16,17,14,16,12],bt:'triangle',lt:'sine'}};
function ainit(){if(AC){if(AC.state=='suspended')AC.resume();return}AC=new(window.AudioContext||window.webkitAudioContext)();mg=AC.createGain();sg=AC.createGain();mg.connect(AC.destination);sg.connect(AC.destination);setVol()}
function setVol(){if(AC){mg.gain.value=opt.m;sg.gain.value=opt.s}}
function tone(f,t,d,ty,g,dst,f2){const o=AC.createOscillator(),e=AC.createGain();o.type=ty;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);e.gain.setValueAtTime(g,t);e.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(e);e.connect(dst);o.start(t);o.stop(t+d)}
function music(n){if(!AC)return;if(cur===n)return;cur=n;step=0;nextT=AC.currentTime+.1}
setInterval(()=>{if(!AC||!cur)return;const s=SONGS[cur],d=60/s.bpm/2;while(nextT<AC.currentTime+.3){const i=step%s.lead.length;tone(s.root*2**(s.bass[i%s.bass.length]/12),nextT,d*1.8,s.bt,.3,mg);tone(s.root*2**(s.lead[i]/12),nextT,d*.9,s.lt,.09,mg);nextT+=d;step++}},100);
function sfx(k){if(!AC)return;const t=AC.currentTime;if(k=='j')tone(280,t,.16,'square',.15,sg,560);else if(k=='d'){tone(220,t,.5,'sawtooth',.3,sg,40);tone(90,t,.4,'square',.2,sg,30)}else if(k=='c')tone(880,t,.12,'square',.14,sg,1320);else if(k=='w'){[523,659,784,1047].forEach((f,i)=>tone(f,t+i*.1,.3,'triangle',.2,sg))}else if(k=='t')tone(150,t,.25,'sawtooth',.2,sg,60)}

/* ---------- LEVEL BUILDING ---------- */
let R=Math.random;const mk=n=>{let s=(n*2654435761+12345)>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}};
const gr=(o,x,w)=>o.push({k:'g',x,y:GY,w,h:400});
const SEC={
a(o,x,d){const n=d<3?2:d<7?3:4,w=n*115+100;gr(o,x,w);for(let i=0;i<n;i++){const s=x+60+i*(100+R()*15);o.push({k:'s',x:s,y:GY-26,w:36,h:26,hid:1,r:0,tx0:s-95,tx1:s})}return x+w},
b(o,x,d){const gp=60+Math.min(d*3,25);gr(o,x,90);let tx=x+90;for(let i=0;i<2;i++){o.push({k:'f',x:tx,y:GY,w:gp,h:400,dl:.12,t:0,vy:0,tx0:tx-50,tx1:tx+gp});tx+=gp;gr(o,tx,60);tx+=60}return tx},
c(o,x,d){const w=100+Math.min(d*4,35)+R()*12;gr(o,x,90);o.push({k:'x',x:x+90,y:GY,w,h:400});gr(o,x+90+w,90);return x+180+w},
d(o,x){const id=o.length;gr(o,x,150);o.push({k:'f',x:x+150,y:GY,w:150,h:400,dl:.05,t:0,vy:0,lk:id});gr(o,x+300,60);for(let i=0;i<5;i++)o.push({k:'c',x:x+70+i*50,y:GY-46,bad:i==4,lk:id,got:0});return x+360},
e(o,x,d){gr(o,x,60);const ax=55+R()*20;o.push({k:'m',x:x+140,y:GY,w:80,h:16,cx:x+180,ax,sp:1.8+d*.1,t:0,dx:0,dy:0});gr(o,x+300,40);return x+340},
f(o,x){gr(o,x,SW);const b=x+190;o.push({k:'b',x:b,y:-90,w:60,h:44,ry:GY-44,vy:0,tx0:b-135,tx1:b-100});return x+SW},
g(o,x,d){gr(o,x,SW);o.push({k:'w',cx:x+170+(R()-.5)*40,cy:GY-17,ax:100,sp:2.2+d*.18,t:0,r:17,x:x+170,y:GY-17});return x+SW},
h(o,x,d){gr(o,x,SW);o.push({k:'d',x:x+SW+80+R()*60,y:GY-14,w:44,h:14,sp:650+d*35,tx0:x+60,tx1:x+80});return x+SW},
i(o,x){gr(o,x,70);o.push({k:'g',x:x+130,y:GY-70,w:130,h:16});o.push({k:'s',x:x+195,y:GY-96,w:65,h:26,hid:1,r:0,tx0:x+150,tx1:x+260});gr(o,x+330,70);return x+400},
j(o,x){gr(o,x,60);for(let i=0;i<3;i++){const t=x+75+i*80;o.push({k:'f',x:t,y:GY-(i==1?90:45),w:70,h:16,dl:.4,t:0,vy:0,tx0:t+20,tx1:t+70})}gr(o,x+320,40);return x+360},
k(o,x){gr(o,x,150);gr(o,x+280,120);o.push({k:'s',x:x+310,y:GY-26,w:24,h:26,hid:1,r:0,tx0:x+105,tx1:x+150,tj:1});return x+400},
l(o,x){gr(o,x,SW);for(let i=0;i<3;i++){const b=x+90+i*80;o.push({k:'b',sp:1,x:b,y:-90,w:50,h:60,ry:GY-60,vy:0,tx0:b-130,tx1:b-110})}return x+SW},
m(o,x){const id=o.length;gr(o,x,SW);for(let i=0;i<5;i++)o.push({k:'c',x:x+60+i*40,y:GY-46,bad:i==4,lk:id,got:0});for(let i=0;i<4;i++)o.push({k:'s',x:x+250+i*20,y:GY-26,w:20,h:26,hid:1,r:0,lk:id});return x+SW},
n(o,x){gr(o,x,60);for(let i=0;i<3;i++){const t=x+90+i*80;o.push({k:'f',x:t,y:GY-30,w:60,h:16,dl:.5,t:0,vy:0,tx0:t+10,tx1:t+60});o.push({k:'c',x:t+22,y:GY-62,got:0})}gr(o,x+340,40);return x+380}};
Object.assign(SEC,{
o(o,x,d){gr(o,x,SW+60);const sp=2.4+d*.15;for(let i=0;i<2;i++)o.push({k:'w',cx:x+130+i*120,cy:GY-17,ax:60,sp,t:i*Math.PI/sp,r:17,x:x+130+i*120,y:GY-17});return x+SW+60},
p(o,x,d){gr(o,x,SW+40);for(let i=0;i<2;i++)o.push({k:'d',x:x+SW+90+i*380,y:GY-14,w:44,h:14,sp:600+d*25,tx0:x+60,tx1:x+80});return x+SW+40},
q(o,x){gr(o,x,60);for(let i=0;i<3;i++){const t=x+80+i*80;o.push({k:'f',x:t,y:GY-40*(i+1),w:56,h:16,dl:.3,t:0,vy:0,tx0:t+8,tx1:t+56})}gr(o,x+330,60);return x+390},
r(o,x){gr(o,x,70);o.push({k:'x',x:x+70,y:GY,w:70,h:400});gr(o,x+140,90);o.push({k:'x',x:x+230,y:GY,w:80,h:400});gr(o,x+310,90);return x+400},
t(o,x){gr(o,x,SW+150);for(const bx of [x+190,x+410])o.push({k:'b',x:bx,y:-90,w:60,h:44,ry:GY-44,vy:0,tx0:bx-135,tx1:bx-100});return x+SW+150},
u(o,x){gr(o,x,150);gr(o,x+270,130);o.push({k:'b',sp:1,x:x+240,y:-90,w:50,h:60,ry:GY-60,vy:0,tx0:x+105,tx1:x+150,tj:1});return x+400},
v(o,x,d){gr(o,x,60);o.push({k:'m',x:x+135,y:GY,w:90,h:16,cx:x+180,ax:55,sp:1.7+d*.08,t:0,dx:0,dy:0});o.push({k:'w',cx:x+180,cy:GY-80,ax:45,sp:2.2,t:0,r:17,x:x+180,y:GY-80});gr(o,x+300,40);return x+340},
x(o,x){gr(o,x,60);for(let i=0;i<4;i++)o.push({k:'g',x:x+110+i*100,y:GY-(i%2?60:30),w:48,h:16});gr(o,x+510,60);return x+570},
y(o,x,d){gr(o,x,SW);o.push({k:'d',x:x+400,y:GY-14,w:44,h:14,sp:650+d*20,tx0:x+80,tx1:x+100});o.push({k:'d',x:x+580,y:GY-62,w:44,h:14,sp:650+d*20,tx0:x+80,tx1:x+100});return x+SW},
z(o,x){gr(o,x,SW+60);for(let i=0;i<5;i++){const b=x+60+i*60;o.push({k:'b',sp:1,x:b,y:-90,w:44,h:60,ry:GY-60,vy:0,tx0:b-130,tx1:b-110})}return x+SW+60}});
const PLAN=[['ab','rab','cbka','ubrac','rcabku'],['ci','irc','dcik','iucr','dicrj'],['gf','ogf','tglh','ftogl','zotgf'],['jk','qjk','kqe','jukq','eqjkv'],['hg','yhg','phoy','hgfy','yphzo'],['ad','bmd','ndm','dmcn','mdnrd'],['be','ebj','ejq','ebnj','vejqb'],['ic','mci','irm','kicm','xrmcdk'],['acehkx','bdgjlo','fimahy','kjhgfz','dnlicvu']];
function build(n){
 const heaven=n>=45,st=heaven?9:n/5|0,lv=n%5,o=[];
 if(heaven){gr(o,-300,3000);const door={k:'D',x:2600,y:GY-120,w:60,h:120,x0:2600,run:0};o.push(door);return{o,len:2900,st,lv,heaven:1,door}}
 R=mk(n);const d=Math.min(11,st*1.1+lv*.7+1);let x=320;gr(o,-300,620);
 for(const c of PLAN[st][lv])x=SEC[c](o,x,d);
 const dx=x+240,door={k:'D',x:dx,y:GY-60,w:34,h:60,x0:dx,run:0};
 if(lv==3){gr(o,x,100);o.push({k:'f',x:x+100,y:GY,w:70,h:400,dl:.1,t:0,vy:0,tx0:x+60,tx1:x+170});gr(o,x+170,350)}else gr(o,x,520);
 if(lv==1||lv==4)o.push({k:'s',x:dx-110,y:GY-26,w:50,h:26,hid:1,r:0,tx0:dx-210,tx1:dx-110});
 if(lv==2||lv==4){door.run=240;door.tx0=dx-210;door.tx1=dx-130}
 o.push(door);return{o,len:x+520,st,lv,door}}

/* ---------- PLAYER DRAWING ---------- */
function drawP(c,x,y,ph,pose,sc,al,rim,col){
 c.save();c.translate(x,y);c.scale(sc,sc);c.globalAlpha=al;c.lineCap='butt';
 const s=Math.sin(ph),k=Math.cos(ph);let ll,rl,la,ra;
 if(pose=='run'){ll=[s*9,-Math.max(0,k)*5];rl=[-s*9,-Math.max(0,-k)*5];la=[-s*8,-10];ra=[s*8,-10]}
 else if(pose=='jump'){ll=[7,-5];rl=[-5,-7];la=[9,-28];ra=[-9,-27]}
 else if(pose=='fall'){ll=[6,0];rl=[-6,0];la=[12,-22];ra=[-12,-22]}
 else{ll=[4,0];rl=[-4,0];la=[5,-8];ra=[-5,-8]}
 const body=(lw,col)=>{c.strokeStyle=c.fillStyle=col;c.lineWidth=lw;c.beginPath();c.moveTo(0,-10);c.lineTo(ll[0],ll[1]);c.moveTo(0,-10);c.lineTo(rl[0],rl[1]);c.moveTo(0,-19);c.lineTo(la[0],la[1]);c.moveTo(0,-19);c.lineTo(ra[0],ra[1]);c.stroke();
  c.fillRect(-5-lw/6,-22-lw/6,10+lw/3,13+lw/3);c.fillRect(-6-lw/6,-33-lw/6,12+lw/3,11+lw/3)};
 if(rim)body(8,'rgba(255,230,200,.45)');body(5,col||'#000');c.restore()}

/* ---------- STATE ---------- */
let G={n:0,L:null,p:null,t:0,cam:0,pa:[],winT:0,maxN:0},K={},net=null,others={},sendT=0,hist=null;
const hk=()=>'hp_h_'+user,sk=()=>'hp_s_'+user;
function loadHist(){}
function bump(){if(!user)return;const d=Math.floor(Math.max(0,G.p.x)/10);if(d>hist.d)hist.d=d;if(G.n>hist.n)hist.n=G.n;cloudSet('hist',hist)}
function show(id){document.querySelectorAll('.scr').forEach(s=>s.classList.toggle('hide',s.id!=id));bgOn=['s_login','s_menu','s_start','s_mp','s_story','s_how','s_hist','s_opts'].includes(id);bgc.style.display=bgOn?'block':'none';
 const gm=mode=='game';$('hud').classList.toggle('hide',!(gm&&!id));$('touch').classList.toggle('hide',!(gm&&!id));$('rot').classList.toggle('on',gm&&!id)}
function toast(t){const e=$('toast');e.textContent=t;e.style.opacity=1;setTimeout(()=>e.style.opacity=0,1800)}
function hudText(){const L=G.L;$('hl').textContent=(L.heaven?"HEAVEN'S GATE":NAMES[L.st]+'  LEVEL '+(L.lv+1)+' / 5')+(net?'   ROOM '+net.room:'')}
function loadLevel(n){G.n=n;G.L=build(n);const L=G.L;G.p={x:60,y:GY-30,w:22,h:30,vx:0,vy:0,on:null,face:1,ph:0,dead:0,coy:0,jb:0};G.t=0;G.pa=[];G.winT=0;G.cam=0;hudText()}
function startGame(n){mode='game';paused=false;music('hell');loadLevel(n);show(null)}
function die(s){const p=G.p;if(p.dead)return;if(net&&!s)net.dc++;p.dead=.7;sfx('d');for(let i=0;i<26;i++)G.pa.push({x:p.x+11,y:p.y+15,vx:(rnd()-.5)*420,vy:-rnd()*450,l:.7+rnd()*.5});bump()}
function win(s){if(G.winT>0||G.p.dead)return;if(net&&!s)net.wc++;G.winT=1;sfx('w');bump()}
function nextLevel(){if(G.n>=45){endGame();return}if(G.n+1>hist.n)hist.n=G.n+1;loadLevel(G.n+1);if(net)toast('Level '+(G.n+1))}
function endGame(){mode='end';music('cred');show('s_end');save=null;cloudSet('save',null);setTimeout(()=>{show('s_cred');restartRoll();mode='cred'},4500)}
function restartRoll(){const r=$('roll');r.style.animation='none';r.offsetHeight;r.style.animation=''}
const hit=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const solid=o=>o.k=='g'||o.k=='m'||(o.k=='f'&&!(o.on&&o.t>o.dl))||(o.k=='b'&&o.land&&!o.gone);

function chainOK(nx){const p=G.p;for(const k in others){const q=others[k];if(q.n!==G.n)continue;const dy=p.y-q.y,a=Math.hypot(nx-q.x,dy),b=Math.hypot(p.x-q.x,dy);if(a>CHAIN&&a>b)return false}return true}
function upd(dt){
 const p=G.p,L=G.L;G.t+=dt;
 for(const q of G.pa){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=1300*dt;q.l-=dt}G.pa=G.pa.filter(q=>q.l>0);
 if(G.winT>0){G.winT-=dt;if(G.winT<=0)nextLevel();return}
 if(net){if(net.sync){const q=Object.values(others)[0];if(q){net.sync=0;if(q.n!=G.n){loadLevel(q.n);return}}}if(net.pd){net.pd=0;if(!p.dead)die(1)}if(net.pw){net.pw=0;win(1)}}
 if(p.dead){p.dead-=dt;if(p.dead<=0)loadLevel(G.n);return}
 const dir=(K.r?1:0)-(K.l?1:0);p.vx=dir*230;if(dir)p.face=dir;
 p.coy-=dt;p.jb-=dt;if(p.on)p.coy=.09;
 if(p.jb>0&&p.coy>0){p.vy=-560;p.coy=0;p.jb=0;p.on=null;sfx('j')}
 p.vy=Math.min(p.vy+1500*dt,900);
 const cxm=p.x+p.w/2;
 for(const o of L.o){
  if(o.gone)continue;
  if(!o.on&&o.tx0!=null&&cxm>=o.tx0&&cxm<=o.tx1&&(!o.tj||p.vy<-50))o.on=1;
  if(o.k=='f'){if(o.on){o.t+=dt;if(o.t>o.dl){o.vy+=1800*dt;o.y+=o.vy*dt}}}
  else if(o.k=='s'){if(o.on||!o.hid)o.r=Math.min(1,o.r+dt*9)}
  else if(o.k=='m'){o.t+=dt;const px=o.x;o.x=o.cx-o.w/2+Math.sin(o.t*o.sp)*o.ax;o.dx=o.x-px}
  else if(o.k=='b'){if(o.on&&!o.land){o.vy+=1800*dt;o.y+=o.vy*dt;if(o.y>=o.ry){o.y=o.ry;o.land=1;o.vy=0;o.lt=0}}if(o.land&&o.sp){o.lt+=dt;if(o.lt>.5)o.gone=1}}
  else if(o.k=='w'){o.t+=dt;o.x=o.cx+Math.sin(o.t*o.sp)*o.ax}
  else if(o.k=='d'){if(o.on)o.x-=o.sp*dt}
  else if(o.k=='D'){if(o.on&&o.x<o.x0+o.run)o.x+=420*dt}}
 if(p.on&&p.on.k=='m')p.x+=p.on.dx;
 const S=L.o.filter(o=>!o.gone&&solid(o));
 let nx=p.x+p.vx*dt;if(net&&!chainOK(nx)){nx=p.x;p.vx=0}p.x=Math.max(nx,-150);
 for(const o of S)if(hit(p,o)){if(p.vx>0)p.x=o.x-p.w;else if(p.vx<0)p.x=o.x+o.w}
 p.y+=p.vy*dt;p.on=null;
 for(const o of S)if(hit(p,o)){if(p.vy>0){p.y=o.y-p.h;p.on=o}else p.y=o.y+o.h;p.vy=0}
 if(p.y>H+60){die();return}
 p.ph+=dt*Math.abs(p.vx)*.055;
 for(const o of L.o){if(o.gone)continue;
  if(o.k=='s'){if(o.r>.5&&hit(p,{x:o.x+4,y:o.y+o.h*(1-o.r)+3,w:o.w-8,h:o.h*o.r-3}))return die()}
  else if(o.k=='b'){if(o.on&&!o.land&&o.vy>40&&hit(p,o))return die()}
  else if(o.k=='d'){if(hit(p,{x:o.x+4,y:o.y,w:o.w-4,h:o.h}))return die()}
  else if(o.k=='w'){const qx=clamp(o.x,p.x,p.x+p.w),qy=clamp(o.cy,p.y,p.y+p.h);if((qx-o.x)**2+(qy-o.cy)**2<(o.r-2)**2)return die()}
  else if(o.k=='c'&&!o.got&&hit(p,{x:o.x-9,y:o.y-9,w:18,h:18})){o.got=1;sfx(o.bad?'t':'c');if(o.bad)for(const q of L.o)if(q.lk===o.lk&&q.k!='c')q.on=1}
  else if(o.k=='D'&&hit(p,o))return win()}
 G.cam+=(clamp(p.x-W*.4,0,Math.max(0,L.len-W))-G.cam)*Math.min(1,dt*8);
 if(Math.floor(p.x)>(G.mx||0))G.mx=Math.floor(p.x);
 if(net){sendT-=dt;if(sendT<=0){sendT=.066;net.me.set({x:p.x,y:p.y,f:p.face,ph:p.ph,po:pose(p),n:G.n,nm:user,dc:net.dc,wc:net.wc})}}
}
const pose=p=>p.on?(Math.abs(p.vx)>10?'run':'idle'):(p.vy<0?'jump':'fall');

/* ---------- RENDER ---------- */
function drawGameObj(o,th,t){
 const c=cx;
 if(o.k=='g'||o.k=='x'||o.k=='f'||o.k=='m'){let ox=0;if(o.k=='f'&&o.on&&o.t<o.dl)ox=(rnd()-.5)*4;
  c.fillStyle=th[3];c.fillRect(o.x+ox,o.y,o.w,o.h);c.fillStyle=th[2];c.fillRect(o.x+ox,o.y,o.w,4);
  if(o.k=='x'){c.strokeStyle='rgba(0,0,0,.35)';c.beginPath();c.moveTo(o.x+o.w*.3,o.y+4);c.lineTo(o.x+o.w*.35,o.y+22);c.moveTo(o.x+o.w*.7,o.y+4);c.lineTo(o.x+o.w*.64,o.y+18);c.stroke()}
  if(o.k=='m'){c.strokeStyle='#555';c.beginPath();c.moveTo(o.x+10,o.y);c.lineTo(o.x+10,-20);c.moveTo(o.x+o.w-10,o.y);c.lineTo(o.x+o.w-10,-20);c.stroke()}}
 else if(o.k=='s'){const n=Math.max(1,Math.round(o.w/12)),w=o.w/n;c.fillStyle='#e6e6ee';for(let i=0;i<n;i++){c.beginPath();c.moveTo(o.x+i*w,o.y+o.h);c.lineTo(o.x+i*w+w/2,o.y+o.h*(1-o.r));c.lineTo(o.x+(i+1)*w,o.y+o.h);c.fill()}}
 else if(o.k=='c'){if(o.got)return;const b=Math.sin(t*4+o.x)*2;c.fillStyle='#ffd23a';c.shadowColor='#ffb000';c.shadowBlur=12;c.beginPath();c.arc(o.x,o.y+b,9,0,7);c.fill();c.shadowBlur=0;c.fillStyle='#b8860b';c.fillRect(o.x-2,o.y+b-5,4,10)}
 else if(o.k=='b'){c.fillStyle='#2a1a1c';c.fillRect(o.x,o.y,o.w,o.h);c.strokeStyle=th[2];c.lineWidth=3;c.strokeRect(o.x,o.y,o.w,o.h);
  if(o.sp){c.fillStyle='#e6e6ee';for(let i=0;i<4;i++){c.beginPath();c.moveTo(o.x+i*o.w/4,o.y+o.h);c.lineTo(o.x+i*o.w/4+o.w/8,o.y+o.h+14);c.lineTo(o.x+(i+1)*o.w/4,o.y+o.h);c.fill()}}}
 else if(o.k=='w'){c.save();c.translate(o.x,o.cy);c.rotate(t*10);c.fillStyle='#c8ccd4';c.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?o.r-5:o.r+3;c.lineTo(Math.cos(a)*r,Math.sin(a)*r)}c.fill();c.fillStyle='#333';c.beginPath();c.arc(0,0,4,0,7);c.fill();c.restore()}
 else if(o.k=='d'){c.fillStyle='#d8d8e0';c.beginPath();c.moveTo(o.x,o.y+o.h/2);c.lineTo(o.x+o.w,o.y);c.lineTo(o.x+o.w,o.y+o.h);c.fill();c.fillStyle='#a02010';c.fillRect(o.x+o.w-12,o.y+2,12,o.h-4)}
 else if(o.k=='D'){const hv=G.L.heaven,gl=hv?'#ffd76a':'#ff5a10';c.shadowColor=gl;c.shadowBlur=20;c.fillStyle=hv?'#fff4c8':'#120406';c.strokeStyle=gl;c.lineWidth=4;
  c.beginPath();c.moveTo(o.x,o.y+o.h);c.lineTo(o.x,o.y+o.w/2);c.arc(o.x+o.w/2,o.y+o.w/2,o.w/2,Math.PI,0);c.lineTo(o.x+o.w,o.y+o.h);c.closePath();c.fill();c.stroke();c.shadowBlur=0;
  if(hv){c.strokeStyle='#e8b84a';c.beginPath();c.moveTo(o.x+o.w/2,o.y);c.lineTo(o.x+o.w/2,o.y+o.h);c.stroke()}}}
function drawChain(c,x1,y1,x2,y2){const d=Math.hypot(x2-x1,y2-y1),sag=Math.max(0,1-d/CHAIN)*70,mx=(x1+x2)/2,my=(y1+y2)/2+sag*2,n=Math.max(4,Math.ceil(d/10));c.fillStyle=d/CHAIN>.9?'#e05a3a':'#b8bcc4';c.strokeStyle='#333';c.lineWidth=1;for(let i=0;i<=n;i++){const t=i/n,u=1-t,x=u*u*x1+2*u*t*mx+t*t*x2,y=u*u*y1+2*u*t*my+t*t*y2;c.beginPath();c.ellipse(x,y,i%2?2.5:4,i%2?4:2.5,0,0,7);c.fill();c.stroke()}}
function draw(){
 const L=G.L,p=G.p,t=G.t,c=cx,s=L.st,th=[...TH[s],s==9?'#e8dcc0':'#17090d'];
 let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,th[0]);g.addColorStop(1,th[1]);c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle=s==9?'rgba(255,255,255,.7)':'rgba(0,0,0,.35)';
 for(let i=-1;i<5;i++){const x=i*300-(G.cam*.3)%300;if(s==9){c.beginPath();c.arc(x+150,330,60,0,7);c.arc(x+210,340,45,0,7);c.arc(x+100,345,45,0,7);c.fill()}else{c.beginPath();c.moveTo(x,H);c.lineTo(x+110,230+(i&1)*40);c.lineTo(x+300,H);c.fill()}}
 if(s<9)for(let i=0;i<5;i++){const x=((i*397-G.cam*.15)%1200+1200)%1200-120,y=80+(i*67%140),b=Math.abs(Math.sin(t*.7+i*2))>.12?1:.1;c.fillStyle='rgba(255,'+(150+i*20)+',40,'+.55*b+')';c.beginPath();c.ellipse(x,y,9,4*b+.5,.2,0,7);c.ellipse(x+30,y,9,4*b+.5,-.2,0,7);c.fill()}
 g=c.createLinearGradient(0,GY+40,0,H);g.addColorStop(0,s==9?'#fff3c8':'#7a1a05');g.addColorStop(1,s==9?'#ffe9a0':'#ff8a1a');c.fillStyle=g;c.fillRect(0,GY+60+Math.sin(t*2)*4,W,H);
 c.save();c.translate(-Math.round(G.cam),0);
 for(const o of L.o)if(!o.gone&&o.x+(o.w||60)>G.cam-100&&o.x<G.cam+W+100)drawGameObj(o,th,t);
 for(const id in others){const q=others[id];if(q.n!==G.n)continue;q.x+=(q.tx-q.x)*.35;q.y+=(q.ty-q.y)*.35;
  drawChain(c,p.x+11,p.y+16,q.x+11,q.y+16);
  drawP(c,q.x+11,q.y+30,q.ph,q.po,1,.9,1,'#222');c.fillStyle='#fff';c.font='12px Arial';c.textAlign='center';c.fillText(q.nm||'',q.x+11,q.y-12)}
 if(!p.dead){drawP(c,p.x+11,p.y+30,p.ph,pose(p),1,1,1);c.fillStyle='#fff';c.font='12px Arial';c.textAlign='center';if(net)c.fillText(user,p.x+11,p.y-12)}
 for(const q of G.pa){c.fillStyle=q.l>.4?'#000':'#ff7a18';c.globalAlpha=Math.min(1,q.l*2);c.fillRect(q.x,q.y,6,6)}c.globalAlpha=1;
 c.restore();
 if(G.winT>0){c.fillStyle='rgba(255,255,255,'+(1-G.winT)+')';c.fillRect(0,0,W,H)}}

/* ---------- MENU BACKGROUND ---------- */
const eyes=Array.from({length:9},(_,i)=>({x:60+i*105+rnd()*40,y:50+rnd()*200,p:rnd()*9,c:i%4==3?'#9be04a':'#ffb020'})),smoke=Array.from({length:16},()=>({x:rnd()*W,y:300+rnd()*200,r:60+rnd()*80,v:6+rnd()*14})),emb=Array.from({length:50},()=>({x:rnd()*W,y:rnd()*H,v:20+rnd()*50,s:1+rnd()*2})),fl=[[],[]];let bt=0;
function drawBg(dt){bt+=dt;const c=bx;let g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a0405');g.addColorStop(.55,'#6a1408');g.addColorStop(1,'#ff6a10');c.fillStyle=g;c.fillRect(0,0,W,H);
 c.fillStyle='#240808';for(let i=0;i<7;i++){c.beginPath();c.moveTo(i*170-60,400);c.lineTo(i*170+30,220+(i*53%90));c.lineTo(i*170+120,400);c.fill()}
 c.fillStyle='rgba(255,120,20,.9)';for(let x=0;x<W;x+=8)c.fillRect(x,420+Math.sin(x*.03+bt*2)*6,8,H);
 c.fillStyle='#ffc040';for(let x=0;x<W;x+=60)c.fillRect(x+Math.sin(bt+x)*20,445+Math.sin(x+bt*1.5)*8,34,3);
 for(const e of eyes){const b=Math.abs(Math.sin(bt*.8+e.p))>.1?1:.1;c.fillStyle=e.c;c.shadowColor=e.c;c.shadowBlur=14;c.beginPath();c.ellipse(e.x,e.y,11,5*b,.25,0,7);c.ellipse(e.x+34,e.y,11,5*b,-.25,0,7);c.fill()}c.shadowBlur=0;
 for(const s of smoke){s.x+=s.v*dt;if(s.x>W+120)s.x=-120;c.fillStyle='rgba(40,12,10,.2)';c.beginPath();c.arc(s.x,s.y,s.r,0,7);c.fill()}
 c.globalCompositeOperation='lighter';
 [[70,0],[890,1]].forEach(([tx,i])=>{c.fillStyle='#000';c.fillStyle='#3a2a22';c.fillRect(tx-6,360,12,110);c.fillRect(tx-20,350,40,12);
  const f=fl[i],lean=Math.sin(bt*(i?2.7:2)+i)*6;for(let n=0;n<(i?3:4);n++)f.push({x:tx+(rnd()-.5)*18,y:350,vx:lean*.5+(rnd()-.5)*12,vy:-(50+rnd()*60),l:1,e:rnd()<.12});
  for(const q of f){q.x+=q.vx*dt;q.y+=q.vy*dt;q.l-=dt*(q.e?.5:1.3);if(q.l>0){const r=q.e?2:14*q.l+2;c.fillStyle='rgba(255,'+Math.floor(60+190*q.l)+','+Math.floor(30*q.l)+','+.35*q.l+')';c.beginPath();c.arc(q.x,q.y,r,0,7);c.fill()}}
  fl[i]=f.filter(q=>q.l>0);const gg=c.createRadialGradient(tx,340,5,tx,340,180);gg.addColorStop(0,'rgba(255,140,40,.28)');gg.addColorStop(1,'rgba(255,140,40,0)');c.fillStyle=gg;c.fillRect(tx-190,150,380,380)});
 c.fillStyle='#ffb040';for(const e of emb){e.y-=e.v*dt;e.x+=Math.sin(bt+e.y*.02)*.4;if(e.y<0){e.y=H;e.x=rnd()*W}c.fillRect(e.x,e.y,e.s,e.s)}
 c.globalCompositeOperation='source-over'}

/* ---------- LOADING ---------- */
let lt=0;
function drawLoad(dt){lt+=dt;const D=4.5;$('lfill').style.width=Math.min(100,lt/D*100)+'%';lx.clearRect(0,0,1672,941);
 drawP(lx,((lt*330)%1900)-100,568,lt*13,'run',5.2,1,0);
 if(lt>D){mode='login';music('hell');if(pending)enterMenu();else show('s_login')}}

/* ---------- FIREBASE ACCOUNTS ---------- */
let uid=null,save=null,fbAuth=null,regMode=false,pending=null;
function cloudSet(k,v){if(uid)try{firebase.database().ref('users/'+uid+'/'+k).set(v)}catch(e){}}
const lmsg=t=>$('lmsg').textContent=t;
function errMsg(e){const c=e.code||'';return({'auth/invalid-credential':'Wrong email or password','auth/wrong-password':'Wrong email or password','auth/user-not-found':'No account with that email','auth/email-already-in-use':'Email already registered','auth/weak-password':'Password needs 6+ characters','auth/invalid-email':'Invalid email address','auth/operation-not-allowed':'Enable Email/Password in Firebase > Authentication','auth/network-request-failed':'No internet connection','auth/too-many-requests':'Too many tries, wait a bit'})[c]||(c=='PERMISSION_DENIED'||/permission/i.test(e.message||'')?'Database rules block this - publish database.rules.json':(e.message||'Error'))}
async function loadProfile(u){const v=(await firebase.database().ref('users/'+u.uid).once('value')).val()||{};return{uid:u.uid,name:v.username||(u.email||'player').split('@')[0],hist:v.hist||{d:0,n:-1},save:v.save||null}}
function enterMenu(){const p=pending;pending=null;uid=p.uid;user=p.name;hist=p.hist;save=p.save;mode='menu';refreshMenu();show('s_menu')}
async function doLogin(){const em=$('em').value.trim(),pw=$('pw').value;if(!em||!pw)return lmsg('Enter email and password');if(!fbAuth)return lmsg('Firebase not loaded (need internet)');lmsg('Logging in...');
 try{const cr=await fbAuth.signInWithEmailAndPassword(em,pw);pending=await loadProfile(cr.user);enterMenu()}catch(e){lmsg(errMsg(e))}}
async function doReg(){const em=$('em').value.trim(),nm=$('un').value.trim(),pw=$('pw').value;if(!em||!nm||!pw)return lmsg('Fill in email, username and password');
 if(!/^[A-Za-z0-9_]{3,14}$/.test(nm))return lmsg('Username: 3-14 letters, numbers or _');if(!fbAuth)return lmsg('Firebase not loaded (need internet)');lmsg('Creating account...');
 const db=firebase.database(),ref=db.ref('usernames/'+nm.toLowerCase());
 try{if((await ref.once('value')).exists())return lmsg('Username already taken');
  const cr=await fbAuth.createUserWithEmailAndPassword(em,pw);
  try{await ref.set(cr.user.uid)}catch(e){await cr.user.delete();return lmsg('Username already taken')}
  await db.ref('users/'+cr.user.uid).set({username:nm,email:em,hist:{d:0,n:-1}});
  pending={uid:cr.user.uid,name:nm,hist:{d:0,n:-1},save:null};enterMenu()}catch(e){lmsg(errMsg(e))}}
try{if(window.firebase&&window.FIREBASE_CONFIG){if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG);fbAuth=firebase.auth();
 const off=fbAuth.onAuthStateChanged(async u=>{off();if(u){try{pending=await loadProfile(u);if(mode=='login')enterMenu()}catch(e){}}})}}catch(e){}
/* ---------- ACCOUNTS / ACTIONS ---------- */
const hash=s=>{let h=5381;for(const ch of s)h=(h*33^ch.charCodeAt(0))>>>0;return h.toString(36)};
function refreshMenu(){$('who').textContent='Player: '+user;$('bcont').classList.toggle('hide',!save)}
function openOpts(r){optBack=r;$('vm').value=opt.m;$('vs').value=opt.s;show('s_opts')}
function saveGame(){save={n:G.n};cloudSet('save',save);toast('Progress saved')}
function netOpen(code,create,cb){
 let done=0;const fin=(e,r)=>{if(!done){done=1;clearTimeout(to);cb(e,r)}};const to=setTimeout(()=>fin('Cannot reach Firebase - check config and internet'),9000);
 if(!window.firebase||!window.FIREBASE_CONFIG)return fin('Firebase not loaded (need internet)');
 try{if(!firebase.apps.length)firebase.initializeApp(window.FIREBASE_CONFIG)}catch(e){return fin('Firebase config error')}
 const rr=firebase.database().ref('rooms/'+code),key=user+'-'+Math.random().toString(36).slice(2,6),me=rr.child('players/'+key);
 rr.child('meta').once('value').then(s=>{
  if(!create&&!s.exists())return fin('Room not found');
  if(create)rr.child('meta').set({host:user,t:Date.now()});
  me.onDisconnect().remove();
  const pl=rr.child('players');
  pl.on('value',sn=>{const v=sn.val()||{};for(const k in v){if(k==key)continue;const d=v[k],q=others[k]||(others[k]={x:d.x,y:d.y,dc:d.dc||0,wc:d.wc||0});if(net&&d.n===G.n){if((d.dc||0)>q.dc)net.pd=1;if((d.wc||0)>q.wc)net.pw=1}q.dc=d.dc||0;q.wc=d.wc||0;q.tx=d.x;q.ty=d.y;q.n=d.n;q.nm=d.nm;q.ph=d.ph;q.po=d.po}for(const k in others)if(!v[k])delete others[k]});
  net={room:code,dc:0,wc:0,pd:0,pw:0,sync:create?0:1,me,leave(){pl.off();me.remove();others={}}};fin(null,code)
 }).catch(e=>fin('Firebase error: '+(e.code||e.message)))}
function mpGo(create){const code=(create?Math.random().toString(36).slice(2,6):$('room').value).trim().toUpperCase();if(!code){$('mmsg').textContent='Enter a room code';return}
 $('mmsg').textContent='Connecting...';netOpen(code,create,(e,r)=>{if(e){$('mmsg').textContent=e;return}$('mmsg').textContent='';startGame(0);toast('Room '+r+' - you are CHAINED, stay close!')})}
const A={
 tap(){ainit();music('hell');mode='open';show('s_open');setTimeout(()=>$('logo').style.opacity=1,500);setTimeout(()=>$('devby').style.opacity=1,2600);setTimeout(()=>$('s_open').style.opacity=0,5000);
  setTimeout(()=>{$('s_open').style.opacity=1;mode='load';lt=0;show('s_load')},6000)},
 login(){regMode?doReg():doLogin()},
 toreg(){regMode=!regMode;$('un').classList.toggle('hide',!regMode);$('blogin').textContent=regMode?'CREATE ACCOUNT':'LOG IN';$('breg').textContent=regMode?'BACK TO LOG IN':'NEW? CREATE ACCOUNT';$('lmsg').textContent=''},
 forgot(){const e=$('em').value.trim();if(!e){lmsg('Type your email first');return}fbAuth.sendPasswordResetEmail(e).then(()=>lmsg('Reset link sent to your email')).catch(er=>lmsg(errMsg(er)))},
 logout(){if(fbAuth)fbAuth.signOut();user=uid=save=null;pending=null;mode='login';show('s_login')},
 go(b){show(b.dataset.g);if(b.dataset.g=='s_start')refreshMenu()},
 hist(){const n=hist.n,st=n<0?'-':n>=45?"HEAVEN'S GATE":NAMES[n/5|0];$('histx').innerHTML='Longest distance: <b>'+hist.d+' m</b><br>Highest stage: <b>'+st+'</b><br>Highest level: <b>'+(n<0?'-':n+1+' / 46')+'</b><br>Best progress: <b>'+Math.round((n+1)/46*100)+'%</b>';show('s_hist')},
 reset(){hist={d:0,n:-1};cloudSet('hist',hist);A.hist()},
 opts(b){openOpts(b.dataset.r)},back(){show(optBack)},
 credits(){mode='cred';music('cred');show('s_cred');restartRoll()},
 credx(){music('hell');mode='menu';show('s_menu')},
 play(){show('s_story')},begin(){startGame(0)},
 cont(){startGame(save?save.n:0)},
 create(){mpGo(1)},join(){mpGo(0)},
 save(){if(mode=='game')saveGame()},
 pause(){if(mode!='game'||G.winT>0)return;paused=true;show('s_pause')},resume(){paused=false;show(null)},
 exit(){if(net){net.leave();net=null}others={};bump();mode='menu';paused=false;refreshMenu();show('s_menu')}};
document.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b&&A[b.dataset.a]){ainit();A[b.dataset.a](b)}});
$('vm').oninput=e=>{opt.m=+e.target.value;LS.set('hp_opt',opt);setVol()};$('vs').oninput=e=>{opt.s=+e.target.value;LS.set('hp_opt',opt);setVol();sfx('c')};

/* ---------- INPUT ---------- */
const map={ArrowLeft:'l',KeyA:'l',ArrowRight:'r',KeyD:'r'};
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'){if(e.key=='Enter'&&mode=='login')A.login();return}
 if(map[e.code])K[map[e.code]]=1;if(['ArrowUp','KeyW','Space'].includes(e.code)){if(mode=='game'&&G.p&&!e.repeat)G.p.jb=.12;e.preventDefault()}
 if(mode=='game'&&(e.code=='Escape'||e.code=='KeyP')){paused?A.resume():A.pause()}});
addEventListener('keyup',e=>{if(map[e.code])K[map[e.code]]=0});
addEventListener('blur',()=>{K={}});
[['tl','l'],['tr','r']].forEach(([id,k])=>{const b=$(id);b.onpointerdown=e=>{K[k]=1;e.preventDefault()};['pointerup','pointerleave','pointercancel'].forEach(ev=>b['on'+ev]=()=>K[k]=0)});
$('tj').onpointerdown=e=>{if(G.p)G.p.jb=.12;e.preventDefault()};
function fit(){const w=Math.min(innerWidth,innerHeight*16/9),a=$('app');a.style.width=w+'px';a.style.height=w*9/16+'px';a.style.fontSize=w/960*16+'px'}
addEventListener('resize',fit);fit();

/* ---------- LOOP ---------- */
let last=0;
function loop(t){const dt=Math.min(.033,(t-last)/1000||0);last=t;
 if(mode=='game'){if(!paused)upd(dt);draw()}
 if(bgOn)drawBg(dt);if(mode=='load')drawLoad(dt);
 requestAnimationFrame(loop)}
show('s_tap');requestAnimationFrame(loop);
