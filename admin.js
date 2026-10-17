(() => {
  'use strict';
  const DRAFT_KEY = 'elias-portfolio-cms-draft-v1';
  const SETTINGS_KEY = 'elias-portfolio-cms-github-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = (value = '') => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let content = clone(window.DEFAULT_CONTENT || {});
  let activeSection = 'site';
  const pendingMedia = new Map();
  const $ = selector => document.querySelector(selector);
  const get = (path, object = content) => path.split('.').reduce((acc, key) => acc == null ? undefined : acc[key], object);
  const set = (path, value, object = content) => { const keys = path.split('.'); const last = keys.pop(); const parent = keys.reduce((acc, key) => acc[key], object); parent[last] = value; };
  const plural = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;
  const titleMap = {site:'Site settings',hero:'Hero & intro',story:'Story',focus:'Skills & focus',projects:'Projects',experience:'Experience',direction:'Direction',proof:'Proof & CV',contact:'Contact & links',publish:'Publish to GitHub'};

  function notice(message, error = false) {
    const node = $('#notice'); node.textContent = message; node.className = `notice show${error ? ' error' : ''}`;
    clearTimeout(notice.timer); notice.timer = setTimeout(() => node.classList.remove('show'), 5600);
  }
  function cleanForStorage(value) {
    if (Array.isArray(value)) return value.map(cleanForStorage);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k, cleanForStorage(v)]));
    return typeof value === 'string' && value.startsWith('blob:') ? '' : value;
  }
  function saveDraft(show = true) { localStorage.setItem(DRAFT_KEY, JSON.stringify(cleanForStorage(content))); if (show) notice('Draft saved on this device. Publish it when you are ready to update GitHub Pages.'); }
  function val(path) { const value = get(path); return value == null ? '' : value; }
  function field(path, label, opts = {}) {
    const {type = 'text', hint = '', placeholder = '', wide = false} = opts;
    const value = path.endsWith('.bulletsText') ? (get(path.replace('.bulletsText', '.bullets')) || []).join('\n') : val(path);
    const control = type === 'textarea'
      ? `<textarea data-path="${esc(path)}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>`
      : `<input type="${type}" data-path="${esc(path)}" value="${esc(value)}" placeholder="${esc(placeholder)}">`;
    return `<div class="field ${wide ? 'wide' : ''}"><label>${esc(label)}</label>${control}${hint ? `<p class="hint">${esc(hint)}</p>` : ''}</div>`;
  }
  function card(title, body, full = false) { return `<article class="form-card ${full ? 'full' : ''}"><h3>${esc(title)}</h3>${body}</article>`; }
  function intro(title, text, extra = '') { return `<div class="intro"><span class="eyebrow">EDITABLE CONTENT</span><h2>${esc(title)}</h2><p>${esc(text)}</p>${extra}</div>`; }
  function repeatHead(listPath, index, title, kicker = '') {
    return `<div class="repeat-head"><div><span class="card-kicker">${esc(kicker || `ITEM ${String(index + 1).padStart(2,'0')}`)}</span><h3>${esc(title || 'Untitled item')}</h3></div><div class="repeat-actions"><button class="tiny-btn" data-move="${esc(listPath)}" data-index="${index}" data-direction="-1" title="Move up">↑</button><button class="tiny-btn" data-move="${esc(listPath)}" data-index="${index}" data-direction="1" title="Move down">↓</button><button class="danger-btn tiny-delete" data-remove="${esc(listPath)}" data-index="${index}">Delete</button></div></div>`;
  }
  function mediaBox(path, label, kind = 'image') {
    const src = val(path); const isVideo = kind === 'video';
    const preview = src ? (isVideo ? `<video src="${esc(src)}" muted playsinline></video>` : '') : '';
    const visual = src ? `<div class="media-preview" ${isVideo ? '' : `style="background-image:url('${esc(src).replace(/'/g, '%27')}')"`}>${preview}</div>` : `<div class="media-preview">NO ${kind.toUpperCase()}</div>`;
    return `<div class="media-box">${visual}<div><p><b>${esc(label)}</b><br>Upload a ${kind}. It will be published into an <code>uploads</code> folder on GitHub when you press Publish.</p><input type="file" accept="${isVideo ? 'video/*' : 'image/*'}" data-media="${esc(path)}" data-kind="${kind}"><div style="margin-top:9px">${src ? `<button class="tiny-btn" data-remove-media="${esc(path)}">Remove ${kind}</button>` : ''}<span class="hint">${src ? esc(src.startsWith('blob:') ? 'New file — publish to make it live.' : `Current: ${src}`) : 'No file selected.'}</span></div></div></div>`;
  }
  const addButton = (path, type) => `<button class="add-btn" data-add="${path}" data-type="${type}">+ Add ${type}</button>`;

  function renderSite() {
    return intro('Your portfolio’s identity', 'Change the displayed name, browser title, metadata, and footer line from one place.') + `<div class="form-grid">${card('Identity', field('site.logoName','Displayed name') + field('site.logoMark','Logo mark', {hint:'Usually a period: .'}) + field('site.browserTitle','Browser tab title'), false)}${card('Search & footer', field('site.description','Site description',{type:'textarea',hint:'Used by search engines and social previews.'}) + field('site.footerLine','Footer line'), false)}</div>`;
  }
  function renderHero() {
    return intro('Hero & introduction', 'This is the first content visitors see. The heading is built from three parts to preserve the editorial italic style.') + `<div class="form-grid">${card('Hero copy', field('hero.badge','Eyebrow label') + field('hero.titleBefore','Title — before italic') + field('hero.titleEmphasis','Italic title words') + field('hero.titleAfter','Title — after italic') + field('hero.summary','Introduction', {type:'textarea'}), false)}${card('Calls to action', field('hero.primaryLabel','Primary button label') + field('hero.primaryLink','Primary button link', {hint:'Use #work, #contact, or a complete https:// URL.'}) + field('hero.secondaryLabel','Second button label') + field('hero.secondaryLink','Second button link') + field('hero.metaOne','Status / role') + field('hero.metaTwo','Location / availability'), false)}${card('Hero photograph', mediaBox('hero.image','Hero portrait','image'), true)}</div>`;
  }
  function renderStory() {
    const facts = (content.story.facts || []).map((item,i) => `<article class="repeat-card">${repeatHead('story.facts',i,item.label,'FACT')}<div class="form-grid">${field(`story.facts.${i}.label`,'Label')}${field(`story.facts.${i}.value`,'Value',{hint:'Use a line break if you want one.'})}</div></article>`).join('');
    return intro('Story', 'Edit your background in your own words. Do not use accomplishments or results you cannot support.') + `<div class="form-grid">${card('Story heading',field('story.headingBefore','Heading — before italic')+field('story.headingEmphasis','Italic heading words')+field('story.caption','Photo caption'))}${card('Story copy',field('story.lead','Lead paragraph',{type:'textarea'})+field('story.body','Body paragraph',{type:'textarea'})+field('story.note','Optional editor note',{type:'textarea'}))}${card('Quote',field('story.quoteBefore','Quote — before italic')+field('story.quoteEmphasis','Italic quote words')+field('story.quoteAfter','Quote — after italic'))}${card('Story photograph',mediaBox('story.image','Story photo','image'))}</div><div class="repeat-list"><h3 style="margin:32px 0 0;font:700 23px/1 'Space Grotesk',sans-serif">Story facts</h3>${facts || '<div class="empty-admin">No facts yet.</div>'}${addButton('story.facts','fact')}</div>`;
  }
  function renderFocus() {
    const items = content.focus.items || [];
    return intro('Skills & focus areas', 'Add skills as focused capability cards. They work best when they describe a practical engineering direction, not only software names.') + `<div class="form-grid">${card('Section copy', field('focus.headingBefore','Heading — before italic')+field('focus.headingEmphasis','Italic heading words')+field('focus.lead','Introduction',{type:'textarea'}), true)}</div><div class="repeat-list">${items.map((item,i) => `<article class="repeat-card">${repeatHead('focus.items',i,item.title,'SKILL / FOCUS')}<div class="form-grid">${field(`focus.items.${i}.icon`,'Icon / character',{hint:'Examples: ⌁, ◎, ↗, ∿'})}${field(`focus.items.${i}.title`,'Title')}${field(`focus.items.${i}.summary`,'Description',{type:'textarea'})}${field(`focus.items.${i}.tags`,'Tools / keywords',{hint:'Use separators such as ·'})}</div></article>`).join('') || '<div class="empty-admin">No focus cards yet.</div>'}${addButton('focus.items','focus')}</div>`;
  }
  function renderProjects() {
    const items = content.projects.items || [];
    return intro('Projects', 'Create, edit, reorder, and delete project cards. Attach an image or a short video, project summary, evidence, repository, and demo links.', '<div class="guide"><b>Publishing media:</b> Images and short videos are uploaded to your GitHub repository when you publish. Keep videos reasonably small; GitHub’s Contents API has a 100 MB file limit.</div>') + `<div class="form-grid">${card('Section copy',field('projects.headingBefore','Heading — before italic')+field('projects.headingEmphasis','Italic heading words')+field('projects.lead','Introduction',{type:'textarea'}),true)}</div><div class="repeat-list">${items.map((item,i) => `<article class="repeat-card">${repeatHead('projects.items',i,item.title,item.status || 'PROJECT')}<div class="form-grid">${field(`projects.items.${i}.title`,'Project title')}${field(`projects.items.${i}.status`,'Status',{hint:'For example: CONCEPT BUILD, COMPLETED, IN PROGRESS'})}${field(`projects.items.${i}.area`,'Discipline / area')}${field(`projects.items.${i}.tags`,'Tools / skills (comma separated)',{hint:'Example: CAD, Arduino, OpenCV'})}${field(`projects.items.${i}.summary`,'Project summary',{type:'textarea'})}${field(`projects.items.${i}.challenge`,'Challenge',{type:'textarea'})}${field(`projects.items.${i}.approach`,'Approach',{type:'textarea'})}${field(`projects.items.${i}.outcome`,'Evidence / outcome',{type:'textarea',hint:'Add real results, conditions, or limitations.'})}${field(`projects.items.${i}.repoUrl`,'Repository URL',{type:'url',placeholder:'https://github.com/...'} )}${field(`projects.items.${i}.demoUrl`,'Demo / video URL',{type:'url',placeholder:'https://...'})}</div>${mediaBox(`projects.items.${i}.image`,'Project image','image')}${mediaBox(`projects.items.${i}.video`,'Project short video','video')}</article>`).join('') || '<div class="empty-admin">No projects yet.</div>'}${addButton('projects.items','project')}</div>`;
  }
  function renderExperience() {
    const items = content.experience.items || [];
    return intro('Experience', 'Add professional, student-team, lab, volunteering, competition, and industrial-training experiences. Attach real media where useful.') + `<div class="form-grid">${card('Section copy',field('experience.headingBefore','Heading — before italic')+field('experience.headingEmphasis','Italic heading words')+field('experience.lead','Introduction',{type:'textarea'}),true)}</div><div class="repeat-list">${items.map((item,i) => `<article class="repeat-card">${repeatHead('experience.items',i,item.role,'EXPERIENCE')}<div class="form-grid">${field(`experience.items.${i}.role`,'Role / position')}${field(`experience.items.${i}.organisation`,'Organisation / team')}${field(`experience.items.${i}.date`,'Date range')}${field(`experience.items.${i}.bulletsText`,'Key points (one per line)',{type:'textarea',hint:'These become small tags. Use truthful, specific notes.'})}${field(`experience.items.${i}.summary`,'Summary',{type:'textarea',wide:true})}</div>${mediaBox(`experience.items.${i}.image`,'Experience image','image')}${mediaBox(`experience.items.${i}.video`,'Experience short video','video')}</article>`).join('') || '<div class="empty-admin">No experience entries yet.</div>'}${addButton('experience.items','experience')}</div>`;
  }
  function renderDirection() {
    return intro('Direction', 'These cards can express the career direction, learning principles, and practical values you want to be known for.') + `<div class="form-grid">${card('Section copy',field('direction.headingBefore','Heading — before italic')+field('direction.headingEmphasis','Italic heading words')+field('direction.lead','Introduction',{type:'textarea'}),true)}</div><div class="repeat-list">${(content.direction.items||[]).map((item,i)=>`<article class="repeat-card">${repeatHead('direction.items',i,item.title,'PRINCIPLE')}<div class="form-grid">${field(`direction.items.${i}.title`,'Title')}${field(`direction.items.${i}.summary`,'Description',{type:'textarea'})}</div></article>`).join('') || '<div class="empty-admin">No direction items yet.</div>'}${addButton('direction.items','direction')}</div>`;
  }
  function renderProof() {
    return intro('Proof, CV & milestones', 'Use this space for only verifiable credentials, awards, completed courses, competition results, publications, and other evidence.') + `<div class="form-grid">${card('Section copy',field('proof.headingBefore','Heading — before italic')+field('proof.headingEmphasis','Italic heading words')+field('proof.lead','Introduction',{type:'textarea'}))}${card('CV link',field('proof.cvLabel','Button label')+field('proof.cvUrl','CV file or URL',{hint:'Default: assets/your-name-cv.pdf. You can upload a revised PDF directly to GitHub and paste its relative path here.'}))}</div><div class="repeat-list">${(content.proof.items||[]).map((item,i)=>`<article class="repeat-card">${repeatHead('proof.items',i,item.title,'MILESTONE')}<div class="form-grid">${field(`proof.items.${i}.date`,'Date / status')}${field(`proof.items.${i}.title`,'Title')}${field(`proof.items.${i}.summary`,'Description',{type:'textarea'})}${field(`proof.items.${i}.linkLabel`,'Evidence link label')}${field(`proof.items.${i}.linkUrl`,'Evidence URL',{type:'url'})}</div></article>`).join('') || '<div class="empty-admin">No milestones yet.</div>'}${addButton('proof.items','proof')}</div>`;
  }
  function renderContact() {
    return intro('Contact & links', 'Set the direct ways people can reach you. Use complete URLs for LinkedIn, GitHub, YouTube, or other relevant profiles.') + `<div class="form-grid">${card('Contact message',field('contact.headingBefore','Heading — before italic')+field('contact.headingEmphasis','Italic heading words')+field('contact.summary','Introduction',{type:'textarea'}))}${card('Contact details',field('contact.email','Email',{type:'email'})+field('contact.location','Location')+field('contact.availability','Open to / availability'))}</div><div class="repeat-list"><h3 style="margin:32px 0 0;font:700 23px/1 'Space Grotesk',sans-serif">Social links</h3>${(content.contact.socials||[]).map((item,i)=>`<article class="repeat-card">${repeatHead('contact.socials',i,item.label,'SOCIAL')}<div class="form-grid">${field(`contact.socials.${i}.label`,'Label')}${field(`contact.socials.${i}.url`,'Full URL',{type:'url'})}</div></article>`).join('') || '<div class="empty-admin">No social links yet.</div>'}${addButton('contact.socials','social')}</div>`;
  }
  function renderPublish() {
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
    const conf = (key,label,extra='') => `<div class="field"><label>${label}</label><input data-github="${key}" value="${esc(settings[key]||'')}" ${key==='token'?'type="password" autocomplete="off"':'type="text"'} placeholder="${extra}"></div>`;
    return intro('Publish to GitHub Pages', 'When you publish, this dashboard uploads new media, commits an updated content.json file to your repository, and GitHub Pages rebuilds the public website.') + `<div class="publish-grid"><div>${card('Repository connection',`${conf('owner','GitHub username or organisation','your-github-username')}${conf('repo','Repository name','elias-portfolio')}${conf('branch','Branch','main')}${conf('directory','Website folder — leave empty for root','')}${conf('token','Fine-grained personal access token','github_pat_...')}<p class="hint">Your token is kept in this browser tab only. It is never written into the downloaded files or committed to GitHub.</p>`,true)}${card('Publish the current content',`<ol class="publish-steps"><li>Upload any media selected in Projects, Experience, Story, or Hero.</li><li>Write the latest editable content to <code>content.json</code>.</li><li>GitHub Pages usually reflects the change in 1–3 minutes.</li></ol><button id="publishNow" class="primary-btn publish-now">Publish to GitHub Pages</button>`,true)}</div><div><div class="security"><b>Security checklist</b>Create a <strong>fine-grained</strong> GitHub token limited to this one repository. Give it <strong>Contents: Read and write</strong> permission, set an expiry date, and revoke it if you no longer use this dashboard. Never share the token or add it to your website code.</div><div style="height:18px"></div>${card('Publish activity',`<div id="publishLog" class="status-log">Waiting for a publish request.</div>`,true)}${card('Backups & recovery',`<p class="hint" style="margin:0 0 14px">Download a JSON backup before major changes. You can import it later in this CMS.</p><div class="tools"><button class="secondary-btn" id="exportContent">Download JSON backup</button><button class="secondary-btn" id="importContent">Import JSON backup</button><button class="danger-btn" id="resetContent">Reset to starter content</button></div>`,true)}</div></div>`;
  }
  function renderSection() {
    $('#sectionTitle').textContent = titleMap[activeSection];
    document.querySelectorAll('[data-section]').forEach(button => button.classList.toggle('active', button.dataset.section === activeSection));
    const renders = {site:renderSite,hero:renderHero,story:renderStory,focus:renderFocus,projects:renderProjects,experience:renderExperience,direction:renderDirection,proof:renderProof,contact:renderContact,publish:renderPublish};
    $('#cmsContent').innerHTML = renders[activeSection]();
  }
  function defaultItem(type) {
    const objects = {
      fact:{label:'NEW FACT',value:'Add your fact'}, focus:{icon:'↗',title:'New focus area',summary:'Describe the skill or practical area you are developing.',tags:'TOOLS · METHODS'},
      project:{id:`project-${Date.now()}`,status:'IN PROGRESS',area:'ENGINEERING',title:'New project',summary:'Add a clear, truthful project summary.',tags:['Engineering'],challenge:'Add the problem or constraint.',approach:'Add what you designed, tested, or analysed.',outcome:'Add only measured results, evidence, and limitations.',image:'',video:'',repoUrl:'',demoUrl:''},
      experience:{role:'New experience',organisation:'ORGANISATION / TEAM',date:'DATE RANGE',summary:'Describe your responsibility and what you learned.',bullets:['Key responsibility'],image:'',video:''},
      direction:{title:'New direction',summary:'Describe this priority or principle.'}, proof:{date:'DATE / STATUS',title:'New milestone',summary:'Describe a verifiable outcome.',linkLabel:'VIEW EVIDENCE',linkUrl:''}, social:{label:'New link',url:'https://'}
    }; return objects[type];
  }
  function addItem(path, type) { const list = get(path); list.push(defaultItem(type)); renderSection(); }
  function removeItem(path, index) { const list = get(path); if (!confirm(`Delete this item?`)) return; list.splice(Number(index),1); renderSection(); }
  function moveItem(path, index, direction) { const list = get(path), from=Number(index), to=from+Number(direction); if (to<0||to>=list.length)return; [list[from],list[to]]=[list[to],list[from]]; renderSection(); }
  function handleTextChange(target) {
    const path = target.dataset.path; if (!path) return;
    let value = target.value;
    if (path.endsWith('.tags') && path.startsWith('projects.items.')) value = value.split(',').map(x=>x.trim()).filter(Boolean);
    if (path.endsWith('.bulletsText')) { set(path.replace('.bulletsText','.bullets'),value.split('\n').map(x=>x.trim()).filter(Boolean)); return; }
    set(path,value);
  }
  function renderExperienceTextFields() {
    document.querySelectorAll('[data-path$=".bulletsText"]').forEach(node => { const p=node.dataset.path.replace('.bulletsText','.bullets'); node.value=(get(p)||[]).join('\n'); });
  }
  function handleMedia(input) {
    const file = input.files?.[0]; if (!file) return; const path=input.dataset.media; const limit = 90*1024*1024;
    if (file.size>limit) { notice('That file is over 90 MB. Use a smaller compressed file before publishing.',true); input.value=''; return; }
    pendingMedia.set(path,file); set(path,URL.createObjectURL(file)); renderSection(); notice(`${file.name} is ready. Use “Publish to GitHub Pages” when you want it live.`);
  }
  function getSettings() { return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); }
  function saveSettings() { const old=getSettings(); document.querySelectorAll('[data-github]').forEach(input=>{ if (input.dataset.github !== 'token') old[input.dataset.github]=input.value.trim(); }); localStorage.setItem(SETTINGS_KEY,JSON.stringify(old)); return {...old,token:document.querySelector('[data-github="token"]')?.value.trim() || ''}; }
  function log(message) { const node=$('#publishLog'); if (node) { node.textContent += `\n${message}`; node.scrollTop=node.scrollHeight; } }
  function bytesToBase64(bytes) { let result=''; const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) result+=String.fromCharCode(...bytes.subarray(i,i+chunk)); return btoa(result); }
  const contentBase64 = text => bytesToBase64(new TextEncoder().encode(text));
  function filePath(settings, shortPath) { const d=(settings.directory||'').trim().replace(/^\/+|\/+$/g,''); return d ? `${d}/${shortPath}` : shortPath; }
  async function existingSha(settings,path,headers) { const res=await fetch(`https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${path}?ref=${encodeURIComponent(settings.branch)}`,{headers}); if(res.status===404)return ''; if(!res.ok)throw new Error(`Could not read ${path}: ${res.status}`); return (await res.json()).sha || ''; }
  async function putGithubFile(settings,path,base64,message,headers) { const sha=await existingSha(settings,path,headers); const res=await fetch(`https://api.github.com/repos/${encodeURIComponent(settings.owner)}/${encodeURIComponent(settings.repo)}/contents/${path}`,{method:'PUT',headers,body:JSON.stringify({message,content:base64,branch:settings.branch, ...(sha?{sha}:{})})}); if(!res.ok){let msg='';try{msg=(await res.json()).message}catch{}throw new Error(`GitHub rejected ${path}: ${res.status} ${msg}`);} return res.json(); }
  function safeFileName(name) { return name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'') || 'media-file'; }
  async function publish() {
    const settings=saveSettings(); const needed=['owner','repo','branch','token']; const missing=needed.filter(key=>!settings[key]); if(missing.length){notice(`Add ${missing.join(', ')} before publishing.`,true);return;}
    const button=$('#publishNow'); button?.classList.add('disabled'); if($('#publishLog')) $('#publishLog').textContent='Starting publish…';
    try {
      const headers={'Authorization':`Bearer ${settings.token}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','Content-Type':'application/json'};
      log(`Connected to ${settings.owner}/${settings.repo} on ${settings.branch}.`);
      let counter=0;
      for (const [path,file] of pendingMedia.entries()) { counter++; const ext=safeFileName(file.name); const short=`uploads/${Date.now()}-${counter}-${ext}`; const remote=filePath(settings,short); log(`Uploading ${file.name}…`); await putGithubFile(settings,remote,bytesToBase64(new Uint8Array(await file.arrayBuffer())),`cms: upload ${file.name}`,headers); set(path,short); log(`Uploaded ${short}`); }
      const contentPath=filePath(settings,'content.json'); log('Writing content.json…'); await putGithubFile(settings,contentPath,contentBase64(JSON.stringify(cleanForStorage(content),null,2)),'cms: update portfolio content',headers); pendingMedia.clear(); saveDraft(false); log('Done. GitHub Pages should update in 1–3 minutes.'); notice('Published successfully. GitHub Pages will rebuild shortly.'); renderSection();
    } catch(error) { console.error(error); log(`ERROR: ${error.message}`); notice(error.message,true); }
    finally { button?.classList.remove('disabled'); }
  }
  function exportContent() { const blob=new Blob([JSON.stringify(cleanForStorage(content),null,2)],{type:'application/json'}), url=URL.createObjectURL(blob), a=document.createElement('a'); a.href=url;a.download='portfolio-content-backup.json';a.click();URL.revokeObjectURL(url);notice('JSON backup downloaded.'); }
  async function importContent(file) { try { const next=JSON.parse(await file.text()); if(!next || typeof next!=='object'||!next.site||!next.hero)throw new Error('This does not look like a portfolio CMS backup.'); content=next; pendingMedia.clear(); renderSection();notice('Backup imported. Review it, then publish when ready.'); }catch(error){notice(error.message,true);} }
  async function initialise() { try { const response=await fetch(`content.json?v=${Date.now()}`,{cache:'no-store'}); if(response.ok)content=await response.json(); } catch {} const draft=localStorage.getItem(DRAFT_KEY); if(draft){try{content=JSON.parse(draft);notice('Loaded your saved local draft.');}catch{}} renderSection(); renderExperienceTextFields(); }

  document.addEventListener('click', event => {
    const sectionButton=event.target.closest('[data-section]'); if(sectionButton){activeSection=sectionButton.dataset.section;renderSection();renderExperienceTextFields();return;}
    if(event.target.closest('#saveDraft')){saveDraft();return;}
    const add=event.target.closest('[data-add]'); if(add){addItem(add.dataset.add,add.dataset.type);return;}
    const remove=event.target.closest('[data-remove]'); if(remove){removeItem(remove.dataset.remove,remove.dataset.index);return;}
    const move=event.target.closest('[data-move]'); if(move){moveItem(move.dataset.move,move.dataset.index,move.dataset.direction);return;}
    const removeMedia=event.target.closest('[data-remove-media]'); if(removeMedia){pendingMedia.delete(removeMedia.dataset.removeMedia);set(removeMedia.dataset.removeMedia,'');renderSection();return;}
    if(event.target.closest('#publishNow')){publish();return;}
    if(event.target.closest('#exportContent')){exportContent();return;}
    if(event.target.closest('#importContent')){$('#importInput').click();return;}
    if(event.target.closest('#resetContent')){if(confirm('Reset every content field to the starter portfolio? Your local draft will be overwritten.')){content=clone(window.DEFAULT_CONTENT);pendingMedia.clear();saveDraft(false);renderSection();notice('Starter content restored.');}return;}
  });
  document.addEventListener('input', event => { if(event.target.matches('[data-path]')) handleTextChange(event.target); });
  document.addEventListener('change', event => { if(event.target.matches('[data-media]'))handleMedia(event.target); if(event.target.matches('[data-github]'))saveSettings(); });
  $('#importInput').addEventListener('change', event => { const file=event.target.files?.[0]; if(file)importContent(file);event.target.value=''; });
  initialise();
})();
