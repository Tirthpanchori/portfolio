import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { journeyState, milestoneProgress, storyPose } from './journey-state';
import { initProcessCards } from './process-motion';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const paused = new URLSearchParams(location.search).get('motion')==='off';
if(paused)document.documentElement.dataset.motion='off';
const motionEnabled = () => !paused && !reduced.matches;
const header = document.querySelector<HTMLElement>('.site-header');
let scheduled = false;
window.addEventListener('scroll', () => {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 80);
    scheduled = false;
  });
}, {passive:true});

const navLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('.nav-links a'));
new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) {
    navLinks.forEach(link => link.hash===`#${entry.target.id}` ? link.setAttribute('aria-current','location') : link.removeAttribute('aria-current'));
  }
}, {rootMargin:'-15% 0px -65% 0px'}).observe(document.querySelector('#home') || document.querySelector('main')!);
const activeObserver = new IntersectionObserver(entries => {
  for (const entry of entries) if (entry.isIntersecting) navLinks.forEach(link => link.hash===`#${entry.target.id}` ? link.setAttribute('aria-current','location') : link.removeAttribute('aria-current'));
}, {rootMargin:'-15% 0px -65% 0px'});
document.querySelectorAll('section[id]').forEach(el=>activeObserver.observe(el));

document.querySelector<HTMLButtonElement>('.copy-email')?.addEventListener('click',async()=>{
  const status = document.querySelector<HTMLElement>('.copy-status');
  try { await navigator.clipboard.writeText('panchoritirth483@gmail.com'); if(status) status.textContent='Email copied. Talk soon.'; }
  catch { if(status) status.textContent='Copy is unavailable. Select the email, or open it in your email app.'; }
});

initProcessCards(motionEnabled);

// One delayed pointer follower. The project eye is a state of the same cursor.
const cursor=document.querySelector<HTMLElement>('#site-cursor');
let targetX=0,targetY=0,cursorX=0,cursorY=0;
let cursorFrame=0,mouseSeen=false,lastMove=0;
let overHero=false;
const pointerInHero=(x:number,y:number)=>{const bounds=document.querySelector('#home')?.getBoundingClientRect();return !!bounds&&x>=bounds.left&&x<=bounds.right&&y>=bounds.top&&y<=bounds.bottom;};
const tickCursor=(now:number)=>{
  if(!cursor||!finePointer.matches||!motionEnabled()||document.hidden){cursorFrame=0;cursor?.classList.remove('is-visible');return;}
  const dx=targetX-cursorX,dy=targetY-cursorY;
  const project=cursor.classList.contains('is-project');
  const follow=project?.23:.15;
  cursorX+=dx*follow;cursorY+=dy*follow;
  cursor.style.transform=`translate3d(${cursorX}px,${cursorY}px,0)`;
  cursor.classList.toggle('is-visible',mouseSeen&&!overHero);
  if(Math.abs(dx)+Math.abs(dy)>.08||now-lastMove<150){cursorFrame=requestAnimationFrame(tickCursor);}else cursorFrame=0;
};
window.addEventListener('pointermove',e=>{
  if(e.pointerType!=='mouse'||!cursor||!finePointer.matches||!motionEnabled()) return;
  const target=e.target as Element;
  overHero=pointerInHero(e.clientX,e.clientY);
  const onProject=!!target.closest('.project-preview');
  cursor.classList.toggle('is-project',onProject);
  targetX=e.clientX;targetY=e.clientY;lastMove=performance.now();
  if(!mouseSeen){cursorX=targetX;cursorY=targetY;mouseSeen=true;}
  cursor.classList.toggle('is-visible',!overHero);
  if(!cursorFrame) cursorFrame=requestAnimationFrame(tickCursor);
},{passive:true});
document.documentElement.addEventListener('pointerleave',()=>{mouseSeen=false;cursor?.classList.remove('is-visible');});
window.addEventListener('scroll',()=>{
  if(!mouseSeen||!cursor) return;
  const el=document.elementFromPoint(targetX,targetY);
  overHero=pointerInHero(targetX,targetY);
  cursor.classList.toggle('is-project',!!el?.closest('.project-preview'));
  cursor.classList.toggle('is-visible',!overHero&&motionEnabled()&&finePointer.matches);
},{passive:true});

