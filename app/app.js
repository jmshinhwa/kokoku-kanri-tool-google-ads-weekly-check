// app.js — 広告管理ツール｜Google広告の週次チェック page. Free: sample / CSV (computed here, nothing uploaded) / one script account.
// Pro (licence key checked by our worker against getreadystack.com/api/lic): history · approve → the script applies · alert mail · CSV · print/PDF.
(function () {
  'use strict';
  var API = 'https://kokoku-kanri-tool-google-ads-weekly-check.pages.dev';
  var SLUG = 'kokoku-kanri-tool-google-ads-weekly-check';
  var BUY = { m: 'https://getreadystack.com/api/buy/web/' + SLUG, y: 'https://getreadystack.com/api/buy/web/' + SLUG + '.yearly', a: 'https://getreadystack.com/api/buy/web/' + SLUG + '.agency' };
  var E = window.KKEngine, I = window.KKI18n, $ = function (id) { return document.getElementById(id); };
  var LS = { get: function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  var lang = (new URLSearchParams(location.search).get('lang') || LS.get('kk:lang') || 'ja'); if (I.LANGS.indexOf(lang) < 0) lang = 'ja';
  var S = { audit: null, src: null, acct: null, rep: null, pro: null, key: LS.get('kk:key') || '' };
  function t(k, v) { return I.t(lang, k, v); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function M(x) { return E.money(x, (S.audit && S.audit.currency) || 'JPY'); }
  function api(path, body) {
    return fetch(API + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {})
      .then(function (r) { return r.json().catch(function () { return { ok: false }; }); }, function () { return { ok: false, error: 'net' }; });
  }
  function qs(o) { return Object.keys(o).map(function (k) { return k + '=' + encodeURIComponent(o[k]); }).join('&'); }

  // ── static words
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-t]').forEach(function (el) { el.textContent = t(el.getAttribute('data-t')); });
    document.querySelectorAll('#langs button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.l === lang ? 'true' : 'false'); });
    $('buyM').href = BUY.m; $('buyY').href = BUY.y; $('buyA').href = BUY.a;
    if (S.audit) render(); if (S.pro) renderPro();
  }
  function setLang(l) { lang = l; LS.set('kk:lang', l); paint(); }

  // ── result
  function table(head, rows) {
    return '<div class="tw"><table><thead><tr>' + head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
      rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  }
  function render() {
    var a = S.audit, T = a.totals, h = '';
    h += '<p class="meta">' + esc(t('acct')) + ': <b>' + esc(a.account.name || a.account.id || '—') + '</b>' + (a.period && a.period.from ? ' · ' + esc(t('period')) + ': ' + esc(a.period.from) + '〜' + esc(a.period.to) : '') + '</p>';
    h += '<div class="kpis">' +
      '<div class="kpi"><span>' + esc(t('kCost')) + '</span><b id="kCost">' + M(T.cost) + '</b></div>' +
      '<div class="kpi"><span>' + esc(t('kConv')) + '</span><b id="kConv">' + T.conv + '</b></div>' +
      '<div class="kpi"><span>' + esc(t('kCpa')) + '</span><b id="kCpa">' + M(a.thr) + '</b></div>' +
      '<div class="kpi bad"><span>' + esc(t('kWaste')) + '</span><b id="kWaste">' + M(a.waste) + '</b><i>' + a.wastePct + '%</i></div></div>';
    if (a.merged.length) h += '<p class="note" id="merged">' + esc(t('merged', { n: a.merged.length })) + ' — ' + a.merged.map(function (l) { return esc(l.join(' = ')); }).join(' · ') + '</p>';
    if (!a.findings.length) h += '<p class="ok">' + esc(t('none')) + '</p>';
    a.findings.forEach(function (f) {
      if (f.id === 'W1') h += '<h3>' + esc(t('fW1', { thr: M(a.thr) })) + ' · ' + M(f.money) + '</h3>' + table(t('th'), f.rows.map(function (r) { return [r[0], r[1], r[2], M(r[3]), r[4] > 1 ? r[4] : '']; }));
      if (f.id === 'W2') h += '<h3>' + esc(t('fW2')) + '</h3>' + table(t('th2'), f.rows.map(function (r) { return [r[0], r[1], r[2], M(r[3])]; }));
      if (f.id === 'T1') h += '<h3 class="warn">' + esc(t('fT1', { n: f.n })) + '</h3>';
      if (f.id === 'C1') h += '<h3>' + esc(t('fC1', { n: f.n })) + '</h3>' + table(t('th3'), f.rows.map(function (r) { return [r[0], r[1], M(r[2])]; }));
      if (f.id === 'C2') h += '<h3>' + esc(t('fC2', { n: f.n })) + '</h3>' + table(t('th4'), f.rows.map(function (r) { return [r[0], r[1] + '%', M(r[2])]; }));
    });
    var N = a.negatives;
    if (N.length) {
      h += '<h3 id="negH">' + esc(t('negH', { n: N.length })) + '</h3><ul class="negs" id="negs">' + N.map(function (x) {
        return '<li><label><input type="checkbox" data-id="' + esc(x.id) + '" checked> <code>' + esc(E.negLine(x)) + '</code> <small>' + esc(x.type === 'exact' ? t('exact') : t('phrase')) + ' · ' + esc(x.campaign || t('allCamp')) + ' · ' + M(x.cost) + '</small></label></li>';
      }).join('') + '</ul><textarea id="negText" readonly rows="' + Math.min(N.length, 8) + '">' + esc(E.negText(N)) + '</textarea>' +
      '<p class="row"><button id="negCopy" class="btn">' + esc(t('negCopy')) + '</button></p>';
      if (S.src === 'acct' && S.rep && S.rep.plan === 'pro') h += '<p class="row"><button id="approve" class="btn pri">' + esc(t('approve', { n: N.length })) + '</button></p><p id="apState" class="note"></p>';
      else h += '<p class="note pro" id="approveFree">' + esc(t('approveFree')) + ' <a href="#buy">' + esc(t('buyH')) + '</a></p>';
    }
    $('result').innerHTML = h; $('result').hidden = false;
    var cp = $('negCopy'); if (cp) cp.onclick = function () { copy($('negText').value, cp); };
    var ul = $('negs'); if (ul) ul.onchange = function () { var sel = picked(); $('negText').value = E.negText(sel); var b = $('approve'); if (b) b.textContent = t('approve', { n: sel.length }); };
    var ap = $('approve'); if (ap) ap.onclick = approve;
    if (S.rep && S.rep.approval) apState(S.rep.approval);
  }
  function picked() { var on = {}; document.querySelectorAll('#negs input:checked').forEach(function (i) { on[i.dataset.id] = 1; }); return S.audit.negatives.filter(function (x) { return on[x.id]; }); }
  function copy(text, btn) {
    var done = function () { var o = btn.textContent; btn.textContent = t('copied'); setTimeout(function () { btn.textContent = o; }, 1500); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { fallback(); }); else fallback();
    function fallback() { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); done(); }
  }
  function apState(ap) {
    var el = $('apState'); if (!el || !ap) return;
    el.textContent = ap.status === 'pending' ? t('approved', { n: ap.items.length }) : ap.status === 'applied' ? t('applied', { n: ap.okN, at: String(ap.appliedAt).replace('T', ' ').slice(0, 16) + ' UTC' }) : '';
  }
  function approve() {
    var items = picked().map(function (x) { return { id: x.id, text: x.text, type: x.type, campaignId: x.campaignId, campaign: x.campaign }; });
    api('https://getreadystack.com/api/approve', { acct: S.acct.acct, token: S.acct.token, items: items }).then(function (r) { if (r.ok) { S.rep.approval = r.approval; apState(r.approval); } });
  }

  // ── free modes
  function runSample() { S.src = 'sample'; S.rep = null; S.audit = E.audit(window.KKSample.week()); render(); }
  function runCsv(text) {
    var p = E.parseCsv(text);
    if (p.error || !p.terms.length) { $('csvMsg').textContent = t('csvErr'); return; }
    $('csvMsg').textContent = ''; S.src = 'csv'; S.rep = null;
    S.audit = E.audit({ account: { name: 'CSV', currency: p.currency }, period: {}, terms: p.terms }); render();
  }
  function script(acct) {
    return fetch('kk_script.gs').then(function (r) { return r.text(); }).then(function (s) {
      return s.replace('__BASE__', API).replace('__ACCT__', acct.acct).replace('__TOKEN__', acct.token);
    });
  }
  function showScript(acct) {
    S.acct = acct;
    script(acct).then(function (s) { $('gCode').value = s; $('gBox').hidden = false; });
  }
  function newFree() {
    var have = LS.get('kk:free'); if (have) return showScript(have);
    api('https://getreadystack.com/api/acct/new', {}).then(function (r) { if (r.ok) { var a = { acct: r.acct, token: r.token }; LS.set('kk:free', a); showScript(a); } else $('gMsg').textContent = r.error || 'error'; });
  }
  function load(acct) {
    S.acct = acct;
    return api('https://getreadystack.com/api/report?' + qs({ acct: acct.acct, token: acct.token })).then(function (r) {
      if (!r.ok) { $('gMsg').textContent = r.error || 'error'; return r; }
      S.rep = r;
      if (!r.last) { $('gMsg').textContent = t('gWait'); return r; }
      $('gMsg').textContent = ''; S.src = 'acct'; S.audit = r.last; render(); if (S.pro) renderPro(); return r;
    });
  }

  // ── Pro
  function useKey(key) {
    key = String(key || '').trim(); if (!key) return;
    api('https://getreadystack.com/api/accts?' + qs({ key: key })).then(function (r) {
      if (!r.ok) { $('keyMsg').textContent = t('keyBad'); S.pro = null; return; }
      S.key = key; LS.set('kk:key', key); S.pro = r; $('keyMsg').textContent = t('keyOk'); renderPro();
      var fr = LS.get('kk:free');            // a free account made before buying becomes this licence's account
      if (fr && !r.accts.some(function (a) { return a.acct === fr.acct; }) && r.accts.length < r.cap)
        api('https://getreadystack.com/api/acct/key', { acct: fr.acct, token: fr.token, key: key }).then(function (x) { if (x.ok) useKey(key); });
    });
  }
  function renderPro() {
    var P = S.pro, h = '<p class="note">' + esc(t('accts')) + ' ' + P.accts.length + ' · ' + esc(t('cap', { n: P.cap })) + '</p><ul class="accts">';
    P.accts.forEach(function (a) { h += '<li><button class="lnk" data-a="' + esc(a.acct) + '">' + esc(a.name || a.cid || a.acct) + '</button> <small>' + esc(a.last || '') + '</small></li>'; });
    h += '</ul>' + (P.accts.length < P.cap ? '<p class="row"><button id="addAcct" class="btn">' + esc(t('addAcct')) + '</button></p>' : '');
    var R = S.rep;
    if (R && R.plan === 'pro' && S.acct) {
      h += '<label class="fld">' + esc(t('email')) + ' <input id="email" type="email" value="' + esc(R.acct.email || '') + '"></label> <button id="saveEmail" class="btn">' + esc(t('save')) + '</button>';
      if (R.compare) h += '<p class="note" id="cmp">' + esc(t('cmp', { a: R.compare.newWaste.length, b: R.compare.goneWaste.length })) + '</p>';
      h += '<h3>' + esc(t('hist')) + '</h3>' + ((R.hist || []).length ? table(t('histTh'), R.hist.slice().reverse().map(function (x) { return [x.wk, M(x.cost), x.conv, M(x.waste) + ' (' + x.wastePct + '%)', x.newWaste == null ? '—' : x.newWaste]; })) : '<p class="note" id="histNone">' + esc(t('histNone')) + '</p>');
      h += '<h3>' + esc(t('log')) + '</h3>' + ((R.log || []).length ? table(t('logTh'), R.log.slice().reverse().slice(0, 50).map(function (l) { return [l.at.replace('T', ' ').slice(0, 16), l.text, l.type === 'exact' ? t('exact') : t('phrase'), l.campaign || l.campaignId, l.ok ? 'OK' : l.err]; })) : '<p class="note">' + esc(t('logNone')) + '</p>');
      var base = API + 'https://getreadystack.com/api/csv?' + qs({ acct: S.acct.acct, token: S.acct.token }) + '&what=';
      h += '<p class="row"><a class="btn" href="' + base + 'hist">' + esc(t('csvH')) + '</a> <a class="btn" href="' + base + 'neg">' + esc(t('csvN')) + '</a> <a class="btn" href="' + base + 'log">' + esc(t('csvL')) + '</a> <button id="print" class="btn">' + esc(t('print')) + '</button></p>';
    }
    $('proBody').innerHTML = h;
    document.querySelectorAll('#proBody [data-a]').forEach(function (b) { b.onclick = function () { var a = P.accts.filter(function (x) { return x.acct === b.dataset.a; })[0]; load(a).then(function () { showScript(a); }); }; });
    var ad = $('addAcct'); if (ad) ad.onclick = function () { api('https://getreadystack.com/api/acct/new', { key: S.key }).then(function (r) { if (r.ok) { useKey(S.key); showScript({ acct: r.acct, token: r.token }); } }); };
    var se = $('saveEmail'); if (se) se.onclick = function () { api('https://getreadystack.com/api/email', { acct: S.acct.acct, token: S.acct.token, email: $('email').value }).then(function (r) { se.textContent = r.ok ? t('copied').replace(/.*/, '✓') : '×'; }); };
    var pr = $('print'); if (pr) pr.onclick = function () { window.print(); };
  }

  // ── wire
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('#langs button').forEach(function (b) { b.onclick = function () { setLang(b.dataset.l); }; });
    $('trySample').onclick = runSample;
    $('tryCsv').onclick = function () { $('csvBox').hidden = !$('csvBox').hidden; };
    $('tryScript').onclick = function () { $('gPanel').hidden = false; newFree(); };
    $('csvRun').onclick = function () { runCsv($('csvIn').value); };
    $('csvFile').onchange = function (e) {
      var f = e.target.files[0]; if (!f) return;
      f.arrayBuffer().then(function (buf) { var u = new Uint8Array(buf), enc = (u[0] === 0xFF && u[1] === 0xFE) ? 'utf-16le' : (u[0] === 0xFE && u[1] === 0xFF) ? 'utf-16be' : 'utf-8';
        var txt = new TextDecoder(enc).decode(buf); $('csvIn').value = txt.slice(0, 200000); runCsv(txt); });
    };
    $('gCopy').onclick = function () { copy($('gCode').value, $('gCopy')); };
    $('gLoad').onclick = function () { if (S.acct) load(S.acct); };
    $('keyBtn').onclick = function () { useKey($('keyIn').value); };
    paint();
    if (S.key) { $('keyIn').value = S.key; useKey(S.key); }
    var m = /#a=([a-f0-9]{16})/.exec(location.hash), fr = LS.get('kk:free');
    if (m && fr && fr.acct === m[1]) { $('gPanel').hidden = false; showScript(fr); load(fr); }
  });
  window.KKApp = { S: S, useKey: useKey, load: load, runCsv: runCsv };
})();
