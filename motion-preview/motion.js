/* Independent motion study. Content and routing belong to this preview only. */
const motionEase = 'cubic-bezier(.23,1,.32,1)';
const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
let cinemaSource = null;
let cinemaBusy = false;
let navigationBusy = false;

function resolveAssets(root) {
  root.querySelectorAll('img[src],video[src],video[poster]').forEach(el => {
    ['src','poster'].forEach(attribute => {
      const value = el.getAttribute(attribute);
      if (value && !/^(?:[a-z]+:|\/|\.\.)/i.test(value)) el.setAttribute(attribute,'../'+value);
    });
  });
}

function animateElement(el, frames, duration = 600, delay = 0) {
  if (!el || reduceMotion()) return Promise.resolve();
  const animation = el.animate(frames,{duration,delay,easing:motionEase,fill:'none'});
  return animation.finished.catch(()=>{});
}

function frameVisual(source) {
  if (!source) return null;
  const frame = source.matches('.project-card') ? source.querySelector('.project-image') : source;
  const rect = frame.getBoundingClientRect();
  if (!rect.width || rect.bottom < 0 || rect.top > innerHeight) return null;
  const clone = frame.cloneNode(true);
  clone.removeAttribute('id');
  clone.querySelectorAll('[id]').forEach(el=>el.removeAttribute('id'));
  clone.querySelectorAll('.hover-disc,.frame-open,.sample-tag').forEach(el=>el.remove());
  clone.classList.add('cinema-ghost');
  clone.setAttribute('aria-hidden','true');
  Object.assign(clone.style,{position:'fixed',left:rect.left+'px',top:rect.top+'px',width:rect.width+'px',height:rect.height+'px',margin:'0',opacity:'1',transform:'none',clipPath:'none',zIndex:'20',pointerEvents:'none'});
  return {clone,rect};
}

async function expandCinema(source) {
  const dialog = document.querySelector('#project-dialog');
  const content = dialog.querySelector('#dialog-content');
  cinemaSource = source;
  dialog.scrollTop=0;
  if (reduceMotion()) return;
  cinemaBusy=true;
  content.style.opacity='0';
  const visual = frameVisual(source);
  if (visual) {
    dialog.append(visual.clone);
    const target=dialog.getBoundingClientRect();
    const scale=Math.min((target.width-32)/visual.rect.width,(innerHeight*.69)/visual.rect.height);
    const width=visual.rect.width*scale,height=visual.rect.height*scale;
    await animateElement(visual.clone,[{transform:'translate(0,0) scale(1)',borderRadius:'28px',opacity:1},{transform:`translate(${target.left+target.width/2-visual.rect.left-visual.rect.width/2}px,${target.top+24+height/2-visual.rect.top-visual.rect.height/2}px) scale(${scale})`,borderRadius:'20px',opacity:1}],560);
    visual.clone.remove();
  }
  content.style.opacity='';
  await animateElement(content,[{opacity:0,transform:'translateY(18px) scale(.98)'},{opacity:1,transform:'none'}],420);
  cinemaBusy=false;
}