// Reference settings: 10px grid, solid cells, 1s hold, 0.5s zero-bounce fade.
const canvas=document.querySelector<HTMLCanvasElement>('#pixel-trail');
const hero=document.querySelector<HTMLElement>('#home');
if(canvas&&hero){
  const ctx=canvas.getContext('2d');
  const trailRGB=getComputedStyle(hero).getPropertyValue('--accent-rgb').trim()||'222,46,43';
  const cells=new Map<number,{x:number;y:number;leftAt:number|null}>();
  let width=0,height=0,visible=true,frame=0;
  let lastPoint:{x:number;y:number}|null=null;
  let activeKey:number|null=null;
  const leave=(now:number)=>{if(activeKey!==null){const cell=cells.get(activeKey);if(cell)cell.leftAt=now;}activeKey=null;lastPoint=null;};
  const resize=()=>{const r=hero.getBoundingClientRect();width=Math.ceil(r.width/10);height=Math.ceil(r.height/10);canvas.width=width;canvas.height=height;lastPoint=null;activeKey=null;cells.clear();};
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cells.clear();ctx?.clearRect(0,0,width,height);leave(performance.now());}}).observe(hero);
  const paint=(now:number)=>{
    if(!ctx)return;
    ctx.clearRect(0,0,width,height);
    if(!motionEnabled()||!visible||document.hidden){cells.clear();activeKey=null;frame=0;return;}
    let fading=false;
    for(const[key,cell]of cells){
      const age=cell.leftAt===null?0:now-cell.leftAt;
      if(cell.leftAt!==null&&age>=1500){cells.delete(key);continue;}
      let alpha=1;
      if(age>1000){const spring=(age-1000)/500*7;alpha=(1+spring)*Math.exp(-spring);}
      ctx.fillStyle=`rgba(${trailRGB},${alpha})`;ctx.fillRect(cell.x,cell.y,1,1);
      if(cell.leftAt!==null)fading=true;
    }
    frame=fading?requestAnimationFrame(paint):0;
  };
  const addCell=(x:number,y:number,now:number,held=false)=>{
    if(x<0||y<0||x>=width||y>=height)return;
    const key=y*width+x;cells.set(key,{x,y,leftAt:held?null:now});if(held)activeKey=key;
  };
  window.addEventListener('pointermove',e=>{
    if(e.pointerType!=='mouse'||!motionEnabled()||!finePointer.matches||!visible)return;
    const r=hero.getBoundingClientRect();const now=performance.now();
    if(e.clientX<r.left||e.clientX>=r.right||e.clientY<r.top||e.clientY>=r.bottom){leave(now);if(!frame&&cells.size)frame=requestAnimationFrame(paint);return;}
    const x=Math.floor((e.clientX-r.left)/10),y=Math.floor((e.clientY-r.top)/10);
    if(activeKey===y*width+x)return;
    if(activeKey!==null){const previous=cells.get(activeKey);if(previous)previous.leftAt=now;}
    if(lastPoint){
      let cx=lastPoint.x,cy=lastPoint.y;
      const dx=Math.abs(x-cx),dy=Math.abs(y-cy),sx=cx<x?1:-1,sy=cy<y?1:-1;
      let error=dx-dy;
      for(let count=0;count<500;count++){
        addCell(cx,cy,now);if(cx===x&&cy===y)break;
        const doubled=error*2;if(doubled>-dy){error-=dy;cx+=sx;}if(doubled<dx){error+=dx;cy+=sy;}
      }
    }
    addCell(x,y,now,true);lastPoint={x,y};if(!frame)frame=requestAnimationFrame(paint);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{leave(performance.now());if(!frame&&cells.size)frame=requestAnimationFrame(paint);});
}
const title=document.querySelector<HTMLElement>('.hero-title');
if(title){
  title.querySelectorAll<HTMLElement>('.headline-scene>span').forEach(line=>{
    const text=line.textContent||'';line.textContent='';
    for(const char of text){const span=document.createElement('span');span.className='headline-char'+(char==='.'?' name-period':'');span.textContent=char===' '? '\u00a0':char;line.append(span);}
  });
}
const journey=document.querySelector<HTMLElement>('#journey');
const wheel=document.querySelector<HTMLElement>('.year-orbit');
const stories=Array.from(document.querySelectorAll<HTMLElement>('.journey-story'));
const controls=Array.from(document.querySelectorAll<HTMLButtonElement>('[data-journey]'));
let journeyTrigger:ScrollTrigger|undefined;
let activeStory=-1;
const renderJourney=(progress:number)=>{
  const state=journeyState(progress,stories.length);
  wheel?.style.setProperty('--wheel-turn',`${state.turn}deg`);
  stories.forEach((story,i)=>{
    const pose=storyPose(state.turn,i);
    gsap.set(story,{autoAlpha:pose.opacity,y:pose.y});
    story.setAttribute('aria-hidden',String(pose.opacity<.5));
  });
  if(state.index!==activeStory){
    activeStory=state.index;
    stories.forEach((story,i)=>story.classList.toggle('is-current',i===state.index));
    controls.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===state.index)));
  }
};
controls.forEach((button,index)=>button.addEventListener('click',()=>{
  if(!journey||!journeyTrigger)return;
  const progress=milestoneProgress(index,stories.length);
  window.scrollTo({top:journeyTrigger.start+(journeyTrigger.end-journeyTrigger.start)*progress,behavior:motionEnabled()?'smooth':'instant'});
}));
let animationContext:gsap.Context|undefined;
let heroTimeline:gsap.core.Timeline|undefined;
let heroOnScreen=true;
const heroSurface=document.querySelector('#home');
if(heroSurface)new IntersectionObserver(entries=>{heroOnScreen=entries[0].isIntersecting;heroTimeline?.paused(!heroOnScreen||document.hidden);}).observe(heroSurface);
document.addEventListener('visibilitychange',()=>heroTimeline?.paused(!heroOnScreen||document.hidden));
const setupMotion=()=>{
  document.documentElement.classList.toggle('cursor-enhanced',finePointer.matches&&motionEnabled());
  animationContext?.revert();journeyTrigger=undefined;
  if(stories.length){gsap.killTweensOf(stories);gsap.set(stories,{clearProps:'opacity,visibility,transform,filter'});}activeStory=-1;
  if(!motionEnabled()){stories.forEach(s=>s.setAttribute('aria-hidden','false'));return;}
  animationContext=gsap.context(()=>{
    if(title){
      const name=title.querySelector('.headline-name');const role=title.querySelector('.headline-role');
      const nameChars=title.querySelectorAll('.headline-name .headline-char');const roleChars=title.querySelectorAll('.headline-role .headline-char');
      gsap.set([name,role],{y:0,yPercent:0,opacity:1});gsap.set(roleChars,{yPercent:115});
      heroTimeline=gsap.timeline({paused:!heroOnScreen||document.hidden})
        .to(nameChars,{yPercent:-115,duration:.55,stagger:.02,ease:'expo.inOut'},1.05)
        .to(roleChars,{yPercent:0,duration:.55,stagger:.02,ease:'expo.inOut'},1.1)
        .set(nameChars,{yPercent:115},3.35)
        .to(roleChars,{yPercent:-115,duration:.55,stagger:.02,ease:'expo.inOut'},3.35)
        .to(nameChars,{yPercent:0,duration:.55,stagger:.02,ease:'expo.inOut'},3.4);
    }
    if(journey&&wheel){
      journeyTrigger=ScrollTrigger.create({trigger:journey,start:'top top',end:()=>`+=${journey.offsetHeight-innerHeight}`,invalidateOnRefresh:true,onUpdate:self=>renderJourney(self.progress),onRefresh:self=>renderJourney(self.progress)});
      renderJourney(journeyTrigger.progress);
    }
    const processCards=gsap.utils.toArray<HTMLElement>('.process-step');
    processCards.forEach((card,index)=>ScrollTrigger.create({trigger:card,start:'top 92%',once:true,onEnter:()=>gsap.fromTo(card,{x:-50,opacity:0},{x:0,opacity:1,duration:.72,delay:index*.035,ease:'back.out(1.08)',clearProps:'transform,opacity'})}));
    const revealBlocks=gsap.utils.toArray<HTMLElement>([
      '#about .section-heading', '.profile-panel',
      '#projects .section-heading', '.projects-grid > .project',
      '.oss-heading', '.oss-selected > li', '.oss-actions',
      '#process .section-heading',
      '#strengths .section-heading', '.strengths-grid > .strength', '#strengths .tool-strip',
      '.journey-stage', '.contact-inner', '#contact .footer'
    ].join(','));
    revealBlocks.forEach(block=>{
      const stickyStage=block.classList.contains('journey-stage');
      ScrollTrigger.create({
        trigger:block,
        start:'top 90%',
        once:true,
        onEnter:()=>{
          if(block.getBoundingClientRect().bottom<=0)return;
          gsap.from(block,{
            ...(stickyStage?{}:{y:28}),opacity:.2,duration:.65,ease:'power3.out',
            clearProps:stickyStage?'opacity':'transform,opacity'
          });
        }
      });
    });
  });
};
setupMotion();
document.fonts.ready.then(()=>ScrollTrigger.refresh());
reduced.addEventListener('change',()=>{cursor?.classList.remove('is-visible');setupMotion();ScrollTrigger.refresh();});
finePointer.addEventListener('change',()=>{document.documentElement.classList.toggle('cursor-enhanced',finePointer.matches&&motionEnabled());cursor?.classList.remove('is-visible');});

const footerWord=document.querySelector<HTMLElement>('.footer-word');
if(footerWord){
  const observer=new IntersectionObserver(([entry])=>{
    if(!entry.isIntersecting||!motionEnabled()||document.hidden)return;
    observer.disconnect();
    footerWord.classList.add('changing');
    window.setTimeout(()=>{
      if(motionEnabled()&&!document.hidden)footerWord.textContent='ship';
      footerWord.classList.remove('changing');
    },200);
  });
  observer.observe(footerWord);
}
