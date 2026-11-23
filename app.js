(function(){
gsap.registerPlugin(ScrollTrigger);
gsap.ticker.lagSmoothing(0);
var $=function(s,c){return (c||document).querySelector(s)}, $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
var clamp=gsap.utils.clamp, lerp=function(a,b,t){return a+(b-a)*t};
function sstep(a,b,x){x=clamp(0,1,(x-a)/(b-a));return x*x*(3-2*x)}
var gn=$('#gn'), gnNav=$('#gnNav'), gnInd=$('#gnInd'), gnLinks=$$('a',gnNav), curSec='', glN=0;
var chromium=!!(navigator.userAgentData&&navigator.userAgentData.brands.some(function(b){return /Chromium/.test(b.brand)}));
function lensCurve(){
  var out=[],mx=0,n=1.5;
  for(var i=0;i<=64;i++){var t=Math.max(.004,i/64),u=1-t,h=Math.pow(1-Math.pow(u,4),.25),dh=Math.pow(u,3)/Math.pow(Math.max(1e-4,1-Math.pow(u,4)),.75);
    var a=Math.atan(dh),b=Math.asin(Math.sin(a)/n),d=Math.tan(a-b)*(h+.55);out.push(d);mx=Math.max(mx,d)}
  return out.map(function(v){return v/mx});
}
var CURVE=lensCurve();
function glass(el){
  var W=Math.round(el.offsetWidth),H=Math.round(el.offsetHeight); if(!chromium||W<4||H<4) return;
  if(el._gw===W&&el._gh===H) return; el._gw=W;el._gh=H;
  var R=Math.min(parseFloat(getComputedStyle(el).borderRadius)||H/2,H/2,W/2), B=Math.min(H/2,26), amp=Math.min(58,H*.95);
  var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d'),d=x.createImageData(W,H),p=d.data;
  for(var j=0;j<H;j++)for(var i=0;i<W;i++){
    var px=i+.5-W/2,py=j+.5-H/2,qx=Math.abs(px)-(W/2-R),qy=Math.abs(py)-(H/2-R),ox=Math.max(qx,0),oy=Math.max(qy,0),l=Math.hypot(ox,oy),t=-(Math.min(Math.max(qx,qy),0)+l-R)/B;
    var nx=0,ny=0; if(l>0){nx=ox/l*Math.sign(px);ny=oy/l*Math.sign(py)} else if(qx>qy) nx=Math.sign(px); else ny=Math.sign(py);
    var m=t<0?0:t>=1?0:CURVE[Math.min(64,Math.round(t*64))]*(1-Math.pow(t,3)),k=(j*W+i)*4;
    p[k]=128-nx*m*127;p[k+1]=128-ny*m*127;p[k+2]=128;p[k+3]=255;
  }
  x.putImageData(d,0,0);
  var id=el._gid||(el._gid='gl'+(++glN)), old=document.getElementById(id); if(old) old.remove();
  var chan=function(v,r,i){return '<feDisplacementMap in="s" in2="m" scale="'+(amp*v)+'" xChannelSelector="R" yChannelSelector="G" result="d'+i+'"/><feColorMatrix in="d'+i+'" values="'+r+'" result="c'+i+'"/>'};
  var f=document.createElementNS('http://www.w3.org/2000/svg','svg');
  f.innerHTML='<filter id="'+id+'" filterUnits="userSpaceOnUse" x="0" y="0" width="'+W+'" height="'+H+'" color-interpolation-filters="sRGB"><feImage href="'+c.toDataURL()+'" x="0" y="0" width="'+W+'" height="'+H+'" preserveAspectRatio="none" result="m"/><feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="s"/>'
    +chan(1.10,'1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0',1)+chan(1,'0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0',2)+chan(.90,'0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0',3)
    +'<feBlend in="c1" in2="c2" mode="screen" result="e"/><feBlend in="e" in2="c3" mode="screen"/></filter>';
  $('#glDefs').appendChild(f.firstChild);
  $('.gl-r',el).style.backdropFilter='url(#'+id+') saturate(1.5) brightness(1.04)';
}
function glassMap(){$$('.gl',gn).forEach(function(e){ if(MQ.matches&&e===gnNav) {$('.gl-r',e).style.backdropFilter='';e._gw=0;return} glass(e)})}
var MQ=matchMedia('(max-width:860px)');
function moveInd(to){ var a=to||gnLinks.find(function(l){return l.getAttribute('href')==='#'+curSec}); if(!a||MQ.matches) return;
  if(gnInd._a&&gnInd._a!==a&&gnInd.animate&&!reduce) gnInd.animate([{scale:'1 1'},{scale:'1.16 1.12',offset:.3},{scale:'.97 1.02',offset:.7},{scale:'1 1'}],{duration:620,easing:'cubic-bezier(.3,.7,.2,1)'});
  gnInd._a=a; gnInd.style.width=a.offsetWidth+'px'; gnInd.style.transform='translateX('+a.offsetLeft+'px)'; }
gnLinks.forEach(function(a){a.addEventListener('pointerenter',function(e){if(e.pointerType==='mouse')moveInd(a)})});
gnNav.addEventListener('pointerleave',function(){moveInd()});
var photos=$$('.ph img,.col figure'), themes=$$('[data-theme]'), secs=$$('[data-sec]'), ell=$('#ell');
function navState(){
  var y=gn.offsetTop+30, th=null;
  themes.forEach(function(s){var r=s.getBoundingClientRect(); if(r.top<=y&&r.bottom>y) th=(s.id==='foot'&&y-r.top<Math.max(1749,innerWidth*1.26)*.676*.08+14)?'light':s.dataset.theme});
  if(th===null) th=ell.getBoundingClientRect().top<y+8?'light':'dark';
  var ph=th==='light'?photos.map(function(p){return p.getBoundingClientRect()}).filter(function(q){return q.top<=y+10&&q.bottom>=y-10}):[];
  function over(g){var r=g.getBoundingClientRect(),w=0;ph.forEach(function(q){w+=Math.max(0,Math.min(q.right,r.right)-Math.max(q.left,r.left))});return w>r.width*.5?'dark':th}
  $$('.gl',gn).concat(gnLinks).forEach(function(g){g.classList.toggle('light',over(g)==='light')});
  gn.style.setProperty('--a',(scrollY*.05%360)+'deg');
  var s='inicio'; secs.forEach(function(e){ if(e.getBoundingClientRect().top<innerHeight*.45) s=e.dataset.sec });
  if(s!==curSec){ curSec=s; moveInd(); gnLinks.forEach(function(l){ if(l.getAttribute('href')==='#'+s) l.setAttribute('aria-current','true'); else l.removeAttribute('aria-current') }) }
}
addEventListener('scroll',navState,{passive:true});
$$('.gl',gn).forEach(function(g){g.addEventListener('pointermove',function(e){var r=g.getBoundingClientRect();g.style.setProperty('--sx',(e.clientX-r.left)+'px');g.style.setProperty('--sy',(e.clientY-r.top)+'px')})});
var menu=$('#gnMenu');
function closeMenu(){gn.classList.remove('open');menu.setAttribute('aria-expanded','false')}
menu.addEventListener('click',function(){var o=gn.classList.toggle('open');menu.setAttribute('aria-expanded',o)});
var cta=$('#gnCta');
function closePop(){gn.classList.remove('pop');cta.setAttribute('aria-expanded','false')}
cta.addEventListener('click',function(){closeMenu();var o=gn.classList.toggle('pop');cta.setAttribute('aria-expanded',o)});
menu.addEventListener('click',closePop);
document.addEventListener('keydown',function(e){if(e.key==='Escape'){var bk=gn.classList.contains('pop')?cta:gn.classList.contains('open')?menu:null;closePop();closeMenu();if(bk)bk.focus()}});
document.addEventListener('click',function(e){if(gn.classList.contains('pop')&&(!e.target.closest('.gn')||e.target.closest('.gn-pop a')))closePop()});
document.addEventListener('click',function(e){if(gn.classList.contains('open')&&!e.target.closest('.gn'))closeMenu()});
var hero=$('#inicio'), pin=$('#heroPin'), cv=$('#cv'), giant=$('#giant'), letters=$$('span',giant), pager=$$('#pager button');
var bgs=$$('.bg'), rowsG=$$('.rows'), copies=$$('.copy'), mcopies=$$('.m-copy'), N=3, f=0, intro=1, shown=-1, EX=0;
var GR=[['#5a2935',.38462,'#fe348e',.87019],['#5c3528',.43937,'#c27054',1],['#70420d',.31731,'#e5cdb1',.69712]];
var M={x:720,y:625}, PV={x:720,y:1720}, TURN=70, S=1, CX=0, CY=0, MOB=false, SEG=600;
$$('.fly',cv).forEach(function(q){var a=document.createElement('div'),b=document.createElement('div');a.className='px';b.className='fl';while(q.firstChild)b.appendChild(q.firstChild);a.appendChild(b);q.appendChild(a);q._z=+q.dataset.z});
$$('.cup',cv).forEach(function(c){var b=document.createElement('div');b.className='fl';b.style.position='relative';while(c.firstChild)b.appendChild(c.firstChild);c.appendChild(b);if(c.classList.contains('wrapimg')){c.classList.remove('wrapimg');b.classList.add('wrapimg')}});
$$('.fly,.cup,.splash',cv).forEach(function(q){q._c={x:parseFloat(q.style.left)+parseFloat(q.style.width)/2,y:parseFloat(q.style.top)+parseFloat(q.style.height)/2}});
var P=[0,1,2].map(function(i){var gs=$$('.g[data-i="'+i+'"]',cv),q=function(s){return gs.reduce(function(a,g){return a.concat($$(s,g))},[])};
  return {gs:gs,cup:q('.cup')[0],fly:q('.fly'),splash:q('.splash'),rows:rowsG[i],copy:copies[i],m:mcopies[i],ln:$$('.ln>span',copies[i]),c:$$('.c',copies[i])}});
function layout(){
  var vw=pin.clientWidth,vh=pin.clientHeight; MOB=vw<=700||vh>vw*1.1; SEG=140;
  hero.style.height=(vh+SEG*(N-1)+Math.round(vh*.7))+'px';
  if(MOB){S=vw/760;CY=vh*.67-815*S}else{S=Math.min(vw/1440,vh/1131);CY=0}
  CX=vw/2-720*S;
  cv.style.setProperty('--s',S);cv.style.setProperty('--cx',CX+'px');cv.style.setProperty('--cy',CY+'px');
  pin.style.setProperty('--pvy',(CY+PV.y*S)+'px'); pin.style.setProperty('--mc',(CY+872*S)+'px');
  gsap.set(giant,{scale:MOB?.69:1,y:MOB?-105:0});
  var W=MOB?1300:Math.max(1749,vw/S*1.25); ell.style.width=W+'px';ell.style.height=W*1183/1749+'px';ell.style.left=(720-W/2)+'px';
  GR.forEach(function(g,i){var H=1131*S;bgs[i].style.background='linear-gradient(180deg,'+g[0]+' '+(CY+g[1]*H)+'px,'+g[2]+' '+(CY+g[3]*H)+'px)'});
  $$('.row',cv).forEach(function(r){
    if(!r._b){var t=r.textContent;r.textContent='';for(var i=0;i<5;i++){var s=document.createElement('span');s.textContent=t;r.appendChild(s)}r._b=1}
    var gap=parseFloat(r.style.fontSize)*.35;r.style.gap=gap+'px';r.style.left=(+r.dataset.l-2*(r.children[0].offsetWidth+gap))+'px';
  });
  letters.forEach(function(l){l._x=204+l.offsetLeft+l.offsetWidth/2});
}
function orbit(q,deg,o){
  var r=deg*Math.PI/180,dx=q._c.x-PV.x,dy=q._c.y-PV.y,c=Math.cos(r),s=Math.sin(r);
  q.style.transform='translate('+(PV.x+dx*c-dy*s-q._c.x+(o.x||0)).toFixed(2)+'px,'+(PV.y+dx*s+dy*c-q._c.y+(o.y||0)).toFixed(2)+'px) rotate('+(deg*(o.tilt==null?1:o.tilt)+(o.spin||0)).toFixed(2)+'deg) scale('+(o.s==null?1:o.s).toFixed(4)+')';
  if(o.op!=null) q.style.opacity=o.op.toFixed(3);
}
function render(){
  var i,n=Math.round(clamp(0,N-1,f));
  if(n!==shown){shown=n;pager.forEach(function(b,k){b.classList.toggle('on',k===n)});giant.classList.toggle('s0',n===0)}
  var cups=[];
  P.forEach(function(p,k){
    var d=k-f+(k===0?intro:0)*1, a=Math.abs(d), vis=a<.999;
    if(k>0&&intro>.02) vis=false;
    p.gs.forEach(function(g){g.style.visibility=vis?'visible':'hidden'});
    var tv=a<.5; p.copy.style.visibility=p.m.style.visibility=tv?'visible':'hidden'; p.copy.style.pointerEvents=p.m.style.pointerEvents=a<.2?'auto':'none';
    var rv=a<.62; p.rows.style.visibility=rv?'visible':'hidden'; if(rv){p.rows.style.opacity=(1-sstep(.08,.58,a)).toFixed(3);p.rows.style.transform='translateX('+(d*420).toFixed(1)+'px)'}
    if(k>0){var ph=lerp(96,-96,clamp(0,1,f-(k-1)));
      bgs[k].style.visibility=f>k-1+.001&&intro<.02?'visible':'hidden';
      var mk=f>=k?'none':'conic-gradient(from 180deg at 50% var(--pvy),transparent '+(180+ph-13)+'deg,#000 '+(180+ph+13)+'deg,#000 360deg)';
      bgs[k].style.webkitMaskImage=mk;bgs[k].style.maskImage=mk}
    if(tv){var out=d<0?-1:1;p.ln.forEach(function(l,j){l.style.transform='translateY('+(out*118*sstep(.03+j*.05,.36+j*.06,a)).toFixed(1)+'%)'});
      p.c.forEach(function(c,j){var q=sstep(.02+(j%3)*.03,.3+(j%3)*.04,a);c.style.opacity=(1-q).toFixed(3);c.style.translate='0 '+(out*26*q).toFixed(1)+'px'});
      var q=sstep(.04,.4,a);p.m.style.opacity=((1-q)*clamp(0,1,1-EX*3.4)).toFixed(3);p.m.style.transform='translateY('+(out*34*q-EX*170).toFixed(1)+'px)'}
    if(!vis) return;
    var th=d*TURN, mv=Math.sin(Math.PI*Math.min(1,a));
    orbit(p.cup,th,{s:1-.1*mv,tilt:.82});
    cups.push({x:PV.x+(M.x-PV.x)*Math.cos(th*Math.PI/180)-(M.y-PV.y)*Math.sin(th*Math.PI/180),w:1-sstep(.5,1,a)});
    p.splash.forEach(function(s){orbit(s,th*1.1,{s:1-.5*sstep(0,.62,a),op:(1-sstep(.22,.6,a))*clamp(0,1,1-EX*2.6),tilt:1.25})});
    p.fly.forEach(function(q,j){var z=q._z,vx=q._c.x-M.x,vy=q._c.y-M.y,k2=mv*(.22+.2*z);
      orbit(q,th*(1+.16*(z-.9)),{x:vx*k2,y:vy*k2-mv*46*z,spin:-d*(j%2?1:-1)*95*(.6+.4*z),tilt:.6,s:1+.1*mv*(z-.7),op:(1-sstep(.26,.64,a))*clamp(0,1,1-EX*2.6)})});
  });
  var fr=Math.abs(f-Math.round(f))*2, act=Math.sin(Math.PI*clamp(0,1,f-Math.floor(f)))+(intro>0?Math.sin(Math.PI*clamp(0,1,intro))*.6:0);
  letters.forEach(function(l){var e=0,t=0;cups.forEach(function(c){var q=(l._x-c.x)/210,w=Math.exp(-q*q)*c.w;e+=w;t+=w*clamp(-1,1,q)});
    l.style.transform='translateY('+(-30*e*act).toFixed(2)+'px) rotate('+(3.2*t*act).toFixed(2)+'deg)'});
}
var idx=0, need=true, lockT=0, lastD=0, lastT=0, own=0, st={v:0}, DUR=.82;
gsap.ticker.add(function(){ if(st.v!==f||need){f=st.v;need=false;render()} });
function zone(){return SEG*(N-1)}
function go(n,keep){
  n=clamp(0,N-1,n); if(n===idx&&!keep) return; idx=n; lockT=performance.now()+430;
  if(!keep){own=performance.now();scrollTo(0,n*SEG)}
  gsap.to(st,{v:n,duration:reduce?0:DUR,ease:'power2.out',overwrite:true});
  setTimeout(function(){if(idx===n&&Math.abs(st.v-n)>.001&&!gsap.isTweening(st)){st.v=n;need=true}},DUR*1000+300);
}
addEventListener('wheel',function(e){
  if(e.ctrlKey) return; var y=scrollY,d=e.deltaY,now=performance.now(),ad=Math.abs(d),fresh=now-lastT>140||ad>=Math.abs(lastD)*.98;
  if(y>zone()+2||(y>zone()-2&&idx===N-1&&d>0&&now>lockT&&(fresh||y>zone()))){lastD=d;lastT=now;return}
  e.preventDefault(); var ok=now>lockT&&ad>4&&fresh; lastD=d; lastT=now; if(!ok) return;
  go(idx+(d>0?1:-1));
},{passive:false});
addEventListener('keydown',function(e){ if(/INPUT|TEXTAREA|BUTTON|SELECT/.test((document.activeElement||{}).tagName)) return; var d={ArrowDown:1,PageDown:1,' ':1,ArrowUp:-1,PageUp:-1}[e.key]; if(!d||scrollY>zone()+2) return; if(d>0&&idx===N-1) return; e.preventDefault(); if(performance.now()>lockT) go(idx+d) });
var ty=null;
addEventListener('touchstart',function(e){ty=e.touches[0].clientY},{passive:true});
addEventListener('touchmove',function(e){ if(scrollY>zone()+2||e.target.closest('.gn')) return; if(ty===null){if(e.cancelable&&performance.now()<lockT)e.preventDefault();return} var d=ty-e.touches[0].clientY;
  if((d>0&&idx<N-1)||(d<0&&(idx>0||scrollY>2))){ if(e.cancelable)e.preventDefault(); if(Math.abs(d)>24&&performance.now()>lockT){go(idx+(d>0?1:-1));ty=null} } },{passive:false});
addEventListener('scroll',function(){ need=true; if(performance.now()-own<120) return; var n=Math.round(clamp(0,N-1,scrollY/SEG)); if(n!==idx) go(n,true) },{passive:true});
pager.forEach(function(b,i){b.addEventListener('click',function(){go(i)})});
function idle(){P.forEach(function(p){p.fly.forEach(function(el){gsap.to($('.fl',el),{y:gsap.utils.random(7,13)*(Math.random()<.5?-1:1),x:gsap.utils.random(-5,5),duration:gsap.utils.random(3.2,5),ease:'sine.inOut',yoyo:true,repeat:-1})});gsap.to($('.fl',p.cup),{y:-7,duration:3.6,ease:'sine.inOut',yoyo:true,repeat:-1})})}
pin.addEventListener('pointermove',function(e){ if(reduce||e.pointerType==='touch') return; var mx=e.clientX/innerWidth-.5,my=e.clientY/innerHeight-.5;
  P[Math.round(clamp(0,2,f))].fly.forEach(function(q){gsap.to($('.px',q),{x:mx*-34*q._z,y:my*-24*q._z,duration:1.6,ease:'power3.out',overwrite:'auto'})}) });
document.addEventListener('click',function(e){var a=e.target.closest('a[href^="#"]');if(!a)return;var t=document.getElementById(a.getAttribute('href').slice(1));if(!t)return;e.preventDefault();closeMenu();
  var y=t.id==='inicio'?0:t.getBoundingClientRect().top+scrollY; scrollTo({top:y,behavior:reduce?'auto':'smooth'})});
$('#mapBtn').addEventListener('click',function(){var f=document.createElement('iframe');f.title='Mapa da Sucaria Pitaya';f.referrerPolicy='no-referrer-when-downgrade';f.src='https://www.google.com/maps?q=Pitaya%20Sucaria%20e%20Cafeteria%2C%20Rua%20Monsenhor%20Jo%C3%A3o%20Soares%2C%20111%2C%20Sorocaba&z=17&output=embed';$('#mapOff').replaceWith(f);f.focus()});
var toast=$('#toast');
$('#copy').addEventListener('click',function(){var t='Rua Monsenhor João Soares, 111, Centro, Sorocaba, SP, 18010-300';(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){toast.textContent='Endereço copiado'},function(){toast.textContent=t}).then(function(){toast.classList.add('show');setTimeout(function(){toast.classList.remove('show')},2200)})});
var HRS={0:null,1:[480,1050],2:[480,1050],3:[480,1050],4:[480,1050],5:[480,1050],6:[480,780]};
var DIA=['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
function hm(m){return Math.floor(m/60)+'h'+(m%60?m%60:'')}
function statusText(d,m){
  var h=HRS[d]; if(h&&m>=h[0]&&m<h[1]) return {open:true,t:'Aberto agora, até as '+hm(h[1])};
  if(h&&m<h[0]) return {open:false,t:'Fechado agora. Abre hoje às 8h'};
  for(var k=1;k<8;k++){var n=(d+k)%7; if(HRS[n]) return {open:false,t:'Fechado agora. Abre '+(k===1?'amanhã':DIA[n])+' às 8h'}}
}
function hoursNow(){
  var n=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'})),d=n.getDay(),s=statusText(d,n.getHours()*60+n.getMinutes()),e=$('#status');
  e.classList.toggle('off',!s.open); e.lastElementChild.textContent=s.t;
  $$('[data-days]').forEach(function(r){r.classList.toggle('today',r.dataset.days.split(',').indexOf(String(d))>-1)});
}
hoursNow(); setInterval(hoursNow,30000);
function motion(){
  favs();
  if(reduce){juices(true);return}
  gsap.timeline({scrollTrigger:{trigger:hero,start:function(){return 'top+='+SEG*(N-1)+' top'},end:'bottom bottom',scrub:.4,invalidateOnRefresh:true,onUpdate:function(s){EX=s.progress;need=true;navState()}}})
    .to(ell,{y:-1080,scale:1.5,ease:'power1.in',duration:1},0)
    .to(cv,{yPercent:-7,ease:'none',duration:1},0)
    .to('.hero .copy',{y:-190,ease:'none',duration:.5},0).to('.hero .copy',{opacity:0,ease:'none',duration:.28},.12)
    .to('#pager,#logo',{autoAlpha:0,duration:.15},0)
    .to('.bg',{opacity:0,duration:.14},.62).to(cv,{opacity:0,duration:.2},.8);
  gsap.from('#aboutH .ln>span',{yPercent:115,duration:1.15,ease:'expo.out',stagger:.09,scrollTrigger:{trigger:'#aboutH',start:'top 84%'}});
  (function(){var mb=innerWidth<861;gsap.timeline({scrollTrigger:{trigger:'#sobre',start:'top 85%',end:'top 5%',scrub:.5}}).fromTo('#aboutF',{clipPath:mb?'ellipse(70% 70% at 50% 0%)':'ellipse(34% 46% at 100% 50%)'},{clipPath:mb?'ellipse(120% 100% at 50% 0%)':'ellipse(100% 84% at 100% 50%)',ease:'power2.out'},0);
    gsap.fromTo('#aboutF img',{scale:1.14,yPercent:-3},{scale:1.02,yPercent:3,ease:'none',scrollTrigger:{trigger:'#sobre',start:'top bottom',end:'bottom top',scrub:.6}})})();
  $$('.shade[data-p]').forEach(function(q){gsap.fromTo(q,{yPercent:+q.dataset.p,rotation:-4},{yPercent:-q.dataset.p,rotation:4,ease:'none',scrollTrigger:{trigger:q.closest('section'),start:'top bottom',end:'bottom top',scrub:1}})});
  $$('.shade[data-w]').forEach(function(q,i){gsap.fromTo(q,{rotation:-2.5},{rotation:3,duration:5.4+i,ease:'sine.inOut',yoyo:true,repeat:-1})});
  $$('.frond[data-p]').forEach(function(q){gsap.fromTo(q,{yPercent:+q.dataset.p,rotation:-5},{yPercent:-q.dataset.p,rotation:6,ease:'none',scrollTrigger:{trigger:q.parentNode,start:'top bottom',end:'bottom top',scrub:.8}})});
  juices(false);
  $$('.ph').forEach(function(q){
    gsap.fromTo(q,{y:-q.dataset.y},{y:+q.dataset.y,ease:'none',scrollTrigger:{trigger:q,start:'top bottom',end:'bottom top',scrub:.7}});
    gsap.fromTo($('img',q),{clipPath:'inset(100% 0% 0% 0% round 24px)',scale:1.06},{clipPath:'inset(0% 0% 0% 0% round 24px)',scale:1,duration:1.5,ease:'expo.out',scrollTrigger:{trigger:q,start:'top 84%'}});
  });
  $$('.col').forEach(function(c){gsap.fromTo(c,{y:-c.dataset.s*.5},{y:+c.dataset.s,ease:'none',scrollTrigger:{trigger:'#cols',start:'top bottom',end:'bottom top',scrub:.6}})});
  $$('.up').forEach(function(e){gsap.from(e,{y:54,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:e,start:'top 90%'}})});
  $$('#fr img').forEach(function(i){gsap.fromTo(i,{yPercent:+i.dataset.k+30},{yPercent:+i.dataset.k*.32+6,ease:'none',scrollTrigger:{trigger:'#foot',start:'top 60%',end:'bottom bottom',scrub:.7}})});
}
function juices(still){
  var im=$$('.ji'),wd=$$('.jw'),lb=$$('.jl'),jp=$('#juicePin'),mix=gsap.utils.interpolate(im.map(function(i){return i.dataset.bg}));
  function juice(q){ var vw=innerWidth,vh=innerHeight,mb=vw<860,gx=mb?.86:.46;
    jp.style.backgroundColor=mix(q/(im.length-1));
    im.forEach(function(el,i){var d=i-q,a=Math.abs(d); if(a>2.2){el.style.visibility='hidden';return} el.style.visibility='visible';
      var s=1-Math.min(a,2)*.2; el.style.zIndex=20-Math.round(a*5);
      el.style.transform='translate(-50%,0) translate('+(d*gx*vw)+'px,'+(-Math.min(a,2)*.035*vh)+'px) scale('+s+')'; el.style.filter=a>.35?'blur('+Math.min(6,(a-.35)*6).toFixed(2)+'px)':'none'});
    wd.forEach(function(el,i){var d=i-q,a=Math.abs(d);el.style.opacity=clamp(0,1,1-a*1.25);el.style.transform='translate('+(d*.62*vw)+'px,-54%)'});
    lb.forEach(function(el,i){var d=i-q,a=Math.abs(d);el.style.opacity=clamp(0,1,1-a*2.6);el.style.transform='translateY('+(d*34)+'px)'});
  }
  var js={f:0};juice(0);
  var st={trigger:'#sucos',start:'top top',end:'bottom bottom',scrub:still?true:.6}; if(!still) st.snap={snapTo:1/(im.length-1),duration:{min:.2,max:.5},delay:.06,ease:'power2.inOut'};
  gsap.to(js,{f:im.length-1,ease:'none',onUpdate:function(){juice(js.f)},scrollTrigger:st});
  addEventListener('resize',function(){juice(js.f)});
}
function favs(){
  if(reduce) return;
  var sec=$('#favoritos'),w=$('#fzW'),h=$('#fzH'),ii=$('#fzI'),S3=$$('.fz-s'),nav=$$('#fzN i'),Z=40;
  function aim(){ gsap.set(h,{scale:1}); var a=h.getBoundingClientRect(),b=ii.getBoundingClientRect(),cx=b.left+b.width/2-a.left,cy=b.top+b.height/2-a.top;
    h.style.transformOrigin=cx+'px '+cy+'px'; var stem=b.width*.5; Z=Math.max(innerWidth*2.3/stem,innerHeight*2.6/(b.height*.5)); h._dx=innerWidth/2-(a.left-w.getBoundingClientRect().left+cx)}
  aim();
  var tx=S3.map(function(s){return [$('h3 .ln>span',s),$('p',s),$('.buy',s)]});
  S3.forEach(function(s){gsap.set($('h3 .ln>span',s),{yPercent:112});gsap.set([$('p',s),$('.buy',s)],{y:34,autoAlpha:0})});
  var cur=-1;
  function show(n){ if(n===cur) return; cur=n; nav.forEach(function(d,i){d.classList.toggle('on',i===n)});
    tx.forEach(function(t,i){ var on=i===n; gsap.to(t[0],{yPercent:on?0:(i<n?-112:112),duration:on?.95:.5,ease:on?'expo.out':'power2.in',overwrite:true}); gsap.to([t[1],t[2]],{y:on?0:26,autoAlpha:on?1:0,duration:on?.9:.35,delay:on?.14:0,stagger:on?.07:0,ease:'power3.out',overwrite:true}); S3[i].style.pointerEvents=on?'auto':'none'}) }
  var tl=gsap.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:sec,start:'top top',end:'bottom bottom',scrub:.45,invalidateOnRefresh:true,onRefreshInit:aim,onUpdate:function(s){
      var t=s.progress*tl.duration(); show(t<.92?-1:t<2.05?0:t<3.45?1:2); var th3=t<.62?'light':'dark'; if(th3!==sec.dataset.theme){sec.dataset.theme=th3;navState()} w.style.pointerEvents='none'}}});
  tl.fromTo(h,{scale:1,x:0},{scale:function(){return Z},x:function(){return h._dx||0},ease:'power3.in',duration:1},0)
    .fromTo($('.fz-img img',S3[0]),{scale:function(){return innerWidth<861?2.4:1.9},x:function(){return innerWidth<861?0:-innerWidth*.15}},{scale:1,x:0,ease:'power2.inOut',duration:1.15},0)
    .to(w,{autoAlpha:0,duration:.1},.93).to('#fzN',{opacity:1,duration:.1},.95)
    .fromTo(S3[1],{clipPath:'ellipse(0% 0% at 50% 112%)'},{clipPath:'ellipse(150% 160% at 50% 112%)',ease:'power2.inOut',duration:.9},1.6)
    .fromTo($('.fz-img img',S3[1]),{scale:1.16,yPercent:8},{scale:1,yPercent:0,ease:'power2.out',duration:1},1.6)
    .to($('.fz-img img',S3[0]),{scale:1.05,yPercent:-4,duration:.9},1.6)
    .fromTo(S3[2],{clipPath:'ellipse(0% 0% at 50% 112%)'},{clipPath:'ellipse(150% 160% at 50% 112%)',ease:'power2.inOut',duration:.9},3)
    .fromTo($('.fz-img img',S3[2]),{scale:1.16,yPercent:8},{scale:1,yPercent:0,ease:'power2.out',duration:1},3)
    .to($('.fz-img img',S3[1]),{scale:1.05,yPercent:-4,duration:.9},3)
    .to({},{duration:.4},4);
  var D=tl.duration(),P3=[0,1.3/D,2.75/D,1];
  var ly=scrollY,dir=1,tm=0,tw=null,touch=false,o={y:0};
  function settle(){ if(touch) return; var r=sec.getBoundingClientRect(),len=sec.offsetHeight-innerHeight,top=r.top+scrollY,p=(scrollY-top)/len; if(p<=.004||p>=.996) return;
    var g=dir>0?P3.filter(function(x){return x>p-.006})[0]:P3.filter(function(x){return x<p+.006}).pop(); if(g==null||Math.abs(g-p)<.004) return;
    o.y=scrollY; tw=gsap.to(o,{y:top+g*len,duration:clamp(.45,1.1,Math.abs(g-p)*3.4),ease:'power2.inOut',onUpdate:function(){scrollTo(0,o.y)}}) }
  function stop(){ if(tw){tw.kill();tw=null} }
  addEventListener('wheel',stop,{passive:true}); addEventListener('touchstart',function(){touch=true;stop()},{passive:true});
  addEventListener('touchend',function(){touch=false;clearTimeout(tm);tm=setTimeout(settle,160)},{passive:true});
  addEventListener('scroll',function(){ var y=scrollY; if(y!==ly) dir=y>ly?1:-1; ly=y; if(tw&&tw.isActive()) return; clearTimeout(tm); tm=setTimeout(settle,130) },{passive:true});
}
if('scrollRestoration' in history) history.scrollRestoration='manual';
scrollTo(0,0);
var rw=innerWidth;
addEventListener('resize',function(){layout();need=true;glassMap();moveInd();if(innerWidth!==rw){rw=innerWidth;ScrollTrigger.refresh()}});
(document.fonts&&document.fonts.ready||Promise.resolve()).then(function(){
  layout();bgs[0].style.visibility='visible';bgs.forEach(function(b,i){b.style.zIndex=i});giant.style.visibility='visible';
  navState();glassMap();moveInd();idle();
  if(reduce){intro=0;render()}
  else{
    render();
    gsap.from(letters.map(function(l){return l}),{opacity:0,duration:.9,ease:'power2.out',stagger:.06});
    var q={v:1};gsap.to(q,{v:0,duration:1.9,delay:.15,ease:'expo.out',onUpdate:function(){intro=q.v;need=true}});
    setTimeout(function(){intro=0;need=true},2600);
    gsap.from('#gn .gl',{y:-70,opacity:0,duration:1.2,ease:'expo.out',stagger:.07,delay:.35,clearProps:'transform,opacity'});
  }
  motion();ScrollTrigger.refresh();
});
addEventListener('load',function(){ScrollTrigger.refresh();glassMap()});
})();
