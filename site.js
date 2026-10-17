(() => {
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

  function projectArt(project, index) {
    const media = project.video || project.image;
    if (media) {
      const type = project.video ? 'VIDEO' : 'IMAGE';
      const visual = project.video
        ? `<video src="${esc(safeUrl(project.video))}" muted playsinline preload="metadata"></video>`
        : `<img src="${esc(imageUrl(project.image))}" alt="${esc(project.title)} project media">`;
      return `<div class="project-art media-art">${visual}<span>${esc(project.area || 'PROJECT')}</span><b class="project-media-note">${type}</b></div>`;
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
    if (!projects.length) { grid.innerHTML = '<p class="empty-state">No projects have been published yet.</p>'; return; }
    grid.innerHTML = projects.map((project, index) => {
      const tags = (project.tags || []).map(tag => `<span>${esc(tag)}</span>`).join('');
      const proof = project.outcome ? `<div class="project-proof"><b>PROJECT SUMMARY / EVIDENCE</b>${esc(project.outcome)}</div>` : '';
      return `<article class="project-card ${index === 0 ? 'project-large' : ''} reveal ${index % 2 ? 'delay-1' : ''}">
        ${projectArt(project, index)}
        <div class="project-content"><div class="project-kicker"><span>${String(index + 1).padStart(2, '0')} · ${esc(project.status || 'PROJECT')}</span><span>${esc(project.area || 'ENGINEERING')}</span></div>
        <h3>${esc(project.title)}</h3><p>${esc(project.summary)}</p><div class="project-tags">${tags}</div>${proof}
        <button class="case-link" data-project-id="${esc(project.id || String(index))}">View project brief <b>↗</b></button></div></article>`;
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
    byId('experienceList').innerHTML = (ex.items || []).length ? (ex.items || []).map(item => {
      const media = item.video || item.image; const visual = item.video ? `<video class="experience-media" src="${esc(safeUrl(item.video))}" muted playsinline preload="metadata"></video>` : item.image ? `<img class="experience-media" src="${esc(imageUrl(item.image))}" alt="${esc(item.role)}">` : '';
      return `<article class="experience-card ${media ? 'has-media' : ''}">${visual}<div class="experience-content"><small>${esc(item.date || '')} · ${esc(item.organisation || '')}</small><h3>${esc(item.role)}</h3><p>${esc(item.summary)}</p><div class="experience-bullets">${(item.bullets || []).filter(Boolean).map(x => `<span>${esc(x)}</span>`).join('')}</div></div></article>`;
    }).join('') : '<p class="empty-state">Add experience in the CMS.</p>';

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
