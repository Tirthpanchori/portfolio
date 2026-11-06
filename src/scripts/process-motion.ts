import gsap from 'gsap';

// Preserve the reference's individual anchors with a gentler, non-overshooting reveal.
const processTiming={open:.48,close:.38,ease:'power2.inOut'};

export function initProcessCards(motionEnabled:()=>boolean){
  const group=document.querySelector<HTMLElement>('.process-steps');
  if(!group)return;
  const phone=matchMedia('(max-width:540px)');
  const states=Array.from(group.querySelectorAll<HTMLElement>('.process-step')).map((card,index)=>{
    const button=card.querySelector<HTMLButtonElement>('.step-button')!;
    const top=card.querySelector<HTMLElement>('.step-top')!;
    const detail=card.querySelector<HTMLElement>('.step-detail')!;
    const inner=detail.firstElementChild as HTMLElement;
    const state={card,button,top,detail,inner,index,active:false,locked:false,hovered:false,closedHeight:0,leaveTimer:0};
    return state;
  });
  group.dataset.processMotion='';

  const render=(state:typeof states[number],animate=true)=>{
    const {card,button,top,detail,inner,index,active}=state;
    // Intrinsic dimensions are read only on a state/width change, not every frame.
    const titleHeight=card.querySelector<HTMLElement>('.step-title')!.offsetHeight;
    const iconHeight=top.offsetHeight;
    const pad=Number.parseFloat(getComputedStyle(button).paddingTop);
    const baseGap=phone.matches?22:21;
    state.closedHeight=pad*2+iconHeight+baseGap+titleHeight+2;
    const headerHeight=pad+iconHeight+(active?0:baseGap)+titleHeight+(active?21:pad)+2;
    const detailHeight=active?inner.scrollHeight:0;
    const height=headerHeight+detailHeight;
    // Source anchors: first top, second/fourth bottom, third centre.
    const anchor=phone.matches?0:index===2?.5:index%2===1?1:0;
    const offset=-(height-state.closedHeight)*anchor;
    const options={duration:animate&&motionEnabled()?(active?processTiming.open:processTiming.close):0,ease:processTiming.ease,overwrite:'auto' as const};
    gsap.to(card,{height,top:offset,...options});
    gsap.to(top,{marginBottom:active?0:baseGap,...options});
    gsap.to(button,{paddingBottom:active?21:pad,...options});
    gsap.to(detail,{height:detailHeight,opacity:active?1:0,...options});
  };
  const activate=(state:typeof states[number],active:boolean)=>{
    if(state.active===active)return;
    state.active=active;
    state.card.classList.toggle('is-active',active);
    state.button.setAttribute('aria-expanded',String(active));
    state.detail.setAttribute('aria-hidden',String(!active));
    render(state);
  };
  states.forEach(state=>{
    const cancelClose=()=>window.clearTimeout(state.leaveTimer);
    state.card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){cancelClose();state.hovered=true;activate(state,true);}});
    state.card.addEventListener('pointerleave',()=>{
      state.hovered=false;
      cancelClose();
      state.leaveTimer=window.setTimeout(()=>{if(!state.locked&&!state.hovered&&!state.card.contains(document.activeElement))activate(state,false);},motionEnabled()?50:0);
    });
    state.button.addEventListener('focus',()=>{cancelClose();activate(state,true);});
    state.button.addEventListener('click',()=>{cancelClose();state.locked=!state.locked;activate(state,state.locked);});
    state.card.addEventListener('focusout',e=>{if(!state.locked&&!state.hovered&&!state.card.contains(e.relatedTarget as Node))activate(state,false);});
    render(state,false);
  });
  let previousWidth=group.clientWidth;
  new ResizeObserver(()=>{
    if(group.clientWidth===previousWidth)return;
    previousWidth=group.clientWidth;
    states.forEach(state=>render(state,false));
  }).observe(group);
  document.fonts.ready.then(()=>states.forEach(state=>render(state,false)));
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',()=>states.forEach(state=>render(state,false)));
}
