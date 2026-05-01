/* ============================================================
   PinkPocket – script.js (satu file untuk semua halaman)
   ============================================================ */

'use strict';

/* ── Storage helpers ── */
const STORAGE_KEY = 'pk_transactions';
const PROFILE_KEY = 'pk_profile';
const TARGET_KEY  = 'pk_target';
const SEED_VER    = 'pk_seed_v5';

function getTransactions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTransactions(txs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(txs)); }
function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: 'Nandita', email: 'nandita@email.com' }; } catch { return { name: 'Nandita', email: 'nandita@email.com' }; }
}
function saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }
function getTarget() { return parseFloat(localStorage.getItem(TARGET_KEY)) || 0; }
function saveTarget(v) { localStorage.setItem(TARGET_KEY, v); }

/* ── Helpers ── */
function fmtRp(n) { return 'Rp ' + Math.abs(n).toLocaleString('id-ID'); }

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

/* ── Icons ── */
const ICONS = {
  Gaji:         `<svg viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>`,
  Investasi:    `<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`,
  Makanan:      `<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>`,
  Transportasi: `<svg viewBox="0 0 24 24"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/><rect x="9" y="11" width="14" height="10" rx="2"/><circle cx="12" cy="21" r="1"/><circle cx="20" cy="21" r="1"/></svg>`,
  Tagihan:      `<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`,
  Belanja:      `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  Hiburan:      `<svg viewBox="0 0 24 24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
  Kesehatan:    `<svg viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  Lainnya:      `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};

const COLORS = ['#ffd8de','#c8f0e0','#e0deff','#ffddd6','#b8e8ff','#ffecc8','#d8f0e8','#f0e0ff'];

/* ── Render transaction list ── */
function renderTxList(containerId, txList) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!txList.length) { el.innerHTML = '<p class="tx-empty">Belum ada transaksi</p>'; return; }
  el.innerHTML = txList.map((t, i) => {
    const sign = t.type === 'pemasukan' ? '+' : '-';
    const cls  = t.type === 'pemasukan' ? 'inc' : 'exp';
    const icon = ICONS[t.cat] || ICONS['Lainnya'];
    const dateLabel = new Date(t.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `<div class="tx-item" style="animation-delay:${i*.04}s">
      <div class="tx-icon">${icon}</div>
      <div class="tx-info">
        <p class="tx-desc">${t.desc}</p>
        <p class="tx-meta">${t.cat} · ${dateLabel}</p>
      </div>
      <span class="tx-amount ${cls}">${sign}${fmtRp(t.amount)}</span>
    </div>`;
  }).join('');
}

/* ── Seed demo data ── */
function seedIfEmpty() {
  if (localStorage.getItem(SEED_VER)) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(SEED_VER, '1');
  const cm = new Date().toISOString().slice(0, 7);
  saveTransactions([
    { id: 1,  type: 'pemasukan',   cat: 'Gaji',         desc: 'Gaji Bulanan',      amount: 8500000, date: `${cm}-01` },
    { id: 2,  type: 'pemasukan',   cat: 'Investasi',     desc: 'Dividen Saham',     amount: 1200000, date: `${cm}-03` },
    { id: 3,  type: 'pengeluaran', cat: 'Makanan',       desc: 'Makan Siang',       amount: 85000,   date: `${cm}-04` },
    { id: 4,  type: 'pengeluaran', cat: 'Tagihan',       desc: 'Tagihan Listrik',   amount: 210000,  date: `${cm}-06` },
    { id: 5,  type: 'pengeluaran', cat: 'Belanja',       desc: 'Belanja Online',    amount: 350000,  date: `${cm}-07` },
    { id: 6,  type: 'pemasukan',   cat: 'Lainnya',       desc: 'Freelance',         amount: 500000,  date: `${cm}-08` },
    { id: 7,  type: 'pengeluaran', cat: 'Hiburan',       desc: 'Langganan Netflix', amount: 54000,   date: `${cm}-09` },
    { id: 8,  type: 'pengeluaran', cat: 'Makanan',       desc: 'Makan Malam',       amount: 65000,   date: `${cm}-10` },
    { id: 9,  type: 'pemasukan',   cat: 'Gaji',          desc: 'Gaji Bulanan',      amount: 8500000, date: `${cm}-11` },
    { id: 10, type: 'pengeluaran', cat: 'Transportasi',  desc: 'Bensin',            amount: 120000,  date: `${cm}-12` },
  ]);
}

