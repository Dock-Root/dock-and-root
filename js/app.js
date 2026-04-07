// ===================================================
// DOCK AND ROOT LABS — Shared App Utilities
// ===================================================

// Detect if we're inside a subdirectory (e.g., blog/) to prefix relative paths
function _base() {
  const path = window.location.pathname.replace(/\\/g, '/');
  return path.includes('/blog/') ? '../' : '';
}

// --- Flag Hashing & State ---
async function hashFlag(flag) {
  const msgBuffer = new TextEncoder().encode(flag.trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function markSolved(slug) {
  localStorage.setItem('drl_solved_' + slug, 'true');
}

function isSolved(slug) {
  return localStorage.getItem('drl_solved_' + slug) === 'true';
}

// --- Navbar ---
function renderNavbar(activePage) {
  const b = _base();
  const links = [
    { href: `${b}index.html`, label: 'Home', id: 'home' },
    { href: `${b}machines.html`, label: 'Machines', id: 'machines' },
    { href: `${b}start.html`, label: 'How It Works', id: 'how-it-works' },
    { href: `${b}blog/index.html`, label: 'Blog', id: 'blog' },
    { href: `${b}writeups.html`, label: 'Writeups', id: 'writeups' },
    { href: `${b}about.html`, label: 'About', id: 'about' },
  ];

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const linkHTML = links.map(l =>
    `<a href="${l.href}" class="nav-link ${activePage === l.id ? 'active' : ''}">${l.label}</a>`
  ).join('');

  navbar.innerHTML = `
    <div class="container">
      <div class="nav-inner">
        <a href="${b}index.html" class="nav-logo">
          <div class="logo-icon">⚓</div>
          <span class="logo-text">Dock<span style="color:var(--accent-green)">&amp;</span>Root</span>
        </a>
        <nav class="nav-links">${linkHTML}</nav>
        <a href="${b}machines.html" class="nav-cta">Start Hacking →</a>
        <button class="nav-hamburger" id="hamburger" aria-label="Toggle menu">
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
          <span class="hamburger-bar"></span>
        </button>
      </div>
    </div>
    <nav class="nav-mobile" id="nav-mobile">
      ${linkHTML}
      <a href="https://github.com/dock-and-root-labs" target="_blank" class="nav-link">GitHub ↗</a>
    </nav>
  `;

  document.getElementById('hamburger').addEventListener('click', () => {
    document.getElementById('nav-mobile').classList.toggle('open');
  });
}

// --- Footer ---
function renderFooter() {
  const b = _base();
  const footer = document.getElementById('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${b}index.html" class="nav-logo" style="display:inline-flex;margin-bottom:4px">
            <div class="logo-icon">⚓</div>
            <span class="logo-text">Dock<span style="color:var(--accent-green)">&amp;</span>Root Labs</span>
          </a>
          <p>Containerized cybersecurity machines for hands-on learning. Run Docker-based challenges locally.</p>
        </div>
        <div class="footer-col">
          <h4>Platform</h4>
          <a href="${b}machines.html">Machines</a>
          <a href="${b}blog/index.html">Blog</a>
          <a href="${b}writeups.html">Writeups</a>
          <a href="${b}about.html">About</a>
        </div>
        <div class="footer-col">
          <h4>Resources</h4>
          <a href="https://docs.docker.com" target="_blank">Docker Docs</a>
          <a href="https://github.com/dock-and-root-labs" target="_blank">GitHub Org</a>
          <a href="${b}blog/post.html?slug=getting-started-with-dock-and-root">Quick Start</a>
        </div>
        <div class="footer-col">
          <h4>Community</h4>
          <a href="https://github.com/dock-and-root-labs/discussions" target="_blank">Discussions</a>
          <a href="https://github.com/dock-and-root-labs/issues" target="_blank">Report Issues</a>
          <a href="mailto:hello@dockandroot.com">Contact</a>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 Dock and Root Labs. Built for the community.</p>
        <p>Open-source. Free forever.</p>
      </div>
    </div>
  `;
}

// --- Toast Notification ---
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const icon = type === 'success' ? '✓' : '✕';
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// --- Copy to clipboard ---
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      btn.textContent = '✓ Copied';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = 'Copy';
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast('Copied to clipboard!');
  });
}

// Setup all copy buttons
function setupCopyButtons() {
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const block = btn.closest('.code-block-wrap');
      const code = block ? block.querySelector('code') : null;
      if (code) copyToClipboard(code.innerText, btn);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCopyButtons();
});
