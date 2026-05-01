/* ============================================================
   PinkPocket – script.js
   ============================================================ */

'use strict';

/* ── Storage helpers ── */
const STORAGE_KEY = 'pk_transactions';
const PROFILE_KEY = 'pk_profile';
const TARGET_KEY  = 'pk_target';
const SEED_VER    = 'pk_seed_v5';
const SALDO_KEY   = 'pk_saldo_awal';

function getTransactions() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function saveTransactions(txs) { localStorage.setItem(STORAGE_KEY, JSON.stringify(txs)); }
function getProfile() {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY)) || { name: 'Nandita', email: 'nandita@email.com' }; }
  catch { return { name: 'Nandita', email: 'nandita@email.com' }; }
}
function saveProfile(p) { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); }
function getTarget() { return parseFloat(localStorage.getItem(TARGET_KEY)) || 0; }
function saveTarget(v) { localStorage.setItem(TARGET_KEY, v); }
function getSaldoAwal() { return parseFloat(localStorage.getItem(SALDO_KEY)) || 0; }
function saveSaldoAwal(v) { localStorage.setItem(SALDO_KEY, v); }

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
    return `<div class="tx-item" style="animation-delay:${i * .04}s">
      <div class="tx-icon">${icon}</div>
      <div class="tx-info">
        <p class="tx-desc">${t.desc}</p>
        <p class="tx-meta">${t.cat} · ${dateLabel}</p>
      </div>
      <span class="tx-amount ${cls}">${sign}${fmtRp(t.amount)}</span>
    </div>`;
  }).join('');
}

/* ── Render transaction list dengan tombol hapus ── */
function renderTxListDeletable(containerId, txList, onDelete) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!txList.length) { el.innerHTML = '<p class="tx-empty">Belum ada transaksi</p>'; return; }
  el.innerHTML = txList.map((t, i) => {
    const sign = t.type === 'pemasukan' ? '+' : '-';
    const cls  = t.type === 'pemasukan' ? 'inc' : 'exp';
    const icon = ICONS[t.cat] || ICONS['Lainnya'];
    const dateLabel = new Date(t.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    return `<div class="tx-item" data-id="${t.id}" style="animation-delay:${i * .04}s">
      <div class="tx-icon">${icon}</div>
      <div class="tx-info">
        <p class="tx-desc">${t.desc}</p>
        <p class="tx-meta">${t.cat} · ${dateLabel}</p>
      </div>
      <span class="tx-amount ${cls}">${sign}${fmtRp(t.amount)}</span>
      <button class="tx-delete-btn" data-id="${t.id}" title="Hapus transaksi">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
      </button>
    </div>`;
  }).join('');

  el.querySelectorAll('.tx-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      // Hapus langsung tanpa confirm (confirm() bisa diblokir browser)
      onDelete(id);
    });
  });
}

/* ── Seed demo data ── */
function seedIfEmpty() {
  // Reset data lama jika ada seed demo
  if (!localStorage.getItem('pk_fresh_v1')) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SALDO_KEY);
    localStorage.setItem('pk_fresh_v1', '1');
  }
  localStorage.setItem(SEED_VER, '1');
}