/* ════════════════════════════════════
   DASHBOARD
════════════════════════════════════ */
function initDashboard() {
  seedIfEmpty();
  const txs = getTransactions();
  let inc = 0, exp = 0;
  txs.forEach(t => t.type === 'pemasukan' ? inc += t.amount : exp += t.amount);

  document.querySelector('.balance-amount').textContent       = fmtRp(inc - exp);
  document.getElementById('total-masuk').textContent          = fmtRp(inc);
  document.getElementById('total-keluar').textContent         = fmtRp(exp);

  const pct = inc > 0 ? Math.min(100, Math.round(Math.max(0, inc - exp) / inc * 100)) : 0;
  document.querySelector('.ring-pct').textContent = pct + '%';
  const offset = 201 - (201 * pct / 100);
  document.querySelectorAll('.ring-svg circle')[1].setAttribute('stroke-dashoffset', offset);

  const recent = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  renderTxList('tx-list', recent);
}

/* ════════════════════════════════════
   STATISTIK
════════════════════════════════════ */
let barChart = null, donutChart = null;

function initStatistik() {
  seedIfEmpty();
  renderStatistik('minggu');

  document.querySelectorAll('.pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderStatistik(btn.dataset.p);
    });
  });
}

function renderStatistik(period) {
  const txs = getTransactions();
  const cm  = new Date().toISOString().slice(0, 7);
  const monthTxs = txs.filter(t => t.date.startsWith(cm));
  let inc = 0, exp = 0;
  monthTxs.forEach(t => t.type === 'pemasukan' ? inc += t.amount : exp += t.amount);

  document.getElementById('sum-masuk').textContent  = fmtRp(inc);
  document.getElementById('sum-keluar').textContent = fmtRp(exp);

  // Bar chart
  let labels = [], incArr = [], expArr = [];
  if (period === 'minggu') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      labels.push(d.toLocaleDateString('id-ID', { weekday: 'short' }));
      let di = 0, de = 0;
      txs.filter(t => t.date === ds).forEach(t => t.type === 'pemasukan' ? di += t.amount : de += t.amount);
      incArr.push(di); expArr.push(de);
    }
  } else if (period === 'bulan') {
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(d.getMonth() - i);
      const m = d.toISOString().slice(0, 7);
      labels.push(d.toLocaleDateString('id-ID', { month: 'short' }));
      let di = 0, de = 0;
      txs.filter(t => t.date.startsWith(m)).forEach(t => t.type === 'pemasukan' ? di += t.amount : de += t.amount);
      incArr.push(di); expArr.push(de);
    }
  } else {
    for (let i = 3; i >= 0; i--) {
      const yr = new Date().getFullYear() - i;
      labels.push(String(yr));
      let di = 0, de = 0;
      txs.filter(t => t.date.startsWith(yr)).forEach(t => t.type === 'pemasukan' ? di += t.amount : de += t.amount);
      incArr.push(di); expArr.push(de);
    }
  }

  const barCtx = document.getElementById('barChart').getContext('2d');
  if (barChart) barChart.destroy();
  barChart = new Chart(barCtx, {
    type: 'bar',
    data: { labels, datasets: [
      { label: 'Pemasukan',   data: incArr, backgroundColor: 'rgba(61,191,142,.7)',  borderRadius: 6 },
      { label: 'Pengeluaran', data: expArr, backgroundColor: 'rgba(224,92,110,.7)', borderRadius: 6 },
    ]},
    options: { responsive: true, plugins: { legend: { position: 'top', labels: { font: { size: 10 }, boxWidth: 10 } }, tooltip: { callbacks: { label: c => ' ' + fmtRp(c.parsed.y) } } }, scales: { y: { beginAtZero: true, ticks: { callback: v => v >= 1e6 ? (v/1e6).toFixed(1)+'jt' : v >= 1e3 ? (v/1e3)+'rb' : v, font: { size: 9 } }, grid: { color: '#f0f0f8' } }, x: { ticks: { font: { size: 10 } }, grid: { display: false } } } },
  });

  // Donut
  const catMap = {};
  monthTxs.filter(t => t.type === 'pengeluaran').forEach(t => { catMap[t.cat] = (catMap[t.cat] || 0) + t.amount; });
  const catLabels = Object.keys(catMap), catData = Object.values(catMap);
  const total = catData.reduce((a, b) => a + b, 0);
  const donutCtx = document.getElementById('donutChart').getContext('2d');
  if (donutChart) donutChart.destroy();

  if (!catLabels.length) {
    document.getElementById('donut-legend').innerHTML = '<p style="color:#9191aa;font-size:12px">Belum ada pengeluaran</p>';
  } else {
    donutChart = new Chart(donutCtx, {
      type: 'doughnut',
      data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: COLORS.slice(0, catLabels.length), borderWidth: 0, hoverOffset: 5 }] },
      options: { cutout: '65%', plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ' ' + fmtRp(c.parsed) } } } },
    });
    document.getElementById('donut-legend').innerHTML = catLabels.map((l, i) => `
      <div class="legend-item">
        <span class="legend-dot" style="background:${COLORS[i]}"></span>
        <span class="legend-name">${l}</span>
        <span class="legend-pct">${total > 0 ? Math.round(catData[i]/total*100) : 0}%</span>
      </div>`).join('');
  }

  // Summary
  document.getElementById('summary-list').innerHTML = [
    { label: 'Pemasukan',   val: fmtRp(inc),       color: '#3dbf8e' },
    { label: 'Pengeluaran', val: fmtRp(exp),       color: '#e05c6e' },
    { label: 'Saldo',       val: fmtRp(inc - exp), color: inc >= exp ? '#3dbf8e' : '#e05c6e' },
    { label: 'Transaksi',   val: monthTxs.length + ' transaksi', color: '#7b72e0' },
  ].map(s => `<div class="summary-item"><span class="summary-label">${s.label}</span><span class="summary-value" style="color:${s.color}">${s.val}</span></div>`).join('');
}

