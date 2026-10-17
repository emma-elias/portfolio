diviv() => {
  'use strict';
  const fallback = window.DEFAULT_CONTENT || {};
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const safeUrl = (value = '') => {
    const v = String(value).trim();
    return /^(https?:|mailto:|#|\.\/|\.\.\/|assets\/|uploads\/)/i.test(v) ? v : '';
  };
  const byId = id => document.getElementById(id);
  const setText = (id, value) => { const el = byId(id); if (el) el.textContent = value || ''; };
  const richTitle = (before = '', emphasis = '', after = '') => `${esc(before)}${before && emphasis ? '<br>' : ''}<em>${esc(emphasis)}</em>${after ? ' ' + esc(after) : ''}`;
  const imageUrl = value => safeUrl(value) || 'assets/profile-photo.png';
  const lineBreaks = value => esc(value || '').replace(/\n/g, '<br>');
  const MAX_FEATURED_PROJECTS = 5;
const isAllProjectsPage = document.body.dataset.page === 'all-projects';

function normaliseMedia(item) {
  const legacy = [];
  if (item.image) legacy.push({ type: 'image', src: item.image });
  if (item.video) legacy.push({ type: 'video', src: item.video });

  const gallery = Array.isArray(item.media) ? item.media : [];
  const seen = new Set();

  return [...legacy, ...gallery].filter(entry => {
    const src = safeUrl(entry?.src || '');
    const type = entry?.type === 'video' ? 'video' : 'image';
    if (!src || seen.has(src)) return false;
    seen.add(src);
    entry.type = type;
    entry.src = src;
    return true;
  });
}

function modelButton(item) {
  const src = safeUrl(item.model3d || '');
  if (!src) return '';
  return `<button class="view-3d-button" type="button" data-model-src="${esc(src)}" data-model-title="${esc(item.title || item.role || '3D model')}">View 3D <b>↗</b></button>`;
}

function mediaCarousel(item, index, context) {
  const media = normaliseMedia(item);
  if (!media.length) return '';

  const isProject = context === 'project';
  const rootClass = isProject
    ? 'project-art media-art media-carousel'
    : 'experience-media-frame media-carousel';

  const slides = media.map((entry, mediaIndex) => {
    const asset = entry.type === 'video'
      ? `<video src="${esc(entry.src)}" muted playsinline loop preload="metadata" data-autoplay-in-view></video>`
      : `<img src="${esc(imageUrl(entry.src))}" alt="${esc(item.title || item.role || 'Portfolio media')} ${mediaIndex + 1}">`;
    return `<div class="media-slide ${mediaIndex === 0 ? 'is-active' : ''}" data-slide aria-hidden="${mediaIndex === 0 ? 'false' : 'true'}">${asset}</div>`;
  }).join('');

  const controls = media.length > 1 ? `
    <button class="carousel-arrow carousel-prev" type="button" data-carousel-step="-1" aria-label="Previous image or video">←</button>
    <button class="carousel-arrow carousel-next" type="button" data-carousel-step="1" aria-label="Next image or video">→</button>
    <div class="carousel-dots" aria-label="Media slides">${media.map((_, dotIndex) => `<button type="button" data-carousel-go="${dotIndex}" aria-label="Show media ${dotIndex + 1}" class="${dotIndex === 0 ? 'is-active' : ''}"></button>`).join('')}</div>` : '';

  return `<div class="${rootClass}" data-carousel data-carousel-index="0">
    <div class="media-slides">${slides}</div>
    ${isProject ? `<span>${esc(item.area || 'PROJECT')}</span>` : ''}
    ${controls}
    ${modelButton(item)}
  </div>`;
}

  async function getContent() {
    try {
      const response = await fetch(`content.json?v=${Date.now()}`, {cache: 'no-store'});
      if (!response.ok) throw new Error('Content file unavailable');
      return await response.json();
    } catch (error) {
      console.warn('Using bundled portfolio content:', error.message);
      return fallback;
    }
  }

const MAX_FEATURED_PROJECTS = 5;
const isAllProjectsPage = document.body.dataset.page === 'all-projects';

function normaliseMedia(item) {
  const legacy = [];
  if (item.image) legacy.push({ type: 'image', src: item.image });
  if (item.video) legacy.push({ type: 'video', src: item.video });

  const gallery = Array.isArray(item.media) ? item.media : [];
  const seen = new Set();

  return [...legacy, ...gallery].filter(entry => {
    const src = safeUrl(entry?.src || '');
    const type = entry?.type === 'video' ? 'video' : 'image';
    if (!src || seen.has(src)) return false;
    seen.add(src);
    entry.type = type;
    entry.src = src;
    return true;
  });
}

function modelButton(item) {
  const src = safeUrl(item.model3d || '');
  if (!src) return '';
  return `<button class="view-3d-button" type="button" data-model-src="${esc(src)}" data-model-title="${esc(item.title || item.role || '3D model')}">View 3D <b>↗</b></button>`;
}

function mediaCarousel(item, index, context) {
  const media = normaliseMedia(item);
  if (!media.length) return '';

  const isProject = context === 'project';
  const rootClass = isProject
    ? 'project-art media-art media-carousel'
    : 'experience-media-frame media-carousel';

  const slides = media.map((entry, mediaIndex) => {
    const asset = entry.type === 'video'
      ? `<video src="${esc(entry.src)}" muted playsinline loop preload="metadata" data-autoplay-in-view></video>`
      : `<img src="${esc(imageUrl(entry.src))}" alt="${esc(item.title || item.role || 'Portfolio media')} ${mediaIndex + 1}">`;
    return `<div class="media-slide ${mediaIndex === 0 ? 'is-active' : ''}" data-slide aria-hidden="${mediaIndex === 0 ? 'false' : 'true'}">${asset}</div>`;
  }).join('');

  const controls = media.length > 1 ? `
    <button class="carousel-arrow carousel-prev" type="button" data-carousel-step="-1" aria-label="Previous image or video">←</button>
    <button class="carousel-arrow carousel-next" type="button" data-carousel-step="1" aria-label="Next image or video">→</button>
    <div class="carousel-dots" aria-label="Media slides">${media.map((_, dotIndex) => `<button type="button" data-carousel-go="${dotIndex}" aria-label="Show media ${dotIndex + 1}" class="${dotIndex === 0 ? 'is-active' : ''}"></button>`).join('')}</div>` : '';

  return `<div class="${rootClass}" data-carousel data-carousel-index="0">
    <div class="media-slides">${slides}</div>
    ${isProject ? `<span>${esc(item.area || 'PROJECT')}</span>` : ''}
    ${controls}
    ${modelButton(item)}
  </div>`;
}
    const styles = ['art-rover', 'art-gripper', 'art-vision', 'art-twin'];
    const details = [
      '<div class="map-grid"></div><div class="rover"><i></i><i></i><b></b></div>',
      '<div class="grip-left"></div><div class="grip-right"></div><div class="grip-object"></div>',
      '<div class="lens"></div><div class="detect one"></div><div class="detect two"></div>',
      '<div class="orbit a"></div><div class="orbit b"></div><div class="twin-core"></div>'
    ];
    return `<div class="project-art ${styles[index % styles.length]}">${details[index % details.length]}<span>${esc(project.area || 'PROJECT')}</span></div>`;
  }

function renderProjects(projects) {
  const grid = byId('projectGrid');
  if (!grid) return;

  const displayedProjects = isAllProjectsPage ? projects : projects.slice(0, MAX_FEATURED_PROJECTS);
  if (!displayedProjects.length) {
    grid.innerHTML = '<p class="empty-state">No projects have been published yet.</p>';
    return;
  }

  grid.innerHTML = displayedProjects.map((project, index) => {
    const tags = (project.tags || []).map(tag => `<span>${esc(tag)}</span>`).join('');
    const proof = project.outcome ? `<div class="project-proof"><b>PROJECT SUMMARY / EVIDENCE</b>${esc(project.outcome)}</div>` : '';
    return `<article class="project-card ${index === 0 ? 'project-large' : ''} reveal ${index % 2 ? 'delay-1' : ''}">
      ${projectArt(project, index)}
      <div class="project-content">
        <div class="project-kicker"><span>${String(index + 1).padStart(2, '0')} · ${esc(project.status || 'PROJECT')}</span><span>${esc(project.area || 'ENGINEERING')}</span></div>
        <h3>${esc(project.title)}</h3>
        <p>${esc(project.summary)}</p>
        <div class="project-tags">${tags}</div>
        ${proof}
        <button class="case-link" type="button" data-project-id="${esc(project.id || String(index))}">View project brief <b>↗</b></button>
      </div>
    </article>`;
  }).join('');
}

  function showProject(project) {
    const modal = byId('projectModal');
    const content = byId('modalContent');
    if (!modal || !content) return;
    const media = project.video
      ? `<video class="project-modal-media" src="${esc(safeUrl(project.video))}" controls playsinline></video>`
      : project.image ? `<img class="project-modal-media" src="${esc(imageUrl(project.image))}" alt="${esc(project.title)}">` : '';
    const tags = (project.tags || []).map(tag => `<li>${esc(tag)}</li>`).join('');
    const links = [
      project.repoUrl ? `<a class="modal-link" href="${esc(safeUrl(project.repoUrl))}" target="_blank" rel="noopener">Repository ↗</a>` : '',
      project.demoUrl ? `<a class="modal-link" href="${esc(safeUrl(project.demoUrl))}" target="_blank" rel="noopener">Demo / video ↗</a>` : ''
    ].join('');
    content.innerHTML = `${media}<p class="eyebrow">${esc(project.status || 'PROJECT')} · ${esc(project.area || 'ENGINEERING')}</p><h2>${esc(project.title)}</h2><div class="brief-grid"><div><h3>Project summary</h3><p>${esc(project.summary)}</p></div><div><h3>Challenge</h3><p>${esc(project.challenge || 'Add the challenge in the CMS.')}</p></div><div><h3>Approach</h3><p>${esc(project.approach || 'Add the approach in the CMS.')}</p></div><div><h3>Evidence / outcome</h3><p>${esc(project.outcome || 'Add only real tests, outcomes, and limitations in the CMS.')}</p></div><div><h3>Tools / skills</h3><ul>${tags}</ul></div></div>${links ? `<div class="modal-actions">${links}</div>` : ''}<p class="modal-footnote">Keep this page honest: use real media, source links, constraints, results, and limitations.</p>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden';
  }
let carouselObserver;
let carouselEventsBound = false;
let stopSTLViewer = () => {};

function syncCarouselVideo(carousel) {
  const activeSlide = carousel.querySelector('.media-slide.is-active');
  carousel.querySelectorAll('video[data-autoplay-in-view]').forEach(video => {
    const shouldPlay = carousel.dataset.visible === 'true' && video.closest('.media-slide') === activeSlide;
    if (shouldPlay) video.play().catch(() => {});
    else video.pause();
  });
}

function showCarouselSlide(carousel, requestedIndex) {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  if (!slides.length) return;
  const index = (requestedIndex + slides.length) % slides.length;
  carousel.dataset.carouselIndex = String(index);

  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === index;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  carousel.querySelectorAll('[data-carousel-go]').forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === index));
  syncCarouselVideo(carousel);
}

function initialiseMediaFeatures() {
  if (!carouselObserver) {
    carouselObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        entry.target.dataset.visible = entry.isIntersecting ? 'true' : 'false';
        syncCarouselVideo(entry.target);
      });
    }, { threshold: 0.55 });
  }

  document.querySelectorAll('[data-carousel]').forEach(carousel => {
    if (carousel.dataset.initialised) return;
    carousel.dataset.initialised = 'true';
    carousel.dataset.visible = 'false';
    carouselObserver.observe(carousel);

    const slides = carousel.querySelectorAll('[data-slide]');
    if (slides.length > 1) {
      window.setInterval(() => {
        const current = Number(carousel.dataset.carouselIndex || 0);
        showCarouselSlide(carousel, current + 1);
      }, 5000);
    }
  });

  if (!carouselEventsBound) {
    carouselEventsBound = true;
    document.addEventListener('click', event => {
      const stepButton = event.target.closest('[data-carousel-step]');
      const dotButton = event.target.closest('[data-carousel-go]');
      const button = stepButton || dotButton;
      if (!button) return;
      const carousel = button.closest('[data-carousel]');
      if (!carousel) return;
      const current = Number(carousel.dataset.carouselIndex || 0);
      const target = stepButton ? current + Number(stepButton.dataset.carouselStep) : Number(dotButton.dataset.carouselGo);
      showCarouselSlide(carousel, target);
    });
  }
}

function closeSTLViewer() {
  stopSTLViewer();
  stopSTLViewer = () => {};
  const modal = byId('modelModal');
  if (!modal) return;
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

async function openSTLViewer(modelUrl, title) {
  const modal = byId('modelModal');
  const stage = byId('stlStage');
  if (!modal || !stage) return;

  closeSTLViewer();
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  byId('modelTitle').textContent = title || '3D model';
  stage.innerHTML = '<p>Loading 3D model…</p>';

  try {
    const [THREE, loaderModule] = await Promise.all([
      import('https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js'),
      import('https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/loaders/STLLoader.js')
    ]);
    const { STLLoader } = loaderModule;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    stage.replaceChildren(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 2000);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x26314b, 2.3));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(3, 5, 4);
    scene.add(key);

    const resize = () => {
      const width = stage.clientWidth || 640;
      const height = stage.clientHeight || 440;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();

    const loader = new STLLoader();
    loader.load(modelUrl, geometry => {
      geometry.center();
      geometry.computeBoundingSphere();
      const radius = Math.max(geometry.boundingSphere?.radius || 1, 0.01);
      const material = new THREE.MeshStandardMaterial({ color: 0x2953d6, metalness: 0.2, roughness: 0.38 });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      camera.position.set(radius * 2.6, radius * 1.8, radius * 2.6);
      camera.lookAt(0, 0, 0);

      let frame;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        mesh.rotation.y += 0.006;
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener('resize', resize);
      stopSTLViewer = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener('resize', resize);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        stage.replaceChildren();
      };
    }, undefined, () => {
      stage.innerHTML = '<p>This STL file could not be loaded. Confirm that it was published to the uploads folder.</p>';
    });
  } catch (error) {
    console.error(error);
    stage.innerHTML = '<p>The 3D viewer could not load. Check your connection and try again.</p>';
  }
      }

  function render(data) {
    const s = data.site || {}, h = data.hero || {}, st = data.story || {}, f = data.focus || {}, p = data.projects || {}, ex = data.experience || {}, d = data.direction || {}, pr = data.proof || {}, c = data.contact || {};
    document.title = s.browserTitle || 'Portfolio';
    const meta = document.querySelector('meta[name="description"]'); if (meta) meta.content = s.description || '';
    const logo = document.querySelector('.logo'); if (logo) logo.innerHTML = `${esc(s.logoName || 'YourName')}<em>${esc(s.logoMark || '.')}</em>`;
    byId('heroImage').src = imageUrl(h.image); byId('heroImage').alt = `Portrait of ${s.logoName || 'portfolio owner'}`;
    setText('heroBadge', h.badge); byId('heroTitle').innerHTML = richTitle(h.titleBefore, h.titleEmphasis, h.titleAfter); setText('heroSummary', h.summary);
    ['heroPrimary','heroSecondary'].forEach((id, index) => { const a = byId(id); if (a) { a.textContent = index ? h.secondaryLabel : h.primaryLabel; a.href = safeUrl(index ? h.secondaryLink : h.primaryLink) || (index ? '#contact' : '#work'); } });
    setText('heroMetaOne', h.metaOne); setText('heroMetaTwo', h.metaTwo);
    const marqueeItems = data.marquee || []; byId('marquee').innerHTML = marqueeItems.concat(marqueeItems).map(item => `<span>${esc(item)}</span>`).join('');

    byId('storyHeading').innerHTML = richTitle(st.headingBefore, st.headingEmphasis); byId('storyImage').src = imageUrl(st.image); setText('storyCaption', st.caption); setText('storyLead', st.lead); setText('storyBody', st.body);
    byId('storyNote').innerHTML = st.note ? `<b>Note:</b> ${esc(st.note)}` : '';
    byId('storyQuote').innerHTML = `“${esc(st.quoteBefore)} <em>${esc(st.quoteEmphasis)}</em> ${esc(st.quoteAfter)}”`;
    byId('storyFacts').innerHTML = (st.facts || []).map(fact => `<div><span>${esc(fact.label)}</span><b>${lineBreaks(fact.value)}</b></div>`).join('');

    byId('focusHeading').innerHTML = richTitle(f.headingBefore, f.headingEmphasis); setText('focusLead', f.lead);
    byId('focusGrid').innerHTML = (f.items || []).map((item, i) => `<article class="focus-card reveal ${i ? `delay-${Math.min(i,3)}` : ''}"><span class="focus-number">${String(i + 1).padStart(2,'0')}</span><div class="focus-icon">${esc(item.icon || '↗')}</div><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p><small>${esc(item.tags)}</small></article>`).join('');

    byId('projectsHeading').innerHTML = richTitle(p.headingBefore, p.headingEmphasis); setText('projectsLead', p.lead); renderProjects(p.items || []);

    byId('experienceHeading').innerHTML = richTitle(ex.headingBefore, ex.headingEmphasis); setText('experienceLead', ex.lead);
byId('experienceList').innerHTML = (ex.items || []).length ? (ex.items || []).map((item, index) => {
  const hasMedia = normaliseMedia(item).length > 0;
  const gallery = mediaCarousel(item, index, 'experience');
  return `<article class="experience-card ${hasMedia ? 'has-media' : ''}">
    ${gallery}
    <div class="experience-content">
      <small>${esc(item.date || '')} · ${esc(item.organisation || '')}</small>
      <h3>${esc(item.role)}</h3>
      <p>${esc(item.summary)}</p>
      <div class="experience-bullets">${(item.bullets || []).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('')}</div>
    </div>
  </article>`;
}).join('') : '<p class="empty-state">Add experience in the CMS.</p>';Add experience in the CMS.</p>';

    byId('directionHeading').innerHTML = richTitle(d.headingBefore, d.headingEmphasis); setText('directionLead', d.lead); byId('directionList').innerHTML = (d.items || []).map((item,i) => `<article class="reveal"><span>${String(i+1).padStart(2,'0')}</span><div><small>PRINCIPLE</small><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p></div></article>`).join('');
    byId('proofHeading').innerHTML = richTitle(pr.headingBefore, pr.headingEmphasis); setText('proofLead', pr.lead); const cv = byId('cvButton'); cv.textContent = pr.cvLabel || 'Download CV'; cv.href = safeUrl(pr.cvUrl) || '#';
    byId('proofList').innerHTML = (pr.items || []).map((item,i) => `<article class="reveal"><span>${String(i+1).padStart(2,'0')}</span><div><small>${esc(item.date)}</small><h3>${esc(item.title)}</h3><p>${esc(item.summary)}</p></div>${item.linkUrl ? `<b><a href="${esc(safeUrl(item.linkUrl))}" target="_blank" rel="noopener">${esc(item.linkLabel || 'View evidence')} ↗</a></b>` : ''}</article>`).join('');

    byId('contactHeading').innerHTML = richTitle(c.headingBefore, c.headingEmphasis); setText('contactSummary', c.summary); const mail = `mailto:${c.email || ''}`; byId('emailButton').href = mail; setText('emailButton', 'Start a conversation'); byId('emailText').href = mail; setText('emailText', c.email); setText('locationText', c.location); setText('availabilityText', c.availability);
    byId('socialLinks').innerHTML = (c.socials || []).map(x => `<a href="${esc(safeUrl(x.url))}" target="_blank" rel="noopener">${esc(x.label)}</a>`).join('');
    setText('year', new Date().getFullYear()); setText('footerName', s.logoName || 'YOUR NAME'); setText('footerLine', s.footerLine || 'ENGINEERING WITH INTENT.');

    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } }), {threshold: .12});
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  }

  function wireInteractions(data) {
    document.querySelector('.theme-button')?.addEventListener('click', () => { const html = document.documentElement; html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark'; });
    const menuButton = document.querySelector('.menu-button'), menu = document.querySelector('.mobile-menu');
    menuButton?.addEventListener('click', () => { const open = menu.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); });
    menu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { menu.classList.remove('open'); menuButton?.setAttribute('aria-expanded','false'); }));
    document.addEventListener('click', event => { const trigger = event.target.closest('[data-project-id]'); if (trigger) { const project = (data.projects?.items || []).find((x,i) => (x.id || String(i)) === trigger.dataset.projectId); if (project) showProject(project); } });
    const modal = byId('projectModal'); const close = () => { modal?.classList.remove('open'); modal?.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; };
    modal?.querySelector('.modal-close').addEventListener('click', close); modal?.querySelector('.modal-overlay').addEventListener('click', close); document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  }

  getContent().then(data => { render(data); wireInteractions(data); });
})();
