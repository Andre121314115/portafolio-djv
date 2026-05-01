/* ══════════════════════════════════════════════════
   DIOJANI VERÁSTEGUI · main.js v5
   Partículas · Typewriter · Morph · Trail · Barras
   ══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const lerp = (a,b,t) => a+(b-a)*t;

  /* ═══════════════ DARK MODE ═══════════════ */
  const html = document.documentElement;
  const themeToggle = $('#themeToggle');
  const THEME_KEY = 'djv-theme';

  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

  themeToggle?.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem(THEME_KEY, next);
    if (window._particleUpdateColors) window._particleUpdateColors();
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(THEME_KEY)) html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
  });

  /* ═══════════════ PARTÍCULAS ═══════════════ */
  const canvas = $('#particlesCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const mouse = { x: -999, y: -999 };

    function getColors() {
      const dark = html.getAttribute('data-theme') === 'dark';
      return dark
        ? ['rgba(168,136,224,', 'rgba(136,196,148,', 'rgba(212,168,120,']
        : ['rgba(122,90,184,',  'rgba(62,110,74,',   'rgba(122,82,48,'];
    }

    window._particleUpdateColors = () => {
      const cols = getColors();
      particles.forEach(p => { p.col = cols[Math.floor(Math.random()*cols.length)]; });
    };

    class Particle {
      constructor(init) { this.reset(init); }
      reset(init) {
        const cols = getColors();
        this.x = Math.random()*W;
        this.y = init ? Math.random()*H : H+10;
        this.r = Math.random()*2+1;
        this.vx = (Math.random()-.5)*.4;
        this.vy = -(Math.random()*.5+.15);
        this.op = Math.random()*.4+.1;
        this.life = 0;
        this.maxLife = Math.random()*280+180;
        this.col = cols[Math.floor(Math.random()*cols.length)];
      }
      update() {
        this.life++;
        const dx=this.x-mouse.x, dy=this.y-mouse.y, d=Math.sqrt(dx*dx+dy*dy);
        if (d<90) { this.vx+=dx/d*.05; this.vy+=dy/d*.05; }
        this.vx*=.98; this.vy*=.98;
        this.x+=this.vx; this.y+=this.vy;
        if (this.life>this.maxLife || this.y<-10) this.reset(false);
      }
      draw() {
        const p=this.life/this.maxLife;
        const fade = p<.15 ? p/.15 : p>.75 ? 1-(p-.75)/.25 : 1;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
        ctx.fillStyle = this.col+(this.op*fade)+')';
        ctx.fill();
      }
    }

    function resize() {
      const r = canvas.parentElement.getBoundingClientRect();
      W = canvas.width = r.width;
      H = canvas.height = r.height;
    }

    function init() {
      resize();
      const n = Math.min(Math.floor((W*H)/9000), 90);
      particles = Array.from({length:n}, (_,i) => new Particle(true));
    }

    function animate() {
      ctx.clearRect(0,0,W,H);
      const cols = getColors();
      for (let i=0;i<particles.length;i++) {
        for (let j=i+1;j<particles.length;j++) {
          const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
          const d=Math.sqrt(dx*dx+dy*dy);
          if (d<100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x,particles[i].y);
            ctx.lineTo(particles[j].x,particles[j].y);
            ctx.strokeStyle=cols[0]+(1-d/100)*.1+')';
            ctx.lineWidth=.7;
            ctx.stroke();
          }
        }
        particles[i].update();
        particles[i].draw();
      }
      requestAnimationFrame(animate);
    }

    canvas.parentElement.addEventListener('mousemove', e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX-r.left;
      mouse.y = e.clientY-r.top;
    });
    canvas.parentElement.addEventListener('mouseleave', () => { mouse.x=-999; mouse.y=-999; });
    window.addEventListener('resize', init);
    init(); animate();
  }

  /* ═══════════════ CURSOR + TRAIL ═══════════════ */
  const cursor = $('#cursor');
  const cRing  = $('#cursorRing');
  const trail  = $('#trailContainer');
  const isTouch = !window.matchMedia('(hover: hover)').matches;
  let mx=0,my=0,rx=0,ry=0;
  const tColors = ['#A888E0','#88C494','#D4A878','#C0A8F0','#6A9E78','#B49DD4'];

  if (!isTouch) {
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      if (cursor) { cursor.style.left=mx+'px'; cursor.style.top=my+'px'; }
      if (trail && Math.random()>.4) {
        const dot = document.createElement('div');
        dot.className='trail-dot';
        dot.style.cssText=`left:${mx}px;top:${my}px;background:${tColors[Math.floor(Math.random()*tColors.length)]};width:${Math.random()*4+3}px;height:${dot.style.width}`;
        trail.appendChild(dot);
        setTimeout(()=>dot.remove(), 750);
      }
    });
    ;(function ringTick(){
      rx=lerp(rx,mx,.13); ry=lerp(ry,my,.13);
      if(cRing){cRing.style.left=rx+'px';cRing.style.top=ry+'px';}
      requestAnimationFrame(ringTick);
    })();
    $$('a,button,.cert__card,.skill,.exp__card,.edu__card,.quote-wrap').forEach(el=>{
      el.addEventListener('mouseenter',()=>{ cursor?.classList.add('hovered'); cRing?.classList.add('hovered'); });
      el.addEventListener('mouseleave',()=>{ cursor?.classList.remove('hovered'); cRing?.classList.remove('hovered'); });
    });
  } else {
    cursor?.remove(); cRing?.remove(); trail?.remove();
    document.body.style.cursor='auto';
  }

  /* ═══════════════ TYPEWRITER ═══════════════ */
  const twEl = $('#twText');
  const phrases = [
    'Creatividad y estrategia en cada proyecto.',
    'Transformando ideas en resultados reales.',
    'Innovación con atención al detalle.',
    'Apasionada por los desafíos creativos.',
  ];

  if (twEl) {
    let pi=0,ci=0,del=false,paused=false;
    function typeStep() {
      const ph = phrases[pi];
      if (paused) { paused=false; del=true; setTimeout(typeStep,1800); return; }
      if (!del) {
        twEl.textContent=ph.slice(0,++ci);
        if (ci===ph.length) { paused=true; setTimeout(typeStep,80); return; }
        setTimeout(typeStep,44);
      } else {
        twEl.textContent=ph.slice(0,--ci);
        if (ci===0) { del=false; pi=(pi+1)%phrases.length; setTimeout(typeStep,380); return; }
        setTimeout(typeStep,20);
      }
    }
    setTimeout(typeStep, 1400);
  }

  /* ═══════════════ SVG MORPH ═══════════════ */
  const morphP = $('.morph-path');
  const morphShapes = [
    'M100,15 C145,15 185,55 185,100 C185,145 145,185 100,185 C55,185 15,145 15,100 C15,55 55,15 100,15 Z',
    'M100,12 C130,18 188,55 185,105 C182,155 148,190 98,188 C48,186 12,150 15,100 C18,50 70,6 100,12 Z',
    'M100,18 C138,12 188,52 185,98 C182,144 148,188 100,188 C52,188 14,148 12,100 C10,52 62,24 100,18 Z',
    'M100,10 C142,16 190,58 186,102 C182,146 140,190 96,186 C52,182 10,144 14,100 C18,56 58,4 100,10 Z',
    'M100,16 C136,10 186,50 188,96 C190,142 152,190 106,188 C60,186 12,152 10,106 C8,60 64,22 100,16 Z',
  ];
  if (morphP) {
    let mi=0;
    setInterval(()=>{
      mi=(mi+1)%morphShapes.length;
      morphP.style.transition='d 3.5s cubic-bezier(.45,0,.55,1)';
      try { morphP.setAttribute('d', morphShapes[mi]); } catch(e){}
    }, 3600);
  }

  /* ═══════════════ NAV SCROLL ═══════════════ */
  const nav = $('#nav');
  let lastY=0, tick=false;
  nav.style.transition='background .4s,padding .4s,box-shadow .4s,transform .45s cubic-bezier(.16,1,.3,1)';
  window.addEventListener('scroll', ()=>{
    if(tick)return;
    requestAnimationFrame(()=>{
      const y=window.scrollY;
      nav.classList.toggle('stuck',y>40);
      nav.style.transform=(y>lastY&&y>120)?'translateY(-110%)':'translateY(0)';
      lastY=y; tick=false;
    }); tick=true;
  },{passive:true});

  /* ═══════════════ HAMBURGER ═══════════════ */
  const ham=$('#ham'), mob=$('#mobMenu');
  let open=false;
  function toggleMenu(f){ open=typeof f==='boolean'?f:!open; ham?.classList.toggle('open',open); mob?.classList.toggle('open',open); document.body.style.overflow=open?'hidden':''; }
  ham?.addEventListener('click',()=>toggleMenu());
  $$('a',mob).forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&open)toggleMenu(false); });

  /* ═══════════════ SMOOTH SCROLL ═══════════════ */
  $$('a[href^="#"]').forEach(a=>{
    a.addEventListener('click',e=>{
      const t=$(a.getAttribute('href'));
      if(!t)return; e.preventDefault();
      window.scrollTo({top:t.getBoundingClientRect().top+scrollY-78,behavior:'smooth'});
    });
  });

  /* ═══════════════ SCROLL REVEAL ═══════════════ */
  const revObs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      const idx=[...en.target.parentElement.querySelectorAll('.reveal:not(.on)')].indexOf(en.target);
      setTimeout(()=>en.target.classList.add('on'), Math.min(idx*70,300));
      revObs.unobserve(en.target);
    });
  },{threshold:.1,rootMargin:'0px 0px -48px 0px'});
  $$('.reveal').forEach(el=>revObs.observe(el));

  setTimeout(()=>{ $$('.reveal-hero').forEach((el,i)=>setTimeout(()=>el.classList.add('on'),200+i*140)); },80);

  /* ═══════════════ SKILL BARS ═══════════════ */
  const barObs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      setTimeout(()=>{ en.target.style.width=en.target.dataset.w+'%'; },200);
      barObs.unobserve(en.target);
    });
  },{threshold:.3});
  $$('.skill__bar').forEach(b=>barObs.observe(b));

  /* SKILL STAGGER */
  const skObs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      const i=parseInt(en.target.style.getPropertyValue('--si')||'0',10);
      setTimeout(()=>en.target.classList.add('on'),i*55);
      skObs.unobserve(en.target);
    });
  },{threshold:.1,rootMargin:'0px 0px -30px 0px'});
  $$('.skill').forEach(el=>skObs.observe(el));

  /* ═══════════════ COUNTERS ═══════════════ */
  const cntObs = new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      if(!en.isIntersecting)return;
      const el=en.target, end=parseInt(el.dataset.count,10);
      if(isNaN(end))return;
      let t0; const dur=1100;
      ;(function f(ts){ if(!t0)t0=ts; const p=Math.min((ts-t0)/dur,1); el.textContent=Math.floor((1-Math.pow(1-p,3))*end); if(p<1)requestAnimationFrame(f); else el.textContent=end; })(performance.now());
      cntObs.unobserve(el);
    });
  },{threshold:.8});
  $$('.hero__stat-n').forEach(el=>cntObs.observe(el));

  /* ═══════════════ CERT TILT ═══════════════ */
  $$('.cert__card').forEach(c=>{
    c.addEventListener('mousemove',e=>{
      const r=c.getBoundingClientRect(),rx=(e.clientX-r.left)/r.width-.5,ry=(e.clientY-r.top)/r.height-.5;
      c.style.transform=`translateY(-6px) perspective(700px) rotateX(${-ry*5}deg) rotateY(${rx*5}deg)`;
    });
    c.addEventListener('mouseleave',()=>{ c.style.transform=''; });
  });

  /* ═══════════════ ACTIVE NAV ═══════════════ */
  const navLinks=$$('.nav__links a');
  const secObs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{ if(!en.isIntersecting)return; navLinks.forEach(l=>{ l.style.color=l.getAttribute('href')==='#'+en.target.id?'var(--lilac)':''; }); });
  },{threshold:.45});
  $$('section[id]').forEach(s=>secObs.observe(s));

  /* ═══════════════ PARALLAX FOTO ═══════════════ */
  const photoW=$('.hero__photo-outer');
  if(photoW&&!isTouch){
    window.addEventListener('scroll',()=>{ const y=window.scrollY; if(y<window.innerHeight*1.3)photoW.style.transform=`translateY(${y*.055}px)`; },{passive:true});
  }

  console.log('%c✦ DJV Portfolio v5 ✦','color:#A888E0;font-family:serif;font-size:13px;font-style:italic');
});