/* ════════════════════════════════════
   TAMBAH
════════════════════════════════════ */
function initTambah() {
  let currentType = 'pengeluaran';
  let amountStr   = '0';

  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];

  document.querySelectorAll('.type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentType = btn.dataset.type;
    });
  });

  document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      if (amountStr === '0') amountStr = val;
      else { if ((amountStr + val).length > 12) return; amountStr += val; }
      document.getElementById('amount-display').textContent = parseInt(amountStr).toLocaleString('id-ID');
    });
  });

  document.getElementById('btn-del').addEventListener('click', () => {
    amountStr = amountStr.slice(0, -1) || '0';
    document.getElementById('amount-display').textContent = parseInt(amountStr).toLocaleString('id-ID');
  });

  document.getElementById('btn-save').addEventListener('click', () => {
    const amount = parseInt(amountStr) || 0;
    const desc   = document.getElementById('tx-desc').value.trim();
    const cat    = document.getElementById('tx-category').value;
    const date   = document.getElementById('tx-date').value;
    if (amount <= 0) { showToast('Masukkan jumlah yang valid'); return; }
    if (!desc)       { showToast('Masukkan keterangan'); return; }
    if (!date)       { showToast('Pilih tanggal'); return; }
    const txs = getTransactions();
    txs.push({ id: Date.now(), type: currentType, amount, desc, cat, date });
    saveTransactions(txs);
    showToast('Transaksi tersimpan');
    amountStr = '0';
    document.getElementById('amount-display').textContent = '0';
    document.getElementById('tx-desc').value = '';
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  });
}