/* ════════════════════════════════════
   DASHBOARD
════════════════════════════════════ */
function initDashboard() {
  seedIfEmpty();
  const txs = getTransactions();
  let inc = 0, exp = 0;
  txs.forEach(t => t.type === 'pemasukan' ? inc += t.amount : exp += t.amount);

  document.querySelector('.balance-amount').textContent = fmtRp(inc - exp);
  document.getElementById('total-masuk').textContent    = fmtRp(inc);
  document.getElementById('total-keluar').textContent   = fmtRp(exp);

  // Update bulan
  document.getElementById('balance-month-label').textContent =
    new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const pct = (getSaldoAwal() + inc) > 0
    ? Math.min(100, Math.round(Math.max(0, getSaldoAwal() + inc - exp) / (getSaldoAwal() + inc) * 100))
    : 0;
  document.querySelector('.ring-pct').textContent = pct + '%';
  const offset = 201 - (201 * pct / 100);
  document.querySelectorAll('.ring-svg circle')[1].setAttribute('stroke-dashoffset', offset);

  const recent = [...txs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  renderTxList('tx-list', recent);

  // Update mini cards
  const saldo = inc - exp;
  document.getElementById('mc-tabungan').textContent  = fmtRp(Math.max(0, saldo));
  document.getElementById('mc-investasi').textContent = fmtRp(txs.filter(t => t.cat === 'Investasi' && t.type === 'pemasukan').reduce((a, t) => a + t.amount, 0));
  document.getElementById('mc-tagihan').textContent   = txs.filter(t => t.cat === 'Tagihan').length + ' tagihan';
  const totalExp = exp > 0 ? Math.round(exp / (inc + getSaldoAwal() || 1) * 100) : 0;
  document.getElementById('mc-anggaran').textContent  = Math.min(100, totalExp) + '% terpakai';

  /* ── Search fitur ── */
  const FEATURES = [
    { name: 'Dashboard',        desc: 'Halaman utama & ringkasan keuangan',   url: 'dashboard.html' },
    { name: 'Statistik',        desc: 'Grafik pemasukan & pengeluaran',        url: 'statistik.html' },
    { name: 'Tambah Transaksi', desc: 'Catat pemasukan atau pengeluaran baru', url: 'tambah.html'    },
    { name: 'Dompet',           desc: 'Riwayat semua transaksi',               url: 'dompet.html'    },
    { name: 'Profil',           desc: 'Edit profil & target tabungan',         url: 'profil.html'    },
    { name: 'Pemasukan',        desc: 'Lihat semua transaksi pemasukan',       url: 'dompet.html'    },
    { name: 'Pengeluaran',      desc: 'Lihat semua transaksi pengeluaran',     url: 'dompet.html'    },
    { name: 'Target Tabungan',  desc: 'Set target tabungan bulanan',           url: 'profil.html'    },
  ];

  const overlay   = document.getElementById('search-overlay');
  const input     = document.getElementById('search-input');
  const results   = document.getElementById('search-results');
  const btnSearch = document.getElementById('btn-search');
  const btnClose  = document.getElementById('search-close');

  function openSearch() {
    overlay.classList.add('open');
    setTimeout(() => input.focus(), 100);
  }
  function closeSearch() {
    overlay.classList.remove('open');
    input.value = '';
    results.innerHTML = '<p class="search-hint">Ketik nama fitur yang ingin dibuka</p>';
  }

  btnSearch.addEventListener('click', openSearch);
  btnClose.addEventListener('click', closeSearch);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeSearch(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSearch(); });

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = '<p class="search-hint">Ketik nama fitur yang ingin dibuka</p>';
      return;
    }
    const found = FEATURES.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.desc.toLowerCase().includes(q)
    );
    if (!found.length) {
      results.innerHTML = '<p class="search-empty">Fitur tidak ditemukan</p>';
      return;
    }
    // highlight matching text
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    const re = new RegExp('(' + escaped + ')', 'gi');
    const hl = str => str.replace(re, '<mark>$1</mark>');

    results.innerHTML = found.map(f => `
      <div class="search-item" onclick="location.href='${f.url}'" style="cursor:pointer">
        <div class="search-item-info">
          <p class="search-item-desc">${hl(f.name)}</p>
          <p class="search-item-meta">${hl(f.desc)}</p>
        </div>
        <svg style="width:16px;height:16px;stroke:#9191aa;fill:none;stroke-width:2;flex-shrink:0" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
      </div>`).join('');
  });

  /* ── Notifikasi ── */
  const notifOverlay = document.getElementById('notif-overlay');
  const notifList    = document.getElementById('notif-list');
  const notifBtn     = document.querySelector('.notif-btn');
  const notifClose   = document.getElementById('notif-close');

  function buildNotifs() {
    const all = getTransactions();
    const notifs = [];
    const cm = new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().split('T')[0];
    const monthTxs = all.filter(t => t.date.startsWith(cm));
    let mi = 0, me = 0;
    monthTxs.forEach(t => t.type === 'pemasukan' ? mi += t.amount : me += t.amount);
    const saldo = mi - me;

    const iconWarn  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;
    const iconMoney = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`;
    const iconInc   = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>`;
    const iconNote  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/></svg>`;
    const iconCheck = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px"><polyline points="20 6 9 17 4 12"/></svg>`;

    if (saldo < 500000 && saldo >= 0) {
      notifs.push({ icon: iconWarn,  bg: '#fff8e1', title: 'Saldo Hampir Habis', desc: `Saldo kamu tinggal ${fmtRp(saldo)}. Pertimbangkan mengurangi pengeluaran.`, time: 'Hari ini', unread: true });
    }

    const monthExp = monthTxs.filter(t => t.type === 'pengeluaran');
    if (monthExp.length) {
      const biggest = monthExp.reduce((a, b) => a.amount > b.amount ? a : b);
      notifs.push({ icon: iconMoney, bg: '#fff0f2', title: 'Pengeluaran Terbesar', desc: `"${biggest.desc}" sebesar ${fmtRp(biggest.amount)} adalah pengeluaran terbesar bulan ini.`, time: 'Bulan ini', unread: false });
    }

    if (mi > 0) {
      notifs.push({ icon: iconInc,   bg: '#f0fff8', title: 'Pemasukan Bulan Ini', desc: `Total pemasukan ${fmtRp(mi)}. Tetap semangat menabung!`, time: 'Bulan ini', unread: false });
    }

    const todayTx = all.filter(t => t.date === today);
    if (todayTx.length === 0) {
      notifs.push({ icon: iconNote,  bg: '#f5f5ff', title: 'Belum Ada Catatan Hari Ini', desc: 'Jangan lupa catat pengeluaran dan pemasukan hari ini ya!', time: 'Hari ini', unread: true });
    } else if (todayTx.length >= 3) {
      notifs.push({ icon: iconCheck, bg: '#f0f0ff', title: 'Aktif Hari Ini', desc: `Kamu sudah mencatat ${todayTx.length} transaksi hari ini. Bagus!`, time: 'Hari ini', unread: false });
    }

    return notifs;
  }

  // Tampilkan dot merah kalau belum pernah dibuka hari ini
  const NOTIF_READ_KEY = 'pk_notif_read';
  const todayStr = new Date().toISOString().split('T')[0];

  function updateDot() {
    const lastRead = localStorage.getItem(NOTIF_READ_KEY);
    const dot = notifBtn.querySelector('.notif-dot');
    if (dot) dot.style.display = lastRead === todayStr ? 'none' : 'block';
  }

  function openNotif() {
    const notifs = buildNotifs();
    notifList.innerHTML = notifs.length
      ? notifs.map(n => `
          <div class="notif-item ${n.unread ? 'unread' : ''}">
            <div class="notif-icon" style="background:${n.bg}">${n.icon}</div>
            <div class="notif-body">
              <p class="notif-title">${n.title}</p>
              <p class="notif-desc">${n.desc}</p>
              <p class="notif-time">${n.time}</p>
            </div>
          </div>`).join('')
      : '<p class="notif-empty">Tidak ada notifikasi</p>';

    // Tandai sudah dibaca
    localStorage.setItem(NOTIF_READ_KEY, todayStr);
    updateDot();
    notifOverlay.classList.add('open');
  }

  updateDot(); // cek saat halaman load

  notifBtn.addEventListener('click', openNotif);
  notifClose.addEventListener('click', () => notifOverlay.classList.remove('open'));
  notifOverlay.addEventListener('click', e => { if (e.target === notifOverlay) notifOverlay.classList.remove('open'); });

  /* ── Modal Saldo Awal ── */
  const modalSaldo      = document.getElementById('modal-saldo');
  const inputSaldoAwal  = document.getElementById('input-saldo-awal');
  const btnSaveSaldo    = document.getElementById('btn-save-saldo');
  const modalSaldoClose = document.getElementById('modal-saldo-close');
  const balanceAmountEl = document.getElementById('balance-amount-val');

  function openSaldoModal() {
    inputSaldoAwal.value = getSaldoAwal() || '';
    modalSaldo.classList.add('open');
    setTimeout(() => inputSaldoAwal.focus(), 100);
  }

  balanceAmountEl.addEventListener('click', openSaldoModal);
  modalSaldoClose.addEventListener('click', () => modalSaldo.classList.remove('open'));
  modalSaldo.addEventListener('click', e => { if (e.target === modalSaldo) modalSaldo.classList.remove('open'); });

  btnSaveSaldo.addEventListener('click', () => {
    const val = parseFloat(inputSaldoAwal.value) || 0;
    if (val < 0) { showToast('Saldo tidak boleh negatif'); return; }

    // Hapus transaksi saldo awal lama jika ada
    const existing = getTransactions().filter(t => t.cat !== 'Saldo Awal');

    // Tambah sebagai transaksi pemasukan supaya muncul di Dompet
    if (val > 0) {
      existing.unshift({
        id: 'saldo-awal',
        type: 'pemasukan',
        cat: 'Saldo Awal',
        desc: 'Saldo Awal',
        amount: val,
        date: new Date().toISOString().split('T')[0],
      });
    }
    saveTransactions(existing);
    saveSaldoAwal(val);
    modalSaldo.classList.remove('open');

    // Refresh angka di dashboard
    let i2 = 0, e2 = 0;
    existing.forEach(t => t.type === 'pemasukan' ? i2 += t.amount : e2 += t.amount);
    balanceAmountEl.textContent = fmtRp(i2 - e2);
    refreshCards();
    showToast('Saldo awal disimpan');
  });

  /* ── Close semua modal via data-modal ── */
  document.querySelectorAll('.modal-close[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById(btn.dataset.modal).classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });

  function refreshCards() {
    const all = getTransactions();
    let i3 = 0, e3 = 0;
    all.forEach(t => t.type === 'pemasukan' ? i3 += t.amount : e3 += t.amount);
    const s = i3 - e3;
    balanceAmountEl.textContent = fmtRp(s);
    document.getElementById('total-masuk').textContent  = fmtRp(i3);
    document.getElementById('total-keluar').textContent = fmtRp(e3);
    document.getElementById('mc-tabungan').textContent  = fmtRp(Math.max(0, s));
    document.getElementById('mc-investasi').textContent = fmtRp(all.filter(t => t.cat === 'Investasi' && t.type === 'pemasukan').reduce((a, t) => a + t.amount, 0));
    document.getElementById('mc-tagihan').textContent   = all.filter(t => t.cat === 'Tagihan').length + ' tagihan';
    const anggaran = parseFloat(localStorage.getItem('pk_anggaran')) || 0;
    const pctAng = anggaran > 0 ? Math.min(100, Math.round(e3 / anggaran * 100)) : 0;
    document.getElementById('mc-anggaran').textContent  = pctAng + '% terpakai';
    const recent = [...all].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    renderTxList('tx-list', recent);
  }

  /* ── Tabungan ── */
  document.getElementById('cek-tabungan').addEventListener('click', () => {
    const all = getTransactions();
    let i = 0, e = 0; all.forEach(t => t.type === 'pemasukan' ? i += t.amount : e += t.amount);
    document.getElementById('info-tabungan').textContent = `Saldo saat ini: ${fmtRp(getSaldoAwal() + i - e)}`;
    document.getElementById('modal-tabungan').classList.add('open');
  });
  document.getElementById('btn-save-tabungan').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('input-tabungan').value) || 0;
    const desc   = document.getElementById('desc-tabungan').value.trim() || 'Tabungan';
    if (amount <= 0) { showToast('Masukkan jumlah yang valid'); return; }
    const txs = getTransactions();
    txs.push({ id: Date.now(), type: 'pemasukan', cat: 'Lainnya', desc, amount, date: new Date().toISOString().split('T')[0] });
    saveTransactions(txs);
    document.getElementById('modal-tabungan').classList.remove('open');
    document.getElementById('input-tabungan').value = '';
    document.getElementById('desc-tabungan').value = '';
    refreshCards(); showToast('Tabungan ditambahkan');
  });

  /* ── Anggaran ── */
  document.getElementById('cek-anggaran').addEventListener('click', () => {
    const anggaran = parseFloat(localStorage.getItem('pk_anggaran')) || 0;
    const all = getTransactions(); let e = 0;
    all.forEach(t => t.type === 'pengeluaran' ? e += t.amount : null);
    const pct = anggaran > 0 ? Math.min(100, Math.round(e / anggaran * 100)) : 0;
    document.getElementById('info-anggaran').textContent = anggaran > 0
      ? `Pengeluaran: ${fmtRp(e)} dari batas ${fmtRp(anggaran)} (${pct}%)`
      : 'Belum ada batas anggaran. Set sekarang.';
    document.getElementById('input-anggaran').value = anggaran || '';
    const wrap = document.getElementById('anggaran-bar-wrap');
    const fill = document.getElementById('anggaran-bar-fill');
    if (anggaran > 0) {
      wrap.style.display = 'block';
      fill.style.width = pct + '%';
      fill.className = 'anggaran-bar-fill' + (pct >= 100 ? ' over' : pct >= 80 ? ' warn' : '');
    } else { wrap.style.display = 'none'; }
    document.getElementById('modal-anggaran').classList.add('open');
  });
  document.getElementById('btn-save-anggaran').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('input-anggaran').value) || 0;
    if (val <= 0) { showToast('Masukkan batas anggaran yang valid'); return; }
    localStorage.setItem('pk_anggaran', val);
    document.getElementById('modal-anggaran').classList.remove('open');
    refreshCards(); showToast('Anggaran disimpan');
  });

  /* ── Investasi ── */
  document.getElementById('cek-investasi').addEventListener('click', () => {
    const total = getTransactions().filter(t => t.cat === 'Investasi' && t.type === 'pemasukan').reduce((a, t) => a + t.amount, 0);
    document.getElementById('info-investasi').textContent = `Total investasi: ${fmtRp(total)}`;
    document.getElementById('modal-investasi').classList.add('open');
  });
  document.getElementById('btn-save-investasi').addEventListener('click', () => {
    const amount = parseFloat(document.getElementById('input-investasi').value) || 0;
    const desc   = document.getElementById('desc-investasi').value.trim() || 'Investasi';
    if (amount <= 0) { showToast('Masukkan jumlah yang valid'); return; }
    const txs = getTransactions();
    txs.push({ id: Date.now(), type: 'pemasukan', cat: 'Investasi', desc, amount, date: new Date().toISOString().split('T')[0] });
    saveTransactions(txs);
    document.getElementById('modal-investasi').classList.remove('open');
    document.getElementById('input-investasi').value = '';
    document.getElementById('desc-investasi').value = '';
    refreshCards(); showToast('Investasi ditambahkan');
  });

  /* ── Tagihan ── */
  document.getElementById('cek-tagihan').addEventListener('click', () => {
    const count = getTransactions().filter(t => t.cat === 'Tagihan').length;
    document.getElementById('info-tagihan').textContent = `Total tagihan tercatat: ${count} transaksi`;
    document.getElementById('modal-tagihan').classList.add('open');
  });
  document.getElementById('btn-save-tagihan').addEventListener('click', () => {
    const nama   = document.getElementById('input-tagihan-nama').value.trim();
    const amount = parseFloat(document.getElementById('input-tagihan-jumlah').value) || 0;
    if (!nama)        { showToast('Masukkan nama tagihan'); return; }
    if (amount <= 0)  { showToast('Masukkan jumlah yang valid'); return; }
    const txs = getTransactions();
    txs.push({ id: Date.now(), type: 'pengeluaran', cat: 'Tagihan', desc: nama, amount, date: new Date().toISOString().split('T')[0] });
    saveTransactions(txs);
    document.getElementById('modal-tagihan').classList.remove('open');
    document.getElementById('input-tagihan-nama').value = '';
    document.getElementById('input-tagihan-jumlah').value = '';
    refreshCards(); showToast('Tagihan ditambahkan');
  });
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
        <span class="legend-pct">${total > 0 ? Math.round(catData[i] / total * 100) : 0}%</span>
      </div>`).join('');
  }

  document.getElementById('summary-list').innerHTML = [
    { label: 'Pemasukan',   val: fmtRp(inc),       color: '#3dbf8e' },
    { label: 'Pengeluaran', val: fmtRp(exp),        color: '#e05c6e' },
    { label: 'Saldo',       val: fmtRp(inc - exp),  color: inc >= exp ? '#3dbf8e' : '#e05c6e' },
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
    document.getElementById('saldo-total').textContent = fmtRp(inc - exp);    document.getElementById('saldo-bulan').textContent = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    let filtered = [...txs].sort((a, b) => b.date.localeCompare(a.date));
    if (currentFilter !== 'semua') filtered = filtered.filter(t => t.type === currentFilter);
    renderTxListDeletable('tx-list', filtered, (id) => {
      const all = getTransactions();
      const deleted = all.find(t => String(t.id) === String(id));
      const updated = all.filter(t => String(t.id) !== String(id));
      saveTransactions(updated);
      showToast('Transaksi dihapus');
      render();
    });
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
    const name  = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    if (!name) { showToast('Nama tidak boleh kosong'); return; }
    saveProfile({ name, email });
    document.getElementById('modal-edit').classList.remove('open');
    renderProfile();
    showToast('Profil diperbarui');
  });

  document.getElementById('menu-target').addEventListener('click', () => document.getElementById('modal-target').classList.add('open'));
  document.getElementById('close-target').addEventListener('click', () => document.getElementById('modal-target').classList.remove('open'));
  document.getElementById('btn-save-target').addEventListener('click', () => {
    const val = parseFloat(document.getElementById('input-target').value);
    if (!val || val <= 0) { showToast('Masukkan target yang valid'); return; }
    saveTarget(val);
    document.getElementById('modal-target').classList.remove('open');
    renderProfile();
    showToast('Target disimpan');
  });

  // Tampilan (Light/Dark)
  function applyTheme(mode) {
    if (mode === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('pk_theme', mode);
    const lbl = document.getElementById('theme-label');
    if (lbl) lbl.textContent = mode === 'dark' ? 'Dark' : 'Light';
  }

  function updateThemeUI() {
    const isDark = localStorage.getItem('pk_theme') === 'dark';
    document.getElementById('opt-light').classList.toggle('active', !isDark);
    document.getElementById('opt-dark').classList.toggle('active', isDark);
    document.getElementById('check-light').textContent = isDark ? '' : '✓';
    document.getElementById('check-dark').textContent  = isDark ? '✓' : '';
    const lbl = document.getElementById('theme-label');
    if (lbl) lbl.textContent = isDark ? 'Dark' : 'Light';
  }

  document.getElementById('menu-theme').addEventListener('click', () => {
    updateThemeUI();
    document.getElementById('modal-theme').classList.add('open');
  });
  document.getElementById('close-theme').addEventListener('click', () => document.getElementById('modal-theme').classList.remove('open'));
  document.getElementById('opt-light').addEventListener('click', () => { applyTheme('light'); updateThemeUI(); });
  document.getElementById('opt-dark').addEventListener('click',  () => { applyTheme('dark');  updateThemeUI(); });

  // Notifikasi
  const NOTIF_PREF = 'pk_notif_pref';
  document.getElementById('menu-notif').addEventListener('click', () => {
    const pref = JSON.parse(localStorage.getItem(NOTIF_PREF) || '{}');
    document.getElementById('notif-saldo').checked   = pref.saldo   !== false;
    document.getElementById('notif-bulanan').checked = pref.bulanan !== false;
    document.getElementById('notif-harian').checked  = pref.harian  !== false;
    document.getElementById('modal-notif').classList.add('open');
  });
  document.getElementById('close-notif').addEventListener('click', () => document.getElementById('modal-notif').classList.remove('open'));
  document.getElementById('btn-save-notif').addEventListener('click', () => {
    localStorage.setItem(NOTIF_PREF, JSON.stringify({
      saldo:   document.getElementById('notif-saldo').checked,
      bulanan: document.getElementById('notif-bulanan').checked,
      harian:  document.getElementById('notif-harian').checked,
    }));
    document.getElementById('modal-notif').classList.remove('open');
    showToast('Pengaturan notifikasi disimpan');
  });

  document.getElementById('menu-reset').addEventListener('click', () => {
    if (!confirm('Reset semua data transaksi?')) return;
    saveTransactions([]);
    renderProfile();
    showToast('Data direset');
  });

  document.querySelectorAll('.modal-overlay').forEach(o => {
    o.addEventListener('click', e => { if (e.target === o) o.classList.remove('open'); });
  });
}

/* ════════════════════════════════════
   AUTO INIT
════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme on every page load
  if (localStorage.getItem('pk_theme') === 'dark') {
    document.body.classList.add('dark');
  }

  const page = document.body.dataset.page;
  if (page === 'dashboard')  initDashboard();
  if (page === 'statistik')  initStatistik();
  if (page === 'tambah')     initTambah();
  if (page === 'dompet')     initDompet();
  if (page === 'profil')     initProfil();
});
