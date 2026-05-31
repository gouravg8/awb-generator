// ─── AWB Floating Widget — Content Script ───────────────────────────────────
// Pure TS, no React. Injects a draggable floating widget into any webpage.
// Double-tap CapsLock regenerates the AWB.

import type { AWBSettings } from '../types';
import { DEFAULT_SETTINGS, normalizeAWBSettings } from '../types';
import { generateAWB } from '../utils/awbGenerator';
import { buildQRSVG } from './qrBuilder';

// ── State ────────────────────────────────────────────────────────────────────
let settings: AWBSettings = { ...DEFAULT_SETTINGS };
let currentAWB = '';
let isVisible = true;
let isMinimized = false;
let widget: HTMLElement | null = null;

// ── Load settings from chrome.storage ────────────────────────────────────────
function loadSettings(): Promise<void> {
  return new Promise(resolve => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('awb_settings', (result: Record<string, Partial<AWBSettings>>) => {
        if (result.awb_settings) settings = normalizeAWBSettings(result.awb_settings);
        resolve();
      });
    } else {
      try {
        const s = localStorage.getItem('awb_settings');
        if (s) settings = normalizeAWBSettings(JSON.parse(s));
      } catch {}
      resolve();
    }
  });
}

// Listen for storage changes (settings updated in popup)
if (typeof chrome !== 'undefined' && chrome.storage) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes['awb_settings']?.newValue) {
      settings = normalizeAWBSettings(changes['awb_settings'].newValue as Partial<AWBSettings>);
    }
  });
}

// ── AWB Generation ────────────────────────────────────────────────────────────
function regenerate(animate = true) {
  currentAWB = generateAWB(settings);
  if (!widget) return;

  const awbEl = widget.querySelector<HTMLElement>('.awf-number');
  const qrEl  = widget.querySelector<HTMLElement>('.awf-qr');
  if (animate && awbEl && qrEl) {
    awbEl.classList.add('awf-fade');
    qrEl.classList.add('awf-fade');
    setTimeout(() => {
      updateDisplay();
      awbEl.classList.remove('awf-fade');
      qrEl.classList.remove('awf-fade');
    }, 160);
  } else {
    updateDisplay();
  }
}

function updateDisplay() {
  if (!widget) return;
  const awbEl  = widget.querySelector<HTMLElement>('.awf-number');
  const qrEl   = widget.querySelector<HTMLElement>('.awf-qr');
  const metaEl = widget.querySelector<HTMLElement>('.awf-meta-chars');
  if (awbEl)  awbEl.textContent = currentAWB;
  if (metaEl) metaEl.textContent = `${currentAWB.length} chars`;
  if (qrEl)   qrEl.innerHTML = buildQRSVG(currentAWB, 100, '#f0ede8', '#18181a');
}

// ── Copy ──────────────────────────────────────────────────────────────────────
async function copyAWB() {
  try {
    await navigator.clipboard.writeText(currentAWB);
    flashCopyBtn('✓ Copied');
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = currentAWB;
    ta.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    flashCopyBtn('✓ Copied');
  }
}

function flashCopyBtn(msg: string) {
  const btn = widget?.querySelector<HTMLElement>('.awf-btn-copy');
  if (!btn) return;
  const orig = btn.textContent || '';
  btn.textContent = msg;
  btn.classList.add('awf-copied');
  setTimeout(() => {
    btn.textContent = orig;
    btn.classList.remove('awf-copied');
  }, 1800);
}

// ── Toggle minimize ───────────────────────────────────────────────────────────
function toggleMinimize() {
  if (!widget) return;
  isMinimized = !isMinimized;
  const body = widget.querySelector<HTMLElement>('.awf-body');
  const btn  = widget.querySelector<HTMLElement>('.awf-btn-minimize');
  if (body) body.style.display = isMinimized ? 'none' : '';
  if (btn)  btn.textContent = isMinimized ? '▲' : '▼';
  widget.classList.toggle('awf-minimized', isMinimized);
}

// ── Toggle visibility ─────────────────────────────────────────────────────────
function toggleWidget() {
  if (!widget) return;
  isVisible = !isVisible;
  widget.style.display = isVisible ? '' : 'none';
}