/* ════════════════════════════════════
   DOMPET
════════════════════════════════════ */
function initDompet() {
  seedIfEmpty();
  let currentFilter = 'semua';

  function render() {
    const txs = getTransactions();
    let inc = 0, exp = 0;
    txs.forEach(t => t.type === 'pemasukan' ? inc += t.amount : exp += t.amount);
    document.getElementById('saldo-total').textContent = fmtRp(inc - exp);
    document.getElementById('saldo-bulan').textContent = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    let filtered = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    if (currentFilter !== 'semua') filtered = filtered.filter(t => t.type === currentFilter);
    renderTxList('tx-list', filtered);
  }

  render();
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.f;
      render();
    });
  });
}

/* ════════════════════════════════════
   PROFIL
════════════════════════════════════ */
function initProfil() {
  seedIfEmpty();

  function renderProfile() {
    const p = getProfile();
    const txs = getTransactions();
    let inc = 0, exp = 0;
    txs.forEach(t => t.type === 'pemasukan' ? inc += t.amount : exp += t.amount);
    document.getElementById('avatar-initial').textContent = p.name.charAt(0).toUpperCase();
    document.getElementById('profile-name').textContent   = p.name;
    document.getElementById('profile-email').textContent  = p.email;
    document.getElementById('stat-tx').textContent        = txs.length;
    document.getElementById('stat-masuk').textContent     = fmtRp(inc);
    document.getElementById('stat-keluar').textContent    = fmtRp(exp);
    const target = getTarget();
    if (target > 0) {
      const pct = Math.min(100, Math.round(Math.max(0, inc - exp) / target * 100));
      document.getElementById('target-info').textContent = `Target: ${fmtRp(target)} · Tercapai ${pct}%`;
    }
    document.getElementById('input-target').value = target || '';
  }

  renderProfile();

  document.getElementById('menu-edit').addEventListener('click', () => {
    const p = getProfile();
    document.getElementById('edit-name').value  = p.name;
    document.getElementById('edit-email').value = p.email;
    document.getElementById('modal-edit').classList.add('open');
  });
  document.getElementById('close-edit').addEventListener('click', () => document.getElementById('modal-edit').classList.remove('open'));
  document.getElementById('btn-save-profil').addEventListener('click', () => {
    const name = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    if (!name) { showToast('Nama tidak boleh kosong'); return; }
    saveProfile({ name, email });
    document.getElementById('modal-edit').classList.remove('open');
    renderProfile(); showToast('Profil diperbarui');
  });

  document.getElementById('menu-target').addEventListener('click', () => document.getElementById('modal-target').classList.add('open'));
  document.getElementById('close-target').addEventListener('click', () => document.getElementById('modal-target').classList.remove('open'));
  document.getElementById('btn-save-target').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('input-target').value);
    if (!val || val <= 0) { showToast('Masukkan target yang valid'); return; }
    saveTarget(val);
    document.getElementById('modal-target').classList.remove('open');
    renderProfile(); showToast('Target disimpan');
  });

  document.getElementById('menu-reset').addEventListener('click', () => {
    if (!confirm('Reset semua data transaksi?')) return;
    saveTransactions([]);
    renderProfile(); showToast('Data direset');
  });

  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
}

/* ════════════════════════════════════
   AUTO INIT — deteksi halaman aktif
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'dashboard')  initDashboard();
  if (page === 'statistik')  initStatistik();
  if (page === 'tambah')     initTambah();
  if (page === 'dompet')     initDompet();
  if (page === 'profil')     initProfil();
});
