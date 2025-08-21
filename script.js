
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xgvzjpyw"; // твой endpoint Formspree

function sectionEl(key){ return document.getElementById('tab-' + key); }
function scrollToActive(key){
  const el = sectionEl(key);
  if(el){ el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}

const tabButtons = document.querySelectorAll('.tab-btn');
const sections = {
  about: document.getElementById('tab-about'),
  reviews: document.getElementById('tab-reviews'),
  lessons: document.getElementById('tab-lessons')
};
function activateTab(key){
  Object.entries(sections).forEach(([k,el])=>{
    if(el) el.classList.toggle('active', k===key);
  });
  tabButtons.forEach(btn=>{
    const on = btn.dataset.tab===key;
    btn.setAttribute('aria-selected', on);
    btn.dataset.active = on;
  });
}

tabButtons.forEach(btn=> btn.addEventListener('click', (e)=>{
  e.preventDefault();
  const key = btn.dataset.tab;
  activateTab(key);
  scrollToActive(key);
}));

document.querySelectorAll('[data-tab-target]').forEach(b=>{
  b.addEventListener('click', (e)=>{
    e.preventDefault();
    const key = b.getAttribute('data-tab-target');
    activateTab(key);
    scrollToActive(key);
  });
});

document.querySelectorAll('.acc').forEach(d=>{
  d.addEventListener('toggle', ()=>{
    const btn = d.querySelector('.acc-btn');
    if(btn) btn.setAttribute('aria-expanded', d.open);
  })
});

async function sendViaFormspree(payload){
  if(!FORMSPREE_ENDPOINT) return false;
  try{
    const res = await fetch(FORMSPREE_ENDPOINT, {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  }catch(e){ return false; }
}

async function handleSubmit(e){
  e.preventDefault();
  const form = e.currentTarget;
  const data = Object.fromEntries(new FormData(form).entries());
  const section = form.dataset.section || 'main';
  const payload = { ...data, section, page: location.href };

  const ok = await sendViaFormspree(payload);

  if(ok){
    alert('Спасибо! Заявка отправлена. Я свяжусь с вами по указанным контактам.');
    form.reset();
  } else {
    alert('Не удалось отправить форму. Попробуйте ещё раз или свяжитесь напрямую.');
  }
}

document.querySelectorAll('.contact-form').forEach(f=> f.addEventListener('submit', handleSubmit));

document.querySelectorAll('a[href="#contact-all"]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    activateTab('lessons');
    setTimeout(()=>{
      const target = document.getElementById('contact-all');
      if(target) target.scrollIntoView({behavior:'smooth', block:'start'});
    }, 120);
  });
});

const hash = (location.hash || '').replace('#','');
if(hash){
  if(['about','reviews','lessons'].includes(hash)){
    activateTab(hash);
    scrollToActive(hash);
  }
  if(hash === 'contact-all'){
    activateTab('lessons');
    setTimeout(()=> document.getElementById('contact-all')?.scrollIntoView({behavior:'smooth'}), 120);
  }
}

const stickyBar = document.querySelector('.sticky-tabbar');
const ctaBar = document.querySelector('.cta-bar');

function checkStickyBar(){
  if(!stickyBar || !ctaBar) return;
  const rect = ctaBar.getBoundingClientRect();
  // если нижняя граница блока выше верхнего края экрана → бар скрылся
  if(rect.bottom < 0){
    stickyBar.classList.add('visible');
  } else {
    stickyBar.classList.remove('visible');
  }
}

window.addEventListener('scroll', checkStickyBar);
checkStickyBar(); // проверить сразу при загрузке


// ===== Глобальный лайтбокс для всех картинок, кроме аватарки =====
(function initGlobalLightbox(){
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.85);
    display:none; align-items:center; justify-content:center; z-index:9999;
    padding:20px; cursor:zoom-out;
  `;
  const img = document.createElement('img');
  img.style.cssText = `
    max-width: min(95vw, 1400px);
    max-height: 95vh;
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0,0,0,.5);
    background:#fff;
  `;
  overlay.appendChild(img);
  document.body.appendChild(overlay);

  function openLightbox(src){
    img.src = src;
    overlay.style.display = 'flex';
    document.body.classList.add('lb-open');
  }
  function closeLightbox(){
    overlay.style.display = 'none';
    img.src = '';
    document.body.classList.remove('lb-open');
  }

  overlay.addEventListener('click', closeLightbox);
  window.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });

  // делегирование клика по IMG
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if(!(t && t.tagName === 'IMG')) return;

    // исключаем аватарку и .no-zoom
    if (t.closest('.hero-photo')) return;
    if (t.classList.contains('no-zoom')) return;

    const bbox = t.getBoundingClientRect();
    if (bbox.width < 40 && bbox.height < 40) return;

    e.preventDefault();
    openLightbox(t.currentSrc || t.src);
  });
})();