// ── Build DOM ─────────────────────────────────────────────────────────────────
function buildWidget(): HTMLElement {
  const host = document.createElement('div');
  host.id = 'awb-float-root';
  host.innerHTML = `
    <div class="awf-header">
      <div class="awf-logo">AWB</div>
      <div class="awf-title">Airway Bill</div>
      <div class="awf-header-actions">
        <button class="awf-btn-minimize" title="Minimize">▼</button>
        <button class="awf-btn-close" title="Hide (Alt+Shift+A)">✕</button>
      </div>
    </div>
    <div class="awf-body">
      <div class="awf-main">
        <div class="awf-qr"></div>
        <div class="awf-info">
          <div class="awf-label"><span class="awf-dot"></span>BILL NUMBER</div>
          <div class="awf-number">—</div>
          <div class="awf-meta">
            <span class="awf-meta-chars">0 chars</span>
            <span class="awf-meta-sep">·</span>
            <span class="awf-meta-hint">⇪⇪ to refresh</span>
          </div>
          <div class="awf-actions">
            <button class="awf-btn-regen" title="Regenerate (double CapsLock)">↺ New</button>
            <button class="awf-btn-copy" title="Copy AWB">⎘ Copy</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── Events ────────────────────────────────────────────────────────────────
  host.querySelector('.awf-btn-regen')!.addEventListener('click', (e) => {
    e.stopPropagation();
    regenerate();
  });
  host.querySelector('.awf-btn-copy')!.addEventListener('click', (e) => {
    e.stopPropagation();
    copyAWB();
  });
  host.querySelector('.awf-btn-minimize')!.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimize();
  });
  host.querySelector('.awf-btn-close')!.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleWidget();
  });

  // ── Drag ──────────────────────────────────────────────────────────────────
  makeDraggable(host, host.querySelector('.awf-header')!);

  return host;
}

// ── Draggable ─────────────────────────────────────────────────────────────────
function makeDraggable(el: HTMLElement, handle: HTMLElement) {
  let startX = 0, startY = 0, initLeft = 0, initTop = 0;
  let dragging = false;

  handle.addEventListener('mousedown', (e: MouseEvent) => {
    // Don't drag when clicking buttons
    if ((e.target as HTMLElement).closest('button')) return;
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = el.getBoundingClientRect();
    initLeft = rect.left;
    initTop  = rect.top;
    el.style.transition = 'none';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    const newLeft = Math.max(0, Math.min(window.innerWidth  - el.offsetWidth,  initLeft + dx));
    const newTop  = Math.max(0, Math.min(window.innerHeight - el.offsetHeight, initTop  + dy));
    el.style.left = `${newLeft}px`;
    el.style.top  = `${newTop}px`;
    el.style.right  = 'auto';
    el.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', () => {
    if (dragging) {
      dragging = false;
      el.style.transition = '';
      document.body.style.userSelect = '';
    }
  });
}

// ── Double CapsLock detection ─────────────────────────────────────────────────
let lastCapsTime = 0;
let capsCount = 0;
let capsTimer: ReturnType<typeof setTimeout> | null = null;

document.addEventListener('keydown', (e: KeyboardEvent) => {
  if (e.key === 'CapsLock') {
    const now = Date.now();
    if (now - lastCapsTime < 500) {
      capsCount++;
    } else {
      capsCount = 1;
    }
    lastCapsTime = now;

    if (capsTimer) clearTimeout(capsTimer);
    capsTimer = setTimeout(() => { capsCount = 0; }, 500);

    if (capsCount >= 2) {
      capsCount = 0;
      if (!isVisible) {
        isVisible = true;
        if (widget) widget.style.display = '';
      }
      regenerate();
    }
  }
}, true);

// Listen for commands from background (keyboard shortcuts)
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.onMessage.addListener((msg: { action: string }) => {
    if (msg.action === 'regenerate') regenerate();
    if (msg.action === 'toggle')     toggleWidget();
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  await loadSettings();
  currentAWB = generateAWB(settings);

  widget = buildWidget();
  document.documentElement.appendChild(widget);
  updateDisplay();
}

init();
