'use strict';
const films=[
 {title:['How hydrated is my skin?','میزان آب پوستم چقدره؟'],client:'Sara Malek / 2026',cover:'cover-13-moody-v4.png',video:'saramalek-social-reel.mp4',note:['Introducing Visioface 1000 at Razan Clinic. Cinematography, lighting and color grading by Sadegh Golzadeh.','معرفی دستگاه Visioface 1000 در کلینیک رازان؛ فیلم‌برداری، نورپردازی و اصلاح رنگ با صادق گل‌زاده.']},
 {title:['An unusual shop','یه شاپ غیرمعمولی'],client:'Faramouj / 2025',cover:'cover-03-moody-v4.png',video:'work-03.mp4',note:['A story about the way a good online shop makes content.','یک داستان دربارهٔ اینکه یک آنلاین‌شاپ خوب چطور محتوا تولید می‌کنه.']},
 {title:['Ten years in business','جشن ده‌سالگی کسب‌وکار'],client:'Faramouj / 2025',cover:'faramouj-tenth-anniversary-cover.jpg',video:'faramouj-tenth-anniversary.mp4',note:['A birthday-themed film commissioned by Faramouj. Direction, cinematography, lighting and color grading by Sadegh Golzadeh.','یک ریل با حال‌وهوای جشن تولد، به سفارش فراموج. کارگردانی، فیلم‌برداری، نورپردازی و اصلاح رنگ با صادق گل‌زاده.']},
 {title:['The night comes alive','هیجان یک شب'],client:'Zoomg / 2025',cover:'cover-16-moody-v4.png',video:'zoomg-event-2.mp4',note:['The people and energy of the Game Awards gathering, well into the night.','آدم‌ها و هیجان دورهمی گیم اواردز، تا دل شب.']},
 {title:['Environment & creativity','محیط و خلاقیت'],client:'Faramouj / 2025',cover:'cover-01-moody-v4.png',video:'work-01.mp4',note:['A story about how our surroundings shape the things we make.','یک روایت از تأثیر محیط روی چیزهایی که می‌سازیم.']},
 {title:['From idea to execution','از ایده تا اجرا'],client:'Maziar Faghihi / 2025',cover:'cover-12-moody-v4.png',video:'maziar-faghihi-intro-2.mp4',note:['A website introduction made to bring the client’s services into focus.','یک ویدیوی معرفی برای نمایش خدمات در وب‌سایت کارفرما.']},
 {title:['Men’s skincare','روتین پوستی آقایان'],client:'Sara Malek / 2026',cover:'cover-14-moody-v4.png',video:'saramalek-mens-skincare.mp4',note:['A social reel on men’s skincare and the services at Razan Clinic.','یک ریل دربارهٔ روتین پوستی آقایان و خدمات کلینیک رازان.']}
];
const $=s=>document.querySelector(s),reduceQuery=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)');
let lang='en',active=3,motion=!reduceQuery.matches,frameWidth=220,rackWidth=1000,raf=0,drag=null,busy=false,opener=null;
const t=arr=>arr[lang==='fa'?1:0],asset=file=>'../'+file;
const rack=$('.rack'),stage=$('#frames'),dialog=$('#cinema'),video=$('#film'),scene=$('.off-set'),memories=[...document.querySelectorAll('.memory')];
stage.innerHTML=films.map((p,i)=>`<button class="frame" data-index="${i}" aria-label="${p.title[0]}" aria-pressed="false"><img src="${asset(p.cover)}" alt="" ${i===active?'fetchpriority="high"':'loading="lazy"'} draggable="false"><span class="frame-index">${String(i+1).padStart(2,'0')} / SG</span><span class="frame-name"></span></button>`).join('');
const frames=[...stage.children];
function layout(){
 const mobile=rackWidth<751,step=mobile?82:Math.min(140,rackWidth/9),gap=mobile?74:frameWidth*.37;
 frames.forEach((el,i)=>{const d=i-active,sign=Math.sign(d);const x=(mobile?d:i-(films.length-1)/2)*step+(d?sign*gap:0);const turn=d?(mobile?sign*-48:sign*-65):0;el.style.transform=`translate(-50%,-50%) translate3d(${x}px,${Math.abs(d)*3}px,${d?-Math.abs(d)*30:65}px) rotateY(${turn}deg)`;el.style.opacity=Math.abs(d)>3?'.24':d?'.66':'1';el.style.zIndex=String(10-Math.abs(d));el.classList.toggle('active',i===active);el.setAttribute('aria-pressed',String(i===active))});
}
function select(i,animate=true){
 active=Math.max(0,Math.min(films.length-1,i));layout();const f=films[active];$('#project-client').textContent=f.client;$('#project-title').textContent=t(f.title);$('#current-number').textContent=String(active+1).padStart(2,'0');$('#previous').disabled=active===0;$('#next').disabled=active===films.length-1;
 if(motion&&animate){$('.selection-copy').getAnimations().forEach(a=>a.cancel());$('.selection-copy').animate([{opacity:.3,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:'cubic-bezier(.23,1,.32,1)'})}
}
function measure(){rackWidth=rack.clientWidth;frameWidth=frames[0].offsetWidth;layout();schedule()}
new ResizeObserver(measure).observe(rack);
frames.forEach((el,i)=>{
 el.addEventListener('pointerenter',()=>{if(fine.matches&&!drag&&!busy&&i!==active)select(i)});
 el.addEventListener('focus',()=>{if(!busy)select(i,false)});
 el.addEventListener('click',e=>{if(drag?.moved){e.preventDefault();return}if(!fine.matches&&i!==active){select(i);return}openFilm(el)});
});
$('#previous').onclick=()=>select(active-1);$('#next').onclick=()=>select(active+1);$('#watch').onclick=()=>openFilm($('#watch'));
rack.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?films.length-1:active+(e.key==='ArrowRight'?1:-1);select(i,false);frames[active].focus()}});
rack.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;drag={x:e.clientX,y:e.clientY,id:e.pointerId,moved:false}});
rack.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){drag.moved=true;select(active+(dx<0?1:-1));drag.x=e.clientX;drag.y=e.clientY}});
window.addEventListener('pointerup',()=>{setTimeout(()=>{drag=null},0)});window.addEventListener('pointercancel',()=>{drag=null});
async function openFilm(trigger){
 if(busy||dialog.open)return;busy=true;opener=trigger;const f=films[active],source=frames[active].getBoundingClientRect();
 $('#cinema-title').textContent=t(f.title);$('#cinema-client').textContent=f.client;$('#cinema-note').textContent=t(f.note);video.poster=asset(f.cover);video.src=asset(f.video);video.preload='metadata';dialog.showModal();document.body.classList.add('modal-open');
 if(motion){
   const target=video.getBoundingClientRect(),ghost=document.createElement('img'),shade=document.createElement('div');ghost.className='flight';shade.className='flight-backdrop';ghost.src=asset(f.cover);Object.assign(ghost.style,{left:`${target.left}px`,top:`${target.top}px`,width:`${target.width}px`,height:`${target.height}px`});dialog.append(shade,ghost);$('.cinema-layout').style.opacity='0';
   const dx=source.left-target.left,dy=source.top-target.top,sx=source.width/target.width,sy=source.height/target.height;
   const anim=ghost.animate([{transform:`translate(${dx}px,${dy}px) scale(${sx},${sy})`},{transform:'translate(0,0) scale(1,1)'}],{duration:500,easing:'cubic-bezier(.77,0,.175,1)',fill:'forwards'});shade.animate([{opacity:0},{opacity:1}],{duration:250,fill:'forwards'});
   await anim.finished.catch(()=>{});$('.cinema-layout').style.opacity='1';ghost.remove();shade.remove();$('.film-info').animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:250,easing:'cubic-bezier(.23,1,.32,1)'});
 }
 busy=false;$('#close').focus();
}
async function closeFilm(){
 if(busy||!dialog.open)return;busy=true;video.pause();
 if(motion){const a=dialog.animate([{opacity:1,transform:'scale(1)'},{opacity:0,transform:'scale(.96)'}],{duration:200,easing:'cubic-bezier(.23,1,.32,1)'});await a.finished.catch(()=>{})}
 dialog.close();video.removeAttribute('src');video.load();document.body.classList.remove('modal-open');busy=false;opener?.focus({preventScroll:true});
}
$('#close').onclick=closeFilm;$('#back').onclick=closeFilm;dialog.addEventListener('cancel',e=>{e.preventDefault();closeFilm()});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeFilm()}});
function setLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='fa'?'rtl':'ltr';document.querySelectorAll('[data-en]').forEach(el=>el.textContent=el.dataset[lang]);$('#language').textContent=lang==='en'?'فا':'EN';$('#language').setAttribute('aria-label',lang==='en'?'Switch to Persian':'Switch to English');$('#close').setAttribute('aria-label',lang==='en'?'Close film':'بستن فیلم');frames.forEach((el,i)=>{el.querySelector('.frame-name').textContent=t(films[i].title);el.setAttribute('aria-label',t(films[i].title))});select(active,false);updateMotionLabel()}
$('#language').onclick=()=>{lang=lang==='en'?'fa':'en';setLanguage()};
function updateMotionLabel(){document.body.classList.toggle('reduced',!motion);$('#motion-toggle').setAttribute('aria-pressed',String(motion));$('#motion-toggle').textContent=lang==='en'?'Motion '+(motion?'on':'off'):motion?'حرکت روشن':'حرکت خاموش';schedule()}
$('#motion-toggle').onclick=()=>{motion=!motion&&!reduceQuery.matches;updateMotionLabel()};reduceQuery.addEventListener('change',()=>{motion=!reduceQuery.matches;updateMotionLabel()});
function schedule(){if(!raf)raf=requestAnimationFrame(scrollScene)}
function scrollScene(){raf=0;const max=document.documentElement.scrollHeight-innerHeight;$('.reading-progress').style.transform=`scaleX(${max>0?scrollY/max:0})`;const rect=scene.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;const progress=motion?Math.max(0,Math.min(1,-rect.top/(scene.offsetHeight-innerHeight||1))):.72;const mobile=innerWidth<751;
 const spread=mobile?87:75;memories.forEach((el,i)=>{const d=i-1,x=d*(15+progress*spread),rot=d*(8+progress*9),y=Math.abs(d)*(progress*18)-progress*10;el.style.transform=`translate(${x}%,${y}%) rotate(${rot}deg) scale(${1-progress*.09})`});
}
window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.12});document.querySelectorAll('.reveal').forEach(e=>observer.observe(e));setLanguage();measure();