async function closeCinema() {
  const dialog=document.querySelector('#project-dialog');
  if (!dialog?.open || cinemaBusy) return;
  cinemaBusy=true;
  dialog.querySelector('video')?.pause();
  const content=dialog.querySelector('#dialog-content');
  const source=cinemaSource;
  await animateElement(content,[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(24px) scale(.97)'}],260);
  dialog.close();
  document.body.classList.remove('modal-open');
  cinemaBusy=false;
  if(source?.isConnected) {
    source.focus({preventScroll:true});
    animateElement(source,[{transform:'scale(.98)'},{transform:'none'}],450);
  }
}

function openCinemaMedia(source, {src,poster,title,description='',photo=false}) {
  const dialog=document.querySelector('#project-dialog');
  dialog.querySelector('#dialog-content').innerHTML=photo
    ? `<img class="cinema-photo" src="${safe(src)}" alt="${safe(title)}"><div class="dialog-copy"><h2>${safe(title)}</h2></div>`
    : `<video controls playsinline preload="metadata" poster="${safe(poster)}" src="${safe(src)}"></video><div class="dialog-copy"><small>${B('BEHIND THE SCENES','پشت‌صحنه')}</small><h2>${safe(title)}</h2><p>${safe(description)}</p></div>`;
  resolveAssets(dialog);
  dialog.showModal();
  document.body.classList.add('modal-open');
  expandCinema(source);
}

async function changePage(nextRoute, url, push=true) {
  if(navigationBusy) return;
  if(!['home','works','about','thoughts','backstage'].includes(nextRoute)) return;
  navigationBusy=true;
  if(push) history.replaceState({view:route,scroll:scrollY},'',location.href);
  await animateElement(document.querySelector('main'),[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(-22px)'}],220);
  route=nextRoute;
  if(push) history.pushState({view:route,scroll:0},'',url);
  render();
  window.scrollTo({top:push?0:(history.state?.scroll||0),behavior:'instant'});
  animateElement(document.querySelector('main'),[{opacity:0,transform:'translateY(26px)'},{opacity:1,transform:'none'}],650);
  document.querySelector('main').setAttribute('tabindex','-1');
  document.querySelector('main').focus({preventScroll:true});
  navigationBusy=false;
}

history.scrollRestoration='manual';
addEventListener('popstate',()=>changePage(new URLSearchParams(location.search).get('view')||'home',location.href,false));

function mountMotion() {
  const cleanup=[];
  const on=(el,type,fn,options)=>{el.addEventListener(type,fn,options);cleanup.push(()=>el.removeEventListener(type,fn,options))};
  const header=document.querySelector('.topbar');
  const brand=header.querySelector('.brand');
  brand.insertAdjacentHTML('beforeend',`<small class="preview-label">${B('MOTION STUDY · 02','نسخهٔ آزمایشی · ۰۲')}</small>`);
  const sun='<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>';
  const moon='<path d="M20.8 13A9 9 0 0 1 11 3.2 9 9 0 1 0 20.8 13Z"/>';
  header.querySelector('.theme-toggle span').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${theme==='dark'?sun:moon}</svg>`;
  header.querySelectorAll('nav a').forEach((a,i)=>{
    const glyphs=['<path d="m3 10 9-7 9 7v10H3Z M9 20v-7h6v7"/>','<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="11" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="18" width="7" height="3" rx="1"/>','<rect x="3" y="7" width="13" height="13" rx="3"/><path d="m16 11 6-4v13l-6-4"/><path d="M6 3h7"/>','<circle cx="12" cy="8" r="4"/><path d="M4 21c0-9 16-9 16 0"/>'];
    a.insertAdjacentHTML('afterbegin',`<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${glyphs[i]}</svg>`);
  });
  document.querySelectorAll('a[href]').forEach(a=>{
    const url=new URL(a.getAttribute('href'),location.href);
    const current=new URL(location.href);
    const samePreview=url.origin===current.origin&&url.pathname.replace(/index.html$/,'')===current.pathname.replace(/index.html$/,'');
    if(samePreview&&!url.hash&&!a.target){
      on(a,'click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();changePage(url.searchParams.get('view')||'home',url.href)});
    }
  });
  document.querySelectorAll('.backstage-frame').forEach((frame,i)=>{
    const video=frame.querySelector('video');
    const src=video.getAttribute('src'),poster=video.getAttribute('poster');
    frame.innerHTML=`<img src="${poster}" alt="${B('Behind the scenes','پشت‌صحنه')} ${i+1}" loading="lazy"><button class="frame-open" aria-label="${B('Watch backstage film','دیدن فیلم پشت‌صحنه')} ${i+1}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m9 5 10 7-10 7Z"/></svg><span>${B('WATCH','تماشا')}</span></button>`;
    on(frame.querySelector('button'),'click',()=>openCinemaMedia(frame,{src,poster,title:B('On set','سر صحنه')+' · 0'+(i+1),description:B('A few moments from behind the camera.','چند لحظه از اون طرف دوربین.')}));
  });
  document.querySelectorAll('.personal-cat,.travel-moment').forEach(frame=>{
    const img=frame.querySelector('img');
    const title=(frame.querySelector('figcaption h2')||frame.querySelector('figcaption')).textContent.trim();
    frame.insertAdjacentHTML('beforeend',`<button class="frame-open photo-open" aria-label="${B('Open photo: ','باز کردن عکس: ')+title}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg></button>`);
    on(frame.querySelector('button'),'click',()=>openCinemaMedia(frame,{src:img.src,title,photo:true}));
  });
  if(!reduceMotion()){
    document.querySelector('.hero')?.classList.add('hero-cinema');
    const icons=document.querySelectorAll('.skill-card svg,.connect-icon svg');
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(!entry.isIntersecting)return;
      animateElement(entry.target,[{opacity:0,transform:'translateY(15px) rotate(-12deg) scale(.6)'},{opacity:1,transform:'none'}],750);
      observer.unobserve(entry.target);
    }),{threshold:.6});
    icons.forEach(el=>observer.observe(el));cleanup.push(()=>observer.disconnect());
    if(matchMedia('(hover:hover) and (pointer:fine)').matches){
      document.querySelectorAll('.connect-icon,.theme-toggle,.black-button,.outline-button,.frame-open').forEach(el=>{
        on(el,'pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--mx',(e.clientX-r.left-r.width/2)*.12+'px');el.style.setProperty('--my',(e.clientY-r.top-r.height/2)*.16+'px')});
        on(el,'pointerleave',()=>{el.style.setProperty('--mx','0px');el.style.setProperty('--my','0px')});
      });
      document.querySelectorAll('.skill-card,.project-image').forEach(el=>{
        on(el,'pointermove',e=>{const r=el.getBoundingClientRect();el.style.setProperty('--shine-x',((e.clientX-r.left)/r.width)*100+'%');el.style.setProperty('--shine-y',((e.clientY-r.top)/r.height)*100+'%')});
      });
    }
  }
  let raf=0;
  const update=()=>{
    raf=0;header.classList.toggle('is-scrolled',scrollY>50);
    if(reduceMotion())return;
    const hero=document.querySelector('.hero');
    if(hero){const p=Math.min(1,scrollY/(innerHeight*.85));hero.style.setProperty('--hero-progress',p);}
    document.querySelectorAll('.job').forEach(el=>{
      const box=el.getBoundingClientRect();el.classList.toggle('job-current',box.top<innerHeight*.65&&box.bottom>innerHeight*.3);
    });
    document.querySelectorAll('.section-statement,.footer-name').forEach(el=>{
      const box=el.getBoundingClientRect();if(box.bottom>0&&box.top<innerHeight)el.style.setProperty('--drift',((innerHeight/2-box.top-box.height/2)*.025)+'px');
    });
  };
  on(window,'scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});update();cleanup.push(()=>cancelAnimationFrame(raf));
  const preference=matchMedia('(prefers-reduced-motion: reduce)');
  on(preference,'change',()=>render());
  return()=>cleanup.forEach(fn=>fn());
}
