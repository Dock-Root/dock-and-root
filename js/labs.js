'use strict';

// ===================================================
// DOCK AND ROOT LABS — Async Machine Data Loader
// Fetches from data/labs.json (Decap CMS source of truth)
// ===================================================

// Global LABS array — populated after loadLabs() resolves
window.LABS = [];

// Promise that resolves once LABS is populated
let _resolve;
window.labsReady = new Promise(r => { _resolve = r; });

// Detect base path (handles blog/ subdirectory)
function _base() {
  const path = window.location.pathname.replace(/\\/g, '/');
  return path.includes('/blog/') ? '../' : '';
}

window.loadLabs = function () {
  if (window.LABS.length > 0) return window.labsReady;

  fetch(_base() + 'data/labs.json')
    .then(r => {
      if (!r.ok) throw new Error('Failed to load labs.json: ' + r.status);
      return r.json();
    })
    .then(data => {
      // Decap CMS saves the list inside a "machines" root object property
      window.LABS = data.machines || [];
      _resolve(window.LABS);
    })
    .catch(err => {
      console.error('[Dock & Root] Could not load lab data:', err);
      _resolve([]);
    });

  return window.labsReady;
};

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

// --- Helpers ---
function getLabBySlug(slug) {
  return window.LABS.find(l => l.slug === slug) || null;
}

function getDifficultyClass(diff) {
  return { Easy: 'easy', Medium: 'medium', Hard: 'hard', Insane: 'insane' }[diff] || 'easy';
}

function getCategoryClass(cat) {
  return {
    Web: 'web', Linux: 'linux', Crypto: 'crypto',
    Pwn: 'pwn', 'Reverse Engineering': 're', Networking: 'network', Forensics: 'forensics',
  }[cat] || 'web';
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}
