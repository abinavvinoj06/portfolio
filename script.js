/* =========================================================
   FOLIO — script.js
   Features:
     1. Scroll reveal
     2. Progress bars (animate on scroll)
     3. Back-to-top button
     4. Filterable project gallery  ← Task 3 (+400 XP)
     5. Figma prototype embed       ← Task 2 (+200 XP)
   ========================================================= */


/* ==========================================================
   ★ TO ADD YOUR FIGMA PROTOTYPE:
   
   1. Open your Figma file → click the Prototype tab
   2. Click the ▶ Play button (top right) to open the prototype
   3. In the prototype viewer, click Share (top right)
   4. Click "Copy embed code" — it looks like:
        <iframe ... src="https://www.figma.com/embed?embed_host=share&url=..."></iframe>
   5. Copy ONLY the src="..." value (the URL inside the quotes)
   6. Paste that URL as the value of FIGMA_EMBED_SRC below:
   ========================================================== */
const FIGMA_EMBED_SRC = 'https://embed.figma.com/proto/izSmKd6Cm9U6SCORPlt4kA/Untitled?node-id=0-3&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=0%3A3&embed-host=share';


/* ---------- 1. SCROLL REVEAL ---------- */
const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealItems.forEach(item => revealObserver.observe(item));


/* ---------- 2. PROGRESS BARS ---------- */
const progressFills = document.querySelectorAll('.progress-fill');
const barObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.dataset.width + '%';
      barObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
progressFills.forEach(bar => barObserver.observe(bar));


/* ---------- 3. BACK-TO-TOP ---------- */
const toTop = document.querySelector('#to-top');
window.addEventListener('scroll', () => {
  toTop.classList.toggle('show', window.scrollY > 300);
});
toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ---------- 4. FILTERABLE PROJECT GALLERY (Task 3 — +400 XP) ----------
   How it works:
   - Each <article class="card"> has a data-category attribute
     ("design", "web", or "code")
   - The filter buttons have data-filter attributes matching those values
   - Clicking a button shows only matching cards; "all" shows everything
   - The project count badge updates to reflect how many are visible
   ------------------------------------------------------------------- */

const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('#projects-grid .card');

// Count cards per category and populate the count badges
function updateCounts(activeFilter) {
  const counts = { all: 0, design: 0, web: 0, code: 0 };
  projectCards.forEach(card => {
    const cat = card.dataset.category;
    counts.all++;
    if (counts[cat] !== undefined) counts[cat]++;
  });

  document.getElementById('count-all').textContent    = counts.all;
  document.getElementById('count-design').textContent = counts.design;
  document.getElementById('count-web').textContent    = counts.web;
  document.getElementById('count-code').textContent   = counts.code;
}

// Run on load
updateCounts('all');

// Make the projects grid position:relative so hidden cards
// (position:absolute) don't break layout
document.getElementById('projects-grid').style.position = 'relative';

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    // Update active button style
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Show / hide cards with a smooth fade
    projectCards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      if (match) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});


/* ---------- 5. FIGMA EMBED (Task 2 — +200 XP) ----------
   If FIGMA_EMBED_SRC is set above, this replaces the placeholder
   inside the Tide project card with a live iframe automatically.
   ---------------------------------------------------------- */

(function injectFigmaEmbed() {
  if (!FIGMA_EMBED_SRC) return; // nothing to do until user fills in the URL

  const wrap        = document.getElementById('card-figma-wrap');
  const placeholder = document.getElementById('card-figma-placeholder');
  if (!wrap) return;

  // Remove placeholder
  if (placeholder) placeholder.remove();

  // Create the iframe
  const iframe = document.createElement('iframe');
  iframe.src             = FIGMA_EMBED_SRC;
  iframe.allow           = 'fullscreen';
  iframe.allowFullscreen = true;
  iframe.title           = 'Tide — Figma Prototype';
  wrap.appendChild(iframe);
})();


/* ---------- CARD STAGGER ---------- */
document.querySelectorAll('.projects-grid .card').forEach((card, i) => {
  card.style.transitionDelay = (i * 0.08) + 's';
});


/* ---------- 6. GITHUB REPOS FROM projects.json (Task 3 — +400 XP) ----------
   Fetches projects.json (auto-generated by GitHub Actions) and renders
   each repo as a card in the #github-projects-grid section.
   ------------------------------------------------------------------- */

(function loadGithubProjects() {
  const grid    = document.getElementById('github-projects-grid');
  const loading = document.getElementById('github-loading');
  if (!grid) return;

  fetch('projects.json')
    .then(res => {
      if (!res.ok) throw new Error('projects.json not found');
      return res.json();
    })
    .then(data => {
      if (loading) loading.remove();

      const projects = data.projects || [];

      if (projects.length === 0) {
        grid.innerHTML = '<p style="color:#888;grid-column:1/-1;text-align:center">No repositories found.</p>';
        return;
      }

      projects.forEach((repo, i) => {
        const stars    = repo.stars   || 0;
        const forks    = repo.forks   || 0;
        const lang     = repo.language !== 'N/A' ? repo.language : '';
        const desc     = repo.description || 'No description provided.';
        const chips    = (repo.languages || [lang]).filter(Boolean).slice(0, 3)
                          .map(l => `<span class="chip">${l}</span>`).join('');
        const homepage = repo.homepage
          ? `<a href="${repo.homepage}" target="_blank" rel="noopener" class="card-link" style="margin-right:.75rem">Live site ↗</a>`
          : '';

        const card = document.createElement('article');
        card.className = 'card reveal';
        card.dataset.category = 'code';
        card.style.transitionDelay = (i * 0.08) + 's';
        card.innerHTML = `
          <span class="card-tag">${repo.category || 'Code'}</span>
          <h3 class="card-title">${repo.name}</h3>
          <p class="card-desc">${desc}</p>
          <div class="card-meta">
            ${chips}
            <span class="chip">⭐ ${stars}</span>
            <span class="chip">🍴 ${forks}</span>
          </div>
          <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
            ${homepage}
            <a href="${repo.url}" target="_blank" rel="noopener" class="card-link">View on GitHub ↗</a>
          </div>
        `;
        grid.appendChild(card);

        // Observe for scroll reveal
        revealObserver.observe(card);
      });
    })
    .catch(() => {
      if (loading) loading.textContent = 'Could not load repositories.';
    });
})();
